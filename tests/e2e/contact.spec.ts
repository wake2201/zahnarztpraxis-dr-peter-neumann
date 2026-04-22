import { expect, test, type Page } from "@playwright/test";
import {
  cleanupRateLimits,
  cleanupTestContactRequests,
  contactRequestExists,
  disconnectPrisma,
  findLatestContactRequestByFirstName,
} from "./helpers/db-cleanup";

const TEST_LAST_NAME = "Playwright";

// Kontaktformular-Tests prüfen Backend-Logik (Validierung, Honeypot, DB)
// nur Desktop nötig, da die Server-Action viewport-unabhängig ist.
// Vermeidet außerdem Rate-Limit-Konflikte (max. 3 Requests/Minute).
test.use({ viewport: { width: 1280, height: 720 } });

/** Cookie-Banner schließen und warten, bis es komplett verschwunden ist. */
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
    const firstName = `E2E-Test-${Date.now()}`;

    await page.goto("/");
    await dismissCookieBanner(page);

    await page.locator("#kontakt").scrollIntoViewIfNeeded();

    await page.getByLabel("Vorname").fill(firstName);
    await page.getByLabel("Nachname").fill(TEST_LAST_NAME);
    await page.getByLabel("Ländervorwahl").selectOption("+43");
    const phoneInput = page.getByLabel("Telefonnummer");
    await phoneInput.type("98a76 54321");
    await expect(phoneInput).toHaveValue("987654321");
    await page.getByLabel("Anliegen").selectOption("appointment");
    await page.getByRole("radio", { name: "vormittags" }).check();
    await page
      .getByLabel("Zusätzliche Informationen (optional)")
      .fill("E2E-Testanfrage – bitte ignorieren.");
    await page.getByLabel(/Ich stimme zu/i).check();

    const submitButton = page.getByRole("button", { name: "Anfrage absenden" });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await expect(page.getByText("Vielen Dank für Ihre Anfrage!")).toBeVisible({ timeout: 10_000 });

    const exists = await contactRequestExists(firstName);
    expect(exists).toBe(true);

    const savedRequest = await findLatestContactRequestByFirstName(firstName);
    expect(savedRequest?.countryCode).toBe("+43");
    expect(savedRequest?.phone).toBe("987654321");
  });

  test("Honeypot blockiert Spam-Einträge", async ({ page }) => {
    await page.goto("/");
    await dismissCookieBanner(page);

    await page.locator("#kontakt").scrollIntoViewIfNeeded();

    const honeypotFirstName = "E2E-Test-Honeypot";

    await page.getByLabel("Vorname").fill(honeypotFirstName);
    await page.getByLabel("Nachname").fill("Spambot");
    await page.getByLabel("Telefonnummer").fill("000000000");
    await page.getByLabel("Anliegen").selectOption("other");
    await page
      .getByLabel("Zusätzliche Informationen (optional)")
      .fill("Spam-Test");
    await page.getByLabel(/Ich stimme zu/i).check();

    // React-controlled Input: nativen value-setter + input/change Events auslösen.
    await page.locator("#website").evaluate((element: HTMLInputElement) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;

      if (!nativeSetter) {
        throw new Error("Kein nativer Setter für Honeypot gefunden.");
      }

      nativeSetter.call(element, "https://spam.example.com");
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const submitButton = page.getByRole("button", { name: "Anfrage absenden" });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await expect(page.getByText("Vielen Dank für Ihre Anfrage!")).toBeVisible({ timeout: 10_000 });

    const exists = await contactRequestExists(honeypotFirstName);
    expect(exists).toBe(false);
  });
});
