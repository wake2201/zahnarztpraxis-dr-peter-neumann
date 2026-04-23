"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/log/client-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        digest: error.digest,
        pathname: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="de">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ein kritischer Fehler ist aufgetreten</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Wir haben das Problem protokolliert. Bitte versuchen Sie es später erneut oder kontaktieren Sie die Praxis telefonisch.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#1E6BB8] text-white rounded hover:bg-[#0F4C81] transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
