import { test, expect, Page } from "@playwright/test";
import { cleanupLoginAttempts, cleanupUsersByEmail, disconnectPrisma, ensureTestUser } from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EinSicheresPasswort123!";

const STAFF_EMAIL = "staff-visibility-test@test.de";
const STAFF_PASSWORD = "Password123!";

test.use({ viewport: { width: 1280, height: 720 } });

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("E-Mail").fill(email);
  await page.getByLabel("Passwort").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
}

function tabLocators(page: Page) {
  return {
    requestsTab: page.getByRole("button", { name: /Anfragen/i }),
    usersTab: page.getByRole("button", { name: /Benutzer/i }),
    logsTab: page.getByRole("button", { name: /Aktivitaetslog|Aktivitätslog/i }),
  };
}

test.describe("Role Visibility & Normalization", () => {
  test.beforeAll(async () => {
    await cleanupLoginAttempts();
    await ensureTestUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: "E2E Admin",
      role: "admin",
    });
    await ensureTestUser({
      email: STAFF_EMAIL,
      password: STAFF_PASSWORD,
      name: "Test Staff",
      role: "STAFF",
    });
  });

  test.afterAll(async () => {
    await cleanupUsersByEmail([STAFF_EMAIL]);
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Admin user sees all tabs", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    const { requestsTab, usersTab, logsTab } = tabLocators(page);
    await expect(requestsTab).toBeVisible();
    await expect(usersTab).toBeVisible();
    await expect(logsTab).toBeVisible();
  });

  test("Staff user only sees the requests tab", async ({ page }) => {
    await loginAs(page, STAFF_EMAIL, STAFF_PASSWORD);

    const { requestsTab, usersTab, logsTab } = tabLocators(page);
    await expect(requestsTab).toBeVisible();
    await expect(usersTab).toBeHidden();
    await expect(logsTab).toBeHidden();
  });

  test("Normalisierte Staff-Session bleibt nach Reload auf Requests-only beschränkt", async ({ page }) => {
    await loginAs(page, STAFF_EMAIL, STAFF_PASSWORD);
    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });

    const { requestsTab, usersTab, logsTab } = tabLocators(page);
    await expect(requestsTab).toBeVisible();
    await expect(usersTab).toBeHidden();
    await expect(logsTab).toBeHidden();
  });
});
