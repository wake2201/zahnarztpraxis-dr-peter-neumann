import { CalendarDays, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentAvailabilityDayDto, AppointmentSlotDto } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

export interface AppointmentSlotSelection extends AppointmentSlotDto {
  date: string;
  dateLabel: string;
}

export function mergeAppointmentAvailabilityDays(
  current: AppointmentAvailabilityDayDto[],
  incoming: AppointmentAvailabilityDayDto[],
) {
  const merged = new Map<string, AppointmentAvailabilityDayDto>(
    current.map((day): [string, AppointmentAvailabilityDayDto] => [
      day.date,
      { ...day, slots: [...day.slots] },
    ]),
  );

  for (const day of incoming) {
    const existing = merged.get(day.date);
    if (!existing) {
      merged.set(day.date, { ...day, slots: [...day.slots] });
      continue;
    }

    const knownStarts = new Set(existing.slots.map((slot) => slot.startAt));
    existing.slots.push(...day.slots.filter((slot) => !knownStarts.has(slot.startAt)));
  }

  return Array.from(merged.values());
}

interface Props {
  days: AppointmentAvailabilityDayDto[];
  selectedStartAt: string | null;
  onSelect: (slot: AppointmentSlotSelection) => void;
  isLoading: boolean;
  error: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  inputName: string;
}

function toSelection(day: AppointmentAvailabilityDayDto, slot: AppointmentSlotDto): AppointmentSlotSelection {
  return { ...slot, date: day.date, dateLabel: day.dateLabel };
}

export function AppointmentSlotPicker({
  days,
  selectedStartAt,
  onSelect,
  isLoading,
  error,
  hasMore,
  isLoadingMore,
  onLoadMore,
  inputName,
}: Props) {
  const daysWithSlots = days.filter((day) => day.slots.length > 0);
  const firstDay = daysWithSlots[0];
  const firstSlot = firstDay?.slots[0];
  const firstSelection = firstDay && firstSlot ? toSelection(firstDay, firstSlot) : null;
  const remainingDays = firstSelection
    ? daysWithSlots
        .map((day) => ({
          ...day,
          slots: day.slots.filter((slot) => slot.startAt !== firstSelection.startAt),
        }))
        .filter((day) => day.slots.length > 0)
    : daysWithSlots;
  const hasSlots = Boolean(firstSelection || remainingDays.length > 0);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center" role="status">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-slate-600">Freie Termine werden geladen …</p>
      </div>
    );
  }

  return (
    <div aria-live="polite">
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!error && !hasSlots && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="mt-4 font-semibold text-slate-700">
            {hasMore ? "In diesem Zeitraum ist kein freier Online-Termin verfügbar." : "Aktuell ist kein freier Online-Termin verfügbar."}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {hasMore ? "Laden Sie weitere Zeiträume, um spätere Termine zu sehen." : "Bitte versuchen Sie es später erneut oder rufen Sie die Praxis an."}
          </p>
        </div>
      )}

      {hasSlots && (
        <fieldset>
          <legend className="sr-only">Freien Termin auswählen</legend>
          {firstSelection && (
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">Nächster freier Termin</p>
              <SlotOption
                inputName={inputName}
                selection={firstSelection}
                selected={selectedStartAt === firstSelection.startAt}
                prominent
                onSelect={onSelect}
              />
            </div>
          )}

          {remainingDays.length > 0 && (
            <div className={firstSelection ? "mt-8" : undefined}>
              <p className="mb-4 text-sm font-semibold text-slate-700">
                {firstSelection ? "Weitere freie Termine" : "Freie Termine"}
              </p>
              <div className="space-y-6">
                {remainingDays.map((day) => (
                  <div key={day.date}>
                    <h3 className="mb-3 text-base font-bold text-slate-800">{day.dateLabel}</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {day.slots.map((slot) => {
                        const selection = toSelection(day, slot);
                        return (
                          <SlotOption
                            key={slot.startAt}
                            inputName={inputName}
                            selection={selection}
                            selected={selectedStartAt === slot.startAt}
                            onSelect={onSelect}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </fieldset>
      )}

      {hasMore && !error && (
        <Button
          type="button"
          variant="outline"
          className="mt-7 w-full sm:w-auto"
          onClick={onLoadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {isLoadingMore ? "Weitere Termine werden geladen …" : "Weitere Termine laden"}
        </Button>
      )}
    </div>
  );
}

function SlotOption({
  inputName,
  selection,
  selected,
  prominent = false,
  onSelect,
}: {
  inputName: string;
  selection: AppointmentSlotSelection;
  selected: boolean;
  prominent?: boolean;
  onSelect: (slot: AppointmentSlotSelection) => void;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-12 cursor-pointer items-center rounded-xl border bg-white px-4 py-3 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        selected ? "border-primary bg-primary-50 text-primary" : "border-slate-200 text-slate-700 hover:border-primary/40",
        prominent && "w-full justify-between border-2 p-5 text-left sm:max-w-xl",
      )}
    >
      <input
        type="radio"
        name={inputName}
        value={selection.startAt}
        checked={selected}
        onChange={() => onSelect(selection)}
        className="sr-only"
      />
      {prominent ? (
        <>
          <span>
            <span className="block text-base font-bold text-slate-800">{selection.dateLabel}</span>
            <span className="mt-1 block text-sm text-slate-600">
              {selection.startLabel} – {selection.endLabel} Uhr
            </span>
          </span>
          <CalendarDays className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        </>
      ) : (
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {selection.startLabel} Uhr
        </span>
      )}
    </label>
  );
}
