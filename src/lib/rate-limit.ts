import { after } from "next/server";
import { prisma } from "./prisma";
import { logger } from "./logger";

// ============================================================================
// RATE LIMITING (DB-basiert - PostgreSQL)
// ============================================================================
// Bei Skalierung auf >1000 req/min: Migration auf Redis/Upstash erwaegen.
// Fuer eine Zahnarztpraxis mit ~50 Besuchern/Tag ist PostgreSQL optimal -
// kein zusaetzlicher Infrastruktur-Dienst noetig.
// ============================================================================

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 Stunde
const DEFAULT_MAX_REQUESTS = 3; // NAT-IP-freundlich (Familie/Buero)

interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

/**
 * Atomarer Rate-Limit ueber ein SINGLE-STATEMENT UPSERT (race-frei).
 *
 * Namespaced Keys (z.B. `contact:<ip>` oder `client-error:<ip>`) nutzen
 * dieselbe Tabelle, ohne dass verschiedene Schutzmechanismen ihr Budget teilen.
 *
 * Der CASE-Ausdruck entscheidet server-seitig:
 *   - Fenster abgelaufen  -> attempts := 1, last_reset := NOW()
 *   - Fenster aktiv       -> attempts := attempts + 1 (kein lastReset-Refresh)
 */
export async function checkRateLimitDb(key: string, options: RateLimitOptions = {}): Promise<boolean> {
  const windowMs = options.windowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const windowStartMs = Date.now() - windowMs;

  // Abgelaufene Eintraege dieses Buckets nach der Response asynchron bereinigen.
  after(async () => {
    await prisma
      .$transaction(async (tx) => {
        await tx.rateLimit.deleteMany({
          where: { ip: key, lastReset: { lt: new Date(windowStartMs) } },
        });
      })
      .catch((err) => logger.error({ err, action: "checkRateLimitDb" }, "Rate-limit cleanup failed"));
  });

  // cuid() als Fallback-ID - wird nur beim INSERT verwendet, nicht beim UPDATE.
  const id = `cuid_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

  const rows = await prisma.$transaction(async (tx) => {
    return tx.$queryRaw<Array<{ attempts: number }>>`
      INSERT INTO rate_limits (id, ip, attempts, last_reset)
      VALUES (${id}, ${key}, 1, NOW())
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
  });

  const attempts = rows[0]?.attempts ?? 1;
  return attempts <= maxRequests;
}

/**
 * Periodischer Cleanup abgelaufener Rate-Limit-Eintraege.
 * Wird nach erfolgreichem Kontaktformular-Submit aufgerufen.
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  const windowStart = new Date(Date.now() - DEFAULT_RATE_LIMIT_WINDOW_MS);
  await prisma
    .$transaction(async (tx) => {
      await tx.rateLimit.deleteMany({
        where: { lastReset: { lt: windowStart } },
      });
    })
    .catch((err) => logger.error({ err, action: "cleanupExpiredRateLimits" }, "Rate-limit cleanup failed"));
}
