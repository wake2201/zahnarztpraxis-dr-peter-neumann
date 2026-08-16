"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminAppointment,
  getAdminAppointmentAvailability,
  mutateAdminAppointment,
  rescheduleAdminAppointment,
} from "@/lib/actions";
import type {
  AdminAppointmentDashboardDto,
  AdminAppointmentDashboardInput,
  AdminAppointmentDto,
  AdminAppointmentMutationAction,
  AppointmentAvailabilityDto,
  AppointmentConfigurationDto,
  AppointmentStatusValue,
} from "@/lib/appointments/types";
import { EUROPEAN_COUNTRY_CODES } from "@/lib/country-codes";
import { AppointmentSettings } from "./appointment-settings";

type AppointmentView = "today" | "week" | "pending";

interface Props {
  dashboard: AdminAppointmentDashboardDto;
  configuration: AppointmentConfigurationDto | null;
  isAdmin: boolean;
  dashboardError: string;
  configurationError: string;
  onReloadDashboard: (input?: AdminAppointmentDashboardInput) => Promise<void>;
  onReloadConfiguration: () => Promise<void>;
}

const STATUS_LABELS: Record<AppointmentStatusValue, string> = {
  PENDING: "Wird geprüft",
  CONFIRMED: "Bestätigt",
  REJECTED: "Abgelehnt",
  CANCELLED: "Storniert",
};

