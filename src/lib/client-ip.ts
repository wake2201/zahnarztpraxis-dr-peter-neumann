import { headers } from "next/headers";

export const TRUSTED_IP_ERROR_CODE = "TRUSTED_IP_UNAVAILABLE";

export class TrustedClientIpError extends Error {
  code = TRUSTED_IP_ERROR_CODE;

  constructor() {
    super("Trusted client IP could not be derived from the current request.");
    this.name = "TrustedClientIpError";
  }
}

/**
 * Vertrauenswuerdige Client-IP-Ermittlung.
 *
 * `TRUST_PROXY` (env) muss auf `true` gesetzt werden, wenn die App
 * hinter einem konfigurierten Reverse-Proxy laeuft, der `x-real-ip` oder
 * `x-forwarded-for` ueberschreibt. Ohne Proxy darf NIEMALS auf diese
 * Header vertraut werden (Client kann sie direkt setzen).
 *
 * Reihenfolge (nur auf echte, vom Host signierte Header vertrauen):
 * 1. `x-vercel-forwarded-for`  -> Vercel Edge (faelschungssicher auf Vercel).
 * 2. `x-real-ip`               -> nur wenn TRUST_PROXY=true (Nginx/Traefik).
 * 3. `x-forwarded-for` letzter Eintrag -> nur wenn TRUST_PROXY=true.
 * 4. Lokal (Dev/Test)          -> Loopback-Fallback fuer lokale Entwicklung.
 * 5. Produktion ohne Trust     -> fail closed statt globalem "unknown"-Bucket.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();

  const isVercelRuntime = process.env.VERCEL === "1";
  const vercel = h.get("x-vercel-forwarded-for");
  if (isVercelRuntime && vercel) {
    return vercel.split(",")[0].trim();
  }

  const trustProxy = process.env.TRUST_PROXY === "true";
  if (trustProxy) {
    const realIp = h.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }

    const xff = h.get("x-forwarded-for");
    if (xff) {
      const parts = xff.split(",").map((part) => part.trim()).filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return "127.0.0.1";
  }

  throw new TrustedClientIpError();
}

export function isTrustedClientIpError(error: unknown): error is TrustedClientIpError {
  return error instanceof TrustedClientIpError;
}
