"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarOff, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAppointmentType,
  createAvailabilityException,
  createWeeklyAvailability,
  deleteAvailabilityException,
  deleteWeeklyAvailability,
  updateAppointmentType,
  updateBookingSettings,
} from "@/lib/actions";
import type {
  AdminAppointmentTypeDto,
  AppointmentConfigurationDto,
  AppointmentConfirmationModeValue,
  AppointmentExceptionKindValue,
  AppointmentResult,
} from "@/lib/appointments/types";

interface Props {
  configuration: AppointmentConfigurationDto | null;
  loadError: string;
  onReload: () => Promise<void>;
}

const WEEKDAYS = [
  { value: 1, label: "Montag" },
  { value: 2, label: "Dienstag" },
  { value: 3, label: "Mittwoch" },
  { value: 4, label: "Donnerstag" },
  { value: 5, label: "Freitag" },
  { value: 6, label: "Samstag" },
  { value: 7, label: "Sonntag" },
];

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return Number.NaN;
  }
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  if (value === 1440) {
    return "24:00";
  }
  const hours = Math.floor(value / 60).toString().padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function AppointmentSettings({ configuration, loadError, onReload }: Props) {
  const mutationLock = useRef(false);
  const [pendingOperation, setPendingOperation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");

  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [typeDuration, setTypeDuration] = useState(30);
  const [typeActive, setTypeActive] = useState(true);
  const [typeOnlineBookable, setTypeOnlineBookable] = useState(true);
  const [typeConfirmationMode, setTypeConfirmationMode] = useState<AppointmentConfirmationModeValue>("AUTO");

  const [weekday, setWeekday] = useState(1);
  const [weeklyStart, setWeeklyStart] = useState("09:00");
  const [weeklyEnd, setWeeklyEnd] = useState("12:00");

  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionKind, setExceptionKind] = useState<AppointmentExceptionKindValue>("BLOCK");
  const [exceptionWholeDay, setExceptionWholeDay] = useState(true);
  const [exceptionStart, setExceptionStart] = useState("09:00");
  const [exceptionEnd, setExceptionEnd] = useState("12:00");

  const [minimumNoticeMinutes, setMinimumNoticeMinutes] = useState(240);
  const [bookingHorizonDays, setBookingHorizonDays] = useState(60);

  useEffect(() => {
    if (!configuration) {
      return;
    }
    setMinimumNoticeMinutes(configuration.settings.minimumNoticeMinutes);
    setBookingHorizonDays(configuration.settings.bookingHorizonDays);
  }, [configuration]);

  async function runMutation<T>(
    operation: string,
    mutation: () => Promise<AppointmentResult<T>>,
    successMessage: string,
    afterSuccess?: () => void,
  ) {
    if (mutationLock.current) {
      return false;
    }

    mutationLock.current = true;
    setPendingOperation(operation);
    setError("");
    setSuccess("");
    try {
      const result = await mutation();
      if (!result.success) {
        setError(result.error);
        return false;
      }

      afterSuccess?.();
      setSuccess(successMessage);
      try {
        await onReload();
      } catch {
        setError("Die Änderung wurde gespeichert, die Anzeige konnte aber nicht aktualisiert werden.");
      }
      return true;
    } catch {
      setError("Die Konfiguration konnte nicht gespeichert werden.");
      return false;
    } finally {
      mutationLock.current = false;
      setPendingOperation("");
    }
  }

  function resetTypeForm() {
    setEditingTypeId(null);
    setTypeName("");
    setTypeDescription("");
    setTypeDuration(30);
    setTypeActive(true);
    setTypeOnlineBookable(true);
    setTypeConfirmationMode("AUTO");
  }

  function editType(appointmentType: AdminAppointmentTypeDto) {
    setEditingTypeId(appointmentType.id);
    setTypeName(appointmentType.name);
    setTypeDescription(appointmentType.description ?? "");
    setTypeDuration(appointmentType.durationMinutes);
    setTypeActive(appointmentType.active);
    setTypeOnlineBookable(appointmentType.onlineBookable);
    setTypeConfirmationMode(appointmentType.confirmationMode);
    setError("");
  }

  async function handleTypeSubmit(event: React.FormEvent) {
    event.preventDefault();
    const input = {
      name: typeName,
      ...(typeDescription.trim() ? { description: typeDescription } : {}),
      durationMinutes: typeDuration,
      active: typeActive,
      onlineBookable: typeOnlineBookable,
      confirmationMode: typeConfirmationMode,
    };

    if (editingTypeId) {
      await runMutation(
        `type:${editingTypeId}`,
        () => updateAppointmentType({ id: editingTypeId, ...input }),
        "Die Terminart wurde aktualisiert.",
        resetTypeForm,
      );
      return;
    }

    await runMutation("type:create", () => createAppointmentType(input), "Die Terminart wurde erstellt.", resetTypeForm);
  }

  async function handleWeeklySubmit(event: React.FormEvent) {
    event.preventDefault();
    await runMutation(
      "weekly:create",
      () => createWeeklyAvailability({
        weekday,
        startMinute: timeToMinutes(weeklyStart),
        endMinute: timeToMinutes(weeklyEnd),
      }),
      "Die online buchbare Zeit wurde hinzugefügt.",
    );
  }

  async function handleExceptionSubmit(event: React.FormEvent) {
    event.preventDefault();
    await runMutation(
      "exception:create",
      () => createAvailabilityException({
        localDate: exceptionDate,
        kind: exceptionKind,
        startMinute: exceptionWholeDay ? 0 : timeToMinutes(exceptionStart),
        endMinute: exceptionWholeDay ? 1440 : timeToMinutes(exceptionEnd),
      }),
      "Die Ausnahme wurde gespeichert.",
      () => setExceptionDate(""),
    );
  }

  if (!configuration) {
    return (
      <section className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
        <h2 className="text-lg font-bold text-slate-800">Buchung konfigurieren</h2>
        <p className={`mt-3 text-sm ${loadError ? "text-red-600" : "text-slate-500"}`}>
          {loadError || "Die Konfiguration wird geladen."}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8" aria-label="Terminkonfiguration">
      <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
        <h2 className="text-xl font-bold text-slate-800">Buchung konfigurieren</h2>
        <p className="mt-1 text-sm text-slate-500">Nur Administratoren können diese Regeln ändern.</p>
        <div aria-live="polite" className="mt-4 space-y-2">
          {loadError && <p className="text-sm text-red-600">{loadError}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Terminarten</h3>
          <p className="mt-1 text-sm text-slate-500">Bestehende Terminarten werden deaktiviert statt gelöscht.</p>
        </div>
        <form onSubmit={handleTypeSubmit} className="grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Name
            <Input value={typeName} onChange={(event) => setTypeName(event.target.value)} required maxLength={100} className="mt-1.5" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Dauer in Minuten
            <Input type="number" min={15} step={15} value={typeDuration} onChange={(event) => setTypeDuration(Number(event.target.value))} required className="mt-1.5" />
          </label>
          <label className="text-sm font-medium text-slate-700 lg:col-span-2">
            Kurzbeschreibung (optional)
            <Textarea value={typeDescription} onChange={(event) => setTypeDescription(event.target.value)} maxLength={500} className="mt-1.5" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Bestätigung
            <select value={typeConfirmationMode} onChange={(event) => setTypeConfirmationMode(event.target.value as AppointmentConfirmationModeValue)} className="w-full h-10 px-3 mt-1.5 bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="AUTO">Automatisch bestätigen</option>
              <option value="MANUAL">Manuell prüfen</option>
            </select>
          </label>
          <div className="flex flex-col justify-end gap-3 text-sm text-slate-700 sm:flex-row sm:items-center lg:justify-start">
            <label className="flex items-center gap-2"><input type="checkbox" checked={typeActive} onChange={(event) => setTypeActive(event.target.checked)} /> Aktiv</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={typeOnlineBookable} onChange={(event) => setTypeOnlineBookable(event.target.checked)} /> Online buchbar</label>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2 sm:flex-row">
            <Button type="submit" disabled={Boolean(pendingOperation)}>
              {pendingOperation.startsWith("type:") ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : editingTypeId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingTypeId ? "Änderungen speichern" : "Terminart erstellen"}
            </Button>
            {editingTypeId && <Button type="button" variant="outline" onClick={resetTypeForm}><X className="w-4 h-4 mr-2" />Bearbeitung abbrechen</Button>}
          </div>
        </form>

        <div className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
          {configuration.appointmentTypes.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">Noch keine Terminarten vorhanden.</p>
          ) : configuration.appointmentTypes.map((appointmentType) => (
            <div key={appointmentType.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-800">{appointmentType.name} · {appointmentType.durationMinutes} Min.</p>
                <p className="mt-1 text-sm text-slate-500">{appointmentType.confirmationMode === "AUTO" ? "Automatische Bestätigung" : "Manuelle Prüfung"}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-0.5 text-xs rounded ${appointmentType.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{appointmentType.active ? "Aktiv" : "Inaktiv"}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${appointmentType.onlineBookable ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{appointmentType.onlineBookable ? "Online buchbar" : "Nur intern"}</span>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => editType(appointmentType)} disabled={Boolean(pendingOperation)}><Pencil className="w-4 h-4 mr-1.5" />Bearbeiten</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">Online buchbare Zeiten</h3>
            <p className="mt-1 text-sm text-slate-500">Wiederkehrende Zeitfenster, getrennt von den allgemeinen Öffnungszeiten.</p>
          </div>
          <form onSubmit={handleWeeklySubmit} className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Wochentag
              <select value={weekday} onChange={(event) => setWeekday(Number(event.target.value))} className="w-full h-10 px-3 mt-1.5 bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary">
                {WEEKDAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Von<Input type="time" step={900} value={weeklyStart} onChange={(event) => setWeeklyStart(event.target.value)} required className="mt-1.5" /></label>
            <label className="text-sm font-medium text-slate-700">Bis<Input type="time" step={900} value={weeklyEnd} onChange={(event) => setWeeklyEnd(event.target.value)} required className="mt-1.5" /></label>
            <Button type="submit" className="sm:col-span-3" disabled={Boolean(pendingOperation)}>{pendingOperation === "weekly:create" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Zeitfenster hinzufügen</Button>
          </form>
          <div className="mt-6 divide-y divide-slate-100">
            {[...configuration.weeklyAvailability].sort((left, right) => left.weekday - right.weekday || left.startMinute - right.startMinute).map((window) => (
              <div key={window.id} className="flex items-center justify-between gap-3 py-3">
                <p className="text-sm text-slate-700"><strong>{WEEKDAYS.find((day) => day.value === window.weekday)?.label ?? `Tag ${window.weekday}`}</strong> · {minutesToTime(window.startMinute)}–{minutesToTime(window.endMinute)}</p>
                {confirmDelete === `weekly:${window.id}` ? (
                  <div className="flex gap-2"><Button size="sm" variant="destructive" disabled={Boolean(pendingOperation)} onClick={() => runMutation(`weekly:delete:${window.id}`, () => deleteWeeklyAvailability(window.id), "Das Zeitfenster wurde entfernt.", () => setConfirmDelete(""))}>Entfernen</Button><Button size="sm" variant="outline" onClick={() => setConfirmDelete("")}>Abbrechen</Button></div>
                ) : (
                  <Button type="button" variant="outline" size="sm" aria-label="Zeitfenster entfernen" onClick={() => setConfirmDelete(`weekly:${window.id}`)}><Trash2 className="w-4 h-4" /></Button>
                )}
              </div>
            ))}
            {configuration.weeklyAvailability.length === 0 && <p className="py-5 text-sm text-slate-500">Noch keine wiederkehrenden Zeiten eingerichtet.</p>}
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">Ausnahmen</h3>
            <p className="mt-1 text-sm text-slate-500">Einzelne Tage sperren oder zusätzliche Zeiten öffnen. Sperren haben Vorrang.</p>
          </div>
          <form onSubmit={handleExceptionSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Datum<Input type="date" value={exceptionDate} onChange={(event) => setExceptionDate(event.target.value)} required className="mt-1.5" /></label>
              <label className="text-sm font-medium text-slate-700">
                Art
                <select value={exceptionKind} onChange={(event) => setExceptionKind(event.target.value as AppointmentExceptionKindValue)} className="w-full h-10 px-3 mt-1.5 bg-white border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="BLOCK">Zeit sperren</option>
                  <option value="OPEN">Zusätzlich öffnen</option>
                </select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={exceptionWholeDay} onChange={(event) => setExceptionWholeDay(event.target.checked)} /> Ganzer Tag</label>
            {!exceptionWholeDay && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">Von<Input type="time" step={900} value={exceptionStart} onChange={(event) => setExceptionStart(event.target.value)} required className="mt-1.5" /></label>
                <label className="text-sm font-medium text-slate-700">Bis<Input type="time" step={900} value={exceptionEnd} onChange={(event) => setExceptionEnd(event.target.value)} required className="mt-1.5" /></label>
              </div>
            )}
            <Button type="submit" disabled={Boolean(pendingOperation)}>{pendingOperation === "exception:create" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarOff className="w-4 h-4 mr-2" />}Ausnahme speichern</Button>
          </form>
          <div className="mt-6 divide-y divide-slate-100">
            {[...configuration.exceptions].sort((left, right) => left.localDate.localeCompare(right.localDate) || left.startMinute - right.startMinute).map((exception) => (
              <div key={exception.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-700"><strong>{exception.localDate}</strong> · {exception.kind === "BLOCK" ? "Gesperrt" : "Zusätzlich offen"} · {minutesToTime(exception.startMinute)}–{minutesToTime(exception.endMinute)}</p>
                {confirmDelete === `exception:${exception.id}` ? (
                  <div className="flex gap-2"><Button size="sm" variant="destructive" disabled={Boolean(pendingOperation)} onClick={() => runMutation(`exception:delete:${exception.id}`, () => deleteAvailabilityException(exception.id), "Die Ausnahme wurde entfernt.", () => setConfirmDelete(""))}>Entfernen</Button><Button size="sm" variant="outline" onClick={() => setConfirmDelete("")}>Abbrechen</Button></div>
                ) : (
                  <Button type="button" variant="outline" size="sm" aria-label="Ausnahme entfernen" onClick={() => setConfirmDelete(`exception:${exception.id}`)}><Trash2 className="w-4 h-4" /></Button>
                )}
              </div>
            ))}
            {configuration.exceptions.length === 0 && <p className="py-5 text-sm text-slate-500">Keine datumsbezogenen Ausnahmen eingerichtet.</p>}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-800">Buchungsregeln</h3>
          <p className="mt-1 text-sm text-slate-500">Zeitzone und Basiseinheit sind für V1 fest vorgegeben.</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runMutation(
              "settings:update",
              () => updateBookingSettings({ minimumNoticeMinutes, bookingHorizonDays }),
              "Die Buchungsregeln wurden aktualisiert.",
            );
          }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="text-sm font-medium text-slate-700">Mindestvorlauf (Minuten)<Input type="number" min={0} step={15} value={minimumNoticeMinutes} onChange={(event) => setMinimumNoticeMinutes(Number(event.target.value))} required className="mt-1.5" /></label>
          <label className="text-sm font-medium text-slate-700">Buchungshorizont (Tage)<Input type="number" min={1} max={365} value={bookingHorizonDays} onChange={(event) => setBookingHorizonDays(Number(event.target.value))} required className="mt-1.5" /></label>
          <label className="text-sm font-medium text-slate-700">Basiseinheit<Input value={`${configuration.settings.slotMinutes} Minuten`} readOnly className="mt-1.5 bg-slate-50" /></label>
          <label className="text-sm font-medium text-slate-700">Praxis-Zeitzone<Input value={configuration.settings.timeZone} readOnly className="mt-1.5 bg-slate-50" /></label>
          <Button type="submit" className="sm:col-span-2 lg:col-span-4 lg:w-fit" disabled={Boolean(pendingOperation)}>{pendingOperation === "settings:update" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Regeln speichern</Button>
        </form>
      </div>
    </section>
  );
}