function statusClass(status: AppointmentStatusValue) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function shiftLocalDate(localDate: string, days: number) {
  const date = new Date(`${localDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function mergeAvailability(
  current: AppointmentAvailabilityDto | null,
  next: AppointmentAvailabilityDto,
  append: boolean,
): AppointmentAvailabilityDto {
  if (!append || !current) {
    return next;
  }

  const days = new Map(current.days.map((day) => [day.date, day]));
  for (const day of next.days) {
    const existing = days.get(day.date);
    if (!existing) {
      days.set(day.date, day);
      continue;
    }
    const knownStarts = new Set(existing.slots.map((slot) => slot.startAt));
    days.set(day.date, {
      ...day,
      slots: [...existing.slots, ...day.slots.filter((slot) => !knownStarts.has(slot.startAt))],
    });
  }

  return { days: [...days.values()], nextCursor: next.nextCursor };
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}

export function AppointmentsTab({
  dashboard,
  configuration,
  isAdmin,
  dashboardError,
  configurationError,
  onReloadDashboard,
  onReloadConfiguration,
}: Props) {
  const [view, setView] = useState<AppointmentView>("today");
  const [showManualForm, setShowManualForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [pendingOperation, setPendingOperation] = useState("");
  const [operationError, setOperationError] = useState("");
  const [operationSuccess, setOperationSuccess] = useState("");
  const [confirmingAction, setConfirmingAction] = useState<AdminAppointmentMutationAction | null>(null);
  const [isChangingWeek, setIsChangingWeek] = useState(false);

  const [manualTypeId, setManualTypeId] = useState(dashboard.manualAppointmentTypes[0]?.id ?? "");
  const [manualAvailability, setManualAvailability] = useState<AppointmentAvailabilityDto | null>(null);
  const [manualAvailabilityError, setManualAvailabilityError] = useState("");
  const [manualStartAt, setManualStartAt] = useState("");
  const [manualFirstName, setManualFirstName] = useState("");
  const [manualLastName, setManualLastName] = useState("");
  const [manualCountryCode, setManualCountryCode] = useState("+49");
  const [manualPhone, setManualPhone] = useState("");
  const [manualDetails, setManualDetails] = useState("");
  const [manualConsent, setManualConsent] = useState(false);
  const [isLoadingManualAvailability, setIsLoadingManualAvailability] = useState(false);

  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);
  const [rescheduleAvailability, setRescheduleAvailability] = useState<AppointmentAvailabilityDto | null>(null);
  const [rescheduleAvailabilityError, setRescheduleAvailabilityError] = useState("");
  const [rescheduleStartAt, setRescheduleStartAt] = useState("");
  const [isLoadingRescheduleAvailability, setIsLoadingRescheduleAvailability] = useState(false);

  useEffect(() => {
    if (
      manualTypeId &&
      dashboard.manualAppointmentTypes.some((appointmentType) => appointmentType.id === manualTypeId)
    ) {
      return;
    }

    setManualTypeId(dashboard.manualAppointmentTypes[0]?.id ?? "");
    setManualAvailability(null);
    setManualStartAt("");
  }, [dashboard.manualAppointmentTypes, manualTypeId]);

  const selectedAppointment = dashboard.appointments.find(
    (appointment) => appointment.id === selectedAppointmentId,
  ) ?? null;

  const rescheduleTarget = dashboard.appointments.find(
    (appointment) => appointment.id === rescheduleTargetId,
  ) ?? null;

  const visibleAppointments = useMemo(() => {
    const appointments = [...dashboard.appointments].sort(
      (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    );

    if (view === "today") {
      return appointments.filter((appointment) => appointment.localDate === dashboard.todayLocalDate);
    }

    if (view === "pending") {
      return appointments.filter((appointment) => appointment.status === "PENDING");
    }

    return appointments.filter(
      (appointment) =>
        appointment.localDate >= dashboard.weekStart && appointment.localDate <= dashboard.weekEnd,
    );
  }, [dashboard, view]);

  async function reloadWeek(weekStart: string) {
    setIsChangingWeek(true);
    setOperationError("");
    try {
      await onReloadDashboard({ weekStart });
      setSelectedAppointmentId(null);
      setRescheduleTargetId(null);
    } catch {
      setOperationError("Die Terminwoche konnte nicht geladen werden.");
    } finally {
      setIsChangingWeek(false);
    }
  }

  async function loadManualAvailability(cursor?: string) {
    if (!manualTypeId) {
      setManualAvailabilityError("Bitte wählen Sie zuerst eine Terminart.");
      return;
    }

    setIsLoadingManualAvailability(true);
    setManualAvailabilityError("");
    try {
      const result = await getAdminAppointmentAvailability({
        appointmentTypeId: manualTypeId,
        ...(cursor ? { cursor } : {}),
      });
      if (!result.success) {
        setManualAvailabilityError(result.error);
        return;
      }

      setManualAvailability((current) => mergeAvailability(current, result.data, Boolean(cursor)));
    } catch {
      setManualAvailabilityError("Freie Termine konnten nicht geladen werden.");
    } finally {
      setIsLoadingManualAvailability(false);
    }
  }

  async function handleCreateManualAppointment(event: React.FormEvent) {
    event.preventDefault();
    if (!manualStartAt) {
      setOperationError("Bitte wählen Sie einen freien Termin.");
      return;
    }

    setPendingOperation("create");
    setOperationError("");
    setOperationSuccess("");
    try {
      const result = await createAdminAppointment({
        appointmentTypeId: manualTypeId,
        startAt: manualStartAt,
        firstName: manualFirstName,
        lastName: manualLastName,
        countryCode: manualCountryCode,
        phone: manualPhone,
        ...(manualDetails.trim() ? { details: manualDetails } : {}),
        gdprConsent: manualConsent,
      });

      if (!result.success) {
        setOperationError(result.error);
        await loadManualAvailability();
        return;
      }

      setOperationSuccess(
        result.data.status === "PENDING"
          ? "Der Telefontermin wurde als offene Terminanfrage eingetragen."
          : "Der Telefontermin wurde bestätigt eingetragen.",
      );
      setManualFirstName("");
      setManualLastName("");
      setManualPhone("");
      setManualDetails("");
      setManualConsent(false);
      setManualStartAt("");
      setManualAvailability(null);
      setShowManualForm(false);
      try {
        await onReloadDashboard({ weekStart: dashboard.weekStart });
      } catch {
        setOperationError("Der Termin wurde gespeichert, die Übersicht konnte aber nicht aktualisiert werden.");
      }
    } catch {
      setOperationError("Der Telefontermin konnte nicht angelegt werden.");
    } finally {
      setPendingOperation("");
    }
  }

  async function handleAppointmentMutation(
    appointment: AdminAppointmentDto,
    action: AdminAppointmentMutationAction,
  ) {
    setPendingOperation(`${appointment.id}:${action}`);
    setOperationError("");
    setOperationSuccess("");
    try {
      const result = await mutateAdminAppointment({
        appointmentId: appointment.id,
        expectedRevision: appointment.revision,
        action,
      });
      if (!result.success) {
        setOperationError(result.error);
        try {
          await onReloadDashboard({ weekStart: dashboard.weekStart });
        } catch {
          // Die fachliche Fehlermeldung bleibt maßgeblich; der Polling-Lauf lädt später erneut.
        }
        return;
      }

      setOperationSuccess(
        action === "CONFIRM"
          ? "Der Termin wurde bestätigt."
          : action === "REJECT"
            ? "Die Terminanfrage wurde abgelehnt und die Zeit freigegeben."
            : "Der Termin wurde storniert und die Zeit freigegeben.",
      );
      setConfirmingAction(null);
      try {
        await onReloadDashboard({ weekStart: dashboard.weekStart });
      } catch {
        setOperationError("Die Änderung wurde gespeichert, die Übersicht konnte aber nicht aktualisiert werden.");
      }
    } catch {
      setOperationError("Die Terminaktion konnte nicht abgeschlossen werden.");
    } finally {
      setPendingOperation("");
    }
  }

  async function loadRescheduleAvailability(appointment: AdminAppointmentDto, cursor?: string) {
    setRescheduleTargetId(appointment.id);
    setIsLoadingRescheduleAvailability(true);
    setRescheduleAvailabilityError("");
    if (!cursor) {
      setRescheduleStartAt("");
      setRescheduleAvailability(null);
    }

    try {
      const result = await getAdminAppointmentAvailability({
        appointmentTypeId: appointment.appointmentTypeId,
        appointmentId: appointment.id,
        ...(cursor ? { cursor } : {}),
      });
      if (!result.success) {
        setRescheduleAvailabilityError(result.error);
        return;
      }

      setRescheduleAvailability((current) => mergeAvailability(current, result.data, Boolean(cursor)));
    } catch {
      setRescheduleAvailabilityError("Freie Ersatztermine konnten nicht geladen werden.");
    } finally {
      setIsLoadingRescheduleAvailability(false);
    }
  }

  async function handleReschedule() {
    if (!rescheduleTarget || !rescheduleStartAt) {
      setRescheduleAvailabilityError("Bitte wählen Sie eine neue Zeit.");
      return;
    }

    setPendingOperation(`${rescheduleTarget.id}:RESCHEDULE`);
    setOperationError("");
    setOperationSuccess("");
    try {
      const result = await rescheduleAdminAppointment({
        appointmentId: rescheduleTarget.id,
        expectedRevision: rescheduleTarget.revision,
        startAt: rescheduleStartAt,
      });
      if (!result.success) {
        const mutationError = result.error;
        setRescheduleAvailabilityError(mutationError);
        try {
          await onReloadDashboard({ weekStart: dashboard.weekStart });
        } catch {
          // Die Server-Revalidierung ist fehlgeschlagen; die Terminwahl wird trotzdem neu geladen.
        }
        await loadRescheduleAvailability(rescheduleTarget);
        setRescheduleAvailabilityError((current) => current || mutationError);
        return;
      }

      setOperationSuccess("Der Termin wurde verschoben.");
      setRescheduleTargetId(null);
      setRescheduleAvailability(null);
      setRescheduleStartAt("");
      try {
        await onReloadDashboard({ weekStart: dashboard.weekStart });
      } catch {
        setOperationError("Der Termin wurde verschoben, die Übersicht konnte aber nicht aktualisiert werden.");
      }
    } catch {
      setRescheduleAvailabilityError("Der Termin konnte nicht verschoben werden.");
    } finally {
      setPendingOperation("");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <AppointmentStat label="Heute" value={dashboard.todayCount} icon={<CalendarDays className="w-5 h-5 text-primary" />} />
        <AppointmentStat label="Diese Woche" value={dashboard.weekCount} icon={<Clock3 className="w-5 h-5 text-blue-600" />} />
        <AppointmentStat label="Offene Terminanfragen" value={dashboard.pendingCount} icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} testId="appointment-pending-count" />
      </div>

      {(dashboardError || operationError || operationSuccess) && (
        <div aria-live="polite" className="space-y-2">
          {dashboardError && <p className="p-3 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">{dashboardError}</p>}
          {operationError && <p className="p-3 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">{operationError}</p>}
          {operationSuccess && <p className="p-3 text-sm text-green-700 border border-green-200 rounded-xl bg-green-50">{operationSuccess}</p>}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Terminansicht">
          <ViewButton active={view === "today"} onClick={() => setView("today")}>Heute</ViewButton>
          <ViewButton active={view === "week"} onClick={() => setView("week")}>Woche</ViewButton>
          <ViewButton active={view === "pending"} onClick={() => setView("pending")}>Offen ({dashboard.pendingCount})</ViewButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowManualForm((current) => !current)}>
            <Plus className="w-4 h-4 mr-1.5" /> Telefontermin
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setShowSettings((current) => !current)}>
              Buchung konfigurieren
            </Button>
          )}
        </div>
      </div>

      {showManualForm && (
        <form onSubmit={handleCreateManualAppointment} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Telefontermin eintragen</h2>
            <p className="mt-1 text-sm text-slate-500">Die freie Zeit wird direkt aus dem zentralen Terminplan geladen.</p>
          </div>
          {dashboard.manualAppointmentTypes.length === 0 ? (
            <p className="text-sm text-amber-700">Es ist noch keine aktive Terminart eingerichtet.</p>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Terminart
                  <select
                    value={manualTypeId}
                    onChange={(event) => {
                      setManualTypeId(event.target.value);
                      setManualAvailability(null);
                      setManualStartAt("");
                    }}
                    className="w-full h-10 px-3 mt-1.5 bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {dashboard.manualAppointmentTypes.map((appointmentType) => (
                      <option key={appointmentType.id} value={appointmentType.id}>
                        {appointmentType.name} · {appointmentType.durationMinutes} Min. · {appointmentType.confirmationMode === "MANUAL" ? "Prüfung nötig" : "sofort bestätigt"}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <Button type="button" variant="outline" onClick={() => loadManualAvailability()} disabled={isLoadingManualAvailability}>
                    {isLoadingManualAvailability ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Freie Termine laden
                  </Button>
                </div>
              </div>

              <AvailabilityPicker
                availability={manualAvailability}
                selectedStartAt={manualStartAt}
                error={manualAvailabilityError}
                loading={isLoadingManualAvailability}
                onSelect={setManualStartAt}
                onLoadMore={(cursor) => loadManualAvailability(cursor)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Vorname" value={manualFirstName} onChange={setManualFirstName} required />
                <Field label="Nachname" value={manualLastName} onChange={setManualLastName} required />
                <label className="text-sm font-medium text-slate-700">
                  Ländervorwahl
                  <select value={manualCountryCode} onChange={(event) => setManualCountryCode(event.target.value)} required className="w-full h-10 px-3 mt-1.5 bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary">
                    {EUROPEAN_COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.code}>{country.country} {country.code}</option>
                    ))}
                  </select>
                </label>
                <Field label="Telefon" value={manualPhone} onChange={(value) => setManualPhone(value.replace(/\D/g, ""))} inputMode="tel" required />
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Zusätzliche Angaben (optional)
                <Textarea value={manualDetails} onChange={(event) => setManualDetails(event.target.value)} className="mt-1.5" maxLength={1900} />
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={manualConsent} onChange={(event) => setManualConsent(event.target.checked)} required className="mt-1" />
                <span>Die Einwilligung zur Verarbeitung der Termindaten wurde bestätigt.</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={!manualStartAt || pendingOperation === "create"}>
                  {pendingOperation === "create" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Termin verbindlich eintragen
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowManualForm(false)} disabled={pendingOperation === "create"}>Abbrechen</Button>
              </div>
            </div>
          )}
        </form>
      )}

      {showSettings && isAdmin && (
        <AppointmentSettings
          configuration={configuration}
          loadError={configurationError}
          onReload={onReloadConfiguration}
        />
      )}

      <section className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-card">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-slate-100 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {view === "today" ? "Heutige Termine" : view === "pending" ? "Offene Terminanfragen" : "Wochenübersicht"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{dashboard.weekStart} bis {dashboard.weekEnd} · chronologisch</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" aria-label="Vorherige Woche" onClick={() => reloadWeek(shiftLocalDate(dashboard.weekStart, -7))} disabled={isChangingWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => reloadWeek(dashboard.todayLocalDate)} disabled={isChangingWeek}>Aktuelle Woche</Button>
            <Button variant="outline" size="sm" aria-label="Nächste Woche" onClick={() => reloadWeek(shiftLocalDate(dashboard.weekStart, 7))} disabled={isChangingWeek}>
              {isChangingWeek ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {visibleAppointments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Für diese Ansicht liegen keine Termine vor.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100" data-testid="appointment-list">
            {visibleAppointments.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => {
                  setSelectedAppointmentId(appointment.id);
                  setConfirmingAction(null);
                  setOperationError("");
                }}
                className="w-full px-6 py-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex items-center justify-center w-12 h-12 font-bold rounded-xl bg-primary/10 text-primary shrink-0">
                      {appointment.startLabel}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{appointment.firstName} {appointment.lastName}</p>
                      <p className="text-sm text-slate-500">{appointment.dateLabel} · {appointment.startLabel}–{appointment.endLabel} · {appointment.typeName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-600">{appointment.source === "ONLINE" ? "Online" : "Telefon"}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusClass(appointment.status)}`}>{STATUS_LABELS[appointment.status]}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedAppointment && (
        <section className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card" aria-label="Termindetails">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Termindetails</h2>
              <p className="mt-1 text-sm text-slate-500">Erstellt am {formatCreatedAt(selectedAppointment.createdAt)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedAppointmentId(null)} aria-label="Termindetails schließen"><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Patient" value={`${selectedAppointment.firstName} ${selectedAppointment.lastName}`} icon={<UserRound className="w-4 h-4" />} />
            <Detail label="Telefon" value={`${selectedAppointment.countryCode} ${selectedAppointment.phone}`} icon={<Phone className="w-4 h-4" />} />
            <Detail label="Terminart" value={`${selectedAppointment.typeName} · ${selectedAppointment.durationMinutes} Min.`} icon={<Clock3 className="w-4 h-4" />} />
            <Detail label="Zeit" value={`${selectedAppointment.dateLabel}, ${selectedAppointment.startLabel}–${selectedAppointment.endLabel}`} icon={<CalendarDays className="w-4 h-4" />} />
            <Detail label="Status" value={STATUS_LABELS[selectedAppointment.status]} />
            <Detail label="Quelle" value={selectedAppointment.source === "ONLINE" ? "Online-Buchung" : "Telefon / Administration"} />
          </div>
          {selectedAppointment.details && (
            <div className="p-4 mt-5 rounded-xl bg-slate-50">
              <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">Angaben des Patienten</p>
              <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{selectedAppointment.details}</p>
            </div>
          )}

          {(selectedAppointment.status === "PENDING" || selectedAppointment.status === "CONFIRMED") && (
            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedAppointment.status === "PENDING" && (
                  <>
                    <Button size="sm" onClick={() => setConfirmingAction("CONFIRM")} disabled={Boolean(pendingOperation)}><Check className="w-4 h-4 mr-1.5" />Bestätigen</Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmingAction("REJECT")} disabled={Boolean(pendingOperation)}>Ablehnen</Button>
                  </>
                )}
                {selectedAppointment.status === "CONFIRMED" && (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmingAction("CANCEL")} disabled={Boolean(pendingOperation)}>Stornieren</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => loadRescheduleAvailability(selectedAppointment)} disabled={Boolean(pendingOperation)}>Verschieben</Button>
              </div>

              {confirmingAction && (
                <div className="flex flex-col gap-3 p-4 border rounded-xl border-amber-200 bg-amber-50 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-amber-800">
                    {confirmingAction === "CONFIRM" ? "Diesen Termin verbindlich bestätigen?" : confirmingAction === "REJECT" ? "Anfrage ablehnen und reservierte Zeit freigeben?" : "Termin stornieren und reservierte Zeit freigeben?"}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={confirmingAction === "CONFIRM" ? "default" : "destructive"} onClick={() => handleAppointmentMutation(selectedAppointment, confirmingAction)} disabled={Boolean(pendingOperation)}>
                      {pendingOperation && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Ausführen
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmingAction(null)} disabled={Boolean(pendingOperation)}>Abbrechen</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {rescheduleTarget && (
        <section className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card" aria-label="Termin verschieben">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Termin verschieben</h2>
              <p className="mt-1 text-sm text-slate-500">Aktuell: {rescheduleTarget.dateLabel}, {rescheduleTarget.startLabel}–{rescheduleTarget.endLabel}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRescheduleTargetId(null)} aria-label="Verschieben schließen"><X className="w-4 h-4" /></Button>
          </div>
          <AvailabilityPicker
            availability={rescheduleAvailability}
            selectedStartAt={rescheduleStartAt}
            error={rescheduleAvailabilityError}
            loading={isLoadingRescheduleAvailability}
            onSelect={setRescheduleStartAt}
            onLoadMore={(cursor) => loadRescheduleAvailability(rescheduleTarget, cursor)}
          />
          <div className="flex flex-col gap-2 mt-5 sm:flex-row">
            <Button onClick={handleReschedule} disabled={!rescheduleStartAt || Boolean(pendingOperation)}>
              {pendingOperation.endsWith(":RESCHEDULE") && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Neue Zeit bestätigen
            </Button>
            <Button variant="outline" onClick={() => setRescheduleTargetId(null)} disabled={Boolean(pendingOperation)}>Abbrechen</Button>
          </div>
        </section>
      )}
    </div>
  );
}

function AppointmentStat({ label, value, icon, testId }: { label: string; value: number; icon: React.ReactNode; testId?: string }) {
  return (
    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-card" data-testid={testId}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50">{icon}</div>
        <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div>
      </div>
    </div>
  );
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button type="button" variant={active ? "default" : "outline"} size="sm" onClick={onClick} aria-pressed={active}>{children}</Button>;
}

function Field({ label, value, onChange, required = false, inputMode }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} required={required} inputMode={inputMode} className="mt-1.5" />
    </label>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">{label}</p>
      <p className="flex items-center gap-1.5 mt-1 text-sm font-medium text-slate-800">{icon}{value}</p>
    </div>
  );
}

