import { test, expect, Page } from "@playwright/test";
import {
  cleanupRateLimits,
  cleanupTestContactRequests,
  contactRequestExists,
  disconnectPrisma,
} from "./helpers/db-cleanup";

const TEST_FIRST_NAME = "E2E-Test";
const TEST_LAST_NAME = "Playwright";

// Kontaktformular-Tests prüfen Backend-Logik (Validierung, Honeypot, DB) —
// nur Desktop nötig, da die Server-Actions viewport-unabhängig sind.
// Vermeidet außerdem Rate-Limit-Konflikte (max. 3 Requests/Minute).
test.use({ viewport: { width: 1280, height: 720 } });

/** Cookie-Banner schließen und warten bis es komplett verschwunden ist */
async function dismissCookieBanner(page: Page) {
  const banner = page.getByText("Cookie-Hinweis");
  if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole("button", { name: "Verstanden" }).click();
    await banner.waitFor({ state: "hidden", timeout: 5000 });
  }
}

test.describe("Kontaktformular", () => {
  test.beforeEach(async () => {
    await cleanupRateLimits();
  });

  test.afterAll(async () => {
    await cleanupRateLimits();
    await cleanupTestContactRequests();
    await disconnectPrisma();
  });

  test("Formular erfolgreich absenden", async ({ page }) => {
    await page.goto("/");
    await dismissCookieBanner(page);

    // Zum Kontaktbereich scrollen
    await page.locator("#kontakt").scrollIntoViewIfNeeded();

    // Formularfelder ausfüllen
    await page.getByLabel("Vorname").fill(TEST_FIRST_NAME);
    await page.getByLabel("Nachname").fill(TEST_LAST_NAME);
    await page.getByLabel("Telefonnummer").fill("123456789");
    await page.getByLabel("Ihr Anliegen").fill("E2E-Testanfrage — bitte ignorieren.");

    // DSGVO-Checkbox aktivieren
    await page.getByRole("checkbox").check();

    // Submit-Button in den sichtbaren Bereich scrollen und klicken
    const submitBtn = page.getByRole("button", { name: "Anfrage absenden" });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // Erfolgsmeldung prüfen
    await expect(
      page.getByText("Vielen Dank für Ihre Anfrage!")
    ).toBeVisible({ timeout: 10_000 });

    // Prüfen, dass der Eintrag in der DB existiert
    const exists = await contactRequestExists(TEST_FIRST_NAME);
    expect(exists).toBe(true);
  });

  test("Honeypot blockiert Spam-Einträge", async ({ page }) => {
    await page.goto("/");
    await dismissCookieBanner(page);

    await page.locator("#kontakt").scrollIntoViewIfNeeded();

    const honeypotFirstName = "E2E-Test-Honeypot";

    // Formularfelder ausfüllen
    await page.getByLabel("Vorname").fill(honeypotFirstName);
    await page.getByLabel("Nachname").fill("Spambot");
    await page.getByLabel("Telefonnummer").fill("000000000");
    await page.getByLabel("Ihr Anliegen").fill("Spam-Test");

    // DSGVO-Checkbox aktivieren
    await page.getByRole("checkbox").check();

    // Honeypot-Feld per JS befüllen (unsichtbar im DOM)
    // React controlled inputs: nativen value-setter + input+change Events
    await page.locator("#website").evaluate((el: HTMLInputElement) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )!.set!;
      nativeSetter.call(el, "https://spam.example.com");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Submit-Button scrollen und klicken
    const submitBtn = page.getByRole("button", { name: "Anfrage absenden" });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // UI zeigt trotzdem "Erfolg" (um Spammer nicht zu informieren)
    await expect(
      page.getByText("Vielen Dank für Ihre Anfrage!")
    ).toBeVisible({ timeout: 10_000 });

    // Aber: Eintrag darf NICHT in der DB sein
    const exists = await contactRequestExists(honeypotFirstName);
    expect(exists).toBe(false);
  });
});
