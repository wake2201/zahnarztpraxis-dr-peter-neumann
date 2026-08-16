import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const envFileName = ".env.test.local";
const envPath = resolve(rootDir, envFileName);
const disposableDatabaseNamePattern = /(?:^|[-_])(?:test|e2e)$/i;

function writeLine(message) {
  process.stdout.write(`${message}\n`);
}

function writeError(message) {
  process.stderr.write(`${message}\n`);
}

function fail(message) {
  writeError(message);
  process.exit(1);
}

function redactTarget(databaseUrl) {
  const url = new URL(databaseUrl);
  const database = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;

  return {
    protocol: url.protocol,
    host: url.host,
    database,
    username: url.username ? "<redacted>" : "",
    passwordPresent: Boolean(url.password),
    sslmode: url.searchParams.get("sslmode") ?? "",
  };
}

if (!existsSync(envPath)) {
  fail(
    [
      `${envFileName} fehlt. Lege die Datei lokal an und committe sie nicht.`,
      "DATABASE_URL muss auf localhost/127.0.0.1 und eine lokale Testdatenbank zeigen.",
    ].join("\n"),
  );
}

const result = dotenv.config({ path: envPath, override: true });
if (result.error) {
  fail(`${envFileName} konnte nicht geladen werden.`);
}

const requiredEnv = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "TRUST_PROXY",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  fail(`${envFileName} ist unvollstaendig. Fehlende Variablen: ${missingEnv.join(", ")}`);
}

if ((process.env.NEXTAUTH_SECRET ?? "").length < 32) {
  fail("NEXTAUTH_SECRET in .env.test.local muss mindestens 32 Zeichen lang sein.");
}

if (process.env.TRUST_PROXY === "true") {
  fail("TRUST_PROXY muss fuer lokale Tests false sein.");
}

let databaseTarget;
try {
  databaseTarget = redactTarget(process.env.DATABASE_URL ?? "");
} catch {
  fail("DATABASE_URL in .env.test.local ist keine gueltige URL.");
}

const parsedDatabaseUrl = new URL(process.env.DATABASE_URL ?? "");
const allowedHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
if (!["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol)) {
  fail("DATABASE_URL in .env.test.local muss PostgreSQL verwenden.");
}

if (!allowedHosts.has(parsedDatabaseUrl.hostname)) {
  fail("DATABASE_URL in .env.test.local muss auf localhost, 127.0.0.1 oder ::1 zeigen.");
}

if (!parsedDatabaseUrl.pathname || parsedDatabaseUrl.pathname === "/") {
  fail("DATABASE_URL in .env.test.local muss einen Datenbanknamen enthalten.");
}

const databaseName = decodeURIComponent(parsedDatabaseUrl.pathname.slice(1));
if (!disposableDatabaseNamePattern.test(databaseName)) {
  fail(
    "DATABASE_URL in .env.test.local muss auf eine explizite Testdatenbank enden " +
      "(_test, -test, _e2e oder -e2e).",
  );
}

if (!parsedDatabaseUrl.username || !parsedDatabaseUrl.password) {
  fail("DATABASE_URL in .env.test.local muss lokalen Benutzer und Passwort enthalten.");
}

const [tool, ...toolArgs] = process.argv.slice(2);
if (!tool) {
  fail("Verwendung: node scripts/run-local-env.mjs <prisma|tsx|playwright|next> [...args]");
}

const commandEntrypoints = {
  prisma: "node_modules/prisma/build/index.js",
  tsx: "node_modules/tsx/dist/cli.mjs",
  playwright: "node_modules/@playwright/test/cli.js",
  next: "node_modules/next/dist/bin/next",
};

const entrypoint = commandEntrypoints[tool];
if (!entrypoint) {
  fail(`Unbekanntes Tool: ${tool}`);
}

const entrypointPath = resolve(rootDir, entrypoint);
if (!existsSync(entrypointPath)) {
  fail(`Lokales Tool nicht gefunden: ${tool}. Fuehre zuerst npm install aus.`);
}

writeLine(
  `Lokale Validierung nutzt ${envFileName}: ${JSON.stringify(databaseTarget)}`,
);

const child = spawn(process.execPath, [entrypointPath, ...toolArgs], {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    DOTENV_CONFIG_PATH: envPath,
    DOTENV_CONFIG_OVERRIDE: "true",
    DOTENV_CONFIG_QUIET: "true",
    E2E_DISPOSABLE_DB_CONFIRMED: "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    writeError(`${tool} wurde durch Signal ${signal} beendet.`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});
