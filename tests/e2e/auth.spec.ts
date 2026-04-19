import { test, expect } from "@playwright/test";
import { cleanupLoginAttempts, disconnectPrisma } from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const WRONG_PASSWORD = "FalschesPasswort1!";

test.describe("Admin Login & Lockout", () => {
  test.afterAll(async () => {
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Erfolgreicher Login mit Seed-Daten", async ({ page }) => {
    await page.goto("/admin/login");

    await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
    await page.getByLabel("Passwort").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Anmelden" }).click();

    // Redirect zum Dashboard prüfen
    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });

    // Dashboard-Inhalt prüfen (Abmelden-Button sichtbar)
    await expect(
      page.getByRole("button", { name: /Abmelden/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Lockout nach 3 fehlgeschlagenen Versuchen", async ({ page }) => {
    // Vorher aufräumen, damit kein vorheriger Lockout stört
    await cleanupLoginAttempts();

    await page.goto("/admin/login");

    // 3x falsches Passwort eingeben
    for (let i = 0; i < 3; i++) {
      await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
      await page.getByLabel("Passwort").fill(WRONG_PASSWORD);
      await page.getByRole("button", { name: "Anmelden" }).click();

      if (i < 2) {
        // Erste 2 Versuche: generische Fehlermeldung abwarten
        await expect(
          page.getByText("Ungültige Anmeldedaten")
        ).toBeVisible({ timeout: 10_000 });
      }
    }

    // Nach dem 3. Versuch: Lockout-Meldung prüfen
    await expect(
      page.getByText(/Gesperrt für noch \d+ Minute/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
