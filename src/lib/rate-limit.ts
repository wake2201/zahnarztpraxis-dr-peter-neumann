import { prisma } from "./prisma";
import { after } from "next/server";
import { logger } from "./logger";

// ============================================================================
// RATE LIMITING (DB-basiert — PostgreSQL)
// ============================================================================
// Bei Skalierung auf >1000 req/min: Migration auf Redis/Upstash erwägen.
// Für eine Zahnarztpraxis mit ~50 Besuchern/Tag ist PostgreSQL optimal —
// kein zusätzlicher Infrastruktur-Dienst nötig.
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 Stunde
const MAX_REQUESTS = 3; // NAT-IP-freundlich (Familie/Büro)

/**
 * Atomarer Rate-Limit über ein SINGLE-STATEMENT UPSERT (race-frei).
 *
 * PostgreSQL `ON CONFLICT DO UPDATE` wird in einer Transaktion mit Row-Lock
 * ausgeführt — alle parallelen Requests werden seriell verarbeitet und sehen
 * konsistente `attempts`- und `last_reset`-Werte.
 *
 * Der CASE-Ausdruck entscheidet server-seitig:
 *   - Fenster abgelaufen  → attempts := 1, last_reset := NOW()
 *   - Fenster aktiv       → attempts := attempts + 1 (kein lastReset-Refresh)
 *
 * Ersetzt den vorigen `findUnique → update` Fluss, der im Reset-Branch eine
 * klassische TOCTOU-Race hatte (N parallele Requests konnten alle attempts=1
 * schreiben und damit N-fach durchrutschen).
 */
export async function checkRateLimitDb(ip: string): Promise<boolean> {
  const windowStartMs = Date.now() - RATE_LIMIT_WINDOW_MS;

  // Abgelaufene Einträge dieser IP nach der Response asynchron bereinigen.
  after(async () => {
    await prisma.rateLimit.deleteMany({
      where: { ip, lastReset: { lt: new Date(windowStartMs) } }
    }).catch(() => {});
  });

  // cuid() als Fallback-ID — wird nur beim INSERT verwendet, nicht beim UPDATE.
  // Kompromiss: Wir generieren die ID clientseitig (wie Prisma sonst auch).
  const id = `cuid_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

  const rows = await prisma.$queryRaw<Array<{ attempts: number }>>`
    INSERT INTO rate_limits (id, ip, attempts, last_reset)
    VALUES (${id}, ${ip}, 1, NOW())
    ON CONFLICT (ip) DO UPDATE SET
      attempts = CASE
        WHEN rate_limits.last_reset < to_timestamp(${windowStartMs} / 1000.0)
          THEN 1
        ELSE rate_limits.attempts + 1
      END,
      last_reset = CASE
        WHEN rate_limits.last_reset < to_timestamp(${windowStartMs} / 1000.0)
          THEN NOW()
        ELSE rate_limits.last_reset
      END
    RETURNING attempts;
  `;

  const attempts = rows[0]?.attempts ?? 1;
  return attempts <= MAX_REQUESTS;
}

/**
 * Periodischer Cleanup abgelaufener Rate-Limit-Einträge.
 * Wird nach erfolgreichem Kontaktformular-Submit aufgerufen.
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  await prisma.rateLimit.deleteMany({
    where: { lastReset: { lt: windowStart } },
  }).catch((err) => logger.error({ err, action: "cleanupExpiredRateLimits" }, "Rate-limit cleanup failed"));
}
