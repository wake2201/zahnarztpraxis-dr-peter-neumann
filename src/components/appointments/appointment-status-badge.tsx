import type { AppointmentStatusValue } from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

const STATUS_CONTENT: Record<AppointmentStatusValue, { label: string; className: string }> = {
  PENDING: { label: "Bestätigung ausstehend", className: "border-amber-200 bg-amber-50 text-amber-800" },
  CONFIRMED: { label: "Bestätigt", className: "border-green-200 bg-green-50 text-green-800" },
  REJECTED: { label: "Nicht bestätigt", className: "border-red-200 bg-red-50 text-red-800" },
  CANCELLED: { label: "Abgesagt", className: "border-slate-200 bg-slate-100 text-slate-700" },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatusValue }) {
  const content = STATUS_CONTENT[status];

  return (
    <span
      className={cn("inline-flex rounded-full border px-3 py-1 text-sm font-semibold", content.className)}
      role="status"
    >
      {content.label}
    </span>
  );
}
