"use client";

import { useState } from "react";
import { CalendarOff, ChevronDown, ChevronUp, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAvailabilityException, deleteAvailabilityException } from "@/lib/actions";
import type { AppointmentExceptionKindValue, AvailabilityExceptionDto } from "@/lib/appointments/types";
import type { RunSettingsMutation } from "../appointment-settings";

interface Props {
  exceptions: AvailabilityExceptionDto[];
  pendingOperation: string;
  runMutation: RunSettingsMutation;
}

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

function formatLocalDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

function exceptionDescription(exception: AvailabilityExceptionDto) {
  const wholeDay = exception.startMinute === 0 && exception.endMinute === 1440;
  if (exception.kind === "BLOCK") {
    return wholeDay
      ? "Ganzer Tag gesperrt"
      : `Gesperrt von ${minutesToTime(exception.startMinute)} bis ${minutesToTime(exception.endMinute)} Uhr`;
  }
  return wholeDay
    ? "Ganzer Tag zusätzlich online buchbar"
    : `Zusätzlich online buchbar von ${minutesToTime(exception.startMinute)} bis ${minutesToTime(exception.endMinute)} Uhr`;
}

export function BookingBlackouts({ exceptions, pendingOperation, runMutation }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localDate, setLocalDate] = useState("");
  const [kind, setKind] = useState<AppointmentExceptionKindValue>("BLOCK");
  const [wholeDay, setWholeDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [confirmingRemovalId, setConfirmingRemovalId] = useState<string | null>(null);

  function resetCreateForm() {
    setShowCreateForm(false);
    setShowAdvanced(false);
    setLocalDate("");
    setKind("BLOCK");
    setWholeDay(true);
    setStartTime("09:00");
    setEndTime("12:00");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await runMutation(
      "exception:create",
      () => createAvailabilityException({
        localDate,
        kind,
        startMinute: wholeDay ? 0 : timeToMinutes(startTime),
        endMinute: wholeDay ? 1440 : timeToMinutes(endTime),
      }),
      kind === "BLOCK" ? "Die Sperrzeit wurde eingetragen." : "Die zusätzliche Buchungszeit wurde eingetragen.",
      resetCreateForm,
    );
  }

  async function removeException(exception: AvailabilityExceptionDto) {
    await runMutation(
      `exception:remove:${exception.id}`,
      () => deleteAvailabilityException(exception.id),
      exception.kind === "BLOCK" ? "Die Sperrzeit wurde entfernt." : "Die zusätzliche Buchungszeit wurde entfernt.",
      () => setConfirmingRemovalId(null),
    );
  }

  const sortedExceptions = [...exceptions].sort(
    (left, right) => left.localDate.localeCompare(right.localDate) || left.startMinute - right.startMinute,
  );
  const blockActionLabel = wholeDay ? "Tag sperren" : "Zeit sperren";

  return (
    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-card sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Gesperrte und zusätzlich geöffnete Zeiten</h3>
          <p className="mt-1 text-sm text-slate-500">Sperrzeiten haben immer Vorrang vor normalen Buchungszeiten.</p>
        </div>
        {!showCreateForm && (
          <Button type="button" onClick={() => setShowCreateForm(true)} disabled={Boolean(pendingOperation)}>
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Tag sperren
          </Button>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="p-4 mt-6 border border-primary/30 rounded-2xl bg-blue-50/30 sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h4 className="font-bold text-slate-800">{kind === "BLOCK" ? blockActionLabel : "Zusätzliche Buchungszeit öffnen"}</h4>
              <p className="mt-1 text-sm text-slate-500">Wählen Sie ein Datum und bei Bedarf eine bestimmte Uhrzeit.</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={resetCreateForm} aria-label="Formular schließen">
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Datum
              <Input
                type="date"
                value={localDate}
                onChange={(event) => setLocalDate(event.target.value)}
                required
                className="mt-1.5 bg-white"
                autoFocus
              />
            </label>

            <fieldset className="p-4 border border-slate-200 rounded-xl bg-white">
              <legend className="px-1 text-sm font-semibold text-slate-700">Zeitraum</legend>
              <div className="space-y-3 mt-1.5">
                <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="exception-time-scope"
                    checked={wholeDay}
                    onChange={() => setWholeDay(true)}
                  />
                  Ganzer Tag
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="exception-time-scope"
                    checked={!wholeDay}
                    onChange={() => setWholeDay(false)}
                  />
                  Bestimmte Uhrzeit
                </label>
              </div>
            </fieldset>

            {!wholeDay && (
              <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Von
                  <Input
                    type="time"
                    step={900}
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    required
                    className="mt-1.5 bg-white"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Bis
                  <Input
                    type="time"
                    step={900}
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    required
                    className="mt-1.5 bg-white"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                if (showAdvanced && kind === "OPEN") {
                  setKind("BLOCK");
                }
                setShowAdvanced((current) => !current);
              }}
              aria-expanded={showAdvanced}
              className="px-0 text-slate-600 hover:bg-transparent hover:text-primary"
            >
              Weitere Optionen
              {showAdvanced
                ? <ChevronUp className="w-4 h-4 ml-2" aria-hidden="true" />
                : <ChevronDown className="w-4 h-4 ml-2" aria-hidden="true" />}
            </Button>

            {showAdvanced && (
              <fieldset className="p-4 mt-3 border border-slate-200 rounded-xl bg-white">
                <legend className="px-1 text-sm font-semibold text-slate-700">Art der Änderung</legend>
                <div className="grid gap-3 mt-2 sm:grid-cols-2">
                  <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="exception-kind"
                      checked={kind === "BLOCK"}
                      onChange={() => setKind("BLOCK")}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-semibold text-slate-800">Zeit sperren</span>
                      <span className="block mt-1 text-slate-500">In dieser Zeit können keine Termine gebucht werden.</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="exception-kind"
                      checked={kind === "OPEN"}
                      onChange={() => setKind("OPEN")}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-semibold text-slate-800">Zusätzliche Zeit öffnen</span>
                      <span className="block mt-1 text-slate-500">Ergänzt die normalen Buchungszeiten an diesem Tag.</span>
                    </span>
                  </label>
                </div>
              </fieldset>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-5 sm:flex-row">
            <Button type="submit" disabled={Boolean(pendingOperation)}>
              {pendingOperation === "exception:create" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <CalendarOff className="w-4 h-4 mr-2" aria-hidden="true" />
              )}
              {kind === "BLOCK" ? blockActionLabel : "Zusätzliche Zeit öffnen"}
            </Button>
            <Button type="button" variant="outline" onClick={resetCreateForm} disabled={Boolean(pendingOperation)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
        {sortedExceptions.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">Noch keine Urlaubstage oder Sperrzeiten eingetragen.</p>
        ) : (
          sortedExceptions.map((exception) => (
            <article
              key={exception.id}
              aria-label={`${formatLocalDate(exception.localDate)}: ${exceptionDescription(exception)}`}
              className="py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{formatLocalDate(exception.localDate)}</p>
                  <p className="mt-1 text-sm text-slate-500">{exceptionDescription(exception)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setConfirmingRemovalId(exception.id)}
                  disabled={Boolean(pendingOperation)}
                  aria-label={`Eintrag am ${formatLocalDate(exception.localDate)} entfernen`}
                  className="justify-start text-red-700 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Entfernen
                </Button>
              </div>

              {confirmingRemovalId === exception.id && (
                <div className="flex flex-col gap-3 p-4 mt-3 border border-slate-200 rounded-xl bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-700">Diesen Eintrag wirklich entfernen?</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="xs"
                      variant="destructive"
                      disabled={Boolean(pendingOperation)}
                      onClick={() => void removeException(exception)}
                      aria-label={`Eintrag am ${formatLocalDate(exception.localDate)} endgültig entfernen`}
                    >
                      {pendingOperation === `exception:remove:${exception.id}` && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      )}
                      Entfernen
                    </Button>
                    <Button type="button" size="xs" variant="outline" onClick={() => setConfirmingRemovalId(null)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
