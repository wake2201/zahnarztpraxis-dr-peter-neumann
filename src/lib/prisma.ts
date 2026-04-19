import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { logger } from "./logger";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error(
    "DATABASE_URL nicht gesetzt. Lege .env basierend auf .env.example an.",
  );
}

function normalizeConnectionString(connectionString: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(connectionString);
  } catch {
    return connectionString;
  }

  if (parsedUrl.protocol !== "postgres:" && parsedUrl.protocol !== "postgresql:") {
    return connectionString;
  }

  if (parsedUrl.searchParams.get("uselibpqcompat") === "true") {
    return connectionString;
  }

  const sslMode = parsedUrl.searchParams.get("sslmode");
  if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
    parsedUrl.searchParams.set("sslmode", "verify-full");
    return parsedUrl.toString();
  }

  return connectionString;
}

const connectionString = normalizeConnectionString(rawConnectionString);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Serverless-optimierte Pool-Konfiguration.
// Neon Serverless Postgres (Free Tier) braucht bis zu 7s zum Aufwachen,
// daher connectionTimeoutMillis: 10000 (Cold Boot + TLS Handshake).
const isNewPool = !globalForPrisma.pool;
export const pool = globalForPrisma.pool ?? new Pool({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Eager Connection Warmup beim Cold Start (siehe ARCHITECTURE.md §4).
if (isNewPool) {
  pool.connect()
    .then(client => client.release())
    .catch(err => {
      logger.warn(
        { err, code: err?.code },
        "[prisma] Eager warmup fehlgeschlagen",
      );
    });
}

const createPrismaClient = () => {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
