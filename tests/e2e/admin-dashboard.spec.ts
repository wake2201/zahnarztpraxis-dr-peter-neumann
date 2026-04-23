import { test, expect, Page } from "@playwright/test";
import {
  cleanupLoginAttempts,
  cleanupTestContactRequests,
  cleanupUsersByEmail,
  createTestAuditLog,
  createTestContactRequest,
  disconnectPrisma,
  ensureTestUser,
  findLatestAuditLogByActionAndDetail,
  getContactRequestById,
  getContactRequestReadState,
  restoreAuditLogs,
  snapshotAuditLogs,
  updateUserRoleByEmail,
  userExistsByEmail,
} from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const CREATED_STAFF_EMAIL = "e2e-staff@test.de";
const WEAK_PASSWORD_EMAIL = "weak-password-user@test.de";
const PROMOTED_STAFF_EMAIL = "promoted-staff@test.de";

test.use({ viewport: { width: 1280, height: 720 } });

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Passwort").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(500);
}

async function openUsersTab(page: Page) {
  const usersTab = page.getByRole("button", { name: /Benutzer/i });
  await expect(usersTab).toBeVisible({ timeout: 10_000 });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await usersTab.click();
    const formVisible = await page
      .getByPlaceholder("Max Mustermann")
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    if (formVisible) {
      return;
    }
  }

  await expect(page.getByPlaceholder("Max Mustermann")).toBeVisible({ timeout: 10_000 });
}

async function openLogsTab(page: Page) {
  const logsTab = page.getByRole("button", { name: /Aktivitaetslog|Aktivitätslog/i });
  await expect(logsTab).toBeVisible({ timeout: 10_000 });
  await logsTab.click();
  await expect(page.getByRole("heading", { name: /Aktivitaetslog|Aktivitätslog/i })).toBeVisible({
    timeout: 10_000,
  });
}

async function disableUserFormValidation(page: Page) {
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
  });
}

function requestRow(page: Page, message: string) {
  return page.locator("div.px-6.py-5").filter({ has: page.getByText(message) }).first();
}

function userRow(page: Page, email: string) {
  return page.locator("div.px-6.py-4").filter({ has: page.getByText(email) }).first();
}

