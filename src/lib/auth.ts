import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import { Prisma } from "../generated/prisma";
import { prisma } from "./prisma";
import { getClientIp, isTrustedClientIpError } from "./client-ip";
import { logger } from "./logger";

const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 Minuten
const LOGIN_ATTEMPT_STALE_DURATION = LOCKOUT_DURATION;
const MAX_ATTEMPTS = 3;
const MAX_TRANSACTION_RETRIES = 3;
const AUTH_IP_UNAVAILABLE_CODE = "AUTH_IP_UNAVAILABLE";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET || NEXTAUTH_SECRET.length < 32) {
  throw new Error(
    "NEXTAUTH_SECRET fehlt oder ist kuerzer als 32 Zeichen. Generiere mit: node -e \"process.stdout.write(require('crypto').randomBytes(48).toString('base64'))\"",
  );
}

// Dummy-Hash mit gleicher Rundenzahl (12) wie echte Passwoerter. Wird bei nicht
// existenten E-Mails verwendet, damit `bcrypt.compare` zeitlich angeglichen bleibt.
const DUMMY_HASH = "$2a$12$KIXbPPpZxDr9e7m1Hf4jK.0xHJ1rN8QvT5P3Ue6F7cD8bO9sL2mWe";

type NormalizedRole = "admin" | "staff";

/**
 * Erzeugt einen nicht umkehrbaren Identifier aus Bucket-Kontext.
 */
function hashIdentifier(...parts: string[]): string {
  return crypto.createHash("sha256").update(parts.join("\0")).digest("hex");
}

export function normalizeRole(role: string | null | undefined): NormalizedRole | null {
  if (typeof role !== "string") {
    return null;
  }

  const normalizedRole = role.trim().toLowerCase();
  if (normalizedRole === "admin" || normalizedRole === "staff") {
    return normalizedRole;
  }

  return null;
}

function isRetryableTransactionError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

