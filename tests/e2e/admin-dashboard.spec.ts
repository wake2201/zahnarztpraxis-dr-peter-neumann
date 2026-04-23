import { test, expect, Page, Route } from "@playwright/test";
import {
  cleanupLoginAttempts,
  cleanupTestContactRequests,
  cleanupUsersByEmail,
  createTestAuditLog,
  createTestContactRequest,
  disconnectPrisma,
  ensureTestUser,
  findLatestAuditLogByActionAndDetail,
  getContactRequestById,
  getContactRequestReadState,
  restoreAuditLogs,
  snapshotAuditLogs,
  updateUserRoleByEmail,
  userExistsByEmail,
} from "./helpers/db-cleanup";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@zeitzer-zahnarzt.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const CREATED_STAFF_EMAIL = "e2e-staff@test.de";
const WEAK_PASSWORD_EMAIL = "weak-password-user@test.de";
const PROMOTED_STAFF_EMAIL = "promoted-staff@test.de";

test.use({ viewport: { width: 1280, height: 720 } });

type BoundingRect = { x: number; y: number; width: number; height: number } | null;

function expectStableBoundingBox(current: BoundingRect, baseline: BoundingRect) {
  expect(current).not.toBeNull();
  expect(baseline).not.toBeNull();

  if (!current || !baseline) {
    return;
  }

  expect(Math.abs(current.x - baseline.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(current.y - baseline.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(current.width - baseline.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(current.height - baseline.height)).toBeLessThanOrEqual(1);
}

function expectStableRightEdge(current: BoundingRect, baseline: BoundingRect) {
  expect(current).not.toBeNull();
  expect(baseline).not.toBeNull();

  if (!current || !baseline) {
    return;
  }

  expect(Math.abs((current.x + current.width) - (baseline.x + baseline.width))).toBeLessThanOrEqual(1);
}

async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Passwort").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(500);
}

async function openUsersTab(page: Page) {
  const usersTab = page.getByRole("button", { name: /Benutzer/i });
  await expect(usersTab).toBeVisible({ timeout: 10_000 });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await usersTab.click();
    const formVisible = await page
      .getByPlaceholder("Max Mustermann")
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    if (formVisible) {
      return;
    }
  }

  await expect(page.getByPlaceholder("Max Mustermann")).toBeVisible({ timeout: 10_000 });
}

async function openLogsTab(page: Page) {
  const logsTab = page.getByRole("button", { name: /Aktivitaetslog|Aktivitätslog/i });
  await expect(logsTab).toBeVisible({ timeout: 10_000 });
  await logsTab.click();
  await expect(page.getByRole("heading", { name: /Aktivitaetslog|Aktivitätslog/i })).toBeVisible({
    timeout: 10_000,
  });
}

async function disableUserFormValidation(page: Page) {
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
  });
}

function requestRow(page: Page, message: string) {
  return page.locator("div.px-6.py-5").filter({ has: page.getByText(message) }).first();
}

function userRow(page: Page, email: string) {
  return page.locator("div.px-6.py-4").filter({ has: page.getByText(email) }).first();
}

async function requestStatValue(page: Page, kind: "total" | "unread" | "done") {
  const testId = kind === "total"
    ? "request-stat-total"
    : kind === "unread"
      ? "request-stat-unread"
      : "request-stat-done";
  const value = await page.getByTestId(testId).locator("p.text-2xl").textContent();
  return Number(value?.trim() || "0");
}

