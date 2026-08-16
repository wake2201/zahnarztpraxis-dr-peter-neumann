import { expect, test, type BrowserContext, type Page, type Request } from "@playwright/test";
import {
  countAppointmentAccessSessions,
  createSeededTestAppointment,
  createTestAvailabilityException,
  createTestAppointmentType,
  disconnectPrisma,
  expireAppointmentAccessSession,
  findLatestAppointmentByFirstName,
  getAppointmentWithSlots,
  resetAppointmentTestData,
  updateTestAppointmentSettings,
  updateTestAppointmentType,
} from "./helpers/db-cleanup";

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

async function configureType(name: string, confirmationMode: "AUTO" | "MANUAL" = "AUTO") {
  await updateTestAppointmentSettings({ minimumNoticeMinutes: 0, bookingHorizonDays: 30 });
  const appointmentType = await createTestAppointmentType({
    name,
    durationMinutes: 30,
    confirmationMode,
  });
  await createTestAvailabilityException({
    localDate: berlinLocalDate(2),
    kind: "OPEN",
    startMinute: 600,
    endMinute: 780,
  });
  return appointmentType;
}

async function bookAppointment(page: Page, typeId: string, firstName: string) {
  await page.goto("/termin/buchen");
  await page.locator(`input[name="appointmentType"][value="${typeId}"]`).check({ force: true });
  await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
  const slot = page.locator('input[name="bookingSlot"]').first();
  await expect(slot).toBeAttached({ timeout: 15_000 });
  const startAt = await slot.getAttribute("value");
  expect(startAt).toBeTruthy();
  await slot.check({ force: true });
  await page.getByRole("button", { name: /Weiter zu den Kontaktdaten/i }).click();
  await page.locator("#appointment-first-name").fill(firstName);
  await page.locator("#appointment-last-name").fill("Playwright");
  await page.locator("#appointment-phone").fill("15123456789");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Angaben prüfen/i }).click();
  await page.getByRole("button", { name: /Buchung abschließen/i }).click();
  await expect(page.getByText(/Ihr Termin ist bestätigt|Ihre Buchung wartet auf Bestätigung/i)).toBeVisible({ timeout: 15_000 });
  const managementCode = (await page.locator("code").textContent())?.trim() ?? "";
  expect(managementCode).toMatch(/^[A-Za-z0-9_-]{43}$/);
  return { managementCode, startAt: startAt! };
}

async function openManagedAppointment(page: Page, managementCode: string) {
  await page.goto("/termin");
  await page.locator("#appointment-management-code").fill(managementCode);
  await page.getByRole("button", { name: /Termin sicher aufrufen/i }).click();
  await expect(page.getByText("Ihr Termin", { exact: true })).toBeVisible({ timeout: 15_000 });
}

