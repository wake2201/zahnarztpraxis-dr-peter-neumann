import { test, expect, Page } from "@playwright/test";
import {
  cleanupLoginAttempts,
  cleanupUsersByEmail,
  countActiveLoginLocks,
  disconnectPrisma,
  ensureTestUser,
} from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const WRONG_PASSWORD = "FalschesPasswort1!";
const INVALID_ROLE_EMAIL = "invalid-role-login@test.de";
const INVALID_ROLE_PASSWORD = "OwnerRole123!";

async function submitLogin(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("E-Mail").fill(email);
  await page.getByLabel("Passwort").fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
}

test.describe("Admin Login & Lockout", () => {
  test.beforeEach(async () => {
    await cleanupLoginAttempts();
  });

  test.afterAll(async () => {
    await cleanupUsersByEmail([INVALID_ROLE_EMAIL]);
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Erfolgreicher Login mit Seed-Daten", async ({ page }) => {
    await submitLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: /Abmelden/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Lockout nach 3 fehlgeschlagenen Versuchen", async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await submitLogin(page, ADMIN_EMAIL, WRONG_PASSWORD);

      if (i < 2) {
        await expect(
          page.getByText("Ungültige Anmeldedaten. Bitte versuchen Sie es erneut."),
        ).toBeVisible({ timeout: 10_000 });
      }
    }

    await expect(
      page.getByText(/Gesperrt für noch \d+ Minute/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Parallele Fehlversuche triggern atomaren Lockout", async ({ context }) => {
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ]);

    try {
      await Promise.all(
        pages.map(async (page) => {
          await submitLogin(page, ADMIN_EMAIL, WRONG_PASSWORD);
          await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
          await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible({ timeout: 10_000 });
        }),
      );

      await expect.poll(async () => (await countActiveLoginLocks()) > 0).toBe(true);

      const verificationPage = await context.newPage();
      try {
        await submitLogin(verificationPage, ADMIN_EMAIL, ADMIN_PASSWORD);
        await expect(verificationPage).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
        await expect(
          verificationPage.getByText(/Gesperrt|Zu viele fehlgeschlagene Versuche/i),
        ).toBeVisible({ timeout: 10_000 });
      } finally {
        await verificationPage.close();
      }
    } finally {
      await Promise.all(pages.map((page) => page.close()));
    }
  });

  test("Benutzer mit ungueltiger Rolle kann sich nicht anmelden", async ({ page }) => {
    await ensureTestUser({
      email: INVALID_ROLE_EMAIL,
      password: INVALID_ROLE_PASSWORD,
      name: "Invalid Role",
      role: "owner",
    });

    await submitLogin(page, INVALID_ROLE_EMAIL, INVALID_ROLE_PASSWORD);

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
    await expect(
      page.getByText("Ungültige Anmeldedaten. Bitte versuchen Sie es erneut."),
    ).toBeVisible({ timeout: 10_000 });
  });
});
