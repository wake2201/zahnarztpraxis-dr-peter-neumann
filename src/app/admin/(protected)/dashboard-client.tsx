"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Inbox, LogOut, Heart, Users, Shield, ScrollText } from "lucide-react";
import { LogsTab } from "@/components/admin/logs-tab";
import { RequestsTab } from "@/components/admin/requests-tab";
import type { AuditLogEntry, ContactRequest, DashboardTab, UserAccount } from "@/components/admin/types";
import { UsersTab } from "@/components/admin/users-tab";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 30_000;

interface Props {
  requests: ContactRequest[];
  userName: string;
  userRole: string;
  users: UserAccount[];
  auditLogs: AuditLogEntry[];
}

export function AdminDashboardClient({
  requests,
  userName,
  userRole,
  users,
  auditLogs,
}: Props) {
  const isAdmin = userRole === "admin";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("requests");

  // Visibility-aware Polling. Intervall auf 30s erhoeht, damit die
  // Vercel-Invocations und DB-Hits deutlich niedriger bleiben.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);

  const unread = requests.filter((request) => !request.read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Admin-Dashboard</h1>
              <p className="text-xs text-slate-500">
                {userName} - {isAdmin ? <><Shield className="w-3 h-3 inline" /> Admin</> : "Mitarbeiter"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </Button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>
              <Inbox className="w-4 h-4 inline mr-1.5" />
              Anfragen
              {unread > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-bold">
                  {unread}
                </span>
              )}
            </TabButton>
            {isAdmin && (
              <>
                <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>
                  <Users className="w-4 h-4 inline mr-1.5" />
                  Benutzer
                </TabButton>
                <TabButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")}>
                  <ScrollText className="w-4 h-4 inline mr-1.5" />
                  Aktivitätslog
                </TabButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "requests" && <RequestsTab requests={requests} />}
        {activeTab === "users" && isAdmin && <UsersTab users={users} />}
        {activeTab === "logs" && isAdmin && <LogsTab auditLogs={auditLogs} />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
