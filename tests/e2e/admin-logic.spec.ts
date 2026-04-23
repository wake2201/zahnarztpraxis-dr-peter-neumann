import { test, expect, Page } from "@playwright/test";
import {
  cleanupLoginAttempts,
  cleanupTestContactRequests,
  cleanupUsersByEmail,
  createTestContactRequest,
  disconnectPrisma,
  ensureTestUser,
  getContactRequestById,
  updateUserRoleByEmail,
} from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const UNKNOWN_ROLE_EMAIL = "unknown-role-user@test.de";
const STALE_ROLE_EMAIL = "stale-role-user@test.de";
const REFRESHED_STAFF_ADMIN_EMAIL = "refresh-downgraded-admin@test.de";
const REFRESHED_STAFF_ADMIN_PASSWORD = "RefreshAdmin123!";

test.use({ viewport: { width: 1280, height: 720 } });

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("E-Mail").fill(email);
  await page.getByLabel("Passwort").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
}

async function openUsersTab(page: Page) {
  const usersTab = page.getByRole("button", { name: /Benutzer/i });
  const usersForm = page.getByPlaceholder("Max Mustermann");
  await expect(usersTab).toBeVisible({ timeout: 10_000 });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await usersTab.click({ force: true });
    const usersVisible = await usersForm.isVisible({ timeout: 1_500 }).catch(() => false);

    if (usersVisible) {
      return;
    }

    await page.waitForTimeout(250);
  }

  await expect(usersForm).toBeVisible({ timeout: 10_000 });
}

function requestRows(page: Page, message: string) {
  return page.locator("div.px-6.py-5").filter({ has: page.getByText(message) });
}

function userRow(page: Page, email: string) {
  return page.locator("div.px-6.py-4").filter({ has: page.getByText(email) }).first();
}

test.describe("Admin Logic Corrections", () => {
  test.beforeAll(async () => {
    await cleanupLoginAttempts();
  });

  test.afterAll(async () => {
    await cleanupUsersByEmail([
      UNKNOWN_ROLE_EMAIL,
      STALE_ROLE_EMAIL,
      REFRESHED_STAFF_ADMIN_EMAIL,
    ]);
    await cleanupTestContactRequests();
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Ungueltige Rollen bleiben sichtbar, aber blockiert", async ({ page }) => {
    await ensureTestUser({
      email: UNKNOWN_ROLE_EMAIL,
      password: "UnknownRole123!",
      name: "Unknown Role User",
      role: "owner",
    });

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await openUsersTab(page);

    const row = userRow(page, UNKNOWN_ROLE_EMAIL);
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText("Unbekannte Rolle")).toBeVisible();
    await expect(row.getByRole("button", { name: /Entfernen/i })).toHaveCount(0);
  });

  test("Fehlgeschlagene Benutzer-Loeschung stellt die Server-Wahrheit ohne manuellen Reload wieder her", async ({ page }) => {
    await ensureTestUser({
      email: STALE_ROLE_EMAIL,
      password: "StaleRole123!",
      name: "Stale Role User",
      role: "staff",
    });

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await openUsersTab(page);

    const staleRow = userRow(page, STALE_ROLE_EMAIL);
    await expect(staleRow).toBeVisible({ timeout: 10_000 });

    await updateUserRoleByEmail(STALE_ROLE_EMAIL, "admin");

    await staleRow.getByRole("button", { name: /Entfernen/i }).click();
    await page.getByRole("button", { name: /Bestaetigen|Bestätigen/i }).click();

    await expect(page.getByText("Admin-Accounts können nicht gelöscht werden.")).toBeVisible({ timeout: 10_000 });

    const restoredRow = userRow(page, STALE_ROLE_EMAIL);
    await expect(restoredRow).toBeVisible({ timeout: 10_000 });
    await expect(restoredRow.getByText("Admin")).toBeVisible();
    await expect(restoredRow.getByRole("button", { name: /Entfernen/i })).toHaveCount(0);
  });

  test("Fehlgeschlagene Anfrage-Aktion entfernt stale UI nach Refresh und zeigt den Fehler an", async ({ page }) => {
    const request = await createTestContactRequest({
      message: `E2E-Stale-Request ${Date.now()}`,
      read: false,
    });

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    const staleRow = requestRows(page, request.message).first();
    await expect(staleRow).toBeVisible({ timeout: 10_000 });

    const secondPage = await page.context().newPage();
    try {
      await secondPage.goto("/admin");
      await expect(secondPage.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });

      const activeRow = requestRows(secondPage, request.message).first();
      await expect(activeRow).toBeVisible({ timeout: 10_000 });
      await activeRow.getByRole("button", { name: /Löschen/i }).click();
      await secondPage.getByRole("button", { name: /Endgültig löschen/i }).click();

      await expect.poll(async () => getContactRequestById(request.id)).toBe(null);
    } finally {
      await secondPage.close();
    }

    await staleRow.getByRole("button", { name: /Gelesen/i }).click();

    await expect(page.getByText("Anfrage nicht gefunden.")).toBeVisible({ timeout: 10_000 });
    await expect(requestRows(page, request.message)).toHaveCount(0, { timeout: 10_000 });
  });

  test("Rollenverlust auf einem privilegierten Tab springt beim naechsten Refresh sauber auf Anfragen zurueck", async ({ page }) => {
    await ensureTestUser({
      email: REFRESHED_STAFF_ADMIN_EMAIL,
      password: REFRESHED_STAFF_ADMIN_PASSWORD,
      name: "Refresh Admin",
      role: "admin",
    });

    await loginAs(page, REFRESHED_STAFF_ADMIN_EMAIL, REFRESHED_STAFF_ADMIN_PASSWORD);
    await openUsersTab(page);

    await updateUserRoleByEmail(REFRESHED_STAFF_ADMIN_EMAIL, "staff");
    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole("button", { name: /Benutzer/i })).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Aktivitaetslog|Aktivitätslog/i })).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Anfragen/i })).toBeVisible();
    await expect(page.getByText("Patientenanfragen")).toBeVisible({ timeout: 10_000 });
  });
});
