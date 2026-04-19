import { headers } from "next/headers";

/**
 * Vertrauenswürdige Client-IP-Ermittlung.
 *
 * `TRUST_PROXY` (env) muss auf `true` gesetzt werden, wenn die App
 * hinter einem konfigurierten Reverse-Proxy läuft, der `x-real-ip` oder
 * `x-forwarded-for` überschreibt. Ohne Proxy darf NIEMALS auf diese
 * Header vertraut werden (Client kann sie direkt setzen).
 *
 * Reihenfolge (nur auf echte, vom Host signierte Header vertrauen):
 * 1. `x-vercel-forwarded-for`  → Vercel Edge (fälschungssicher auf Vercel).
 * 2. `x-real-ip`               → nur wenn TRUST_PROXY=true (Nginx/Traefik).
 * 3. `x-forwarded-for` letzter Eintrag → nur wenn TRUST_PROXY=true.
 * 4. `"unknown"`               → globaler Bucket (siehe ARCHITECTURE.md §6).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();

  const vercel = h.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();

  const trustProxy = process.env.TRUST_PROXY === "true";
  if (trustProxy) {
    const realIp = h.get("x-real-ip");
    if (realIp) return realIp.trim();

    const xff = h.get("x-forwarded-for");
    if (xff) {
      const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    }
  }

  return "unknown";
}
