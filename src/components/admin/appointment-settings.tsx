"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentConfigurationDto, AppointmentResult } from "@/lib/appointments/types";
import { AppointmentTypeSettings } from "./appointment-settings/appointment-type-settings";
import { BookingBlackouts } from "./appointment-settings/booking-blackouts";
import { BookingRules } from "./appointment-settings/booking-rules";
import { SettingsHome } from "./appointment-settings/settings-home";
import { WeeklyBookingHours } from "./appointment-settings/weekly-booking-hours";

interface Props {
  configuration: AppointmentConfigurationDto | null;
  loadError: string;
  onReload: () => Promise<void>;
  onClose: () => void;
}

export type AppointmentSettingsSection = "home" | "types" | "hours" | "blackouts" | "rules";

export type RunSettingsMutation = <T>(
  operation: string,
  mutation: () => Promise<AppointmentResult<T>>,
  successMessage: string,
  afterSuccess?: () => void,
) => Promise<boolean>;

const SECTION_COPY: Record<AppointmentSettingsSection, { title: string; description: string }> = {
  home: {
    title: "Termin-Einstellungen",
    description: "Wählen Sie den Bereich aus, den Sie ändern möchten.",
  },
  types: {
    title: "Terminarten",
    description: "Dauer, Bestätigung und Online-Buchung verwalten.",
  },
  hours: {
    title: "Buchungszeiten",
    description: "Festlegen, wann Patienten Termine online buchen können.",
  },
  blackouts: {
    title: "Urlaub & Sperrzeiten",
    description: "Einzelne Tage oder Uhrzeiten für Online-Buchungen sperren.",
  },
  rules: {
    title: "Weitere Einstellungen",
    description: "Vorlauf und möglichen Buchungszeitraum festlegen.",
  },
};

export function AppointmentSettings({ configuration, loadError, onReload, onClose }: Props) {
  const mutationLock = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [activeSection, setActiveSection] = useState<AppointmentSettingsSection>("home");
  const [pendingOperation, setPendingOperation] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [success, setSuccess] = useState("");
  const [reloadWarning, setReloadWarning] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [activeSection]);

  const runMutation: RunSettingsMutation = async (
    operation,
    mutation,
    successMessage,
    afterSuccess,
  ) => {
    if (mutationLock.current) {
      return false;
    }

    mutationLock.current = true;
    setPendingOperation(operation);
    setMutationError("");
    setSuccess("");
    setReloadWarning("");

    try {
      const result = await mutation();
      if (!result.success) {
        setMutationError(result.error);
        return false;
      }

      afterSuccess?.();
      setSuccess(successMessage);

      try {
        await onReload();
      } catch {
        setReloadWarning("Die Änderung wurde gespeichert. Die Anzeige konnte jedoch nicht aktualisiert werden.");
      }

      return true;
    } catch {
      setMutationError("Die Einstellung konnte nicht gespeichert werden.");
      return false;
    } finally {
      mutationLock.current = false;
      setPendingOperation("");
    }
  };

  const sectionCopy = SECTION_COPY[activeSection];

  return (
    <section className="space-y-6" aria-label="Termin-Einstellungen">
      <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="justify-start px-0 mb-3 text-slate-600 hover:bg-transparent hover:text-primary"
              onClick={activeSection === "home" ? onClose : () => setActiveSection("home")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              {activeSection === "home" ? "Zurück zu den Terminen" : "Alle Einstellungen"}
            </Button>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold text-slate-800 outline-none sm:text-2xl"
            >
              {sectionCopy.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{sectionCopy.description}</p>
          </div>
          {activeSection !== "home" && (
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="self-start">
              <X className="w-4 h-4 mr-2" aria-hidden="true" />
              Schließen
            </Button>
          )}
        </div>

        <div aria-live="polite" aria-atomic="true" className="mt-4 space-y-2">
          {loadError && configuration && (
            <p className="p-3 text-sm text-amber-800 border border-amber-200 rounded-xl bg-amber-50">
              {loadError}
            </p>
          )}
          {mutationError && (
            <p role="alert" className="p-3 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">
              {mutationError}
            </p>
          )}
          {success && (
            <p className="p-3 text-sm text-green-800 border border-green-200 rounded-xl bg-green-50">
              {success}
            </p>
          )}
          {reloadWarning && (
            <p className="p-3 text-sm text-amber-800 border border-amber-200 rounded-xl bg-amber-50">
              {reloadWarning}
            </p>
          )}
        </div>
      </div>

      {!configuration ? (
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-card">
          {loadError ? (
            <div className="space-y-4">
              <p role="alert" className="text-sm text-red-700">{loadError}</p>
              <Button type="button" variant="outline" onClick={() => void onReload().catch(() => undefined)}>
                Erneut versuchen
              </Button>
            </div>
          ) : (
            <p className="flex items-center text-sm text-slate-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Die Einstellungen werden geladen.
            </p>
          )}
        </div>
      ) : (
        <>
          {activeSection === "home" && (
            <SettingsHome configuration={configuration} onSelect={setActiveSection} />
          )}
          {activeSection === "types" && (
            <AppointmentTypeSettings
              appointmentTypes={configuration.appointmentTypes}
              pendingOperation={pendingOperation}
              runMutation={runMutation}
            />
          )}
          {activeSection === "hours" && (
            <WeeklyBookingHours
              weeklyAvailability={configuration.weeklyAvailability}
              pendingOperation={pendingOperation}
              runMutation={runMutation}
            />
          )}
          {activeSection === "blackouts" && (
            <BookingBlackouts
              exceptions={configuration.exceptions}
              pendingOperation={pendingOperation}
              runMutation={runMutation}
            />
          )}
          {activeSection === "rules" && (
            <BookingRules
              settings={configuration.settings}
              pendingOperation={pendingOperation}
              runMutation={runMutation}
            />
          )}
        </>
      )}
    </section>
  );
}