async function runTransactionWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === MAX_TRANSACTION_RETRIES) {
        throw error;
      }
    }
  }

  throw new Error("Transaktion konnte nicht erfolgreich abgeschlossen werden.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Anmeldung",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        let ip: string;
        let headersList: Awaited<ReturnType<typeof headers>>;

        try {
          ip = await getClientIp();
          headersList = await headers();
        } catch (error) {
          if (isTrustedClientIpError(error)) {
            throw new Error(JSON.stringify({ code: AUTH_IP_UNAVAILABLE_CODE }));
          }

          throw error;
        }

        // Zwei Lockout-Buckets:
        // - emailIdentifier: granular pro Account
        // - ipIdentifier: verhindert Enumerations-Bursts pro IP + UserAgent
        const userAgent = headersList.get("user-agent") || "unknown";
        const emailIdentifier = `email-${hashIdentifier("login-email", ip, userAgent, email)}`;
        const ipIdentifier = `ip-${hashIdentifier("login-ip", ip, userAgent)}`;

        const result = await runTransactionWithRetry(() =>
          prisma.$transaction(async (tx) => {
            const now = new Date();
            const [emailAttemptRaw, ipAttemptRaw, user] = await Promise.all([
              tx.loginAttempt.findUnique({ where: { identifier: emailIdentifier } }),
              tx.loginAttempt.findUnique({ where: { identifier: ipIdentifier } }),
              tx.user.findUnique({
                where: { email },
                select: { id: true, email: true, name: true, role: true, password: true },
              }),
            ]);

            // Abgelaufene Lockouts muessen vor dem naechsten Versuch entfernt werden,
            // sonst beginnt der erste Fehlversuch nach Ablauf sofort wieder bei 4.
            const expiredLockIdentifiers = [
              emailAttemptRaw?.lockedUntil && emailAttemptRaw.lockedUntil <= now ? emailIdentifier : null,
              ipAttemptRaw?.lockedUntil && ipAttemptRaw.lockedUntil <= now ? ipIdentifier : null,
            ].filter((identifier): identifier is string => Boolean(identifier));

            if (expiredLockIdentifiers.length > 0) {
              await tx.loginAttempt.deleteMany({
                where: { identifier: { in: expiredLockIdentifiers } },
              });
            }

            const emailAttempt = expiredLockIdentifiers.includes(emailIdentifier) ? null : emailAttemptRaw;
            const ipAttempt = expiredLockIdentifiers.includes(ipIdentifier) ? null : ipAttemptRaw;
            const activeLock =
              (emailAttempt?.lockedUntil && emailAttempt.lockedUntil > now && emailAttempt.lockedUntil) ||
              (ipAttempt?.lockedUntil && ipAttempt.lockedUntil > now && ipAttempt.lockedUntil) ||
              null;

            if (activeLock) {
              return {
                status: "locked" as const,
                code: "LOCKOUT_ACTIVE" as const,
                remainingMinutes: Math.ceil((activeLock.getTime() - now.getTime()) / 60_000),
              };
            }

            // Timing-Angleich: bcrypt immer ausfuehren, auch wenn der User nicht existiert.
            const passwordToCheck = user?.password ?? DUMMY_HASH;
            const passwordValid = await bcrypt.compare(credentials.password, passwordToCheck);
            const normalizedRole = normalizeRole(user?.role);

            if (!user || !normalizedRole || !passwordValid) {
              const [emailUpdated, ipUpdated] = await Promise.all([
                tx.loginAttempt.upsert({
                  where: { identifier: emailIdentifier },
                  update: { attempts: { increment: 1 }, lockedUntil: null },
                  create: { identifier: emailIdentifier, attempts: 1 },
                }),
                tx.loginAttempt.upsert({
                  where: { identifier: ipIdentifier },
                  update: { attempts: { increment: 1 }, lockedUntil: null },
                  create: { identifier: ipIdentifier, attempts: 1 },
                }),
              ]);

              // Der IP-Bucket ist bewusst grosszuegiger, damit ehrliche User nicht
              // schon nach wenigen Vertippern global ausgesperrt werden.
              const shouldLockEmail = emailUpdated.attempts >= MAX_ATTEMPTS;
              const shouldLockIp = ipUpdated.attempts >= MAX_ATTEMPTS * 3;
              if (shouldLockEmail || shouldLockIp) {
                const lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION);
                const lockUpdates: Array<Promise<unknown>> = [];

                if (shouldLockEmail) {
                  lockUpdates.push(
                    tx.loginAttempt.update({
                      where: { identifier: emailIdentifier },
                      data: { lockedUntil },
                    }),
                  );
                }

                if (shouldLockIp) {
                  lockUpdates.push(
                    tx.loginAttempt.update({
                      where: { identifier: ipIdentifier },
                      data: { lockedUntil },
                    }),
                  );
                }

                await Promise.all(lockUpdates);
                return {
                  status: "locked" as const,
                  code: "LOCKOUT_TRIGGERED" as const,
                  remainingMinutes: Math.ceil(LOCKOUT_DURATION / 60_000),
                };
              }

              return { status: "invalid" as const };
            }

            await tx.loginAttempt.deleteMany({
              where: { identifier: { in: [emailIdentifier, ipIdentifier] } },
            });

            await tx.auditLog.create({
              data: {
                userId: user.id,
                userName: user.name || user.email,
                action: "LOGIN",
                // Keine Klar-IP im Audit-Log. Nur ein kurzer Hash-Ausschnitt.
                details: `Anmeldung (Identifier: ${emailIdentifier.slice(0, 8)}...)`,
              },
            });

            return {
              status: "success" as const,
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: normalizedRole,
              },
            };
          }),
        );

        // Abgelaufene Lockouts und alte Fehlversuchs-Buckets koennen im Hintergrund
        // aufgeraeumt werden, ohne aktive Sperren oder frische Fehlversuche zu loeschen.
        void prisma
          .$transaction(async (tx) => {
            const now = new Date();
            const staleAttemptCutoff = new Date(now.getTime() - LOGIN_ATTEMPT_STALE_DURATION);

            await tx.loginAttempt.deleteMany({
              where: {
                OR: [
                  { lockedUntil: { lt: now } },
                  { lockedUntil: null, updatedAt: { lt: staleAttemptCutoff } },
                ],
              },
            });
          })
          .catch((error) => {
            logger.error(
              { err: error, action: "cleanupLoginAttempts" },
              "[cleanupLoginAttempts] LoginAttempt-Bereinigung fehlgeschlagen",
            );
          });

        if (result.status === "locked") {
          throw new Error(JSON.stringify({ code: result.code, remainingMinutes: result.remainingMinutes }));
        }

        if (result.status === "invalid") {
          return null;
        }

        return result.user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 Stunden
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeRole(user.role) ?? "staff";
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.id) {
        return { ...session, user: undefined as never };
      }

      // DB-Lookup bei jeder Session-Anfrage. So werden geloeschte oder
      // umgestufte Accounts auch bei JWT-Sessions serverseitig invalidiert.
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, role: true, name: true, email: true },
      }).catch(() => null);

      const normalizedRole = normalizeRole(dbUser?.role);
      if (!dbUser || !normalizedRole) {
        return { ...session, user: undefined as never };
      }

      session.user.id = dbUser.id;
      session.user.role = normalizedRole;
      session.user.name = dbUser.name ?? session.user.name ?? null;
      session.user.email = dbUser.email ?? null;
      return session;
    },
  },
  secret: NEXTAUTH_SECRET,
};
