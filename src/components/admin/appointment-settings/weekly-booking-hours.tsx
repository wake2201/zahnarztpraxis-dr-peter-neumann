"use client";

import { useState } from "react";
import { Clock3, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWeeklyAvailability, deleteWeeklyAvailability } from "@/lib/actions";
import type { WeeklyAvailabilityDto } from "@/lib/appointments/types";
import type { RunSettingsMutation } from "../appointment-settings";

interface Props {
  weeklyAvailability: WeeklyAvailabilityDto[];
  pendingOperation: string;
  runMutation: RunSettingsMutation;
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

export function WeeklyBookingHours({ weeklyAvailability, pendingOperation, runMutation }: Props) {
  const [addingWeekday, setAddingWeekday] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [confirmingRemovalId, setConfirmingRemovalId] = useState<string | null>(null);

  function openAddForm(weekday: number) {
    setAddingWeekday(weekday);
    setStartTime("09:00");
    setEndTime("12:00");
    setConfirmingRemovalId(null);
  }

  function closeAddForm() {
    setAddingWeekday(null);
    setStartTime("09:00");
    setEndTime("12:00");
  }

  async function addWindow(event: React.FormEvent, weekday: number) {
    event.preventDefault();
    await runMutation(
      `weekly:create:${weekday}`,
      () => createWeeklyAvailability({
        weekday,
        startMinute: timeToMinutes(startTime),
        endMinute: timeToMinutes(endTime),
      }),
      "Das Zeitfenster wurde hinzugefügt.",
      closeAddForm,
    );
  }

  async function removeWindow(window: WeeklyAvailabilityDto) {
    await runMutation(
      `weekly:remove:${window.id}`,
      () => deleteWeeklyAvailability(window.id),
      "Das Zeitfenster wurde entfernt.",
      () => setConfirmingRemovalId(null),
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-card">
      <div className="p-5 border-b border-slate-100 sm:p-6">
        <h3 className="text-lg font-bold text-slate-800">Online buchbare Zeiten</h3>
        <p className="mt-1 text-sm text-slate-500">
          Pro Tag können ein oder mehrere Zeitfenster eingerichtet werden, zum Beispiel vormittags und nachmittags.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {WEEKDAYS.map((day) => {
          const windows = weeklyAvailability
            .filter((window) => window.weekday === day.value)
            .sort((left, right) => left.startMinute - right.startMinute);
          const addLabel = windows.length === 0
            ? "Zeitfenster hinzufügen"
            : windows.length === 1
              ? "Zweites Zeitfenster"
              : "Weiteres Zeitfenster";

          return (
            <section
              key={day.value}
              aria-labelledby={`booking-hours-day-${day.value}`}
              className="p-5 sm:p-6"
            >
              <div className="grid gap-4 md:grid-cols-[8rem_minmax(0,1fr)]">
                <div>
                  <h4 id={`booking-hours-day-${day.value}`} className="font-bold text-slate-800">{day.label}</h4>
                  {windows.length === 0 && <p className="mt-1 text-sm text-slate-500">Nicht buchbar</p>}
                </div>

                <div className="space-y-3">
                  {windows.map((window) => (
                    <div key={window.id} className="p-3 border border-slate-200 rounded-xl">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center text-sm font-semibold text-slate-700">
                          <Clock3 className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                          {minutesToTime(window.startMinute)} bis {minutesToTime(window.endMinute)} Uhr
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setConfirmingRemovalId(window.id)}
                          disabled={Boolean(pendingOperation)}
                          aria-label={`Zeitfenster ${minutesToTime(window.startMinute)} bis ${minutesToTime(window.endMinute)} Uhr am ${day.label} entfernen`}
                          className="justify-start text-red-700 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                          Entfernen
                        </Button>
                      </div>

                      {confirmingRemovalId === window.id && (
                        <div className="flex flex-col gap-3 pt-3 mt-3 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-slate-600">Dieses Zeitfenster wirklich entfernen?</p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="xs"
                              variant="destructive"
                              disabled={Boolean(pendingOperation)}
                              onClick={() => void removeWindow(window)}
                              aria-label={`Zeitfenster ${minutesToTime(window.startMinute)} bis ${minutesToTime(window.endMinute)} Uhr am ${day.label} endgültig entfernen`}
                            >
                              {pendingOperation === `weekly:remove:${window.id}` && (
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
                    </div>
                  ))}

                  {addingWeekday === day.value ? (
                    <form
                      onSubmit={(event) => void addWindow(event, day.value)}
                      className="p-4 border border-primary/30 rounded-xl bg-blue-50/30"
                      aria-label={`Zeitfenster für ${day.label} hinzufügen`}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700">
                          Von
                          <Input
                            type="time"
                            step={900}
                            value={startTime}
                            onChange={(event) => setStartTime(event.target.value)}
                            required
                            className="mt-1.5 bg-white"
                            autoFocus
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
                      <div className="flex flex-col gap-2 mt-4 sm:flex-row">
                        <Button type="submit" size="sm" disabled={Boolean(pendingOperation)}>
                          {pendingOperation === `weekly:create:${day.value}` ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                          )}
                          Zeitfenster speichern
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={closeAddForm} disabled={Boolean(pendingOperation)}>
                          <X className="w-4 h-4 mr-2" aria-hidden="true" />
                          Abbrechen
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => openAddForm(day.value)}
                      disabled={Boolean(pendingOperation) || addingWeekday !== null}
                      className="justify-start text-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                      {addLabel}
                    </Button>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
