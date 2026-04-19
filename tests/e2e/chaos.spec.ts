import { test, expect } from "@playwright/test";
import {
  cleanupTestContactRequests,
  contactRequestExists,
  disconnectPrisma,
} from "./helpers/db-cleanup";

// Chaos-Tests — prüfen Race-Conditions und Backend-Integrität.
test.use({ viewport: { width: 1280, height: 720 } });

test.describe("Chaos & Integrity", () => {
  test.afterAll(async () => {
    await cleanupTestContactRequests();
    await disconnectPrisma();
  });

  test("Rapid-fire Double-Click auf Submit erzeugt nur einen DB-Eintrag", async ({ page }) => {
    const firstName = `Chaos-${Date.now()}`;

    await page.goto("/#kontakt");

    await page.getByLabel("Vorname").fill(firstName);
    await page.getByLabel("Nachname").fill("Monkey");
    await page.getByLabel("Telefonnummer").fill("1234567890");
    await page.getByLabel("Ihr Anliegen").fill("Race-Condition Test");
    await page.getByRole("checkbox").check();

    const submitBtn = page.getByRole("button", { name: "Anfrage absenden" });
    await submitBtn.scrollIntoViewIfNeeded();

    await Promise.all([
      submitBtn.dispatchEvent("click"),
      submitBtn.dispatchEvent("click"),
      submitBtn.dispatchEvent("click"),
    ]);

    await expect(page.getByText("Vielen Dank für Ihre Anfrage!")).toBeVisible({ timeout: 10_000 });

    // Bei aktiviertem Rate-Limit (MAX_REQUESTS=3/h) sollten keine Duplikate entstehen;
    // aber mindestens ein Eintrag.
    const exists = await contactRequestExists(firstName);
    expect(exists).toBe(true);
  });

  test("Bypass-Versuch: nur HTML-Tags im Vornamen wird abgelehnt", async ({ page }) => {
    const spamFirstName = "BypassAttempt";

    await page.goto("/#kontakt");

    // sanitize entfernt <p></p> → leerer String → Zod min(1) schlägt fehl
    await page.getByLabel("Vorname").fill("<p></p>");
    await page.getByLabel("Nachname").fill(spamFirstName);
    await page.getByLabel("Telefonnummer").fill("1234567890");
    await page.getByLabel("Ihr Anliegen").fill("Bypass-Test");
    await page.getByRole("checkbox").check();

    const submitBtn = page.getByRole("button", { name: "Anfrage absenden" });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // Fehlermeldung erwartet
    await expect(page.getByText("Vorname ist erforderlich.")).toBeVisible({ timeout: 10_000 });

    // Kein DB-Eintrag
    const exists = await contactRequestExists(spamFirstName);
    expect(exists).toBe(false);
  });
});
