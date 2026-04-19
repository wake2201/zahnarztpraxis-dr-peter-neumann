import { test, expect } from "@playwright/test";
import { cleanupLoginAttempts, disconnectPrisma } from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

test.use({ viewport: { width: 1280, height: 720 } });

test.describe("Security — Edge Cases", () => {
  test.afterAll(async () => {
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Unauthenticated Admin-Routen leiten auf /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
  });

  test("robots.txt erlaubt Startseite, sperrt /admin", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /admin");
  });

  test("Security-Header werden gesetzt", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["strict-transport-security"]).toContain("max-age=");
    // Öffentliche Seite DARF noindex nicht haben (nur /admin).
    expect(res.headers()["x-robots-tag"]).toBeUndefined();
  });

  test("Admin-Bereich sendet noindex-Header", async ({ request }) => {
    const res = await request.get("/admin/login");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("CSP-Nonce wird pro Request neu generiert", async ({ request }) => {
    const [a, b] = await Promise.all([request.get("/"), request.get("/")]);
    const cspA = a.headers()["content-security-policy"] || "";
    const cspB = b.headers()["content-security-policy"] || "";
    const nonceA = cspA.match(/nonce-([^']+)'/)?.[1];
    const nonceB = cspB.match(/nonce-([^']+)'/)?.[1];
    expect(nonceA).toBeTruthy();
    expect(nonceB).toBeTruthy();
    expect(nonceA).not.toBe(nonceB);
  });

  test("Login-Fehler nach Lockout mit klarem Error-Text", async ({ page }) => {
    await cleanupLoginAttempts();

    await page.goto("/admin/login");
    for (let i = 0; i < 3; i++) {
      await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
      await page.getByLabel("Passwort").fill("WrongPassword1!");
      await page.getByRole("button", { name: "Anmelden" }).click();
      if (i < 2) {
        await expect(page.getByText("Ungültige Anmeldedaten")).toBeVisible({ timeout: 10_000 });
      }
    }
    await expect(page.getByText(/Gesperrt für noch \d+ Minute/i)).toBeVisible({ timeout: 10_000 });

    // Selbst mit korrektem Passwort bleibt Lockout aktiv
    await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
    await page.getByLabel("Passwort").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page.getByText(/Gesperrt/i)).toBeVisible({ timeout: 10_000 });
  });
});
