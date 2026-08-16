import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../../../src/lib/prisma";

const disposableDatabaseNamePattern = /(?:^|[-_])(?:test|e2e)$/i;
const allowedDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function assertDisposableTestDatabase() {
  if (process.env.E2E_DISPOSABLE_DB_CONFIRMED !== "1") {
    throw new Error("Destruktiver E2E-Helper blockiert: Bestätigungsmarker fehlt.");
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(process.env.DATABASE_URL ?? "");
  } catch {
    throw new Error("Destruktiver E2E-Helper blockiert: DATABASE_URL ist ungültig.");
  }

  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
  if (
    !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
    !allowedDatabaseHosts.has(databaseUrl.hostname) ||
    !disposableDatabaseNamePattern.test(databaseName)
  ) {
    throw new Error(
      "Destruktiver E2E-Helper blockiert: Ziel ist keine bestätigte lokale Testdatenbank.",
    );
  }
}

interface TestContactRequest {
  id: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  message: string;
  gdprConsent: boolean;
  read: boolean;
  createdAt: Date;
}

interface AuditLogSnapshotEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string | null;
  createdAt: Date;
}

type TestAppointmentConfirmationMode = "AUTO" | "MANUAL";
type TestAppointmentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

interface TestAppointmentTypeInput {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  active?: boolean;
  onlineBookable?: boolean;
  confirmationMode?: TestAppointmentConfirmationMode;
}

interface TestAppointmentInput {
  appointmentTypeId: string;
  startAt: Date;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  phone?: string;
  details?: string | null;
  status?: TestAppointmentStatus;
  source?: "ONLINE" | "ADMIN";
  managementCode?: string;
}

function hashTestSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Setzt nur die Termin-Domaene der bestaetigten Wegwerf-Datenbank zurueck.
 * Kontaktanfragen, Benutzer und Audit-Logs bleiben unberuehrt.
 */
export async function resetAppointmentTestData() {
  assertDisposableTestDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.appointmentAccessSession.deleteMany({});
    await tx.appointmentSlot.deleteMany({});
    await tx.appointment.deleteMany({});
    await tx.appointmentAvailabilityException.deleteMany({});
    await tx.appointmentWeeklyAvailability.deleteMany({});
    await tx.appointmentType.deleteMany({});
    await tx.appointmentSettings.upsert({
      where: { id: "default" },
      update: {
        slotMinutes: 15,
        minimumNoticeMinutes: 0,
        bookingHorizonDays: 60,
        timeZone: "Europe/Berlin",
      },
      create: {
        id: "default",
        slotMinutes: 15,
        minimumNoticeMinutes: 0,
        bookingHorizonDays: 60,
        timeZone: "Europe/Berlin",
      },
    });
    await tx.rateLimit.deleteMany({
      where: { ip: { startsWith: "appointment-" } },
    });
  });
}

export async function createTestAppointmentType(input: TestAppointmentTypeInput = {}) {
  assertDisposableTestDatabase();
  const suffix = `${Date.now()}-${randomBytes(3).toString("hex")}`;
  return prisma.$transaction(async (tx) => {
    return tx.appointmentType.create({
      data: {
        name: input.name ?? `E2E Terminart ${suffix}`,
        description: input.description ?? "Nur fuer isolierte E2E-Tests",
        durationMinutes: input.durationMinutes ?? 30,
        active: input.active ?? true,
        onlineBookable: input.onlineBookable ?? true,
        confirmationMode: input.confirmationMode ?? "AUTO",
      },
    });
  });
}

export async function updateTestAppointmentType(
  id: string,
  input: Partial<Omit<TestAppointmentTypeInput, "name">> & { name?: string },
) {
  assertDisposableTestDatabase();
  return prisma.$transaction(async (tx) => {
    return tx.appointmentType.update({ where: { id }, data: input });
  });
}

export async function updateTestAppointmentSettings(input: {
  minimumNoticeMinutes: number;
  bookingHorizonDays: number;
}) {
  assertDisposableTestDatabase();
  return prisma.$transaction(async (tx) => {
    return tx.appointmentSettings.upsert({
      where: { id: "default" },
      update: {
        slotMinutes: 15,
        minimumNoticeMinutes: input.minimumNoticeMinutes,
        bookingHorizonDays: input.bookingHorizonDays,
        timeZone: "Europe/Berlin",
      },
      create: {
        id: "default",
        slotMinutes: 15,
        minimumNoticeMinutes: input.minimumNoticeMinutes,
        bookingHorizonDays: input.bookingHorizonDays,
        timeZone: "Europe/Berlin",
      },
    });
  });
}

