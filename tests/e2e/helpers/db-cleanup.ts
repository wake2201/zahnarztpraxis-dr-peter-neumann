import bcrypt from "bcryptjs";
import { prisma } from "../../../src/lib/prisma";

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

/**
 * Loescht alle Login-Attempt-Eintraege.
 */
export async function cleanupLoginAttempts() {
  await prisma.$transaction(async (tx) => {
    await tx.loginAttempt.deleteMany({});
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

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
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

/**
 * Prueft, ob eine Kontaktanfrage mit dem gegebenen Vornamen existiert.
 */
export async function contactRequestExists(firstName: string): Promise<boolean> {
  const count = await prisma.contactRequest.count({
    where: { firstName },
  });
  return count > 0;
}

/**
 * Trennt die Prisma-Verbindung. Im afterAll aufrufen.
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
