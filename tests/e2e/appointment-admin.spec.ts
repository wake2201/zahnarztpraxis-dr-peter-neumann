import { expect, test, type BrowserContext, type Locator, type Page, type Request } from "@playwright/test";
import {
  cleanupLoginAttempts,
  cleanupUsersByEmail,
  countAppointmentsByFirstName,
  countTestAvailabilityExceptions,
  countTestWeeklyAvailability,
  createSeededTestAppointment,
  createTestAvailabilityException,
  createTestAppointmentType,
  disconnectPrisma,
  ensureTestUser,
  findLatestAppointmentByFirstName,
  findLatestAuditLogByActionAndDetail,
  findTestAppointmentTypeByName,
  getAppointmentWithSlots,
  getTestAppointmentSettings,
  resetAppointmentTestData,
  updateTestAppointmentSettings,
} from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EinSicheresPasswort123!";
const STAFF_EMAIL = "appointment-staff-e2e@test.de";
const STAFF_PASSWORD = "AppointmentStaff123!";

function berlinLocalDate(daysFromNow: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";
  const target = new Date(Date.UTC(
    Number(value("year")),
    Number(value("month")) - 1,
    Number(value("day")) + daysFromNow,
  ));
  return target.toISOString().slice(0, 10);
}

function futureBerlinDayInstant(daysFromNow: number, utcHour: number) {
  return new Date(`${berlinLocalDate(daysFromNow)}T${utcHour.toString().padStart(2, "0")}:00:00.000Z`);
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("E-Mail").fill(email);
  await page.getByLabel("Passwort").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
}

async function openAppointmentsTab(page: Page) {
  await page.getByRole("button", { name: /Termine/i }).click();
  await expect(page.getByTestId("appointment-pending-count")).toBeVisible();
}

async function configureOpenType(options: {
  name: string;
  confirmationMode?: "AUTO" | "MANUAL";
  onlineBookable?: boolean;
}) {
  await updateTestAppointmentSettings({ minimumNoticeMinutes: 0, bookingHorizonDays: 30 });
  const appointmentType = await createTestAppointmentType({
    name: options.name,
    durationMinutes: 30,
    confirmationMode: options.confirmationMode ?? "AUTO",
    onlineBookable: options.onlineBookable ?? true,
  });
  await createTestAvailabilityException({
    localDate: berlinLocalDate(2),
    kind: "OPEN",
    startMinute: 600,
    endMinute: 780,
  });
  return appointmentType;
}

function appointmentEntry(page: Page, firstName: string) {
  return page.getByTestId("appointment-list").getByRole("article").filter({ hasText: firstName });
}

function appointmentRow(page: Page, firstName: string) {
  return appointmentEntry(page, firstName).getByRole("button", {
    name: `Details zu ${firstName}`,
    exact: false,
  });
}

function isServerActionRequestFor(request: Request, markers: string[]) {
  const postData = request.postData();
  if (!postData) {
    return false;
  }

  return request.method() === "POST"
    && Boolean(request.headers()["next-action"])
    && markers.every((marker) => postData.includes(marker));
}

async function expectNoHorizontalOverflow(locator: Locator) {
  await expect.poll(() => locator.evaluate((element) => (
    element.scrollWidth <= element.clientWidth
  ))).toBe(true);
}

async function replayServerAction(context: BrowserContext, request: Request) {
  const originalHeaders = request.headers();
  const body = request.postDataBuffer();
  if (!body || !originalHeaders["next-action"] || !originalHeaders["content-type"]) {
    throw new Error("Server Action request could not be captured for authorization replay");
  }
  const headers: Record<string, string> = {
    accept: originalHeaders.accept ?? "text/x-component",
    "content-type": originalHeaders["content-type"],
    "next-action": originalHeaders["next-action"],
  };
  if (originalHeaders["next-router-state-tree"]) {
    headers["next-router-state-tree"] = originalHeaders["next-router-state-tree"];
  }
  return context.request.post(request.url(), { data: body, headers, failOnStatusCode: false });
}

