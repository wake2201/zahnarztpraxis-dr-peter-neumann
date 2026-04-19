import { test, expect, Page } from "@playwright/test";
import { cleanupLoginAttempts, cleanupUsersByEmail, disconnectPrisma } from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

// Admin-Dashboard-Tests nur auf Desktop — Admin-Bereich ist nicht mobile-optimiert.
test.use({ viewport: { width: 1280, height: 720 } });

/** Loggt sich als Admin ein und wartet auf das Dashboard. */
async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Passwort").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
}

test.describe("Admin Dashboard", () => {
  test.beforeAll(async () => {
    // Lockouts bereinigen, damit Login nicht blockiert ist
    await cleanupLoginAttempts();
  });

  test.afterAll(async () => {
    // Test-Mitarbeiter bereinigen (falls erstellt)
    await cleanupUsersByEmail(["e2e-staff@test.de"]);
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Dashboard zeigt Statistik-Karten und Anfragen-Tab", async ({ page }) => {
    await loginAsAdmin(page);

    // Statistik-Karten prüfen
    await expect(page.getByText("Gesamt")).toBeVisible();
    await expect(page.getByText("Ungelesen")).toBeVisible();
    await expect(page.getByText("Erledigt")).toBeVisible();

    // Anfragen-Tab ist Standard-Tab
    await expect(page.getByText("Patientenanfragen")).toBeVisible();

    // DSGVO-Hinweis ist sichtbar
    await expect(page.getByText("DSGVO-Hinweis")).toBeVisible();
  });

  test("Admin sieht Benutzer- und Aktivitätslog-Tabs", async ({ page }) => {
    await loginAsAdmin(page);

    // Admin-exklusive Tabs prüfen
    const usersTab = page.getByRole("button", { name: /Benutzer/i });
    const logsTab = page.getByRole("button", { name: /Aktivitätslog/i });

    await expect(usersTab).toBeVisible();
    await expect(logsTab).toBeVisible();

    // Benutzer-Tab öffnen
    await usersTab.click();
    await expect(page.getByText("Neuen Mitarbeiter anlegen")).toBeVisible();
    await expect(page.getByText("Alle Benutzer")).toBeVisible();

    // Aktivitätslog-Tab öffnen
    await logsTab.click();
    await expect(page.getByRole("heading", { name: "Aktivitätslog" })).toBeVisible();
    await expect(page.getByText(/Letzte 100 Aktionen/i)).toBeVisible();
  });

  test("Mitarbeiter erstellen und löschen", async ({ page }) => {
    await loginAsAdmin(page);

    // Zum Benutzer-Tab wechseln
    await page.getByRole("button", { name: /Benutzer/i }).click();
    await expect(page.getByText("Neuen Mitarbeiter anlegen")).toBeVisible();

    // Formular ausfüllen
    const nameInput = page.getByPlaceholder("Max Mustermann");
    const emailInput = page.getByPlaceholder("mitarbeiter@praxis.de");
    const passwordInput = page.getByPlaceholder("••••••••");

    await nameInput.fill("E2E Testmitarbeiter");
    await emailInput.fill("e2e-staff@test.de");
    await passwordInput.fill("Test1234!");

    await page.getByRole("button", { name: /Mitarbeiter erstellen/i }).click();

    // Erfolgsmeldung prüfen
    await expect(page.getByText("Mitarbeiter erfolgreich erstellt!")).toBeVisible({ timeout: 10_000 });

    // Server Action löst revalidatePath aus — Seite neu laden um aktuelle Daten zu sehen
    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Benutzer/i }).click();

    // Neuer Mitarbeiter in der Liste sichtbar
    await expect(page.getByText("E2E Testmitarbeiter")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("e2e-staff@test.de")).toBeVisible();

    // Mitarbeiter löschen — Entfernen-Button neben dem User finden
    await page.getByRole("button", { name: /Entfernen/i }).last().click();

    // Bestätigungsdialog
    await page.getByRole("button", { name: /Bestätigen/i }).click();

    // revalidatePath braucht Server-Re-Render — Seite neu laden um aktuellen Stand zu prüfen
    await page.waitForTimeout(2000);
    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Benutzer/i }).click();

    // Mitarbeiter sollte aus der Liste verschwunden sein
    await expect(page.getByText("e2e-staff@test.de")).toBeHidden({ timeout: 10_000 });
  });

  test("Unautorisierter Zugriff wird auf Login umgeleitet", async ({ page }) => {
    // Direkt auf Dashboard zugreifen ohne Login
    await page.goto("/admin");

    // Sollte zum Login umgeleitet werden
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
  });
});
