"use client";

import { useMemo, useRef, useState } from "react";
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
  Settings2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
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
import { AdminAvailabilityPicker } from "./admin-availability-picker";
import { AppointmentSettings } from "./appointment-settings";
import { NewAppointmentDialog } from "./new-appointment-dialog";

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
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const newAppointmentTriggerRef = useRef<HTMLButtonElement>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [pendingOperation, setPendingOperation] = useState("");
  const [operationError, setOperationError] = useState("");
  const [operationSuccess, setOperationSuccess] = useState("");
  const [confirmingAction, setConfirmingAction] = useState<AdminAppointmentMutationAction | null>(null);
  const confirmingRevisionRef = useRef<number | null>(null);
  const [quickConfirmation, setQuickConfirmation] = useState<{
    appointmentId: string;
    action: Extract<AdminAppointmentMutationAction, "CONFIRM" | "REJECT">;
    expectedRevision: number;
  } | null>(null);
  const [isChangingWeek, setIsChangingWeek] = useState(false);

  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);
  const [rescheduleExpectedRevision, setRescheduleExpectedRevision] = useState<number | null>(null);
  const [rescheduleAvailability, setRescheduleAvailability] = useState<AppointmentAvailabilityDto | null>(null);
  const [rescheduleAvailabilityError, setRescheduleAvailabilityError] = useState("");
  const [rescheduleStartAt, setRescheduleStartAt] = useState("");
  const [isLoadingRescheduleAvailability, setIsLoadingRescheduleAvailability] = useState(false);
  const rescheduleRequestIdRef = useRef(0);
  const rescheduleHeadingRef = useRef<HTMLHeadingElement>(null);
  const rescheduleTriggerRef = useRef<HTMLButtonElement | null>(null);

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

  function closeNewAppointment() {
    setShowNewAppointment(false);
    window.requestAnimationFrame(() => newAppointmentTriggerRef.current?.focus());
  }

  function closeSettings() {
    setShowSettings(false);
    window.requestAnimationFrame(() => settingsTriggerRef.current?.focus());
  }

  async function handleAppointmentCreated(status: AppointmentStatusValue) {
    setOperationError("");
    setOperationSuccess(
      status === "PENDING"
        ? "Der Termin wurde eingetragen und wartet auf Bestätigung."
        : "Termin wurde erfolgreich eingetragen.",
    );
    closeNewAppointment();
    try {
      await onReloadDashboard({ weekStart: dashboard.weekStart });
    } catch {
      setOperationError("Der Termin wurde gespeichert, die Übersicht konnte aber nicht aktualisiert werden.");
    }
  }

  async function handleAppointmentMutation(
    appointment: AdminAppointmentDto,
    action: AdminAppointmentMutationAction,
    expectedRevision = appointment.revision,
  ) {
    setPendingOperation(`${appointment.id}:${action}`);
    setOperationError("");
    setOperationSuccess("");
    try {
      const result = await mutateAdminAppointment({
        appointmentId: appointment.id,
        expectedRevision,
        action,
      });
      if (!result.success) {
        setOperationError(result.error);
        setConfirmingAction(null);
        confirmingRevisionRef.current = null;
        setQuickConfirmation(null);
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
      confirmingRevisionRef.current = null;
      setQuickConfirmation(null);
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

  function startQuickConfirmation(
    appointment: AdminAppointmentDto,
    action: Extract<AdminAppointmentMutationAction, "CONFIRM" | "REJECT">,
  ) {
    setQuickConfirmation({
      appointmentId: appointment.id,
      action,
      expectedRevision: appointment.revision,
    });
    setConfirmingAction(null);
    confirmingRevisionRef.current = null;
    setOperationError("");
    setOperationSuccess("");
  }

  function startDetailConfirmation(
    appointment: AdminAppointmentDto,
    action: AdminAppointmentMutationAction,
  ) {
    confirmingRevisionRef.current = appointment.revision;
    setConfirmingAction(action);
    setOperationError("");
    setOperationSuccess("");
  }

  function clearDetailConfirmation() {
    setConfirmingAction(null);
    confirmingRevisionRef.current = null;
  }

  function executeDetailConfirmation(
    appointment: AdminAppointmentDto,
    action: AdminAppointmentMutationAction,
  ) {
    const expectedRevision = confirmingRevisionRef.current;
    if (expectedRevision === null) {
      clearDetailConfirmation();
      setOperationError("Der Termin hat sich geändert. Bitte prüfen Sie ihn erneut.");
      return;
    }

    void handleAppointmentMutation(appointment, action, expectedRevision);
  }

  async function loadRescheduleAvailability(
    appointment: AdminAppointmentDto,
    cursor?: string,
    trigger?: HTMLButtonElement,
  ) {
    const requestId = ++rescheduleRequestIdRef.current;
    if (trigger) {
      rescheduleTriggerRef.current = trigger;
    }
    setRescheduleTargetId(appointment.id);
    setIsLoadingRescheduleAvailability(true);
    setRescheduleAvailabilityError("");
    if (!cursor) {
      if (appointment.id !== rescheduleTargetId) {
        setRescheduleExpectedRevision(appointment.revision);
      }
      setRescheduleStartAt("");
      setRescheduleAvailability(null);
      window.requestAnimationFrame(() => rescheduleHeadingRef.current?.focus());
    }

    try {
      const result = await getAdminAppointmentAvailability({
        appointmentTypeId: appointment.appointmentTypeId,
        appointmentId: appointment.id,
        ...(cursor ? { cursor } : {}),
      });
      if (requestId !== rescheduleRequestIdRef.current) {
        return;
      }
      if (!result.success) {
        setRescheduleAvailabilityError(result.error);
        return;
      }

      setRescheduleAvailability((current) => mergeAvailability(current, result.data, Boolean(cursor)));
    } catch {
      if (requestId === rescheduleRequestIdRef.current) {
        setRescheduleAvailabilityError("Freie Ersatztermine konnten nicht geladen werden.");
      }
    } finally {
      if (requestId === rescheduleRequestIdRef.current) {
        setIsLoadingRescheduleAvailability(false);
      }
    }
  }

  function closeReschedule() {
    rescheduleRequestIdRef.current += 1;
    setRescheduleTargetId(null);
    setRescheduleExpectedRevision(null);
    setRescheduleAvailability(null);
    setRescheduleAvailabilityError("");
    setRescheduleStartAt("");
    setIsLoadingRescheduleAvailability(false);
    window.requestAnimationFrame(() => rescheduleTriggerRef.current?.focus());
  }

  async function handleReschedule() {
    if (!rescheduleTarget || !rescheduleStartAt || rescheduleExpectedRevision === null) {
      setRescheduleAvailabilityError("Bitte wählen Sie eine neue Zeit.");
      return;
    }

    setPendingOperation(`${rescheduleTarget.id}:RESCHEDULE`);
    setOperationError("");
    setOperationSuccess("");
    try {
      const result = await rescheduleAdminAppointment({
        appointmentId: rescheduleTarget.id,
        expectedRevision: rescheduleExpectedRevision,
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
      closeReschedule();
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

  if (showSettings && isAdmin) {
    return (
      <AppointmentSettings
        configuration={configuration}
        loadError={configurationError}
        onReload={onReloadConfiguration}
        onClose={closeSettings}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Terminverwaltung</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">Termine</h1>
          <p className="mt-2 text-sm text-slate-500">Termine ansehen, Anfragen bearbeiten oder einen neuen Termin eintragen.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            ref={newAppointmentTriggerRef}
            type="button"
            onClick={() => {
              setOperationError("");
              setOperationSuccess("");
              setShowNewAppointment(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Neuer Termin
          </Button>
          {isAdmin && (
            <Button ref={settingsTriggerRef} type="button" variant="outline" onClick={() => setShowSettings(true)}>
              <Settings2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Einstellungen
            </Button>
          )}
        </div>
      </div>

      <NewAppointmentDialog
        open={showNewAppointment}
        appointmentTypes={dashboard.manualAppointmentTypes}
        onClose={closeNewAppointment}
        onCreated={handleAppointmentCreated}
      />

      {(dashboardError || operationError || operationSuccess) && (
        <div aria-live="polite" className="space-y-2">
          {dashboardError && <p className="p-3 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">{dashboardError}</p>}
          {operationError && <p className="p-3 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">{operationError}</p>}
          {operationSuccess && <p className="p-3 text-sm text-green-700 border border-green-200 rounded-xl bg-green-50">{operationSuccess}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Terminansicht">
        <ViewButton active={view === "today"} onClick={() => setView("today")}>Heute</ViewButton>
        <ViewButton active={view === "week"} onClick={() => setView("week")}>Woche</ViewButton>
        <ViewButton active={view === "pending"} onClick={() => setView("pending")}>
          Offene Anfragen ({dashboard.pendingCount})
        </ViewButton>
      </div>

      {dashboard.pendingCount > 0 && view !== "pending" && (
        <button
          type="button"
          onClick={() => setView("pending")}
          className="flex w-full flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-3 font-semibold text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            {dashboard.pendingCount === 1
              ? "1 Terminanfrage wartet auf Bestätigung"
              : `${dashboard.pendingCount} Terminanfragen warten auf Bestätigung`}
          </span>
          <span className="text-sm font-semibold text-amber-800">Jetzt ansehen</span>
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <AppointmentStat label="Heute" value={dashboard.todayCount} icon={<CalendarDays className="w-5 h-5 text-primary" />} />
        <AppointmentStat label="Diese Woche" value={dashboard.weekCount} icon={<Clock3 className="w-5 h-5 text-blue-600" />} />
        <AppointmentStat label="Offene Terminanfragen" value={dashboard.pendingCount} icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} testId="appointment-pending-count" />
      </div>

      <section className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-card">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-slate-100 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {view === "today" ? "Heutige Termine" : view === "pending" ? "Offene Terminanfragen" : "Wochenübersicht"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {view === "pending"
                ? "Anfragen bestätigen, verschieben oder ablehnen."
                : view === "today"
                  ? "Alle Termine des heutigen Tages."
                  : `${dashboard.weekStart} bis ${dashboard.weekEnd} · chronologisch`}
            </p>
          </div>
          {view === "week" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" aria-label="Vorherige Woche" onClick={() => reloadWeek(shiftLocalDate(dashboard.weekStart, -7))} disabled={isChangingWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => reloadWeek(dashboard.todayLocalDate)} disabled={isChangingWeek}>Aktuelle Woche</Button>
              <Button variant="outline" size="sm" aria-label="Nächste Woche" onClick={() => reloadWeek(shiftLocalDate(dashboard.weekStart, 7))} disabled={isChangingWeek}>
                {isChangingWeek ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>

        {visibleAppointments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Für diese Ansicht liegen keine Termine vor.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100" data-testid="appointment-list">
            {visibleAppointments.map((appointment) => {
              const pendingConfirmation = quickConfirmation?.appointmentId === appointment.id
                ? quickConfirmation
                : null;

              return (
                <article key={appointment.id}>
                  <button
                    type="button"
                    aria-label={`Details zu ${appointment.firstName} ${appointment.lastName} öffnen`}
                    onClick={() => {
                      setSelectedAppointmentId(appointment.id);
                      setConfirmingAction(null);
                      confirmingRevisionRef.current = null;
                      setQuickConfirmation(null);
                      setOperationError("");
                    }}
                    className="w-full px-4 py-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                          {appointment.startLabel}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{appointment.firstName} {appointment.lastName}</p>
                          <p className="text-sm text-slate-500">{appointment.dateLabel} · {appointment.typeName}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{appointment.source === "ONLINE" ? "Online" : "Praxis"}</span>
                        <span className={`rounded px-2 py-1 text-xs font-medium ${statusClass(appointment.status)}`}>{STATUS_LABELS[appointment.status]}</span>
                      </div>
                    </div>
                  </button>

                  {view === "pending" && appointment.status === "PENDING" && (
                    <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <Button size="sm" onClick={() => startQuickConfirmation(appointment, "CONFIRM")} disabled={Boolean(pendingOperation)}>
                          <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          Bestätigen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(event) => loadRescheduleAvailability(appointment, undefined, event.currentTarget)}
                          disabled={Boolean(pendingOperation) || isLoadingRescheduleAvailability}
                        >
                          Andere Zeit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => startQuickConfirmation(appointment, "REJECT")} disabled={Boolean(pendingOperation)}>
                          Ablehnen
                        </Button>
                      </div>

                      {pendingConfirmation && (
                        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-amber-900">
                            {pendingConfirmation.action === "CONFIRM"
                              ? "Diese Terminanfrage jetzt verbindlich bestätigen?"
                              : "Diese Anfrage ablehnen und die reservierte Zeit freigeben?"}
                          </p>
                          <div className="flex flex-col gap-2 min-[420px]:flex-row">
                            <Button
                              size="sm"
                              variant={pendingConfirmation.action === "CONFIRM" ? "default" : "destructive"}
                              onClick={() => handleAppointmentMutation(
                                appointment,
                                pendingConfirmation.action,
                                pendingConfirmation.expectedRevision,
                              )}
                              disabled={Boolean(pendingOperation)}
                            >
                              {pendingOperation === `${appointment.id}:${pendingConfirmation.action}` && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                              {pendingConfirmation.action === "CONFIRM" ? "Jetzt bestätigen" : "Jetzt ablehnen"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setQuickConfirmation(null)} disabled={Boolean(pendingOperation)}>
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
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
            <Detail label="Quelle" value={selectedAppointment.source === "ONLINE" ? "Online-Buchung" : "Durch die Praxis eingetragen"} />
          </div>
          {selectedAppointment.details && (
            <div className="p-4 mt-5 rounded-xl bg-slate-50">
              <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">Angaben des Patienten</p>
              <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{selectedAppointment.details}</p>
            </div>
          )}

          {(selectedAppointment.status === "CONFIRMED" || (selectedAppointment.status === "PENDING" && view !== "pending")) && (
            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedAppointment.status === "PENDING" && (
                  <>
                    <Button size="sm" onClick={() => startDetailConfirmation(selectedAppointment, "CONFIRM")} disabled={Boolean(pendingOperation)}><Check className="w-4 h-4 mr-1.5" />Bestätigen</Button>
                    <Button size="sm" variant="destructive" onClick={() => startDetailConfirmation(selectedAppointment, "REJECT")} disabled={Boolean(pendingOperation)}>Ablehnen</Button>
                  </>
                )}
                {selectedAppointment.status === "CONFIRMED" && (
                  <Button size="sm" variant="destructive" onClick={() => startDetailConfirmation(selectedAppointment, "CANCEL")} disabled={Boolean(pendingOperation)}>Stornieren</Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(event) => loadRescheduleAvailability(selectedAppointment, undefined, event.currentTarget)}
                  disabled={Boolean(pendingOperation) || isLoadingRescheduleAvailability}
                >
                  {selectedAppointment.status === "PENDING" ? "Andere Zeit" : "Verschieben"}
                </Button>
              </div>

              {confirmingAction && (
                <div className="flex flex-col gap-3 p-4 border rounded-xl border-amber-200 bg-amber-50 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-amber-800">
                    {confirmingAction === "CONFIRM" ? "Diesen Termin verbindlich bestätigen?" : confirmingAction === "REJECT" ? "Anfrage ablehnen und reservierte Zeit freigeben?" : "Termin stornieren und reservierte Zeit freigeben?"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={confirmingAction === "CONFIRM" ? "default" : "destructive"}
                      onClick={() => executeDetailConfirmation(selectedAppointment, confirmingAction)}
                      disabled={Boolean(pendingOperation)}
                    >
                      {pendingOperation && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Ausführen
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearDetailConfirmation} disabled={Boolean(pendingOperation)}>Abbrechen</Button>
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
              <h2 ref={rescheduleHeadingRef} tabIndex={-1} className="text-lg font-bold text-slate-800 outline-none">Termin verschieben</h2>
              <p className="mt-1 text-sm text-slate-500">Aktuell: {rescheduleTarget.dateLabel}, {rescheduleTarget.startLabel}–{rescheduleTarget.endLabel}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={closeReschedule}
              disabled={Boolean(pendingOperation)}
              aria-label="Verschieben schließen"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <AdminAvailabilityPicker
            availability={rescheduleAvailability}
            selectedStartAt={rescheduleStartAt}
            error={rescheduleAvailabilityError}
            loading={isLoadingRescheduleAvailability}
            onSelect={setRescheduleStartAt}
            onRetry={() => loadRescheduleAvailability(rescheduleTarget)}
            onLoadMore={(cursor) => loadRescheduleAvailability(rescheduleTarget, cursor)}
          />
          <div className="flex flex-col gap-2 mt-5 sm:flex-row">
            <Button onClick={handleReschedule} disabled={!rescheduleStartAt || Boolean(pendingOperation)}>
              {pendingOperation.endsWith(":RESCHEDULE") && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Neue Zeit bestätigen
            </Button>
            <Button variant="outline" onClick={closeReschedule} disabled={Boolean(pendingOperation)}>Abbrechen</Button>
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

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">{label}</p>
      <p className="flex items-center gap-1.5 mt-1 text-sm font-medium text-slate-800">{icon}{value}</p>
    </div>
  );
}