test.describe("Admin appointment operations and authorization", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    await cleanupLoginAttempts();
    await ensureTestUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: "E2E Appointment Admin",
      role: "admin",
    });
    await ensureTestUser({
      email: STAFF_EMAIL,
      password: STAFF_PASSWORD,
      name: "E2E Appointment Staff",
      role: "staff",
    });
  });

  test.beforeEach(async () => {
    await resetAppointmentTestData();
    await cleanupLoginAttempts();
  });

  test.afterAll(async () => {
    await resetAppointmentTestData();
    await cleanupUsersByEmail([STAFF_EMAIL]);
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("unauthenticated users are redirected and staff receive operations without configuration", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);

    await login(page, STAFF_EMAIL, STAFF_PASSWORD);
    await openAppointmentsTab(page);
    await expect(page.getByRole("button", { name: /^Neuer Termin$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Einstellungen$/i })).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: /Neuer Termin/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Benutzer/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Aktivitätslog|Aktivitaetslog/i })).toHaveCount(0);
  });

  test("staff can use the focused ADMIN-source appointment flow while the same action fails closed without a session", async ({ page, browser }) => {
    const firstName = `E2E-Termin-Praxis-${Date.now()}`;
    const appointmentType = await configureOpenType({
      name: "E2E Nur intern",
      confirmationMode: "MANUAL",
      onlineBookable: false,
    });

    await login(page, STAFF_EMAIL, STAFF_PASSWORD);
    await openAppointmentsTab(page);
    const trigger = page.getByRole("button", { name: /^Neuer Termin$/i });
    await expect(page.getByRole("dialog", { name: /Neuer Termin/i })).toHaveCount(0);
    await expect(page.getByRole("region", { name: /Termin-Einstellungen/i })).toHaveCount(0);

    await trigger.click();
    let dialog = page.getByRole("dialog", { name: /Neuer Termin/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /^Neuer Termin$/i })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    dialog = page.getByRole("dialog", { name: /Neuer Termin/i });
    await dialog.getByRole("button", { name: /E2E Nur intern/i }).click();
    await expect(dialog.getByRole("button", { name: /Freie Termine laden/i })).toHaveCount(0);
    const slot = dialog.locator('button[aria-pressed="false"]').first();
    await expect(slot).toBeVisible({ timeout: 15_000 });
    await slot.click();

    const submit = dialog.getByRole("button", { name: /^Termin eintragen$/i });
    await expect(submit).toBeDisabled();
    await expect(dialog.getByLabel("Ländervorwahl")).toHaveValue("+49");
    await dialog.getByLabel("Vorname").fill(firstName);
    await dialog.getByLabel("Nachname").fill("Playwright");
    await dialog.getByLabel(/^Telefon/).fill("15123456789");
    await expect(submit).toBeDisabled();
    await dialog.getByRole("checkbox", { name: /Verarbeitung seiner Termindaten/i }).check();
    await expect(submit).toBeEnabled();
    const actionRequestPromise = page.waitForRequest(
      (request) => isServerActionRequestFor(request, [firstName]),
    );
    await submit.click();
    const actionRequest = await actionRequestPromise;
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(/wartet auf Bestätigung/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /^Offene Anfragen/ }).click();
    await expect(appointmentRow(page, firstName)).toBeVisible();

    const stored = await findLatestAppointmentByFirstName(firstName);
    expect(stored?.appointmentTypeId).toBe(appointmentType.id);
    expect(stored?.source).toBe("ADMIN");
    expect(stored?.status).toBe("PENDING");
    expect(stored?.slots).toHaveLength(2);
    expect(await findLatestAuditLogByActionAndDetail("CREATE_APPOINTMENT", stored?.id ?? "missing")).not.toBeNull();

    const anonymousContext = await browser.newContext();
    try {
      const replay = await replayServerAction(anonymousContext, actionRequest);
      expect(replay.headers()["x-action-redirect"] ?? replay.url()).toContain("/admin/login");
      await expect.poll(async () => countAppointmentsByFirstName(firstName)).toBe(1);
    } finally {
      await anonymousContext.close();
    }
  });

  test("primary appointment workflows avoid horizontal page overflow at supported widths", async ({ page }) => {
    const responsiveType = await configureOpenType({
      name: `E2E Responsive ${Date.now()}`,
      confirmationMode: "AUTO",
    });
    const responsivePatient = `E2E-Responsive-Auto-${Date.now()}`;
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await openAppointmentsTab(page);

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1024, height: 768 },
      { width: 768, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await expectNoHorizontalOverflow(page.locator("html"));

      const trigger = page.getByRole("button", { name: /^Neuer Termin$/i });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: /Neuer Termin/i });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveJSProperty("open", true);
      await expect(dialog.getByRole("heading", { name: /^Neuer Termin$/i })).toBeFocused();
      await expectNoHorizontalOverflow(dialog);
      const bounds = await dialog.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width + 1);

      await dialog.getByRole("button", { name: responsiveType.name }).click();
      const timeStage = dialog.getByRole("region", { name: /Freie Uhrzeit auswählen/i });
      await expect(timeStage).toBeVisible();
      await expectNoHorizontalOverflow(timeStage);
      const slot = timeStage.locator('button[aria-pressed="false"]').first();
      await expect(slot).toBeVisible({ timeout: 15_000 });

      if (viewport.width === 390) {
        await slot.click();
        const patientStage = dialog.getByRole("region", { name: /Patientendaten/i });
        await expect(patientStage).toBeVisible();
        await expectNoHorizontalOverflow(patientStage);
        await expect(dialog.getByLabel("Vorname")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect.poll(() => page.evaluate(() => (
          document.activeElement?.closest("dialog")?.hasAttribute("open") ?? false
        ))).toBe(true);

        await dialog.getByLabel("Vorname").fill(responsivePatient);
        await dialog.getByLabel("Nachname").fill("Mobiltest");
        await dialog.getByLabel(/^Telefon/).fill("15123456789");
        await dialog.getByRole("checkbox", { name: /Verarbeitung seiner Termindaten/i }).check();
        const createRequestPromise = page.waitForRequest(
          (request) => isServerActionRequestFor(request, [responsivePatient]),
        );
        await dialog.getByRole("button", { name: /^Termin eintragen$/i }).click();
        await createRequestPromise;
        await expect(dialog).toBeHidden({ timeout: 15_000 });
        await expect(page.getByText(/Termin wurde erfolgreich eingetragen/i)).toBeVisible();
        await expect(trigger).toBeFocused();
        const created = await findLatestAppointmentByFirstName(responsivePatient);
        expect(created?.status).toBe("CONFIRMED");
        continue;
      }

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }

    await page.getByRole("button", { name: /^Einstellungen$/i }).click();
    const configuration = page.getByRole("region", { name: /Termin-Einstellungen/i });
    await expectNoHorizontalOverflow(configuration);
    await configuration.getByRole("button", { name: /Buchungszeiten/i }).click();
    const monday = configuration.getByRole("region", { name: "Montag", exact: true });
    await expect(monday).toBeVisible();
    await expectNoHorizontalOverflow(page.locator("html"));
    await expectNoHorizontalOverflow(configuration);
    await expectNoHorizontalOverflow(monday);
  });

  test("admin confirm and reject use revision-safe transitions; rejection releases capacity", async ({ page }) => {
    const appointmentType = await configureOpenType({
      name: "E2E Admin Status",
      confirmationMode: "MANUAL",
    });
    const confirmSeed = await createSeededTestAppointment({
      appointmentTypeId: appointmentType.id,
      startAt: futureBerlinDayInstant(2, 8),
      firstName: `E2E-Termin-Confirm-${Date.now()}`,
      status: "PENDING",
    });
    const rejectStart = new Date(`${berlinLocalDate(2)}T10:00:00.000Z`);
    const rejectSeed = await createSeededTestAppointment({
      appointmentTypeId: appointmentType.id,
      startAt: rejectStart,
      firstName: `E2E-Termin-Reject-${Date.now()}`,
      status: "PENDING",
    });

    await page.goto("/termin/buchen");
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator(`input[name="bookingSlot"][value="${rejectStart.toISOString()}"]`)).toHaveCount(0);

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await openAppointmentsTab(page);
    await page.getByRole("button", { name: /^Offene Anfragen/ }).click();

    const confirmEntry = appointmentEntry(page, confirmSeed.appointment.firstName);
    await confirmEntry.getByRole("button", { name: /^Bestätigen$/i }).click();
    const confirmRequestPromise = page.waitForRequest(
      (request) => isServerActionRequestFor(request, [confirmSeed.appointment.id]),
    );
    await confirmEntry.getByRole("button", { name: /^Jetzt bestätigen$/i }).click();
    const confirmRequest = await confirmRequestPromise;
    await expect.poll(async () => (await getAppointmentWithSlots(confirmSeed.appointment.id))?.status).toBe("CONFIRMED");
    const confirmed = await getAppointmentWithSlots(confirmSeed.appointment.id);
    expect(confirmed?.revision).toBe(1);
    const staleReplay = await replayServerAction(page.context(), confirmRequest);
    expect(staleReplay.ok()).toBe(true);
    expect((await getAppointmentWithSlots(confirmSeed.appointment.id))?.revision).toBe(1);
    expect(await findLatestAuditLogByActionAndDetail("CONFIRM_APPOINTMENT", confirmSeed.appointment.id)).not.toBeNull();

    const rejectEntry = appointmentEntry(page, rejectSeed.appointment.firstName);
    await rejectEntry.getByRole("button", { name: /^Ablehnen$/i }).click();
    await rejectEntry.getByRole("button", { name: /^Jetzt ablehnen$/i }).click();
    await expect.poll(async () => (await getAppointmentWithSlots(rejectSeed.appointment.id))?.status).toBe("REJECTED");
    const rejected = await getAppointmentWithSlots(rejectSeed.appointment.id);
    expect(rejected?.slots).toHaveLength(0);
    expect(await findLatestAuditLogByActionAndDetail("REJECT_APPOINTMENT", rejectSeed.appointment.id)).not.toBeNull();
    await expect(page.getByTestId("appointment-pending-count").getByText("0", { exact: true })).toBeVisible();

    await page.goto("/termin/buchen");
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator(`input[name="bookingSlot"][value="${rejectStart.toISOString()}"]`)).toBeAttached();
  });

  test("admin cancellation preserves the record and admin reschedule atomically moves all slots", async ({ page }) => {
    const appointmentType = await configureOpenType({ name: "E2E Admin Move" });
    const cancelSeed = await createSeededTestAppointment({
      appointmentTypeId: appointmentType.id,
      startAt: futureBerlinDayInstant(2, 8),
      firstName: `E2E-Termin-Admin-Cancel-${Date.now()}`,
      status: "CONFIRMED",
    });
    const moveSeed = await createSeededTestAppointment({
      appointmentTypeId: appointmentType.id,
      startAt: futureBerlinDayInstant(2, 9),
      firstName: `E2E-Termin-Admin-Move-${Date.now()}`,
      status: "CONFIRMED",
    });
    const oldMoveSlots = moveSeed.appointment.durationMinutesSnapshot / 15;

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await openAppointmentsTab(page);
    await page.getByRole("button", { name: /^Woche$/i }).click();
    if (await appointmentRow(page, cancelSeed.appointment.firstName).count() === 0) {
      await page.getByRole("button", { name: "Nächste Woche" }).click();
    }
    await expect(appointmentRow(page, cancelSeed.appointment.firstName)).toBeVisible();

    await appointmentRow(page, cancelSeed.appointment.firstName).click();
    await page.getByRole("button", { name: /^Stornieren$/i }).click();
    await page.getByRole("button", { name: /^Ausführen$/i }).click();
    await expect.poll(async () => (await getAppointmentWithSlots(cancelSeed.appointment.id))?.status).toBe("CANCELLED");
    expect((await getAppointmentWithSlots(cancelSeed.appointment.id))?.slots).toHaveLength(0);
    expect(await findLatestAuditLogByActionAndDetail("CANCEL_APPOINTMENT", cancelSeed.appointment.id)).not.toBeNull();

    await appointmentRow(page, moveSeed.appointment.firstName).click();
    await page.getByRole("button", { name: /^Verschieben$/i }).click();
    const reschedule = page.getByRole("region", { name: /Termin verschieben/i });
    const replacement = reschedule.locator('button[aria-pressed="false"]').last();
    await expect(replacement).toBeVisible({ timeout: 15_000 });
    await replacement.click();
    await reschedule.getByRole("button", { name: /Neue Zeit bestätigen/i }).click();
    await expect.poll(async () => (await getAppointmentWithSlots(moveSeed.appointment.id))?.revision).toBe(1);
    const moved = await getAppointmentWithSlots(moveSeed.appointment.id);
    expect(moved?.slots).toHaveLength(oldMoveSlots);
    expect(moved?.startAt.toISOString()).not.toBe(moveSeed.appointment.startAt.toISOString());
    expect(await findLatestAuditLogByActionAndDetail("RESCHEDULE_APPOINTMENT", moveSeed.appointment.id)).not.toBeNull();
  });

  test("admin configuration supports lifecycle and a replayed settings action rechecks the admin role", async ({ page, browser }) => {
    const typeName = `E2E Admin Typ ${Date.now()}`;
    const blockedDate = berlinLocalDate(5);
    const openDate = berlinLocalDate(6);
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await openAppointmentsTab(page);
    await expect(page.getByRole("region", { name: /Termin-Einstellungen/i })).toHaveCount(0);
    await page.getByRole("button", { name: /^Einstellungen$/i }).click();
    const configuration = page.getByRole("region", { name: /Termin-Einstellungen/i });
    await expect(configuration).toBeVisible();
    await expect(configuration.getByRole("button", { name: /Terminarten/i })).toBeVisible();
    await expect(configuration.getByRole("button", { name: /Buchungszeiten/i })).toBeVisible();
    await expect(configuration.getByRole("button", { name: /Urlaub & Sperrzeiten/i })).toBeVisible();
    await expect(configuration.getByRole("button", { name: /Weitere Einstellungen/i })).toBeVisible();
    await expect(configuration.getByRole("button", { name: /Terminart hinzufügen/i })).toHaveCount(0);
    await expect(page.getByText(/Europe\/Berlin|Basiseinheit/i)).toHaveCount(0);

    await configuration.getByRole("button", { name: /Terminarten/i }).click();
    await expect(configuration.getByRole("heading", { name: /Vorhandene Terminarten/i })).toBeVisible();
    await expect(configuration.locator("form")).toHaveCount(0);
    await configuration.getByRole("button", { name: /Terminart hinzufügen/i }).click();
    let typeForm = configuration.locator("form");
    await typeForm.getByLabel("Name").fill(typeName);
    await typeForm.getByLabel(/^Dauer$/i).selectOption("45");
    await typeForm.getByRole("radio", { name: /Erst durch die Praxis bestätigen/i }).check();
    await typeForm.getByRole("button", { name: /^Speichern$/i }).click();
    await expect(configuration.getByText(/Terminart wurde hinzugefügt/i)).toBeVisible({ timeout: 15_000 });
    const storedType = await findTestAppointmentTypeByName(typeName);
    expect(storedType?.durationMinutes).toBe(45);
    expect(storedType?.confirmationMode).toBe("MANUAL");
    const typeRow = configuration.getByRole("article", {
      name: `Terminart ${typeName}`,
      exact: true,
    });
    await expect(typeRow.getByRole("button", { name: /Löschen|Entfernen/i })).toHaveCount(0);
    await typeRow.getByRole("button", { name: /Bearbeiten/i }).click();
    typeForm = configuration.locator("form");
    await typeForm.getByLabel(/Patienten können diese Terminart online buchen/i).uncheck();
    await typeForm.getByRole("button", { name: /^Speichern$/i }).click();
    await expect.poll(async () => (await findTestAppointmentTypeByName(typeName))?.onlineBookable).toBe(false);

    await configuration.getByRole("button", { name: /Alle Einstellungen/i }).click();
    await configuration.getByRole("button", { name: /Buchungszeiten/i }).click();
    const wednesday = configuration.getByRole("region", { name: "Mittwoch", exact: true });
    await expect(wednesday.getByText("Nicht buchbar")).toBeVisible();
    await wednesday.getByRole("button", { name: /Zeitfenster hinzufügen/i }).click();
    const weeklyForm = configuration.getByRole("form", { name: /Zeitfenster für Mittwoch hinzufügen/i });
    await weeklyForm.getByLabel("Von").fill("09:00");
    await weeklyForm.getByLabel("Bis").fill("12:00");
    await weeklyForm.getByRole("button", { name: /Zeitfenster speichern/i }).click();
    await expect.poll(countTestWeeklyAvailability).toBe(1);

    await configuration.getByRole("button", { name: /Alle Einstellungen/i }).click();
    await configuration.getByRole("button", { name: /Urlaub & Sperrzeiten/i }).click();
    await configuration.getByRole("button", { name: /^Tag sperren$/i }).click();
    let exceptionForm = configuration.locator("form");
    await exceptionForm.getByLabel("Datum").fill(blockedDate);
    await exceptionForm.getByRole("button", { name: /^Tag sperren$/i }).click();
    await expect.poll(countTestAvailabilityExceptions).toBe(1);
    await configuration.getByRole("button", { name: /^Tag sperren$/i }).click();
    exceptionForm = configuration.locator("form");
    await exceptionForm.getByLabel("Datum").fill(openDate);
    await exceptionForm.getByRole("button", { name: /Weitere Optionen/i }).click();
    await exceptionForm.getByRole("radio", { name: /Zusätzliche Zeit öffnen/i }).check();
    await exceptionForm.getByRole("button", { name: /^Zusätzliche Zeit öffnen$/i }).click();
    await expect.poll(countTestAvailabilityExceptions).toBe(2);

    await configuration.getByRole("button", { name: /Alle Einstellungen/i }).click();
    await configuration.getByRole("button", { name: /Weitere Einstellungen/i }).click();
    const settingsForm = configuration.locator("form");
    await settingsForm.getByLabel(/Wie kurzfristig dürfen Patienten buchen/i).selectOption("custom");
    await settingsForm.getByLabel(/Eigener Vorlauf in Minuten/i).fill("180");
    await settingsForm.getByLabel(/Wie weit im Voraus dürfen Patienten buchen/i).selectOption("custom");
    await settingsForm.getByLabel(/Eigener Zeitraum in Tagen/i).fill("45");
    await expect(settingsForm.getByText(/Basiseinheit|Europe\/Berlin/i)).toHaveCount(0);
    const settingsActionPromise = page.waitForRequest(
      (request) => isServerActionRequestFor(request, ["bookingHorizonDays", "45"]),
    );
    await settingsForm.getByRole("button", { name: /Einstellungen speichern/i }).click();
    const settingsActionRequest = await settingsActionPromise;
    await expect.poll(async () => (await getTestAppointmentSettings())?.bookingHorizonDays).toBe(45);
    expect((await getTestAppointmentSettings())?.slotMinutes).toBe(15);
    expect((await getTestAppointmentSettings())?.timeZone).toBe("Europe/Berlin");

    await updateTestAppointmentSettings({ minimumNoticeMinutes: 30, bookingHorizonDays: 32 });
    const staffContext = await browser.newContext();
    const staffPage = await staffContext.newPage();
    try {
      await login(staffPage, STAFF_EMAIL, STAFF_PASSWORD);
      const replay = await replayServerAction(staffContext, settingsActionRequest);
      expect(replay.headers()["x-action-redirect"] ?? replay.url()).toContain("/admin");
      expect((await getTestAppointmentSettings())?.bookingHorizonDays).toBe(32);
      expect((await getTestAppointmentSettings())?.minimumNoticeMinutes).toBe(30);
    } finally {
      await staffContext.close();
    }

    expect(await findLatestAuditLogByActionAndDetail("CREATE_APPOINTMENT_TYPE", storedType?.id ?? "missing")).not.toBeNull();
    expect(await findLatestAuditLogByActionAndDetail("UPDATE_APPOINTMENT_TYPE", storedType?.id ?? "missing")).not.toBeNull();
    expect(await findLatestAuditLogByActionAndDetail("CREATE_WEEKLY_AVAILABILITY", "ID:")).not.toBeNull();
    expect(await findLatestAuditLogByActionAndDetail("CREATE_AVAILABILITY_EXCEPTION", "ID:")).not.toBeNull();
    expect(await findLatestAuditLogByActionAndDetail("UPDATE_BOOKING_SETTINGS", "Buchungsregeln")).not.toBeNull();

    await configuration.getByRole("button", { name: /Alle Einstellungen/i }).click();
    await configuration.getByRole("button", { name: /Buchungszeiten/i }).click();
    const configuredWednesday = configuration.getByRole("region", { name: "Mittwoch", exact: true });
    await configuredWednesday.getByRole("button", {
      name: "Zeitfenster 09:00 bis 12:00 Uhr am Mittwoch entfernen",
      exact: true,
    }).click();
    await configuredWednesday.getByRole("button", {
      name: "Zeitfenster 09:00 bis 12:00 Uhr am Mittwoch endgültig entfernen",
      exact: true,
    }).click();
    await expect.poll(countTestWeeklyAvailability).toBe(0);

    await configuration.getByRole("button", { name: /Alle Einstellungen/i }).click();
    await configuration.getByRole("button", { name: /Urlaub & Sperrzeiten/i }).click();
    const formattedBlockedDate = blockedDate.split("-").reverse().join(".");
    const blockedEntry = configuration.getByRole("article", {
      name: formattedBlockedDate,
      exact: false,
    });
    await blockedEntry.getByRole("button", {
      name: `Eintrag am ${formattedBlockedDate} entfernen`,
      exact: true,
    }).click();
    await blockedEntry.getByRole("button", {
      name: `Eintrag am ${formattedBlockedDate} endgültig entfernen`,
      exact: true,
    }).click();
    await expect.poll(countTestAvailabilityExceptions).toBe(1);
    expect(await findLatestAuditLogByActionAndDetail("DELETE_WEEKLY_AVAILABILITY", "ID:")).not.toBeNull();
    expect(await findLatestAuditLogByActionAndDetail("DELETE_AVAILABILITY_EXCEPTION", "ID:")).not.toBeNull();
  });
});
