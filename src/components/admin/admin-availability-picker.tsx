"use client";

import { useId } from "react";
import { CalendarDays, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentAvailabilityDto } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

export interface AdminAvailabilityPickerProps {
  availability: AppointmentAvailabilityDto | null;
  selectedStartAt: string;
  error: string;
  loading: boolean;
  loadingMore?: boolean;
  onSelect: (startAt: string) => void;
  onRetry: () => void;
  onLoadMore: (cursor: string) => void;
}

export function AdminAvailabilityPicker({
  availability,
  selectedStartAt,
  error,
  loading,
  loadingMore = false,
  onSelect,
  onRetry,
  onLoadMore,
}: AdminAvailabilityPickerProps) {
  const headingPrefix = useId();
  const days = availability?.days.filter((day) => day.slots.length > 0) ?? [];
  const hasSlots = days.length > 0;

  if (loading && !availability) {
    return (
      <div
        className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-slate-600">
          Freie Termine werden geladen …
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5" aria-busy={loading || loadingMore}>
      {loading && availability && (
        <p className="flex items-center gap-2 text-sm text-slate-600" role="status">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          Freie Termine werden aktualisiert …
        </p>
      )}

      {error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="mt-3 bg-white"
            onClick={onRetry}
            disabled={loading || loadingMore}
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Erneut versuchen
          </Button>
        </div>
      )}

      {!error && availability && !hasSlots && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-9 text-center">
          <CalendarDays className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-semibold text-slate-700">
            {availability.nextCursor
              ? "In diesem Zeitraum wurden keine freien Zeiten gefunden."
              : "Derzeit wurden keine freien Zeiten gefunden."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {availability.nextCursor
              ? "Sie können weitere Termine anzeigen."
              : "Bitte wählen Sie eine andere Terminart oder versuchen Sie es später erneut."}
          </p>
        </div>
      )}

      {hasSlots && (
        <fieldset>
          <legend className="sr-only">Freie Uhrzeit auswählen</legend>
          <div className="space-y-6">
            {days.map((day) => {
              const headingId = `${headingPrefix}-${day.date}`;

              return (
                <div key={day.date} role="group" aria-labelledby={headingId}>
                  <h4 id={headingId} className="mb-3 text-sm font-bold text-slate-800">
                    {day.dateLabel}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {day.slots.map((slot) => {
                      const selected = selectedStartAt === slot.startAt;

                      return (
                        <button
                          key={slot.startAt}
                          type="button"
                          onClick={() => onSelect(slot.startAt)}
                          aria-pressed={selected}
                          aria-label={`${day.dateLabel}, ${slot.startLabel} bis ${slot.endLabel} Uhr`}
                          className={cn(
                            "flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            selected
                              ? "border-primary bg-primary text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:bg-primary/5",
                          )}
                        >
                          {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                          <span>{slot.startLabel} Uhr</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
      )}

      {availability?.nextCursor && !error && (
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => onLoadMore(availability.nextCursor!)}
          disabled={loading || loadingMore}
        >
          {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {loadingMore ? "Weitere Termine werden geladen …" : "Weitere Termine anzeigen"}
        </Button>
      )}
    </div>
  );
}
