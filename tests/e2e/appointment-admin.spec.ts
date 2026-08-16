import { expect, test, type BrowserContext, type Page, type Request } from "@playwright/test";
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

function appointmentRow(page: Page, firstName: string) {
  return page.getByTestId("appointment-list").getByRole("button").filter({ hasText: firstName });
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
    await expect(page.getByRole("button", { name: /Telefontermin/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Buchung konfigurieren/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Benutzer/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Aktivitätslog|Aktivitaetslog/i })).toHaveCount(0);
  });

  test("staff can create an ADMIN-source phone appointment while the same action fails closed without a session", async ({ page, browser }) => {
    const firstName = `E2E-Termin-Telefon-${Date.now()}`;
    const appointmentType = await configureOpenType({
      name: "E2E Nur intern",
      confirmationMode: "MANUAL",
      onlineBookable: false,
    });

    await login(page, STAFF_EMAIL, STAFF_PASSWORD);
    await openAppointmentsTab(page);
    await page.getByRole("button", { name: /Telefontermin/i }).click();
    const form = page.getByRole("heading", { name: /Telefontermin eintragen/i }).locator("..",).locator("..");
    await expect(form.getByRole("option", { name: /E2E Nur intern/i })).toBeAttached();
    await form.getByRole("button", { name: /Freie Termine laden/i }).click();
    const slot = form.locator('button[aria-pressed="false"]').first();
    await expect(slot).toBeVisible({ timeout: 15_000 });
    await slot.click();
    await form.getByLabel("Vorname").fill(firstName);
    await form.getByLabel("Nachname").fill("Playwright");
    await form.getByLabel("Ländervorwahl").fill("+49");
    await form.getByLabel("Telefon").fill("15123456789");
    await form.getByRole("checkbox").check();
    const actionRequestPromise = page.waitForRequest(
      (request) => request.method() === "POST" && Boolean(request.headers()["next-action"]),
    );
    await form.getByRole("button", { name: /Termin verbindlich eintragen/i }).click();
    const actionRequest = await actionRequestPromise;
    await expect(page.getByText(/offene Terminanfrage eingetragen/i)).toBeVisible({ timeout: 15_000 });

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
    await page.getByRole("button", { name: /^Offen/ }).click();

    await appointmentRow(page, confirmSeed.appointment.firstName).click();
    await page.getByRole("button", { name: /^Bestätigen$/i }).click();
    const confirmRequestPromise = page.waitForRequest(
      (request) => request.method() === "POST" && Boolean(request.headers()["next-action"]),
    );
    await page.getByRole("button", { name: /^Ausführen$/i }).click();
    const confirmRequest = await confirmRequestPromise;
    await expect.poll(async () => (await getAppointmentWithSlots(confirmSeed.appointment.id))?.status).toBe("CONFIRMED");
    const confirmed = await getAppointmentWithSlots(confirmSeed.appointment.id);
    expect(confirmed?.revision).toBe(1);
    const staleReplay = await replayServerAction(page.context(), confirmRequest);
    expect(staleReplay.ok()).toBe(true);
    expect((await getAppointmentWithSlots(confirmSeed.appointment.id))?.revision).toBe(1);
    expect(await findLatestAuditLogByActionAndDetail("CONFIRM_APPOINTMENT", confirmSeed.appointment.id)).not.toBeNull();

    await appointmentRow(page, rejectSeed.appointment.firstName).click();
    await page.getByRole("button", { name: /^Ablehnen$/i }).click();
    await page.getByRole("button", { name: /^Ausführen$/i }).click();
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
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await openAppointmentsTab(page);
    await page.getByRole("button", { name: /Buchung konfigurieren/i }).click();
    const configuration = page.getByRole("region", { name: /Terminkonfiguration/i });
    await expect(configuration).toBeVisible();

    const forms = configuration.locator("form");
    const typeForm = forms.nth(0);
    await typeForm.getByLabel("Name").fill(typeName);
    await typeForm.getByLabel(/Dauer in Minuten/i).fill("45");
    await typeForm.getByLabel(/Bestätigung/i).selectOption("MANUAL");
    await typeForm.getByRole("button", { name: /Terminart erstellen/i }).click();
    await expect(configuration.getByText(/Terminart wurde erstellt/i)).toBeVisible({ timeout: 15_000 });
    const storedType = await findTestAppointmentTypeByName(typeName);
    expect(storedType?.durationMinutes).toBe(45);
    expect(storedType?.confirmationMode).toBe("MANUAL");
    const typeRow = configuration.getByText(typeName, { exact: false }).first().locator("..").locator("..");
    await expect(typeRow.getByRole("button", { name: /Löschen|Entfernen/i })).toHaveCount(0);
    await typeRow.getByRole("button", { name: /Bearbeiten/i }).click();
    await typeForm.getByLabel(/Online buchbar/i).uncheck();
    await typeForm.getByRole("button", { name: /Änderungen speichern/i }).click();
    await expect.poll(async () => (await findTestAppointmentTypeByName(typeName))?.onlineBookable).toBe(false);

    const weeklyForm = forms.nth(1);
    await weeklyForm.getByLabel(/Wochentag/i).selectOption("3");
    await weeklyForm.getByLabel("Von").fill("09:00");
    await weeklyForm.getByLabel("Bis").fill("12:00");
    await weeklyForm.getByRole("button", { name: /Zeitfenster hinzufügen/i }).click();
    await expect.poll(countTestWeeklyAvailability).toBe(1);

    const exceptionForm = forms.nth(2);
    await exceptionForm.getByLabel("Datum").fill(berlinLocalDate(5));
    await exceptionForm.getByLabel("Art").selectOption("BLOCK");
    await exceptionForm.getByRole("button", { name: /Ausnahme speichern/i }).click();
    await expect.poll(countTestAvailabilityExceptions).toBe(1);
    await exceptionForm.getByLabel("Datum").fill(berlinLocalDate(6));
    await exceptionForm.getByLabel("Art").selectOption("OPEN");
    await exceptionForm.getByRole("button", { name: /Ausnahme speichern/i }).click();
    await expect.poll(countTestAvailabilityExceptions).toBe(2);

    const settingsForm = forms.nth(3);
    await settingsForm.getByLabel(/Mindestvorlauf/i).fill("180");
    await settingsForm.getByLabel(/Buchungshorizont/i).fill("45");
    await expect(settingsForm.getByLabel(/Basiseinheit/i)).toHaveValue("15 Minuten");
    await expect(settingsForm.getByLabel(/Praxis-Zeitzone/i)).toHaveValue("Europe/Berlin");
    const settingsActionPromise = page.waitForRequest(
      (request) => request.method() === "POST" && Boolean(request.headers()["next-action"]),
    );
    await settingsForm.getByRole("button", { name: /Regeln speichern/i }).click();
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

    await configuration.getByRole("button", { name: /Zeitfenster entfernen/i }).click();
    await configuration.getByRole("button", { name: /^Entfernen$/i }).click();
    await expect.poll(countTestWeeklyAvailability).toBe(0);
    await configuration.getByRole("button", { name: /Ausnahme entfernen/i }).first().click();
    await configuration.getByRole("button", { name: /^Entfernen$/i }).click();
    await expect.poll(countTestAvailabilityExceptions).toBe(1);
    expect(await findLatestAuditLogByActionAndDetail("DELETE_WEEKLY_AVAILABILITY", "ID:")).not.toBeNull();
    expect(await findLatestAuditLogByActionAndDetail("DELETE_AVAILABILITY_EXCEPTION", "ID:")).not.toBeNull();
  });
});
