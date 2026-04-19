import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Generiert eine kryptographische Nonce pro Request und setzt
 * einen strikten Content-Security-Policy Header.
 *
 * AUTH-HINWEIS: Der Auth-Guard für /admin/* liegt bewusst NICHT hier,
 * sondern im (protected)/layout.tsx via getServerSession(). Grund:
 * getToken() (next-auth/jwt) benötigt NEXTAUTH_SECRET, das auf
 * Vercel's Edge Runtime nicht immer als Env-Var verfügbar ist.
 * Das führte zu einem 307-Redirect-Loop nach erfolgreichem Login.
 *
 * Next.js App Router liest den CSP-Header von den Request-Headers und
 * propagiert die Nonce automatisch auf alle generierten <script>-Tags.
 *
 * 'strict-dynamic' erlaubt Scripts, die von einem vertrauenswürdigen Script
 * geladen werden (Next.js Hydration), ohne 'unsafe-inline' zu benötigen.
 *
 * 'unsafe-eval' wird nur im Development-Modus hinzugefügt (HMR / React Fast Refresh).
 * style-src 'unsafe-inline' ist nötig, weil Tailwind/Next.js Inline-Styles injiziert.
 */
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV === "development";

  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];

  const cspHeaderValue = cspDirectives.join("; ");

  // Nonce + CSP auf Request-Headers setzen — Next.js liest diese und
  // propagiert die Nonce automatisch auf seine Inline-Scripts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeaderValue);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // CSP auch auf Response-Headers setzen — wird vom Browser enforced
  response.headers.set("Content-Security-Policy", cspHeaderValue);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static/asset endpoints.
    // robots.txt + sitemap.xml werden excluded, damit sie ohne CSP-Nonce
    // voll cachebar sind (sie enthalten ohnehin kein JS).
    {
      source: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
