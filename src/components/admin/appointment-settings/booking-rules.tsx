"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBookingSettings } from "@/lib/actions";
import type { AppointmentSettingsDto } from "@/lib/appointments/types";
import type { RunSettingsMutation } from "../appointment-settings";

interface Props {
  settings: AppointmentSettingsDto;
  pendingOperation: string;
  runMutation: RunSettingsMutation;
}

const NOTICE_PRESETS = [
  { value: 60, label: "1 Stunde vorher" },
  { value: 120, label: "2 Stunden vorher" },
  { value: 240, label: "4 Stunden vorher" },
  { value: 720, label: "12 Stunden vorher" },
  { value: 1440, label: "1 Tag vorher" },
  { value: 2880, label: "2 Tage vorher" },
];

const HORIZON_PRESETS = [
  { value: 14, label: "14 Tage" },
  { value: 30, label: "30 Tage" },
  { value: 60, label: "60 Tage" },
  { value: 90, label: "90 Tage" },
  { value: 180, label: "180 Tage" },
];

function hasPreset(presets: Array<{ value: number }>, value: number) {
  return presets.some((preset) => preset.value === value);
}

export function BookingRules({ settings, pendingOperation, runMutation }: Props) {
  const [minimumNoticeMinutes, setMinimumNoticeMinutes] = useState(settings.minimumNoticeMinutes);
  const [bookingHorizonDays, setBookingHorizonDays] = useState(settings.bookingHorizonDays);
  const [customNotice, setCustomNotice] = useState(!hasPreset(NOTICE_PRESETS, settings.minimumNoticeMinutes));
  const [customHorizon, setCustomHorizon] = useState(!hasPreset(HORIZON_PRESETS, settings.bookingHorizonDays));

  useEffect(() => {
    setMinimumNoticeMinutes(settings.minimumNoticeMinutes);
    setBookingHorizonDays(settings.bookingHorizonDays);
    setCustomNotice(!hasPreset(NOTICE_PRESETS, settings.minimumNoticeMinutes));
    setCustomHorizon(!hasPreset(HORIZON_PRESETS, settings.bookingHorizonDays));
  }, [settings]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await runMutation(
      "settings:update",
      () => updateBookingSettings({ minimumNoticeMinutes, bookingHorizonDays }),
      "Die weiteren Einstellungen wurden gespeichert.",
    );
  }

  return (
    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-card sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Regeln für Online-Buchungen</h3>
        <p className="mt-1 text-sm text-slate-500">Diese Regeln gelten für alle online buchbaren Terminarten.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="p-4 border border-slate-200 rounded-xl sm:p-5">
            <label className="text-sm font-semibold text-slate-800" htmlFor="minimum-notice-preset">
              Wie kurzfristig dürfen Patienten buchen?
            </label>
            <p className="mt-1 text-sm text-slate-500">Beispiel: Bei vier Stunden Vorlauf ist eine Buchung erst vier Stunden später möglich.</p>
            <select
              id="minimum-notice-preset"
              value={customNotice ? "custom" : String(minimumNoticeMinutes)}
              onChange={(event) => {
                if (event.target.value === "custom") {
                  setCustomNotice(true);
                  return;
                }
                setCustomNotice(false);
                setMinimumNoticeMinutes(Number(event.target.value));
              }}
              className="w-full h-11 px-3 mt-4 bg-white border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {NOTICE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>{preset.label}</option>
              ))}
              <option value="custom">Eigener Wert …</option>
            </select>

            {customNotice && (
              <label className="block mt-4 text-sm font-medium text-slate-700">
                Eigener Vorlauf in Minuten
                <Input
                  type="number"
                  min={0}
                  max={43200}
                  step={1}
                  value={minimumNoticeMinutes}
                  onChange={(event) => setMinimumNoticeMinutes(Number(event.target.value))}
                  required
                  className="mt-1.5"
                />
              </label>
            )}
          </div>

          <div className="p-4 border border-slate-200 rounded-xl sm:p-5">
            <label className="text-sm font-semibold text-slate-800" htmlFor="booking-horizon-preset">
              Wie weit im Voraus dürfen Patienten buchen?
            </label>
            <p className="mt-1 text-sm text-slate-500">Bestimmt, wie viele Tage im Kalender zur Auswahl stehen.</p>
            <select
              id="booking-horizon-preset"
              value={customHorizon ? "custom" : String(bookingHorizonDays)}
              onChange={(event) => {
                if (event.target.value === "custom") {
                  setCustomHorizon(true);
                  return;
                }
                setCustomHorizon(false);
                setBookingHorizonDays(Number(event.target.value));
              }}
              className="w-full h-11 px-3 mt-4 bg-white border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {HORIZON_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>{preset.label}</option>
              ))}
              <option value="custom">Eigener Wert …</option>
            </select>

            {customHorizon && (
              <label className="block mt-4 text-sm font-medium text-slate-700">
                Eigener Zeitraum in Tagen
                <Input
                  type="number"
                  min={1}
                  max={365}
                  step={1}
                  value={bookingHorizonDays}
                  onChange={(event) => setBookingHorizonDays(Number(event.target.value))}
                  required
                  className="mt-1.5"
                />
              </label>
            )}
          </div>
        </div>

        <Button type="submit" disabled={Boolean(pendingOperation)}>
          {pendingOperation === "settings:update" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="w-4 h-4 mr-2" aria-hidden="true" />
          )}
          Einstellungen speichern
        </Button>
      </form>
    </div>
  );
}
