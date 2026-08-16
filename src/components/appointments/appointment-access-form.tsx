"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyAppointmentManagementCode } from "@/lib/actions";
import { publicContent } from "@/content/data";

export function AppointmentAccessForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !code.trim()) {
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const result = await verifyAppointmentManagementCode({ code: code.trim() });
        if (!result.success) {
          setError(result.error);
          return;
        }

        setCode("");
        router.refresh();
      } catch {
        setError("Der Zugangscode konnte nicht geprüft werden. Bitte versuchen Sie es später erneut.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-100 bg-white p-6 shadow-card sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <KeyRound className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-center text-3xl font-bold tracking-tight text-slate-800">Termin verwalten</h1>
      <p className="mt-3 text-center leading-7 text-slate-600">
        Geben Sie den persönlichen Zugangscode von Ihrer Buchungsbestätigung ein. Ein Konto oder eine E-Mail-Adresse ist nicht erforderlich.
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <label htmlFor="appointment-management-code" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Zugangscode
        </label>
        <Input
          id="appointment-management-code"
          name="appointmentManagementCode"
          required
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={64}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          aria-describedby={error ? "appointment-code-error appointment-code-help" : "appointment-code-help"}
          aria-invalid={Boolean(error)}
          className="h-12 bg-white text-center font-mono text-lg tracking-widest"
          placeholder="Zugangscode eingeben"
        />
        <p id="appointment-code-help" className="mt-2 text-sm leading-6 text-slate-500">
          Der Code wird per geschütztem POST an den Server übertragen und erscheint nicht in der Internetadresse.
        </p>

        {error && (
          <p id="appointment-code-error" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isPending || !code.trim()}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />}
          {isPending ? "Zugang wird geprüft …" : "Termin sicher aufrufen"}
        </Button>
      </form>

      <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
        <p>Code verloren oder Hilfe benötigt?</p>
        <a href={publicContent.practice.phone.href} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-semibold text-primary hover:bg-primary-50">
          <Phone className="h-4 w-4" aria-hidden="true" />{publicContent.practice.phone.display} anrufen
        </a>
        <p className="mt-2"><Link href="/termin/buchen" className="font-semibold text-primary hover:underline">Neuen Termin buchen</Link></p>
      </div>
    </div>
  );
}
