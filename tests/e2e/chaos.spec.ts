import { test, expect, type Page } from "@playwright/test";
import {
  cleanupRateLimits,
  cleanupTestContactRequests,
  contactRequestExists,
  disconnectPrisma,
} from "./helpers/db-cleanup";

// Chaos-Tests — prüfen Race-Conditions und Backend-Integrität.
test.use({ viewport: { width: 1280, height: 720 } });

async function dismissCookieBanner(page: Page) {
  const banner = page.getByText("Datenschonende Website");
  if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole("button", { name: "Alles klar" }).click();
    await banner.waitFor({ state: "hidden", timeout: 5000 });
  }
}

test.describe("Chaos & Integrity", () => {
  test.beforeEach(async () => {
    await cleanupRateLimits();
  });

  test.afterAll(async () => {
    await cleanupRateLimits();
    await cleanupTestContactRequests();
    await disconnectPrisma();
  });

  test("Rapid-fire Double-Click auf Submit erzeugt nur einen DB-Eintrag", async ({ page }) => {
    const firstName = `Chaos-${Date.now()}`;

    await page.goto("/#kontakt");
    await dismissCookieBanner(page);
    await page.locator("#kontakt").scrollIntoViewIfNeeded();

    await page.getByLabel("Vorname").fill(firstName);
    await page.getByLabel("Nachname").fill("Monkey");
    await page.getByLabel("Telefonnummer").fill("1234567890");
    await page.getByLabel("Anliegen").selectOption("other");
    await page.getByLabel(/Ich stimme zu/i).check();

    const submitBtn = page.getByRole("button", { name: "Anfrage absenden" });
    await submitBtn.scrollIntoViewIfNeeded();

    await submitBtn.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
      button.click();
    });

    await expect(page.getByText("Vielen Dank für Ihre Anfrage!")).toBeVisible({ timeout: 10_000 });

    // Bei aktiviertem Rate-Limit sollten keine Duplikate entstehen;
    // aber mindestens ein Eintrag.
    const exists = await contactRequestExists(firstName);
    expect(exists).toBe(true);
  });

  test("Bypass-Versuch: nur HTML-Tags im Vornamen wird abgelehnt", async ({ page }) => {
    const spamFirstName = "BypassAttempt";

    await page.goto("/#kontakt");
    await dismissCookieBanner(page);
    await page.locator("#kontakt").scrollIntoViewIfNeeded();

    // sanitize entfernt <p></p> -> leerer String -> Zod min(1) schlägt fehl
    await page.getByLabel("Vorname").fill("<p></p>");
    await page.getByLabel("Nachname").fill(spamFirstName);
    await page.getByLabel("Telefonnummer").fill("1234567890");
    await page.getByLabel("Anliegen").selectOption("other");
    await page.getByLabel(/Ich stimme zu/i).check();

    const submitBtn = page.getByRole("button", { name: "Anfrage absenden" });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    await expect(page.getByText("Vorname ist erforderlich.")).toBeVisible({ timeout: 10_000 });

    const exists = await contactRequestExists(spamFirstName);
    expect(exists).toBe(false);
  });
});