function AvailabilityPicker({
  availability,
  selectedStartAt,
  error,
  loading,
  onSelect,
  onLoadMore,
}: {
  availability: AppointmentAvailabilityDto | null;
  selectedStartAt: string;
  error: string;
  loading: boolean;
  onSelect: (startAt: string) => void;
  onLoadMore: (cursor: string) => void;
}) {
  return (
    <div className="space-y-4" aria-live="polite">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {availability && availability.days.length === 0 && !loading && <p className="text-sm text-slate-500">Derzeit wurden keine freien Zeiten gefunden.</p>}
      {availability?.days.map((day) => (
        <div key={day.date}>
          <p className="mb-2 text-sm font-semibold text-slate-700">{day.dateLabel}</p>
          <div className="flex flex-wrap gap-2">
            {day.slots.map((slot) => (
              <button
                key={slot.startAt}
                type="button"
                onClick={() => onSelect(slot.startAt)}
                aria-pressed={selectedStartAt === slot.startAt}
                className={`px-3 py-2 text-sm font-medium border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedStartAt === slot.startAt ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700 hover:border-primary/50"}`}
              >
                {slot.startLabel}–{slot.endLabel}
              </button>
            ))}
          </div>
        </div>
      ))}
      {availability?.nextCursor && (
        <Button type="button" variant="outline" size="sm" onClick={() => onLoadMore(availability.nextCursor!)} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Weitere freie Termine
        </Button>
      )}
    </div>
  );
}