export async function createTestWeeklyAvailability(input: {
  weekday: number;
  startMinute: number;
  endMinute: number;
}) {
  assertDisposableTestDatabase();
  return prisma.$transaction(async (tx) => {
    return tx.appointmentWeeklyAvailability.create({ data: input });
  });
}

export async function createTestAvailabilityException(input: {
  localDate: string;
  kind: "OPEN" | "BLOCK";
  startMinute: number;
  endMinute: number;
}) {
  assertDisposableTestDatabase();
  return prisma.$transaction(async (tx) => {
    return tx.appointmentAvailabilityException.create({
      data: {
        localDate: new Date(`${input.localDate}T00:00:00.000Z`),
        kind: input.kind,
        startMinute: input.startMinute,
        endMinute: input.endMinute,
      },
    });
  });
}

export async function deleteTestAvailabilityException(id: string) {
  assertDisposableTestDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.appointmentAvailabilityException.delete({ where: { id } });
  });
}

export async function createSeededTestAppointment(input: TestAppointmentInput) {
  assertDisposableTestDatabase();
  const managementCode = input.managementCode ?? randomBytes(32).toString("base64url");
  return prisma.$transaction(async (tx) => {
    const appointmentType = await tx.appointmentType.findUniqueOrThrow({
      where: { id: input.appointmentTypeId },
    });
    const endAt = new Date(input.startAt.getTime() + appointmentType.durationMinutes * 60_000);
    const appointment = await tx.appointment.create({
      data: {
        appointmentTypeId: appointmentType.id,
        typeNameSnapshot: appointmentType.name,
        durationMinutesSnapshot: appointmentType.durationMinutes,
        confirmationModeSnapshot: appointmentType.confirmationMode,
        firstName: input.firstName ?? `E2E-Termin-${Date.now()}`,
        lastName: input.lastName ?? "Playwright",
        countryCode: input.countryCode ?? "+49",
        phone: input.phone ?? "15123456789",
        details: input.details ?? "Isolierter E2E-Testtermin",
        gdprConsent: true,
        startAt: input.startAt,
        endAt,
        status: input.status ?? (appointmentType.confirmationMode === "AUTO" ? "CONFIRMED" : "PENDING"),
        source: input.source ?? "ONLINE",
        managementCodeHash: hashTestSecret(managementCode),
      },
    });

    if (appointment.status === "PENDING" || appointment.status === "CONFIRMED") {
      await tx.appointmentSlot.createMany({
        data: Array.from(
          { length: appointmentType.durationMinutes / 15 },
          (_, index) => ({
            appointmentId: appointment.id,
            slotStartAt: new Date(input.startAt.getTime() + index * 15 * 60_000),
          }),
        ),
      });
    }

    return { appointment, managementCode };
  });
}

export async function findLatestAppointmentByFirstName(firstName: string) {
  return prisma.appointment.findFirst({
    where: { firstName },
    include: { slots: { orderBy: { slotStartAt: "asc" } }, accessSession: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAppointmentWithSlots(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { slots: { orderBy: { slotStartAt: "asc" } }, accessSession: true },
  });
}

export async function countAppointmentsByFirstName(firstName: string) {
  return prisma.appointment.count({ where: { firstName } });
}

export async function countAppointmentSlots() {
  return prisma.appointmentSlot.count();
}

export async function countAppointmentAccessSessions() {
  return prisma.appointmentAccessSession.count();
}

export async function expireAppointmentAccessSession(appointmentId: string) {
  assertDisposableTestDatabase();
  return prisma.$transaction(async (tx) => {
    return tx.appointmentAccessSession.update({
      where: { appointmentId },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
  });
}

export async function getTestAppointmentSettings() {
  return prisma.appointmentSettings.findUnique({ where: { id: "default" } });
}

export async function findTestAppointmentTypeByName(name: string) {
  return prisma.appointmentType.findFirst({ where: { name } });
}

export async function countTestWeeklyAvailability() {
  return prisma.appointmentWeeklyAvailability.count();
}

export async function countTestAvailabilityExceptions() {
  return prisma.appointmentAvailabilityException.count();
}

/**
 * Loescht alle Kontaktanfragen, deren Vorname mit "E2E-Test" beginnt.
 */
export async function cleanupTestContactRequests() {
  assertDisposableTestDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.contactRequest.deleteMany({
      where: { firstName: { startsWith: "E2E-Test" } },
    });
  });
}

export async function createTestContactRequest(
  data: Partial<Omit<TestContactRequest, "id">> = {},
): Promise<TestContactRequest> {
  assertDisposableTestDatabase();
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return prisma.$transaction(async (tx) => {
    return tx.contactRequest.create({
      data: {
        firstName: data.firstName ?? `E2E-Test-${uniqueSuffix}`,
        lastName: data.lastName ?? "Playwright",
        countryCode: data.countryCode ?? "+49",
        phone: data.phone ?? "1234567890",
        message: data.message ?? `E2E-Test Nachricht ${uniqueSuffix}`,
        gdprConsent: data.gdprConsent ?? true,
        read: data.read ?? false,
        ...(data.createdAt ? { createdAt: data.createdAt } : {}),
      },
    });
  });
}

export async function getContactRequestById(id: string) {
  return prisma.contactRequest.findUnique({
    where: { id },
  });
}

export async function getContactRequestReadState(id: string): Promise<boolean | null> {
  const request = await prisma.contactRequest.findUnique({
    where: { id },
    select: { read: true },
  });

  return request?.read ?? null;
}

/**
 * Loescht alle Login-Attempt-Eintraege.
 */
export async function cleanupLoginAttempts() {
  assertDisposableTestDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.loginAttempt.deleteMany({});
  });
}

