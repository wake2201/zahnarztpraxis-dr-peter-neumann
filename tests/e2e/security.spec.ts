import { test, expect, APIResponse } from "@playwright/test";
import { cleanupLoginAttempts, cleanupRateLimits, disconnectPrisma } from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EinSicheresPasswort123!";

async function expectInvalidInputResponse(response: APIResponse) {
  const body = await response.json();
  expect(body).toEqual({ error: "Ungültige Eingabe." });
}

test.use({ viewport: { width: 1280, height: 720 } });

test.describe("Security — Edge Cases", () => {
  test.beforeEach(async () => {
    await cleanupRateLimits();
  });

  test.afterAll(async () => {
    await cleanupRateLimits();
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
        await expect(page.getByText("Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.")).toBeVisible({
          timeout: 10_000,
        });
      }
    }
    await expect(page.getByText(/Gesperrt für noch \d+ Minute/i)).toBeVisible({ timeout: 10_000 });

    await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
    await page.getByLabel("Passwort").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page.getByText(/Gesperrt/i)).toBeVisible({ timeout: 10_000 });
  });

  test("Client-Error-Route akzeptiert nur digest und pathname", async ({ request }) => {
    const res = await request.post("/api/log/client-error", {
      data: {
        digest: "digest-123",
        pathname: "/admin",
      },
    });

    expect(res.status()).toBe(204);
  });

  test("Client-Error-Route lehnt kaputtes JSON ab", async ({ request }) => {
    const res = await request.post("/api/log/client-error", {
      headers: {
        "Content-Type": "application/json",
      },
      data: "{\"message\":",
    });

    expect(res.status()).toBe(400);
    await expectInvalidInputResponse(res);
  });

  test("Client-Error-Route lehnt falsche Feldtypen ab", async ({ request }) => {
    const res = await request.post("/api/log/client-error", {
      data: {
        digest: ["digest"],
        pathname: { value: "/admin" },
      },
    });

    expect(res.status()).toBe(400);
    await expectInvalidInputResponse(res);
  });

  test("Client-Error-Route lehnt zusaetzliche Felder ab", async ({ request }) => {
    const res = await request.post("/api/log/client-error", {
      data: {
        digest: "digest-123",
        pathname: "/admin",
        message: "Playwright client error",
        stack: "Error: Playwright client error",
      },
    });

    expect(res.status()).toBe(400);
    await expectInvalidInputResponse(res);
  });

  test("Client-Error-Route rate-limited wiederholte Requests", async ({ request }) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await request.post("/api/log/client-error", {
        data: {
          digest: `digest-${attempt}`,
          pathname: "/admin",
        },
      });

      expect(response.status()).toBe(204);
    }

    const blocked = await request.post("/api/log/client-error", {
      data: {
        digest: "digest-blocked",
        pathname: "/admin",
      },
    });

    expect(blocked.status()).toBe(429);
    await expect(blocked.json()).resolves.toEqual({
      error: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
    });
  });
});
