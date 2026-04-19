import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    const baseHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: [
          "camera=()",
          "microphone=()",
          "geolocation=()",
          "attribution-reporting=()",
          "private-aggregation=()",
          "private-state-token-issuance=()",
          "private-state-token-redemption=()",
          "join-ad-interest-group=()",
          "run-ad-auction=()",
          "browsing-topics=()",
        ].join(", "),
      },
      { key: "X-DNS-Prefetch-Control", value: "off" },
    ];

    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
      {
        // noindex nur für den Admin-Bereich — öffentliche Seiten müssen
        // für Suchmaschinen sichtbar bleiben (Praxis-SEO).
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, nosnippet, noarchive, noimageindex",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
