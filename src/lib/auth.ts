import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { getClientIp } from "./client-ip";

const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 Minuten
const MAX_ATTEMPTS = 3;

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET || NEXTAUTH_SECRET.length < 32) {
  throw new Error(
    "NEXTAUTH_SECRET fehlt oder ist kürzer als 32 Zeichen. Generiere mit: node -e \"console.log(require('crypto').randomBytes(48).toString('base64'))\"",
  );
}

// Dummy-Hash mit gleicher Rundenzahl (12) wie echte Passwörter. Wird bei nicht
// existenten E-Mails verwendet, damit `bcrypt.compare` die gleiche Zeit braucht
// wie bei existenten Usern → verhindert Timing-basierte E-Mail-Enumeration.
const DUMMY_HASH = "$2a$12$KIXbPPpZxDr9e7m1Hf4jK.0xHJ1rN8QvT5P3Ue6F7cD8bO9sL2mWe";

/**
 * Erzeugt einen nicht-umkehrbaren Identifier aus IP + UserAgent.
 */
function hashIdentifier(ip: string, userAgent: string): string {
  return crypto.createHash("sha256").update(`${ip}::${userAgent}`).digest("hex");
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

        // Fälschungssichere IP (siehe client-ip.ts — priorisiert x-real-ip und
        // den LETZTEN x-forwarded-for-Eintrag statt dem client-kontrollierten ersten).
        const ip = await getClientIp();
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "unknown";

        // Zwei parallele Lockout-Buckets:
        //   - emailIdentifier: (IP+UA+Email)  → granulares Lockout pro Account
        //   - ipIdentifier:    (IP+UA)        → IP-only-Lockout verhindert
        //     E-Mail-Enumeration per Brute-Force (siehe H-5 im Audit).
        const baseHash = hashIdentifier(ip, userAgent);
        const emailIdentifier = `${baseHash}-${email}`;
        const ipIdentifier = `ip-${baseHash}`;

        const [emailAttempt, ipAttempt] = await Promise.all([
          prisma.loginAttempt.findUnique({ where: { identifier: emailIdentifier } }),
          prisma.loginAttempt.findUnique({ where: { identifier: ipIdentifier } }),
        ]);

        const now = new Date();
        const activeLock =
          (emailAttempt?.lockedUntil && emailAttempt.lockedUntil > now && emailAttempt.lockedUntil) ||
          (ipAttempt?.lockedUntil && ipAttempt.lockedUntil > now && ipAttempt.lockedUntil) ||
          null;

        if (activeLock) {
          const remainMin = Math.ceil((activeLock.getTime() - now.getTime()) / 60_000);
          throw new Error(JSON.stringify({ code: "LOCKOUT_ACTIVE", remainingMinutes: remainMin }));
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Timing-Angleich: bcrypt IMMER ausführen, auch wenn User nicht existiert.
        // Verhindert E-Mail-Enumeration über Response-Zeit (~300 ms Differenz).
        const passwordToCheck = user?.password ?? DUMMY_HASH;
        const passwordValid = await bcrypt.compare(credentials.password, passwordToCheck);
        const loginFailed = !user || !passwordValid;

        if (loginFailed) {
          // Beide Buckets parallel, atomar inkrementieren.
          const [emailUpd, ipUpd] = await Promise.all([
            prisma.loginAttempt.upsert({
              where: { identifier: emailIdentifier },
              update: { attempts: { increment: 1 } },
              create: { identifier: emailIdentifier, attempts: 1 },
            }),
            prisma.loginAttempt.upsert({
              where: { identifier: ipIdentifier },
              update: { attempts: { increment: 1 } },
              create: { identifier: ipIdentifier, attempts: 1 },
            }),
          ]);

          // IP-Bucket bekommt höheres Limit (3× MAX_ATTEMPTS) — erlaubt ehrlichen
          // Usern mehrfaches Vertippen, blockiert aber Enumerations-Bursts.
          const triggerLock =
            emailUpd.attempts >= MAX_ATTEMPTS || ipUpd.attempts >= MAX_ATTEMPTS * 3;

          if (triggerLock) {
            const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
            await Promise.all([
              emailUpd.attempts >= MAX_ATTEMPTS
                ? prisma.loginAttempt.update({ where: { identifier: emailIdentifier }, data: { lockedUntil } })
                : Promise.resolve(),
              ipUpd.attempts >= MAX_ATTEMPTS * 3
                ? prisma.loginAttempt.update({ where: { identifier: ipIdentifier }, data: { lockedUntil } })
                : Promise.resolve(),
            ]);
            throw new Error(JSON.stringify({ code: "LOCKOUT_TRIGGERED", remainingMinutes: 15 }));
          }
          return null;
        }

        // Erfolgreicher Login: beide Lockout-Buckets zurücksetzen + Audit-Log
        await Promise.all([
          emailAttempt ? prisma.loginAttempt.delete({ where: { identifier: emailIdentifier } }) : Promise.resolve(),
          ipAttempt ? prisma.loginAttempt.delete({ where: { identifier: ipIdentifier } }) : Promise.resolve(),
        ]);

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userName: user.name || user.email,
            action: "LOGIN",
            // Kein Klar-IP im Audit-Log (DSGVO Art. 25 — Datensparsamkeit).
            // Stattdessen die ersten 8 Zeichen des SHA-256-Identifiers.
            details: `Anmeldung (Identifier: ${emailIdentifier.slice(0, 8)}…)`,
          },
        });

        // Periodisches Cleanup: abgelaufene Lockouts entfernen (Fire-and-forget).
        void prisma.loginAttempt.deleteMany({
          where: { lockedUntil: { lt: new Date() } },
        }).catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
        token.role = user.role ?? "staff";
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.id) return session;

      // DB-Lookup bei JEDER Session-Anfrage. Ohne diesen Check bleibt ein
      // gelöschter oder rollen-demoter Staff-Account bis zu 8h (JWT-maxAge)
      // mit alten Rechten zugriffsfähig — DSGVO Art. 32 Risiko.
      //
      // Performance: JWT wird erst nach 5 Minuten erneut aus der Page-RSC
      // gelesen (NextAuth-intern gecacht), sodass der DB-Hit im Amortized-Fall
      // bei <1 pro 5 min pro Session liegt.
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, role: true, name: true, email: true },
      }).catch(() => null);

      if (!dbUser) {
        // User existiert nicht mehr → Session als invalid markieren
        return { ...session, user: undefined as never };
      }

      (session.user).id = dbUser.id;
      (session.user).role = dbUser.role;
      session.user.name = dbUser.name ?? session.user.name;
      session.user.email = dbUser.email ?? session.user.email;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
