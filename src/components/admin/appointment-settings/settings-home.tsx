import { CalendarClock, CalendarOff, ChevronRight, SlidersHorizontal, Stethoscope } from "lucide-react";
import type { AppointmentConfigurationDto } from "@/lib/appointments/types";
import type { AppointmentSettingsSection } from "../appointment-settings";

interface Props {
  configuration: AppointmentConfigurationDto;
  onSelect: (section: AppointmentSettingsSection) => void;
}

const SETTINGS_LINKS = [
  {
    section: "types" as const,
    title: "Terminarten",
    description: "Sprechstunde, Kontrolle und weitere Terminarten",
    icon: Stethoscope,
  },
  {
    section: "hours" as const,
    title: "Buchungszeiten",
    description: "Wann Patienten online buchen können",
    icon: CalendarClock,
  },
  {
    section: "blackouts" as const,
    title: "Urlaub & Sperrzeiten",
    description: "Tage oder einzelne Uhrzeiten sperren",
    icon: CalendarOff,
  },
  {
    section: "rules" as const,
    title: "Weitere Einstellungen",
    description: "Vorlauf und Buchungszeitraum",
    icon: SlidersHorizontal,
  },
];

export function SettingsHome({ configuration, onSelect }: Props) {
  const activeTypeCount = configuration.appointmentTypes.filter((type) => type.active).length;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {SETTINGS_LINKS.map((link) => {
        const Icon = link.icon;
        const supplementalText = link.section === "types"
          ? `${activeTypeCount} ${activeTypeCount === 1 ? "aktive Terminart" : "aktive Terminarten"}`
          : undefined;

        return (
          <button
            key={link.section}
            type="button"
            onClick={() => onSelect(link.section)}
            className="flex items-center w-full gap-4 p-5 text-left transition-colors bg-white border border-slate-200 rounded-2xl shadow-card hover:border-primary/40 hover:bg-blue-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
          >
            <span className="flex items-center justify-center w-11 h-11 shrink-0 text-primary rounded-xl bg-blue-50">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-slate-800">{link.title}</span>
              <span className="block mt-1 text-sm text-slate-500">{link.description}</span>
              {supplementalText && <span className="block mt-2 text-xs font-medium text-slate-500">{supplementalText}</span>}
            </span>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
