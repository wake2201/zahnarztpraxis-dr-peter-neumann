import { Heart } from "lucide-react";

export default function AppointmentLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8" aria-busy="true" aria-label="Terminseite wird geladen">
      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-card sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Heart className="h-6 w-6 animate-pulse text-primary" aria-hidden="true" />
        </div>
        <div className="mx-auto mt-6 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="mx-auto mt-4 h-4 w-full max-w-md animate-pulse rounded bg-slate-100" />
        <div className="mt-9 space-y-4">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <span className="sr-only">Termindaten werden geladen …</span>
      </div>
    </main>
  );
}
