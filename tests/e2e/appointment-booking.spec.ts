import { expect, test, type Page } from "@playwright/test";
import {
  countAppointmentsByFirstName,
  countAppointmentSlots,
  createTestAvailabilityException,
  createTestAppointmentType,
  deleteTestAvailabilityException,
  disconnectPrisma,
  findLatestAppointmentByFirstName,
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

function lastSundayOfMonth(year: number, zeroBasedMonth: number) {
  const date = new Date(Date.UTC(year, zeroBasedMonth + 1, 0));
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return date.toISOString().slice(0, 10);
}

function nextBerlinDstTransitionDate() {
  const today = berlinLocalDate(0);
  const year = Number(today.slice(0, 4));
  const candidates = [year, year + 1]
    .flatMap((candidateYear) => [
      lastSundayOfMonth(candidateYear, 2),
      lastSundayOfMonth(candidateYear, 9),
    ])
    .sort();
  const transition = candidates.find((candidate) => candidate > today);
  if (!transition) throw new Error("No DST transition within the supported booking horizon");
  return transition;
}

async function configureOpenDay(options: {
  name: string;
  durationMinutes?: number;
  confirmationMode?: "AUTO" | "MANUAL";
  active?: boolean;
  onlineBookable?: boolean;
  dayOffset?: number;
  startMinute?: number;
  endMinute?: number;
}) {
  const localDate = berlinLocalDate(options.dayOffset ?? 2);
  await updateTestAppointmentSettings({ minimumNoticeMinutes: 0, bookingHorizonDays: 30 });
  const appointmentType = await createTestAppointmentType({
    name: options.name,
    durationMinutes: options.durationMinutes ?? 30,
    confirmationMode: options.confirmationMode ?? "AUTO",
    active: options.active ?? true,
    onlineBookable: options.onlineBookable ?? true,
  });
  const openException = await createTestAvailabilityException({
    localDate,
    kind: "OPEN",
    startMinute: options.startMinute ?? 600,
    endMinute: options.endMinute ?? 720,
  });
  return { appointmentType, localDate, openException };
}

async function preparePublicBooking(
  page: Page,
  options: { typeId: string; firstName: string; slotIndex?: number },
) {
  await page.goto("/termin/buchen");
  await page.locator(`input[name="appointmentType"][value="${options.typeId}"]`).check({ force: true });
  await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();

  const slot = page.locator('input[name="bookingSlot"]').nth(options.slotIndex ?? 0);
  await expect(slot).toBeAttached({ timeout: 15_000 });
  const startAt = await slot.getAttribute("value");
  expect(startAt).toBeTruthy();
  await slot.check({ force: true });
  await page.getByRole("button", { name: /Weiter zu den Kontaktdaten/i }).click();
  await page.locator("#appointment-first-name").fill(options.firstName);
  await page.locator("#appointment-last-name").fill("Playwright");
  await page.locator("#appointment-phone").fill("015123456789");
  await page.locator("#appointment-details").fill("E2E Terminbuchung ohne E-Mail-Adresse");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Angaben prüfen/i }).click();
  return startAt!;
}

async function finishPublicBooking(page: Page) {
  await page.getByRole("button", { name: /Buchung abschließen/i }).click();
  await expect(page.getByText(/Ihr Termin ist bestätigt|Ihre Buchung wartet auf Bestätigung/i)).toBeVisible({
    timeout: 15_000,
  });
  const managementCode = (await page.locator("code").textContent())?.trim() ?? "";
  expect(managementCode).toMatch(/^[A-Za-z0-9_-]{43}$/);
  return managementCode;
}