export async function countActiveLoginLocks(): Promise<number> {
  return prisma.loginAttempt.count({
    where: {
      lockedUntil: {
        gt: new Date(),
      },
    },
  });
}

export async function countLoginAttempts(): Promise<number> {
  return prisma.loginAttempt.count();
}

export async function getLoginAttemptIdentifiers(): Promise<string[]> {
  const attempts = await prisma.loginAttempt.findMany({
    select: { identifier: true },
    orderBy: { updatedAt: "asc" },
  });

  return attempts.map((attempt) => attempt.identifier);
}

export async function ageNonLockedLoginAttempts(updatedAt: Date) {
  assertDisposableTestDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE login_attempts
      SET updated_at = ${updatedAt}
      WHERE locked_until IS NULL
    `;
  });
}

/**
 * Loescht alle Rate-Limit-Eintraege.
 */
export async function cleanupRateLimits() {
  assertDisposableTestDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.rateLimit.deleteMany({});
  });
}

/**
 * Loescht Test-User anhand einer E-Mail-Liste.
 */
export async function cleanupUsersByEmail(emails: string[]) {
  assertDisposableTestDatabase();
  const normalizedEmails = emails.map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (normalizedEmails.length === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({
      where: { email: { in: normalizedEmails } },
    });
  });
}

/**
 * Stellt sicher, dass ein Test-User mit den gewuenschten Daten existiert.
 */
export async function ensureTestUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
}) {
  assertDisposableTestDatabase();
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const normalizedEmail = data.email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    return tx.user.upsert({
      where: { email: normalizedEmail },
      update: {
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
      create: {
        email: normalizedEmail,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
    });
  });
}

async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
}

export async function userExistsByEmail(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return Boolean(user);
}

export async function updateUserRoleByEmail(email: string, role: string) {
  assertDisposableTestDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    return tx.user.update({
      where: { email: normalizedEmail },
      data: { role },
    });
  });
}

/**
 * Prueft, ob eine Kontaktanfrage mit dem gegebenen Vornamen existiert.
 */
export async function contactRequestExists(firstName: string): Promise<boolean> {
  const count = await countContactRequestsByFirstName(firstName);
  return count > 0;
}

export async function countContactRequestsByFirstName(firstName: string): Promise<number> {
  const count = await prisma.contactRequest.count({
    where: { firstName },
  });
  return count;
}

export async function findLatestContactRequestByFirstName(firstName: string) {
  return prisma.contactRequest.findFirst({
    where: { firstName },
    orderBy: { createdAt: "desc" },
  });
}

export async function snapshotAuditLogs(): Promise<AuditLogSnapshotEntry[]> {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function restoreAuditLogs(snapshot: AuditLogSnapshotEntry[]) {
  assertDisposableTestDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany({});

    if (snapshot.length > 0) {
      await tx.auditLog.createMany({
        data: snapshot.map((log) => ({
          id: log.id,
          userId: log.userId,
          userName: log.userName,
          action: log.action,
          details: log.details,
          createdAt: log.createdAt,
        })),
      });
    }
  });
}

export async function createTestAuditLog(data: Partial<Omit<AuditLogSnapshotEntry, "id" | "createdAt">> = {}) {
  assertDisposableTestDatabase();
  return prisma.$transaction(async (tx) => {
    return tx.auditLog.create({
      data: {
        userId: data.userId ?? "e2e-audit-user",
        userName: data.userName ?? "E2E Playwright",
        action: data.action ?? "LOGIN",
        details: data.details ?? `E2E-Test Audit ${Date.now()}`,
      },
    });
  });
}

export async function findLatestAuditLogByActionAndDetail(action: string, detailFragment: string) {
  return prisma.auditLog.findFirst({
    where: {
      action,
      details: {
        contains: detailFragment,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Trennt die Prisma-Verbindung. Im afterAll aufrufen.
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