test.describe("Admin Dashboard", () => {
  test.beforeAll(async () => {
    await cleanupLoginAttempts();
  });

  test.afterAll(async () => {
    await cleanupUsersByEmail([
      CREATED_STAFF_EMAIL,
      WEAK_PASSWORD_EMAIL,
      PROMOTED_STAFF_EMAIL,
    ]);
    await cleanupTestContactRequests();
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Dashboard zeigt Statistik-Karten und Anfragen-Tab", async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText("Gesamt")).toBeVisible();
    await expect(page.getByText("Ungelesen")).toBeVisible();
    await expect(page.getByText("Erledigt")).toBeVisible();
    await expect(page.getByText("Patientenanfragen")).toBeVisible();
    await expect(page.getByText("DSGVO-Hinweis")).toBeVisible();
  });

  test("Admin sieht Benutzer- und Aktivitätslog-Tabs", async ({ page }) => {
    await loginAsAdmin(page);

    const usersTab = page.getByRole("button", { name: /Benutzer/i });
    const logsTab = page.getByRole("button", { name: /Aktivitaetslog|Aktivitätslog/i });

    await expect(usersTab).toBeVisible();
    await expect(logsTab).toBeVisible();

    await openUsersTab(page);
    await expect(page.getByText("Alle Benutzer")).toBeVisible();

    await openLogsTab(page);
    await expect(page.getByText(/Letzte 100 Aktionen/i)).toBeVisible();
  });

  test("Mitarbeiter erstellen und löschen", async ({ page }) => {
    await loginAsAdmin(page);
    await openUsersTab(page);

    await page.getByPlaceholder("Max Mustermann").fill("E2E Testmitarbeiter");
    await page.getByPlaceholder("mitarbeiter@praxis.de").fill(CREATED_STAFF_EMAIL);
    await page.getByPlaceholder("••••••••").fill("Test1234!");
    await page.getByRole("button", { name: /Mitarbeiter erstellen/i }).click();

    await expect(page.getByText("Mitarbeiter erfolgreich erstellt!")).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await openUsersTab(page);

    await expect(page.getByText("E2E Testmitarbeiter")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(CREATED_STAFF_EMAIL)).toBeVisible();

    await page.getByRole("button", { name: /Entfernen/i }).last().click();
    await page.getByRole("button", { name: /Bestätigen/i }).click();

    await page.waitForTimeout(2_000);
    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await openUsersTab(page);

    await expect(page.getByText(CREATED_STAFF_EMAIL)).toBeHidden({ timeout: 10_000 });
  });

  test("Unautorisierter Zugriff wird auf Login umgeleitet", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
  });

  test("Anfrage-Status bleibt nach Reload korrekt gespeichert", async ({ page }) => {
    const request = await createTestContactRequest({
      message: `E2E-Test Toggle ${Date.now()}`,
      read: false,
    });

    await loginAsAdmin(page);

    const row = requestRow(page, request.message);
    await expect(row.getByText(request.message)).toBeVisible();
    await row.getByRole("button", { name: /Gelesen/i }).click();

    await expect.poll(async () => getContactRequestReadState(request.id)).toBe(true);

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });

    const reloadedRow = requestRow(page, request.message);
    await expect(reloadedRow.getByRole("button", { name: /Ungelesen/i })).toBeVisible();
  });

  test("Anfrage löschen erzeugt Audit-Log und entfernt den Datensatz", async ({ page }) => {
    const request = await createTestContactRequest({
      message: `E2E-Test Delete ${Date.now()}`,
    });

    await loginAsAdmin(page);

    const row = requestRow(page, request.message);
    await expect(row.getByText(request.message)).toBeVisible();
    await row.getByRole("button", { name: /Löschen/i }).click();
    await page.getByRole("button", { name: /Endgültig löschen/i }).click();

    await expect.poll(async () => getContactRequestById(request.id)).toBe(null);
    await expect.poll(async () => {
      return Boolean(await findLatestAuditLogByActionAndDetail("DELETE_REQUEST", request.id));
    }).toBe(true);

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(request.message)).toBeHidden();
  });

  test("Server-seitige Zod-Validierung blockiert ungültige E-Mail trotz noValidate", async ({ page }) => {
    const invalidEmail = `ungueltig-email-${Date.now()}`;

    await loginAsAdmin(page);
    await openUsersTab(page);
    await disableUserFormValidation(page);

    await page.getByPlaceholder("Max Mustermann").fill("Playwright Invalid Email");
    await page.getByPlaceholder("mitarbeiter@praxis.de").fill(invalidEmail);
    await page.getByPlaceholder("••••••••").fill("StrongPass123!");
    await page.getByRole("button", { name: /Mitarbeiter erstellen/i }).click();

    await expect(page.getByText("Ungültige E-Mail-Adresse.")).toBeVisible({ timeout: 10_000 });
    await expect.poll(async () => userExistsByEmail(invalidEmail)).toBe(false);
  });

  test("Server-seitige Zod-Validierung blockiert schwaches Passwort trotz noValidate", async ({ page }) => {
    await loginAsAdmin(page);
    await openUsersTab(page);
    await disableUserFormValidation(page);

    await page.getByPlaceholder("Max Mustermann").fill("Playwright Weak Password");
    await page.getByPlaceholder("mitarbeiter@praxis.de").fill(WEAK_PASSWORD_EMAIL);
    await page.getByPlaceholder("••••••••").fill("password");
    await page.getByRole("button", { name: /Mitarbeiter erstellen/i }).click();

    await expect(
      page.getByText(
        "Passwort muss mindestens 1 Großbuchstaben, 1 Kleinbuchstaben, 1 Ziffer und 1 Sonderzeichen enthalten.",
      ),
    ).toBeVisible({ timeout: 10_000 });
    await expect.poll(async () => userExistsByEmail(WEAK_PASSWORD_EMAIL)).toBe(false);
  });

  test("Delete-Action blockiert stale UI nach Role-Eskalation", async ({ page }) => {
    await ensureTestUser({
      email: PROMOTED_STAFF_EMAIL,
      password: "PromotedUser123!",
      name: "Promoted Staff",
      role: "staff",
    });

    await loginAsAdmin(page);
    await openUsersTab(page);
    await expect(page.getByText(PROMOTED_STAFF_EMAIL)).toBeVisible();

    await updateUserRoleByEmail(PROMOTED_STAFF_EMAIL, "admin");

    const row = userRow(page, PROMOTED_STAFF_EMAIL);
    await row.getByRole("button", { name: /Entfernen/i }).click();
    await page.getByRole("button", { name: /Bestätigen/i }).click();

    await expect(page.getByText("Admin-Accounts können nicht gelöscht werden.")).toBeVisible({ timeout: 10_000 });
    await expect.poll(async () => userExistsByEmail(PROMOTED_STAFF_EMAIL)).toBe(true);

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await openUsersTab(page);
    await expect(page.getByText(PROMOTED_STAFF_EMAIL)).toBeVisible();
  });

  test("Aktivitätslog bietet keine destructive Clear-Aktion", async ({ page }) => {
    const snapshot = await snapshotAuditLogs();
    const logDetails = `E2E-Test Log Seed ${Date.now()}`;
    await createTestAuditLog({
      action: "LOGIN",
      details: logDetails,
    });

    try {
      await loginAsAdmin(page);
      await openLogsTab(page);

      await expect(page.getByRole("button", { name: /Logs leeren/i })).toHaveCount(0);
      await expect(page.getByText("Einträge können nicht manuell gelöscht werden.")).toBeVisible();
      await expect(page.getByText(logDetails)).toBeVisible();

      await page.reload();
      await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
      await openLogsTab(page);
      await expect(page.getByRole("button", { name: /Logs leeren/i })).toHaveCount(0);
      await expect(page.getByText(logDetails)).toBeVisible();
    } finally {
      await restoreAuditLogs(snapshot);
    }
  });
});
