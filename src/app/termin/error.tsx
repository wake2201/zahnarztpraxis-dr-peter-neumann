"use client";

import { AlertTriangle, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicContent } from "@/content/data";

export default function AppointmentError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { practice } = publicContent;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
          <AlertTriangle className="h-7 w-7 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-800">Terminseite konnte nicht geladen werden</h1>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
          Bitte versuchen Sie es erneut. Bei einer dringenden Terminfrage erreichen Sie die Praxis während der Sprechzeiten telefonisch.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Erneut versuchen
          </Button>
          <Button asChild variant="outline">
            <a href={practice.phone.href}><Phone className="mr-2 h-4 w-4" aria-hidden="true" />{practice.phone.display}</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
