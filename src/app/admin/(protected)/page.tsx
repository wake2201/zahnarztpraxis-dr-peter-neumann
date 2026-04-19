import { getCachedSession } from "@/lib/session";
import { getContactRequests, getUsers, getAuditLogs } from "@/lib/actions";
import { logger } from "@/lib/logger";
import { AdminDashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

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
    isAdmin ? getUsers() : Promise.resolve([] as Awaited<ReturnType<typeof getUsers>>),
    isAdmin ? getAuditLogs() : Promise.resolve([] as Awaited<ReturnType<typeof getAuditLogs>>),
  ]);

  const [requestsRes, usersRes, logsRes] = settled;
  settled.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.error(
        { err: result.reason, action: "AdminDashboardPage", queryIndex: index },
        "Dashboard-Teilquery fehlgeschlagen",
      );
    }
  });

  const requests = requestsRes.status === "fulfilled" ? requestsRes.value : [];
  const users = usersRes.status === "fulfilled" ? usersRes.value : [];
  const logs = logsRes.status === "fulfilled" ? logsRes.value : [];

  return (
    <AdminDashboardClient
      requests={requests}
      userName={session.user.name || "Admin"}
      userRole={role}
      users={isAdmin ? users : []}
      auditLogs={isAdmin ? logs : []}
    />
  );
}