async function replayServerAction(context: BrowserContext, request: Request) {
  const originalHeaders = request.headers();
  const body = request.postDataBuffer();
  if (!body || !originalHeaders["next-action"] || !originalHeaders["content-type"]) {
    throw new Error("Server Action request could not be captured for replay");
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

test.describe("Patient appointment management", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async () => {
    await resetAppointmentTestData();
  });

  test.afterAll(async () => {
    await resetAppointmentTestData();
    await disconnectPrisma();
  });

  test("invalid codes and database IDs do not grant access; a valid code creates a hashed session", async ({ page }) => {
    const firstName = `E2E-Termin-Code-${Date.now()}`;
    const appointmentType = await configureType("E2E Code-Sicherheit");
    const { managementCode } = await bookAppointment(page, appointmentType.id, firstName);
    const stored = await findLatestAppointmentByFirstName(firstName);
    if (!stored) throw new Error("E2E appointment was not stored");

    await page.goto("/termin");
    await page.locator("#appointment-management-code").fill("ungueltiger-code-1234567890");
    await page.getByRole("button", { name: /Termin sicher aufrufen/i }).click();
    await expect(page.getByRole("alert")).toContainText(/ungültig oder abgelaufen/i);
    expect(page.url()).not.toContain("ungueltiger-code");

    await page.locator("#appointment-management-code").fill(stored.id);
    await page.getByRole("button", { name: /Termin sicher aufrufen/i }).click();
    await expect(page.getByRole("alert")).toContainText(/ungültig oder abgelaufen/i);

    await page.locator("#appointment-management-code").fill(stored.managementCodeHash ?? "missing-hash");
    await page.getByRole("button", { name: /Termin sicher aufrufen/i }).click();
    await expect(page.getByRole("alert")).toContainText(/ungültig oder abgelaufen/i);

    await page.locator("#appointment-management-code").fill(managementCode);
    await page.getByRole("button", { name: /Termin sicher aufrufen/i }).click();
    await expect(page.getByText("Ihr Termin", { exact: true })).toBeVisible({ timeout: 15_000 });
    expect(page.url()).not.toContain(managementCode);
    const cookie = (await page.context().cookies()).find((entry) => entry.name === "appointment_session");
    if (!cookie) throw new Error("Appointment session cookie was not created");
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Lax");
    expect(cookie.path).toBe("/termin");
    expect(cookie.value).not.toBe(managementCode);
    expect(cookie.expires * 1000).toBeGreaterThan(Date.now() + 19 * 60_000);
    expect(cookie.expires * 1000).toBeLessThan(Date.now() + 21 * 60_000);

    const withSession = await getAppointmentWithSlots(stored.id);
    expect(withSession?.accessSession?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(withSession?.accessSession?.tokenHash).not.toBe(cookie.value);
    expect(withSession?.accessSession?.expiresAt.getTime()).toBeGreaterThan(Date.now() + 19 * 60_000);
    expect(withSession?.accessSession?.expiresAt.getTime()).toBeLessThan(Date.now() + 21 * 60_000);
    expect(withSession?.managementCodeHash).not.toBe(managementCode);
  });

  test("an expired management session cannot mutate its appointment", async ({ page }) => {
    const firstName = `E2E-Termin-Expired-${Date.now()}`;
    const appointmentType = await configureType("E2E Abgelaufene Sitzung");
    const { managementCode } = await bookAppointment(page, appointmentType.id, firstName);
    const stored = await findLatestAppointmentByFirstName(firstName);
    if (!stored) throw new Error("E2E appointment was not stored");

    await openManagedAppointment(page, managementCode);
    await expireAppointmentAccessSession(stored.id);
    await page.getByRole("button", { name: /Termin absagen/i }).click();
    await page.getByRole("button", { name: /Absage bestätigen/i }).click();
    await expect(page.getByRole("alert")).toContainText(/ungültig oder abgelaufen/i);

    const unchanged = await getAppointmentWithSlots(stored.id);
    expect(unchanged?.status).toBe("CONFIRMED");
    expect(unchanged?.revision).toBe(0);
    expect(unchanged?.slots).toHaveLength(2);
  });

  test("management-code verification is rate-limited with a dedicated generic boundary", async ({ page }) => {
    await page.goto("/termin");
    const input = page.locator("#appointment-management-code");
    const submit = page.getByRole("button", { name: /Termin sicher aufrufen/i });

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await input.fill(`${"A".repeat(42)}${attempt}`);
      const responsePromise = page.waitForResponse(
        (response) => response.request().method() === "POST"
          && Boolean(response.request().headers()["next-action"]),
      );
      await submit.click();
      await responsePromise;
    }

    await expect(page.getByRole("alert")).toContainText(/Zu viele Anfragen/i);
    expect(page.url()).not.toContain("A".repeat(20));
  });

  test("cancellation preserves the record, releases every slot and makes the time bookable again", async ({ page }) => {
    const firstName = `E2E-Termin-Cancel-${Date.now()}`;
    const appointmentType = await configureType("E2E Patientenabsage");
    const { managementCode, startAt } = await bookAppointment(page, appointmentType.id, firstName);
    const before = await findLatestAppointmentByFirstName(firstName);
    if (!before) throw new Error("E2E appointment was not stored");

    await openManagedAppointment(page, managementCode);
    await page.getByRole("button", { name: /Termin absagen/i }).click();
    const actionRequestPromise = page.waitForRequest(
      (request) => request.method() === "POST" && Boolean(request.headers()["next-action"]),
    );
    await page.getByRole("button", { name: /Absage bestätigen/i }).click();
    const actionRequest = await actionRequestPromise;
    await expect(page.getByText(/Storniert/i)).toBeVisible({ timeout: 15_000 });

    const after = await getAppointmentWithSlots(before.id);
    expect(after?.status).toBe("CANCELLED");
    expect(after?.slots).toHaveLength(0);
    expect(after?.id).toBe(before.id);

    const replay = await replayServerAction(page.context(), actionRequest);
    expect(replay.ok()).toBe(true);
    const afterReplay = await getAppointmentWithSlots(before.id);
    expect(afterReplay?.status).toBe("CANCELLED");
    expect(afterReplay?.revision).toBe(after?.revision);
    expect(afterReplay?.slots).toHaveLength(0);

    await page.goto("/termin/buchen");
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator(`input[name="bookingSlot"][value="${startAt}"]`)).toBeAttached();

    const slotMs = 15 * 60_000;
    const pastStart = new Date(Math.floor((Date.now() - 60 * 60_000) / slotMs) * slotMs);
    const past = await createSeededTestAppointment({
      appointmentTypeId: appointmentType.id,
      startAt: pastStart,
      firstName: `E2E-Termin-Historisch-${Date.now()}`,
      status: "CONFIRMED",
    });
    await openManagedAppointment(page, past.managementCode);
    await expect(page.getByRole("button", { name: /Termin verschieben|Termin absagen/i })).toHaveCount(0);
    await replayServerAction(page.context(), actionRequest);
    const historicalAfterReplay = await getAppointmentWithSlots(past.appointment.id);
    expect(historicalAfterReplay?.status).toBe("CONFIRMED");
    expect(historicalAfterReplay?.revision).toBe(0);
    expect(historicalAfterReplay?.slots).toHaveLength(2);
  });

  test("rescheduling atomically frees the old interval and reserves the new interval", async ({ page }) => {
    const firstName = `E2E-Termin-Reschedule-${Date.now()}`;
    const appointmentType = await configureType("E2E Verschiebung");
    const { managementCode, startAt } = await bookAppointment(page, appointmentType.id, firstName);
    const before = await findLatestAppointmentByFirstName(firstName);
    if (!before) throw new Error("E2E appointment was not stored");
    const oldSlots = before.slots.map((slot) => slot.slotStartAt.toISOString());

    await openManagedAppointment(page, managementCode);
    await page.getByRole("button", { name: /Termin verschieben/i }).click();
    const options = page.locator('input[name="managedAppointmentSlot"]');
    await expect(options.first()).toBeAttached({ timeout: 15_000 });
    const values = await options.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
    const replacement = values.find((value) => Date.parse(value) >= before.endAt.getTime());
    expect(replacement).toBeTruthy();
    await page.locator(`input[name="managedAppointmentSlot"][value="${replacement}"]`).check({ force: true });
    await page.getByRole("button", { name: /Neuen Zeitpunkt bestätigen/i }).click();
    await expect(page.getByText("Ihr Termin", { exact: true })).toBeVisible({ timeout: 15_000 });

    const after = await getAppointmentWithSlots(before.id);
    expect(after?.startAt.toISOString()).toBe(replacement);
    expect(after?.slots).toHaveLength(2);
    expect(after?.slots.map((slot) => slot.slotStartAt.toISOString())).not.toEqual(oldSlots);
    expect(after?.revision).toBe(before.revision + 1);

    await page.goto("/termin/buchen");
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator(`input[name="bookingSlot"][value="${startAt}"]`)).toBeAttached();
  });

  test("rescheduling a MANUAL booking preserves PENDING policy", async ({ page }) => {
    const firstName = `E2E-Termin-Manual-Move-${Date.now()}`;
    const appointmentType = await configureType("E2E Manuelle Verschiebung", "MANUAL");
    const { managementCode, startAt } = await bookAppointment(page, appointmentType.id, firstName);
    const before = await findLatestAppointmentByFirstName(firstName);
    if (!before) throw new Error("E2E appointment was not stored");
    expect(before.status).toBe("PENDING");
    await updateTestAppointmentType(appointmentType.id, {
      name: "E2E Manuelle Verschiebung geändert",
      durationMinutes: 45,
      confirmationMode: "AUTO",
    });

    await openManagedAppointment(page, managementCode);
    await page.getByRole("button", { name: /Termin verschieben/i }).click();
    const options = page.locator('input[name="managedAppointmentSlot"]');
    await expect(options.first()).toBeAttached({ timeout: 15_000 });
    const values = await options.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
    const replacement = values.find((value) => value !== startAt);
    expect(replacement).toBeTruthy();
    await page.locator(`input[name="managedAppointmentSlot"][value="${replacement}"]`).check({ force: true });
    await page.getByRole("button", { name: /Neuen Zeitpunkt bestätigen/i }).click();
    await expect.poll(async () => (await getAppointmentWithSlots(before.id))?.revision).toBe(1);
    const after = await getAppointmentWithSlots(before.id);
    expect(after?.status).toBe("PENDING");
    expect(after?.startAt.toISOString()).toBe(replacement);
    expect(after?.typeNameSnapshot).toBe(before.typeNameSnapshot);
    expect(after?.durationMinutesSnapshot).toBe(30);
    expect(after?.confirmationModeSnapshot).toBe("MANUAL");
    expect(after?.slots).toHaveLength(2);
  });

  test("a collision introduced after selection rolls back the complete reschedule", async ({ page }) => {
    const firstName = `E2E-Termin-Rollback-${Date.now()}`;
    const appointmentType = await configureType("E2E Collision Rollback");
    const { managementCode } = await bookAppointment(page, appointmentType.id, firstName);
    const before = await findLatestAppointmentByFirstName(firstName);
    if (!before) throw new Error("E2E appointment was not stored");
    const oldStart = before.startAt.toISOString();
    const oldSlots = before.slots.map((slot) => slot.slotStartAt.toISOString());

    await openManagedAppointment(page, managementCode);
    await page.getByRole("button", { name: /Termin verschieben/i }).click();
    const replacementOption = page.locator('input[name="managedAppointmentSlot"]').last();
    await expect(replacementOption).toBeAttached({ timeout: 15_000 });
    const replacement = await replacementOption.getAttribute("value");
    expect(replacement).toBeTruthy();
    await replacementOption.check({ force: true });
    await createSeededTestAppointment({
      appointmentTypeId: appointmentType.id,
      startAt: new Date(replacement!),
      firstName: `E2E-Termin-Collision-${Date.now()}`,
    });

    await page.getByRole("button", { name: /Neuen Zeitpunkt bestätigen/i }).click();
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    const after = await getAppointmentWithSlots(before.id);
    expect(after?.startAt.toISOString()).toBe(oldStart);
    expect(after?.slots.map((slot) => slot.slotStartAt.toISOString())).toEqual(oldSlots);
    expect(after?.revision).toBe(before.revision);
  });

  test("independent browser sessions cannot read each other and reissuing one code invalidates its old token", async ({ browser }) => {
    const typeA = await configureType("E2E Session A");
    const typeB = await createTestAppointmentType({ name: "E2E Session B", durationMinutes: 30 });
    const bookingContextA = await browser.newContext();
    const bookingContextB = await browser.newContext();
    const bookingPageA = await bookingContextA.newPage();
    const bookingPageB = await bookingContextB.newPage();
    const bookingA = await bookAppointment(bookingPageA, typeA.id, `E2E-Termin-Session-A-${Date.now()}`);
    const bookingB = await bookAppointment(bookingPageB, typeB.id, `E2E-Termin-Session-B-${Date.now()}`);
    await bookingContextA.close();
    await bookingContextB.close();

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    try {
      await openManagedAppointment(pageA, bookingA.managementCode);
      await openManagedAppointment(pageB, bookingB.managementCode);
      await expect(pageA.getByText("E2E Session A", { exact: true })).toBeVisible();
      await expect(pageA.getByText("E2E Session B", { exact: true })).toHaveCount(0);
      await expect(pageB.getByText("E2E Session B", { exact: true })).toBeVisible();
      await expect(pageB.getByText("E2E Session A", { exact: true })).toHaveCount(0);
      const cookieA = (await contextA.cookies()).find((entry) => entry.name === "appointment_session");
      const cookieB = (await contextB.cookies()).find((entry) => entry.name === "appointment_session");
      expect(cookieA?.value).not.toBe(cookieB?.value);
      expect(await countAppointmentAccessSessions()).toBe(2);

      await pageB.getByRole("button", { name: /Sitzung beenden/i }).click();
      await expect(pageB.locator("#appointment-management-code")).toBeVisible();
      await pageB.locator("#appointment-management-code").fill(bookingA.managementCode);
      await pageB.getByRole("button", { name: /Termin sicher aufrufen/i }).click();
      await expect(pageB.getByText("E2E Session A", { exact: true })).toBeVisible();

      await pageA.reload();
      await expect(pageA.locator("#appointment-management-code")).toBeVisible({ timeout: 15_000 });
      await expect(pageA.getByText("E2E Session A", { exact: true })).toHaveCount(0);
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