test.describe("Public appointment booking", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async () => {
    await resetAppointmentTestData();
  });

  test.afterAll(async () => {
    await resetAppointmentTestData();
    await disconnectPrisma();
  });

  test("navigation from the deeply scrolled homepage starts the booking flow at the top", async ({ page }) => {
    await createTestAppointmentType({ name: "E2E Scrollposition" });
    await page.goto("/");

    const bookingLink = page.getByRole("link", { name: /Termin direkt buchen/i });
    await bookingLink.scrollIntoViewIfNeeded();
    await expect(bookingLink).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    await bookingLink.click();

    await expect(page).toHaveURL(/\/termin\/buchen$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await expect(page.locator("header").first()).toBeInViewport();
    await expect(page.getByRole("heading", { level: 1, name: "Termin online buchen" })).toBeInViewport();
    await expect(page.getByRole("navigation", { name: "Buchungsfortschritt" })).toBeInViewport();
    await expect(page.getByText("Welche Terminart benötigen Sie?", { exact: true })).toBeInViewport();
  });

  test("AUTO booking reserves the exact duration, stores snapshots and never exposes the code in the URL", async ({ page }) => {
    const firstName = `E2E-Termin-Auto-${Date.now()}`;
    const { appointmentType } = await configureOpenDay({
      name: "E2E Prophylaxe 45",
      durationMinutes: 45,
      confirmationMode: "AUTO",
      endMinute: 690,
    });

    const selectedStart = await preparePublicBooking(page, { typeId: appointmentType.id, firstName });
    const managementCode = await finishPublicBooking(page);

    await expect(page).toHaveURL(/\/termin\/buchen$/);
    expect(page.url()).not.toContain(managementCode);
    const stored = await findLatestAppointmentByFirstName(firstName);
    if (!stored) throw new Error("E2E appointment was not stored");
    expect(stored.status).toBe("CONFIRMED");
    expect(stored.source).toBe("ONLINE");
    expect(stored.typeNameSnapshot).toBe("E2E Prophylaxe 45");
    expect(stored.durationMinutesSnapshot).toBe(45);
    expect(stored.startAt.toISOString()).toBe(selectedStart);
    expect(stored.endAt.getTime() - stored.startAt.getTime()).toBe(45 * 60_000);
    expect(stored.slots).toHaveLength(3);
    expect(stored.managementCodeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.managementCodeHash).not.toBe(managementCode);
    expect(stored.phone).toBe("15123456789");
    expect(stored.gdprConsent).toBe(true);
  });

  test("MANUAL mode creates PENDING while inactive and internal-only types stay out of public selection", async ({ page }) => {
    const firstName = `E2E-Termin-Manual-${Date.now()}`;
    const { appointmentType } = await configureOpenDay({
      name: "E2E Manuelle Anfrage",
      confirmationMode: "MANUAL",
    });
    await createTestAppointmentType({ name: "E2E Inaktiv", active: false, onlineBookable: true });
    await createTestAppointmentType({ name: "E2E Nur Telefon", active: true, onlineBookable: false });

    await page.goto("/termin/buchen");
    await expect(page.getByText("E2E Manuelle Anfrage", { exact: true })).toBeVisible();
    await expect(page.getByText("E2E Inaktiv", { exact: true })).toHaveCount(0);
    await expect(page.getByText("E2E Nur Telefon", { exact: true })).toHaveCount(0);

    await preparePublicBooking(page, { typeId: appointmentType.id, firstName });
    await finishPublicBooking(page);
    await expect(page.getByText(/wartet auf Bestätigung/i)).toBeVisible();
    const stored = await findLatestAppointmentByFirstName(firstName);
    expect(stored?.status).toBe("PENDING");
    expect(stored?.confirmationModeSnapshot).toBe("MANUAL");
  });

  test("notice, horizon and BLOCK policy suppress otherwise open slots", async ({ page }) => {
    const targetDate = berlinLocalDate(2);
    const appointmentType = await createTestAppointmentType({ name: "E2E Policy" });
    await createTestAvailabilityException({
      localDate: targetDate,
      kind: "OPEN",
      startMinute: 600,
      endMinute: 630,
    });

    await updateTestAppointmentSettings({ minimumNoticeMinutes: 3 * 24 * 60, bookingHorizonDays: 10 });
    await page.goto("/termin/buchen");
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator('input[name="bookingSlot"]')).toHaveCount(0);

    await updateTestAppointmentSettings({ minimumNoticeMinutes: 0, bookingHorizonDays: 1 });
    await page.reload();
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator('input[name="bookingSlot"]')).toHaveCount(0);

    await updateTestAppointmentSettings({ minimumNoticeMinutes: 0, bookingHorizonDays: 10 });
    await createTestAvailabilityException({
      localDate: targetDate,
      kind: "BLOCK",
      startMinute: 0,
      endMinute: 1440,
    });
    await page.reload();
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator('input[name="bookingSlot"]')).toHaveCount(0);
    await expect(page.getByText(/kein freier Online-Termin/i)).toBeVisible();
  });

  test("DST gaps and ambiguous 02:xx instants fail closed while unambiguous slots remain", async ({ page }) => {
    const transitionDate = nextBerlinDstTransitionDate();
    await updateTestAppointmentSettings({ minimumNoticeMinutes: 0, bookingHorizonDays: 365 });
    const appointmentType = await createTestAppointmentType({
      name: "E2E DST",
      durationMinutes: 30,
    });
    await createTestAvailabilityException({
      localDate: transitionDate,
      kind: "OPEN",
      startMinute: 120,
      endMinute: 240,
    });

    await page.goto("/termin/buchen");
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    for (let pageIndex = 0; pageIndex < 30; pageIndex += 1) {
      if (await page.locator('input[name="bookingSlot"]').count()) break;
      const loadMore = page.getByRole("button", { name: /Weitere Termine laden/i });
      if (!(await loadMore.isVisible())) break;
      await loadMore.click();
    }

    const starts = await page.locator('input[name="bookingSlot"]').evaluateAll((inputs) =>
      inputs.map((input) => (input as HTMLInputElement).value),
    );
    expect(starts.length).toBeGreaterThan(0);
    const localHours = starts.map((startAt) => new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(startAt)));
    expect(localHours.some((hour) => hour.startsWith("02"))).toBe(false);
  });

  for (const policy of ["outside-window", "block", "minimum-notice", "horizon", "non-online"] as const) {
    test(`server revalidation rejects ${policy} changed after slot selection`, async ({ page }) => {
      const firstName = `E2E-Termin-Revalidate-${policy}-${Date.now()}`;
      const { appointmentType, localDate, openException } = await configureOpenDay({
        name: `E2E Revalidation ${policy}`,
      });
      await preparePublicBooking(page, { typeId: appointmentType.id, firstName });

      if (policy === "outside-window") {
        await deleteTestAvailabilityException(openException.id);
      } else if (policy === "block") {
        await createTestAvailabilityException({
          localDate,
          kind: "BLOCK",
          startMinute: 0,
          endMinute: 1440,
        });
      } else if (policy === "minimum-notice") {
        await updateTestAppointmentSettings({ minimumNoticeMinutes: 3 * 24 * 60, bookingHorizonDays: 30 });
      } else if (policy === "horizon") {
        await updateTestAppointmentSettings({ minimumNoticeMinutes: 0, bookingHorizonDays: 1 });
      } else {
        await updateTestAppointmentType(appointmentType.id, { onlineBookable: false });
      }

      await page.getByRole("button", { name: /Buchung abschließen/i }).click();
      await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
      await expect.poll(async () => countAppointmentsByFirstName(firstName)).toBe(0);
      expect(await countAppointmentSlots()).toBe(0);
    });
  }

  test("server revalidation rejects a type disabled after slot selection without a partial reservation", async ({ page }) => {
    const firstName = `E2E-Termin-Stale-${Date.now()}`;
    const { appointmentType } = await configureOpenDay({ name: "E2E Stale Type" });
    await preparePublicBooking(page, { typeId: appointmentType.id, firstName });
    await updateTestAppointmentType(appointmentType.id, { active: false });

    await page.getByRole("button", { name: /Buchung abschließen/i }).click();
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await expect.poll(async () => countAppointmentsByFirstName(firstName)).toBe(0);
    expect(await countAppointmentSlots()).toBe(0);
  });

  test("occupied intervals are excluded for the full multi-slot duration", async ({ page }) => {
    const firstName = `E2E-Termin-Overlap-${Date.now()}`;
    const { appointmentType } = await configureOpenDay({
      name: "E2E Single Capacity",
      durationMinutes: 30,
      startMinute: 600,
      endMinute: 630,
    });
    await preparePublicBooking(page, { typeId: appointmentType.id, firstName });
    await finishPublicBooking(page);

    await page.goto("/termin/buchen");
    await page.locator(`input[name="appointmentType"][value="${appointmentType.id}"]`).check({ force: true });
    await page.getByRole("button", { name: /Freie Termine anzeigen/i }).click();
    await expect(page.locator('input[name="bookingSlot"]')).toHaveCount(0);
    expect(await countAppointmentSlots()).toBe(2);
  });

  test("two independent clients racing for one slot produce exactly one success and no partial loser", async ({ browser }) => {
    const firstName = `E2E-Termin-Race-${Date.now()}`;
    const { appointmentType } = await configureOpenDay({
      name: "E2E Concurrency",
      durationMinutes: 30,
      startMinute: 600,
      endMinute: 630,
    });
    const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
    const pages = await Promise.all(contexts.map((context) => context.newPage()));

    try {
      const starts = await Promise.all(
        pages.map((page) => preparePublicBooking(page, { typeId: appointmentType.id, firstName })),
      );
      expect(new Set(starts).size).toBe(1);

      await Promise.all(
        pages.map((page) => page.getByRole("button", { name: /Buchung abschließen/i }).click()),
      );
      await expect.poll(async () => countAppointmentsByFirstName(firstName)).toBe(1);
      await expect.poll(async () => {
        const visible = await Promise.all(
          pages.map((page) => page.getByText(/Ihr Termin ist bestätigt/i).isVisible()),
        );
        return visible.filter(Boolean).length;
      }).toBe(1);
      const successCount = await Promise.all(
        pages.map((page) => page.getByText(/Ihr Termin ist bestätigt/i).isVisible()),
      );
      expect(successCount.filter(Boolean)).toHaveLength(1);
      await expect(pages[successCount[0] ? 1 : 0]!.getByRole("alert")).toBeVisible();
      expect(await countAppointmentSlots()).toBe(2);
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  });
});
