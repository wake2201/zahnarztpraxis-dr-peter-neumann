import { prisma } from "../../../src/lib/prisma";

/**
 * Löscht alle Kontaktanfragen, deren Vorname mit "E2E-Test" beginnt.
 */
export async function cleanupTestContactRequests() {
  await prisma.contactRequest.deleteMany({
    where: { firstName: { startsWith: "E2E-Test" } },
  });
}

/**
 * Löscht alle Login-Attempt-Einträge (Lockouts).
 */
export async function cleanupLoginAttempts() {
  await prisma.loginAttempt.deleteMany({});
}

/**
 * Prüft ob eine Kontaktanfrage mit dem gegebenen Vornamen existiert.
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
