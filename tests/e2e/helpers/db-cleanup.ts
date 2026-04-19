import bcrypt from "bcryptjs";
import { prisma } from "../../../src/lib/prisma";

export interface TestContactRequest {
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

export interface AuditLogSnapshotEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string | null;
  createdAt: Date;
}

/**
 * Loescht alle Kontaktanfragen, deren Vorname mit "E2E-Test" beginnt.
 */
export async function cleanupTestContactRequests() {
  await prisma.$transaction(async (tx) => {
    await tx.contactRequest.deleteMany({
      where: { firstName: { startsWith: "E2E-Test" } },
    });
  });
}

export async function createTestContactRequest(
  data: Partial<Omit<TestContactRequest, "id" | "createdAt">> = {},
): Promise<TestContactRequest> {
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

/**
 * Loescht alle Rate-Limit-Eintraege.
 */
export async function cleanupRateLimits() {
  await prisma.$transaction(async (tx) => {
    await tx.rateLimit.deleteMany({});
  });
}

/**
 * Loescht Test-User anhand einer E-Mail-Liste.
 */
export async function cleanupUsersByEmail(emails: string[]) {
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

export async function findUserByEmail(email: string) {
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
  const count = await prisma.contactRequest.count({
    where: { firstName },
  });
  return count > 0;
}

export async function snapshotAuditLogs(): Promise<AuditLogSnapshotEntry[]> {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function restoreAuditLogs(snapshot: AuditLogSnapshotEntry[]) {
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

export async function countAuditLogsByAction(action: string): Promise<number> {
  return prisma.auditLog.count({
    where: { action },
  });
}

export async function countAuditLogs(): Promise<number> {
  return prisma.auditLog.count();
}

export async function findLatestAuditLogByAction(action: string) {
  return prisma.auditLog.findFirst({
    where: { action },
    orderBy: { createdAt: "desc" },
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
