import { getCachedSession } from "@/lib/session";
import {
  getAdminAppointmentDashboard,
  getAppointmentConfiguration,
  getAuditLogs,
  getContactRequests,
  getUsers,
} from "@/lib/actions";
import { logger } from "@/lib/logger";
import type { AdminAppointmentDashboardDto } from "@/lib/appointments/types";
import { AdminDashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

function getBerlinDateKey() {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function emptyAppointmentDashboard(): AdminAppointmentDashboardDto {
  const todayLocalDate = getBerlinDateKey();
  return {
    appointments: [],
    manualAppointmentTypes: [],
    todayLocalDate,
    weekStart: todayLocalDate,
    weekEnd: todayLocalDate,
    pendingCount: 0,
    todayCount: 0,
    weekCount: 0,
  };
}

/**
 * Admin Dashboard - Server Component.
 * Auth-Guard liegt im (protected)/layout.tsx.
 * Laedt die Daten serverseitig und uebergibt sie an die Client Component.
 */
export default async function AdminDashboardPage() {
  const session = await getCachedSession();

  // Session ist durch layout.tsx garantiert, aber TypeScript braucht den Check.
  if (!session) {
    return null;
  }

  const role = session.user.role || "staff";
  const isAdmin = role === "admin";

  // Alle Queries parallel mit Promise.allSettled, damit Teilfehler den
  // restlichen Dashboard-Inhalt nicht unnoetig mitreissen.
  const settled = await Promise.allSettled([
    getContactRequests(),
    getAdminAppointmentDashboard(),
    isAdmin ? getAppointmentConfiguration() : Promise.resolve(null),
    isAdmin ? getUsers() : Promise.resolve([] as Awaited<ReturnType<typeof getUsers>>),
    isAdmin ? getAuditLogs() : Promise.resolve([] as Awaited<ReturnType<typeof getAuditLogs>>),
  ]);

  const [requestsRes, appointmentsRes, appointmentConfigurationRes, usersRes, logsRes] = settled;
  settled.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.error(
        { err: result.reason, action: "AdminDashboardPage", queryIndex: index },
        "Dashboard-Teilquery fehlgeschlagen",
      );
    }
  });

  const requests = requestsRes.status === "fulfilled" ? requestsRes.value : [];
  const appointmentDashboard = appointmentsRes.status === "fulfilled"
    ? appointmentsRes.value
    : emptyAppointmentDashboard();
  const appointmentConfiguration = appointmentConfigurationRes.status === "fulfilled"
    ? appointmentConfigurationRes.value
    : null;
  const users = usersRes.status === "fulfilled" ? usersRes.value : [];
  const logs = logsRes.status === "fulfilled" ? logsRes.value : [];

  return (
    <AdminDashboardClient
      requests={requests}
      appointmentDashboard={appointmentDashboard}
      appointmentConfiguration={appointmentConfiguration}
      appointmentDashboardError={appointmentsRes.status === "rejected" ? "Termine konnten nicht geladen werden." : ""}
      appointmentConfigurationError={
        isAdmin && appointmentConfigurationRes.status === "rejected"
          ? "Die Terminkonfiguration konnte nicht geladen werden."
          : ""
      }
      userName={session.user.name || "Admin"}
      userRole={role}
      users={isAdmin ? users : []}
      auditLogs={isAdmin ? logs : []}
    />
  );
}
