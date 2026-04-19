import { getCachedSession } from "@/lib/session";
import { getContactRequests, getDashboardStats, getUsers, getAuditLogs } from "@/lib/actions";
import { AdminDashboardClient } from "./dashboard-client";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Admin Dashboard — Server Component.
 * Auth-Guard liegt im (protected)/layout.tsx.
 * Lädt die Daten serverseitig und übergibt sie an die Client Component.
 */
export default async function AdminDashboardPage() {
  const session = await getCachedSession();

  // Session ist durch layout.tsx garantiert, aber TypeScript braucht den Check
  if (!session) return null;

  const role = session.user.role || "staff";
  const isAdmin = role === "admin";

  // ALLE 4 Queries parallel mit Promise.allSettled — partial-failure-tolerant.
  // Wenn z.B. die Audit-Log-Query hängt/crasht, fällt der Admin NICHT komplett
  // in die error.tsx, sondern sieht Anfragen+Stats (Business-Continuity).
  const settled = await Promise.allSettled([
    getContactRequests(),
    getDashboardStats(),
    isAdmin ? getUsers() : Promise.resolve([] as Awaited<ReturnType<typeof getUsers>>),
    isAdmin ? getAuditLogs() : Promise.resolve([] as Awaited<ReturnType<typeof getAuditLogs>>),
  ]);

  const [requestsRes, statsRes, usersRes, logsRes] = settled;
  settled.forEach((r, i) => {
    if (r.status === "rejected") {
      logger.error(
        { err: r.reason, action: "AdminDashboardPage", queryIndex: i },
        "Dashboard-Teilquery fehlgeschlagen",
      );
    }
  });

  const requests = requestsRes.status === "fulfilled" ? requestsRes.value : [];
  const stats = statsRes.status === "fulfilled" ? statsRes.value : { total: 0, unread: 0 };
  const users = usersRes.status === "fulfilled" ? usersRes.value : [];
  const logs = logsRes.status === "fulfilled" ? logsRes.value : [];

  return (
    <AdminDashboardClient
      requests={requests}
      stats={stats}
      userName={session.user?.name || "Admin"}
      userRole={role}
      users={isAdmin ? users : []}
      auditLogs={isAdmin ? logs : []}
    />
  );
}
