"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  Clock,
  Loader2,
  LogOut,
  Phone,
  RefreshCw,
  Stethoscope,
  XCircle,
} from "lucide-react";
import {
  AppointmentSlotPicker,
  mergeAppointmentAvailabilityDays,
  type AppointmentSlotSelection,
} from "./appointment-slot-picker";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { Button } from "@/components/ui/button";
import {
  cancelManagedAppointment,
  endAppointmentManagementSession,
  getManagedAppointmentAvailability,
  rescheduleManagedAppointment,
} from "@/lib/actions";
import type { AppointmentAvailabilityDayDto, ManagedAppointmentDto } from "@/lib/appointments/types";
import { publicContent } from "@/content/data";

type ManagementMode = "view" | "reschedule" | "cancel";
type PendingAction = "reschedule" | "cancel" | "endSession" | null;

export function AppointmentManagement({ initialAppointment }: { initialAppointment: ManagedAppointmentDto }) {
  const router = useRouter();
  const viewHeadingRef = useRef<HTMLHeadingElement>(null);
  const modeHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousMode = useRef<ManagementMode>("view");
  const [appointment, setAppointment] = useState(initialAppointment);
  const [mode, setMode] = useState<ManagementMode>("view");
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlotSelection | null>(null);
  const [availabilityDays, setAvailabilityDays] = useState<AppointmentAvailabilityDayDto[]>([]);
  const [availabilityCursor, setAvailabilityCursor] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (previousMode.current === mode) {
      return;
    }
    previousMode.current = mode;
    (mode === "view" ? viewHeadingRef : modeHeadingRef).current?.focus();
  }, [mode]);

  async function loadAvailability({ append = false, cursor }: { append?: boolean; cursor?: string } = {}) {
    append ? setIsLoadingMore(true) : setIsLoadingAvailability(true);
    setAvailabilityError("");

    try {
      const result = await getManagedAppointmentAvailability(cursor ? { cursor } : {});
      if (!result.success) {
        setAvailabilityError(result.error);
        return;
      }

      setAvailabilityDays((current) => append
        ? mergeAppointmentAvailabilityDays(current, result.data.days)
        : result.data.days);
      setAvailabilityCursor(result.data.nextCursor);
    } catch {
      setAvailabilityError("Freie Termine konnten nicht geladen werden. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoadingAvailability(false);
      setIsLoadingMore(false);
    }
  }

  function openReschedule() {
    setMode("reschedule");
    setSelectedSlot(null);
    setAvailabilityDays([]);
    setAvailabilityCursor(null);
    setActionError("");
    void loadAvailability();
  }

  async function handleReschedule() {
    if (!selectedSlot || pendingAction) {
      return;
    }

    setPendingAction("reschedule");
    setActionError("");
    try {
      const result = await rescheduleManagedAppointment({ startAt: selectedSlot.startAt });
      if (!result.success) {
        setActionError(result.error);
        setSelectedSlot(null);
        setAvailabilityDays([]);
        setAvailabilityCursor(null);
        await loadAvailability();
        return;
      }

      setAppointment(result.data);
      setMode("view");
      setSelectedSlot(null);
      router.refresh();
    } catch {
      setActionError("Der Termin konnte nicht verschoben werden. Bitte versuchen Sie es erneut.");
      setSelectedSlot(null);
      setAvailabilityDays([]);
      setAvailabilityCursor(null);
      await loadAvailability();
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCancel() {
    if (pendingAction) {
      return;
    }

    setPendingAction("cancel");
    setActionError("");
    try {
      const result = await cancelManagedAppointment();
      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setAppointment(result.data);
      setMode("view");
      router.refresh();
    } catch {
      setActionError("Der Termin konnte nicht abgesagt werden. Bitte versuchen Sie es erneut.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEndSession() {
    if (pendingAction) {
      return;
    }

    setPendingAction("endSession");
    setActionError("");
    try {
      const result = await endAppointmentManagementSession();
      if (!result.success) {
        setActionError(result.error);
        return;
      }

      router.refresh();
    } catch {
      setActionError("Die Sitzung konnte nicht beendet werden. Bitte versuchen Sie es erneut.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-card sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Ihr Termin</p>
            <h1 ref={viewHeadingRef} tabIndex={-1} className="mt-1 text-3xl font-bold tracking-tight text-slate-800 focus:outline-none">Termin verwalten</h1>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <AppointmentDetail icon={<Stethoscope className="h-5 w-5" aria-hidden="true" />} label="Terminart" value={appointment.typeName} />
          <AppointmentDetail icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />} label="Datum" value={appointment.dateLabel} />
          <AppointmentDetail icon={<Clock className="h-5 w-5" aria-hidden="true" />} label="Uhrzeit" value={`${appointment.startLabel} – ${appointment.endLabel} Uhr`} />
        </dl>

        {appointment.status === "PENDING" && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Die Praxis prüft Ihre Buchung. Der aktuelle Status wird hier angezeigt, sobald Sie sich erneut mit Ihrem Zugangscode anmelden.
          </p>
        )}

        {actionError && mode !== "reschedule" && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{actionError}</p>
        )}

        {mode === "view" && (
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap">
            {appointment.canReschedule && (
              <Button type="button" onClick={openReschedule} disabled={Boolean(pendingAction)}>
                <CalendarClock className="mr-2 h-4 w-4" aria-hidden="true" />Termin verschieben
              </Button>
            )}
            {appointment.canCancel && (
              <Button type="button" variant="outline" className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => { setMode("cancel"); setActionError(""); }} disabled={Boolean(pendingAction)}>
                <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />Termin absagen
              </Button>
            )}
            {!appointment.canReschedule && !appointment.canCancel && (
              <p className="text-sm leading-6 text-slate-500">Dieser Termin kann online nicht mehr geändert werden. Bitte rufen Sie die Praxis bei Fragen an.</p>
            )}
          </div>
        )}

        {mode === "cancel" && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5" role="group" aria-labelledby="cancel-appointment-heading">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              <div>
                <h2 ref={modeHeadingRef} tabIndex={-1} id="cancel-appointment-heading" className="font-bold text-red-900 focus:outline-none">Termin wirklich absagen?</h2>
                <p className="mt-1 text-sm leading-6 text-red-700">Der reservierte Zeitpunkt wird wieder freigegeben. Diese Aktion kann hier nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="destructive" onClick={() => void handleCancel()} disabled={Boolean(pendingAction)}>
                {pendingAction === "cancel" && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {pendingAction === "cancel" ? "Termin wird abgesagt …" : "Absage bestätigen"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode("view")} disabled={Boolean(pendingAction)}>Nicht absagen</Button>
            </div>
          </div>
        )}

        {mode === "reschedule" && (
          <div className="mt-8 border-t border-slate-100 pt-7">
            <h2 ref={modeHeadingRef} tabIndex={-1} className="text-xl font-bold text-slate-800 focus:outline-none">Neuen Zeitpunkt auswählen</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Die angezeigten Zeiten kommen direkt vom Server und werden beim Verschieben erneut geprüft.</p>

            {actionError && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                {actionError} Die bisherige Auswahl wurde verworfen.
              </p>
            )}

            <div className="mt-6">
              <AppointmentSlotPicker
                days={availabilityDays}
                selectedStartAt={selectedSlot?.startAt ?? null}
                onSelect={(slot) => { setSelectedSlot(slot); setActionError(""); }}
                isLoading={isLoadingAvailability}
                error={availabilityError}
                hasMore={Boolean(availabilityCursor)}
                isLoadingMore={isLoadingMore}
                onLoadMore={() => void loadAvailability({ append: true, cursor: availabilityCursor ?? undefined })}
                inputName="managedAppointmentSlot"
              />
            </div>

            {availabilityError && (
              <Button type="button" variant="outline" className="mt-4" onClick={() => void loadAvailability()}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Erneut laden
              </Button>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => { setMode("view"); setActionError(""); }} disabled={Boolean(pendingAction)}>Abbrechen</Button>
              <Button type="button" onClick={() => void handleReschedule()} disabled={!selectedSlot || Boolean(pendingAction)}>
                {pendingAction === "reschedule" && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {pendingAction === "reschedule" ? "Termin wird verschoben …" : "Neuen Zeitpunkt bestätigen"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 sm:flex-row">
        <a href={publicContent.practice.phone.href} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-semibold text-primary hover:bg-primary-50">
          <Phone className="h-4 w-4" aria-hidden="true" />{publicContent.practice.phone.display}
        </a>
        <Button type="button" variant="ghost" size="sm" onClick={() => void handleEndSession()} disabled={Boolean(pendingAction)}>
          {pendingAction === "endSession" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />}
          {pendingAction === "endSession" ? "Sitzung wird beendet …" : "Sitzung beenden"}
        </Button>
      </div>
    </div>
  );
}

function AppointmentDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <dt className="flex items-center gap-2 text-sm font-semibold text-primary">{icon}{label}</dt>
      <dd className="mt-2 break-words font-bold text-slate-800">{value}</dd>
    </div>
  );
}
