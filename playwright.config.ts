import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const disposableDatabaseNamePattern = /(?:^|[-_])(?:test|e2e)$/i;
const allowedDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function assertDisposableE2eDatabase() {
  if (process.env.E2E_DISPOSABLE_DB_CONFIRMED !== "1") {
    throw new Error(
      "E2E-Ausführung blockiert: E2E_DISPOSABLE_DB_CONFIRMED=1 fehlt. " +
        "Nutze npm run test:e2e:local.",
    );
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(process.env.DATABASE_URL ?? "");
  } catch {
    throw new Error("E2E-Ausführung blockiert: DATABASE_URL ist ungültig.");
  }

  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
  if (
    !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
    !allowedDatabaseHosts.has(databaseUrl.hostname) ||
    !disposableDatabaseNamePattern.test(databaseName)
  ) {
    throw new Error(
      "E2E-Ausführung blockiert: Erforderlich sind eine Loopback-PostgreSQL-Datenbank " +
        "und ein Name mit _test, -test, _e2e oder -e2e.",
    );
  }
}

assertDisposableE2eDatabase();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  timeout: 30_000,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      // Kontaktformular-Tests nur auf Desktop (Backend-Logik, viewport-unabhängig)
      // Vermeidet Rate-Limit-Konflikte bei 3 Requests/Minute
      testIgnore: [/contact\.spec/, /admin-dashboard\.spec/],
    },
  ],

  webServer: {
    command: "npm.cmd run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