async function delayNextServerAction(page: Page, delayMs = 1_200) {
  let intercepted = false;

  const handler = async (route: Route) => {
    const request = route.request();

    if (!intercepted && request.method() === "POST" && request.headers()["next-action"]) {
      intercepted = true;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    await route.continue();
  };

  await page.route("**/*", handler);

  return {
    wasIntercepted: () => intercepted,
    dispose: async () => page.unroute("**/*", handler),
  };
}

test.describe("Admin Dashboard", () => {
  test.beforeAll(async () => {
    await cleanupLoginAttempts();
  });

  test.afterAll(async () => {
    await cleanupUsersByEmail([
      CREATED_STAFF_EMAIL,
      WEAK_PASSWORD_EMAIL,
      PROMOTED_STAFF_EMAIL,
    ]);
    await cleanupTestContactRequests();
    await cleanupLoginAttempts();
    await disconnectPrisma();
  });

  test("Dashboard zeigt Statistik-Karten und Anfragen-Tab", async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText("Gesamt", { exact: true })).toBeVisible();
    await expect(page.getByText("Ungelesen", { exact: true })).toBeVisible();
    await expect(page.getByText("Erledigt", { exact: true })).toBeVisible();
    await expect(page.getByText("Patientenanfragen")).toBeVisible();
    await expect(page.getByText("DSGVO-Hinweis")).toBeVisible();
  });

  test("Admin sieht Benutzer- und Aktivitaetslog-Tabs", async ({ page }) => {
    await loginAsAdmin(page);

    const usersTab = page.getByRole("button", { name: /Benutzer/i });
    const logsTab = page.getByRole("button", { name: /Aktivitaetslog|Aktivitätslog/i });

    await expect(usersTab).toBeVisible();
    await expect(logsTab).toBeVisible();

    await openUsersTab(page);
    await expect(page.getByText("Alle Benutzer")).toBeVisible();

    await openLogsTab(page);
    await expect(page.getByText(/Letzte 100 Aktionen/i)).toBeVisible();
  });

  test("Mitarbeiter erstellen und loeschen", async ({ page }) => {
    await loginAsAdmin(page);
    await openUsersTab(page);

    await page.getByPlaceholder("Max Mustermann").fill("E2E Testmitarbeiter");
    await page.getByPlaceholder("mitarbeiter@praxis.de").fill(CREATED_STAFF_EMAIL);
    await page.getByPlaceholder("••••••••").fill("Test1234!");
    await page.getByRole("button", { name: /Mitarbeiter erstellen/i }).click();

    await expect(page.getByText("Mitarbeiter erfolgreich erstellt!")).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await openUsersTab(page);

    await expect(page.getByText("E2E Testmitarbeiter")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(CREATED_STAFF_EMAIL)).toBeVisible();

    await page.getByRole("button", { name: /Entfernen/i }).last().click();
    await page.getByRole("button", { name: /Bestaetigen|Bestätigen/i }).click();

    await page.waitForTimeout(2_000);
    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await openUsersTab(page);

    await expect(page.getByText(CREATED_STAFF_EMAIL)).toBeHidden({ timeout: 10_000 });
  });

  test("Unautorisierter Zugriff wird auf Login umgeleitet", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
  });

  test("Anfrage-Status aktualisiert Liste und Zaehler erst nach erfolgreichem Abschluss", async ({ page }) => {
    await cleanupTestContactRequests();

    const request = await createTestContactRequest({
      message: `E2E-Test Toggle ${Date.now()}`,
      read: false,
    });

    await loginAsAdmin(page);

    const row = requestRow(page, request.message);
    await expect(row.getByText(request.message)).toBeVisible();
    const baselineUnread = await requestStatValue(page, "unread");
    expect(baselineUnread).toBeGreaterThanOrEqual(1);

    const delayedAction = await delayNextServerAction(page);
    try {
      await row.getByRole("button", { name: /Gelesen/i }).click();

      await expect(row.getByRole("button", { name: /Wird aktualisiert/i })).toBeDisabled({ timeout: 10_000 });
      await expect(page.getByRole("button", { name: /^Als gelesen$/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Als ungelesen$/i })).toBeVisible();
      expect(delayedAction.wasIntercepted()).toBe(true);
      expect(await getContactRequestReadState(request.id)).toBe(false);
      expect(await requestStatValue(page, "unread")).toBe(baselineUnread);

      await expect.poll(async () => getContactRequestReadState(request.id)).toBe(true);
      await expect.poll(async () => requestStatValue(page, "unread")).toBe(baselineUnread - 1);
      await expect(row.getByRole("button", { name: /Ungelesen/i })).toBeVisible({ timeout: 10_000 });
    } finally {
      await delayedAction.dispose();
    }

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });

    const reloadedRow = requestRow(page, request.message);
    await expect(reloadedRow.getByRole("button", { name: /Ungelesen/i })).toBeVisible();
  });

  test("Einzelnes Loeschen entfernt Anfrage und Zaehler erst nach erfolgreichem Abschluss", async ({ page }) => {
    await cleanupTestContactRequests();

    const request = await createTestContactRequest({
      message: `E2E-Test Delete ${Date.now()}`,
    });

    await loginAsAdmin(page);

    const row = requestRow(page, request.message);
    await expect(row.getByText(request.message)).toBeVisible();
    const baselineTotal = await requestStatValue(page, "total");
    expect(baselineTotal).toBeGreaterThanOrEqual(1);

    await row.getByRole("button", { name: /Löschen/i }).click();

    const delayedAction = await delayNextServerAction(page);
    try {
      await page.getByRole("button", { name: /Endgültig löschen/i }).click();

      await expect(page.getByRole("button", { name: /Wird gelöscht/i })).toBeDisabled({ timeout: 10_000 });
      await expect(page.getByRole("button", { name: /^Auswahl löschen$/i })).toBeVisible();
      expect(delayedAction.wasIntercepted()).toBe(true);
      expect(await getContactRequestById(request.id)).not.toBe(null);
      expect(await requestStatValue(page, "total")).toBe(baselineTotal);

      await expect.poll(async () => getContactRequestById(request.id)).toBe(null);
      await expect.poll(async () => requestStatValue(page, "total")).toBe(baselineTotal - 1);
      await expect.poll(async () => {
        return Boolean(await findLatestAuditLogByActionAndDetail("DELETE_REQUEST", request.id));
      }).toBe(true);
    } finally {
      await delayedAction.dispose();
    }

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(request.message)).toBeHidden();
  });

  test("Bulk gelesen und ungelesen aktualisiert Liste und Zaehler erst nach erfolgreichem Abschluss", async ({ page }) => {
    await cleanupTestContactRequests();

    const firstRequest = await createTestContactRequest({
      message: `E2E-Test Bulk Toggle A ${Date.now()}`,
      read: false,
    });
    const secondRequest = await createTestContactRequest({
      message: `E2E-Test Bulk Toggle B ${Date.now()}`,
      read: false,
    });

    await loginAsAdmin(page);

    const firstRow = requestRow(page, firstRequest.message);
    const secondRow = requestRow(page, secondRequest.message);
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    await expect(secondRow).toBeVisible({ timeout: 10_000 });
    const baselineUnread = await requestStatValue(page, "unread");
    expect(baselineUnread).toBeGreaterThanOrEqual(2);

    await firstRow.getByRole("checkbox").check();
    await secondRow.getByRole("checkbox").check();
    await expect(page.getByTestId("request-selection-count")).toHaveText("2 ausgewählt");

    const delayedReadAction = await delayNextServerAction(page);
    try {
      await page.getByRole("button", { name: /Als gelesen/i }).click();

      await expect(page.getByRole("button", { name: /Wird aktualisiert/i }).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole("button", { name: /^Als ungelesen$/i })).toBeVisible();
      expect(delayedReadAction.wasIntercepted()).toBe(true);
      expect(await getContactRequestReadState(firstRequest.id)).toBe(false);
      expect(await getContactRequestReadState(secondRequest.id)).toBe(false);
      expect(await requestStatValue(page, "unread")).toBe(baselineUnread);

      await expect.poll(async () => getContactRequestReadState(firstRequest.id)).toBe(true);
      await expect.poll(async () => getContactRequestReadState(secondRequest.id)).toBe(true);
      await expect.poll(async () => requestStatValue(page, "unread")).toBe(baselineUnread - 2);
    } finally {
      await delayedReadAction.dispose();
    }

    await expect(page.getByTestId("request-selection-count")).toHaveText("0 ausgewählt");

    await firstRow.getByRole("checkbox").check();
    await secondRow.getByRole("checkbox").check();
    await expect(page.getByTestId("request-selection-count")).toHaveText("2 ausgewählt");

    const delayedUnreadAction = await delayNextServerAction(page);
    try {
      await page.getByRole("button", { name: /Als ungelesen/i }).click();

      await expect(page.getByRole("button", { name: /Wird aktualisiert/i }).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole("button", { name: /^Als gelesen$/i })).toBeVisible();
      expect(delayedUnreadAction.wasIntercepted()).toBe(true);
      expect(await getContactRequestReadState(firstRequest.id)).toBe(true);
      expect(await getContactRequestReadState(secondRequest.id)).toBe(true);
      expect(await requestStatValue(page, "unread")).toBe(baselineUnread - 2);

      await expect.poll(async () => getContactRequestReadState(firstRequest.id)).toBe(false);
      await expect.poll(async () => getContactRequestReadState(secondRequest.id)).toBe(false);
      await expect.poll(async () => requestStatValue(page, "unread")).toBe(baselineUnread);
    } finally {
      await delayedUnreadAction.dispose();
    }

    await expect(page.getByTestId("request-selection-count")).toHaveText("0 ausgewählt");
  });

  test("Bulk-Loeschen entfernt Anfragen und Zaehler erst nach erfolgreichem Abschluss", async ({ page }) => {
    await cleanupTestContactRequests();

    const firstRequest = await createTestContactRequest({
      message: `E2E-Test Bulk Delete A ${Date.now()}`,
    });
    const secondRequest = await createTestContactRequest({
      message: `E2E-Test Bulk Delete B ${Date.now()}`,
    });

    await loginAsAdmin(page);

    const firstRow = requestRow(page, firstRequest.message);
    const secondRow = requestRow(page, secondRequest.message);
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    await expect(secondRow).toBeVisible({ timeout: 10_000 });
    const baselineTotal = await requestStatValue(page, "total");
    expect(baselineTotal).toBeGreaterThanOrEqual(2);

    await firstRow.getByRole("checkbox").check();
    await secondRow.getByRole("checkbox").check();
    await expect(page.getByTestId("request-selection-count")).toHaveText("2 ausgewählt");
    const bulkDeleteButton = page.getByRole("button", { name: /^Auswahl löschen$/i });
    const bulkActions = page.getByTestId("request-bulk-actions");
    const baselineBox = await bulkActions.boundingBox();
    const baselineDeleteButtonBox = await bulkDeleteButton.boundingBox();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await bulkDeleteButton.click();
      await expect(page.getByRole("button", { name: /^Auswahl endgültig löschen$/i })).toBeVisible();
      const cancelBulkDeleteButton = page.getByRole("button", { name: /^Abbrechen$/i });
      await expect(cancelBulkDeleteButton).toBeVisible();
      expectStableBoundingBox(await bulkActions.boundingBox(), baselineBox);
      expectStableRightEdge(await cancelBulkDeleteButton.boundingBox(), baselineDeleteButtonBox);

      await cancelBulkDeleteButton.click();
      await expect(bulkDeleteButton).toBeVisible();
      expectStableBoundingBox(await bulkActions.boundingBox(), baselineBox);
      expectStableRightEdge(await bulkDeleteButton.boundingBox(), baselineDeleteButtonBox);
    }

    await bulkDeleteButton.click();
    await expect(page.getByRole("button", { name: /^Auswahl endgültig löschen$/i })).toBeVisible();
    const cancelBulkDeleteButton = page.getByRole("button", { name: /^Abbrechen$/i });
    await expect(cancelBulkDeleteButton).toBeVisible();
    expectStableBoundingBox(await bulkActions.boundingBox(), baselineBox);
    expectStableRightEdge(await cancelBulkDeleteButton.boundingBox(), baselineDeleteButtonBox);

    const delayedDeleteAction = await delayNextServerAction(page);
    try {
      await page.getByRole("button", { name: /^Auswahl endgültig löschen$/i }).click();

      const pendingBulkDeleteButton = page.getByRole("button", { name: /Wird gelöscht/i }).first();
      await expect(pendingBulkDeleteButton).toBeDisabled({ timeout: 10_000 });
      expectStableRightEdge(await pendingBulkDeleteButton.boundingBox(), baselineDeleteButtonBox);
      expect(delayedDeleteAction.wasIntercepted()).toBe(true);
      expect(await getContactRequestById(firstRequest.id)).not.toBe(null);
      expect(await getContactRequestById(secondRequest.id)).not.toBe(null);
      expect(await requestStatValue(page, "total")).toBe(baselineTotal);

      await expect.poll(async () => getContactRequestById(firstRequest.id)).toBe(null);
      await expect.poll(async () => getContactRequestById(secondRequest.id)).toBe(null);
      await expect.poll(async () => requestStatValue(page, "total")).toBe(baselineTotal - 2);
      await expect.poll(async () => {
        return Boolean(await findLatestAuditLogByActionAndDetail("DELETE_REQUEST", firstRequest.id));
      }).toBe(true);
      await expect.poll(async () => {
        return Boolean(await findLatestAuditLogByActionAndDetail("DELETE_REQUEST", secondRequest.id));
      }).toBe(true);
    } finally {
      await delayedDeleteAction.dispose();
    }
  });

  test("Server-seitige Zod-Validierung blockiert ungueltige E-Mail trotz noValidate", async ({ page }) => {
    const invalidEmail = `ungueltig-email-${Date.now()}`;

    await loginAsAdmin(page);
    await openUsersTab(page);
    await disableUserFormValidation(page);

    await page.getByPlaceholder("Max Mustermann").fill("Playwright Invalid Email");
    await page.getByPlaceholder("mitarbeiter@praxis.de").fill(invalidEmail);
    await page.getByPlaceholder("••••••••").fill("StrongPass123!");
    await page.getByRole("button", { name: /Mitarbeiter erstellen/i }).click();

    await expect(page.getByText("Ungültige E-Mail-Adresse.")).toBeVisible({ timeout: 10_000 });
    await expect.poll(async () => userExistsByEmail(invalidEmail)).toBe(false);
  });

  test("Server-seitige Zod-Validierung blockiert schwaches Passwort trotz noValidate", async ({ page }) => {
    await loginAsAdmin(page);
    await openUsersTab(page);
    await disableUserFormValidation(page);

    await page.getByPlaceholder("Max Mustermann").fill("Playwright Weak Password");
    await page.getByPlaceholder("mitarbeiter@praxis.de").fill(WEAK_PASSWORD_EMAIL);
    await page.getByPlaceholder("••••••••").fill("password");
    await page.getByRole("button", { name: /Mitarbeiter erstellen/i }).click();

    await expect(
      page.getByText(
        "Passwort muss mindestens 1 Großbuchstaben, 1 Kleinbuchstaben, 1 Ziffer und 1 Sonderzeichen enthalten.",
      ),
    ).toBeVisible({ timeout: 10_000 });
    await expect.poll(async () => userExistsByEmail(WEAK_PASSWORD_EMAIL)).toBe(false);
  });

  test("Delete-Action blockiert stale UI nach Role-Eskalation", async ({ page }) => {
    await ensureTestUser({
      email: PROMOTED_STAFF_EMAIL,
      password: "PromotedUser123!",
      name: "Promoted Staff",
      role: "staff",
    });

    await loginAsAdmin(page);
    await openUsersTab(page);
    await expect(page.getByText(PROMOTED_STAFF_EMAIL)).toBeVisible();

    await updateUserRoleByEmail(PROMOTED_STAFF_EMAIL, "admin");

    const row = userRow(page, PROMOTED_STAFF_EMAIL);
    await row.getByRole("button", { name: /Entfernen/i }).click();
    await page.getByRole("button", { name: /Bestaetigen|Bestätigen/i }).click();

    await expect(page.getByText("Admin-Accounts können nicht gelöscht werden.")).toBeVisible({ timeout: 10_000 });
    await expect.poll(async () => userExistsByEmail(PROMOTED_STAFF_EMAIL)).toBe(true);

    await page.reload();
    await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
    await openUsersTab(page);
    await expect(page.getByText(PROMOTED_STAFF_EMAIL)).toBeVisible();
  });

  test("Aktivitaetslog bietet keine destructive Clear-Aktion", async ({ page }) => {
    const snapshot = await snapshotAuditLogs();
    const logDetails = `E2E-Test Log Seed ${Date.now()}`;
    await createTestAuditLog({
      action: "LOGIN",
      details: logDetails,
    });

    try {
      await loginAsAdmin(page);
      await openLogsTab(page);

      await expect(page.getByRole("button", { name: /Logs leeren/i })).toHaveCount(0);
      await expect(page.getByText("Einträge können nicht manuell gelöscht werden.")).toBeVisible();
      await expect(page.getByText(logDetails)).toBeVisible();

      await page.reload();
      await expect(page.getByRole("button", { name: /Abmelden/i })).toBeVisible({ timeout: 15_000 });
      await openLogsTab(page);
      await expect(page.getByRole("button", { name: /Logs leeren/i })).toHaveCount(0);
      await expect(page.getByText(logDetails)).toBeVisible();
    } finally {
      await restoreAuditLogs(snapshot);
    }
  });
});
