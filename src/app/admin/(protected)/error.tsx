"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Phone } from "lucide-react";
import { publicContent } from "@/content/data";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { admin, practice } = publicContent;

  function handleRetry() {
    setRetrying(true);
    setRetryCount(c => c + 1);
    // router.refresh() invalidiert den RSC-Cache und erzwingt einen
    // frischen Server-Component-Render. Ohne diesen Aufruf würde reset()
    // nur den React-Tree re-mounten — mit demselben gecachten (fehlerhaften)
    // Server-Response. Bei transienten DB-Timeouts ist das der Unterschied
    // zwischen "funktioniert nach Retry" und "identischer Fehler nochmal".
    router.refresh();
    reset();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-slate-100 p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Ein Fehler ist aufgetreten
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Beim Laden des Dashboards ist ein unerwarteter Fehler aufgetreten.
          Bitte versuchen Sie es erneut.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-4 font-mono">
            Fehler-ID: {error.digest}
          </p>
        )}
        <Button onClick={handleRetry} disabled={retrying || retryCount >= 3}>
          {retrying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Wird geladen…
            </>
          ) : (
            "Erneut versuchen"
          )}
        </Button>
        {retryCount >= 3 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
            <p className="text-xs text-amber-800 font-medium mb-1">Mehrfache Fehlversuche</p>
            <p className="text-xs text-amber-700">
              Das System scheint vorübergehend nicht erreichbar zu sein.
            </p>
            <a href={practice.phone.href} className="mt-2 inline-flex items-center text-xs text-primary font-semibold">
              <Phone className="w-3 h-3 mr-1" /> {admin.errorPhoneCtaLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
