"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { CalendarDays, Inbox, LogOut, Heart, Users, Shield, ScrollText } from "lucide-react";
import { AppointmentsTab } from "@/components/admin/appointments-tab";
import { LogsTab } from "@/components/admin/logs-tab";
import { RequestsTab } from "@/components/admin/requests-tab";
import type { AuditLogEntry, ContactRequest, DashboardTab, UserAccount } from "@/components/admin/types";
import { UsersTab } from "@/components/admin/users-tab";
import { Button } from "@/components/ui/button";
import {
  getAdminAppointmentDashboard,
  getAppointmentConfiguration,
  getContactRequests,
} from "@/lib/actions";
import type {
  AdminAppointmentDashboardDto,
  AdminAppointmentDashboardInput,
  AppointmentConfigurationDto,
} from "@/lib/appointments/types";

const POLL_INTERVAL_MS = 30_000;
const REQUESTS_PAGE_SIZE = 50;

interface Props {
  requests: ContactRequest[];
  appointmentDashboard: AdminAppointmentDashboardDto;
  appointmentConfiguration: AppointmentConfigurationDto | null;
  appointmentDashboardError: string;
  appointmentConfigurationError: string;
  userName: string;
  userRole: string;
  users: UserAccount[];
  auditLogs: AuditLogEntry[];
}

export function AdminDashboardClient({
  requests,
  appointmentDashboard,
  appointmentConfiguration,
  appointmentDashboardError,
  appointmentConfigurationError,
  userName,
  userRole,
  users,
  auditLogs,
}: Props) {
  const isAdmin = userRole === "admin";
  const [activeTab, setActiveTab] = useState<DashboardTab>("requests");
  const [requestItems, setRequestItems] = useState(requests);
  const [requestPageHistory, setRequestPageHistory] = useState<ContactRequest[][]>([]);
  const [hasOlderRequests, setHasOlderRequests] = useState(requests.length >= REQUESTS_PAGE_SIZE);
  const [isLoadingOlderRequests, setIsLoadingOlderRequests] = useState(false);
  const [requestPaginationError, setRequestPaginationError] = useState("");
  const [appointmentDashboardData, setAppointmentDashboardData] = useState(appointmentDashboard);
  const [appointmentConfigurationData, setAppointmentConfigurationData] = useState(appointmentConfiguration);
  const [appointmentLoadError, setAppointmentLoadError] = useState(appointmentDashboardError);
  const [appointmentConfigLoadError, setAppointmentConfigLoadError] = useState(appointmentConfigurationError);

  useEffect(() => {
    setRequestItems(requests);
    setRequestPageHistory([]);
    setHasOlderRequests(requests.length >= REQUESTS_PAGE_SIZE);
    setRequestPaginationError("");
  }, [requests]);

  useEffect(() => {
    setAppointmentDashboardData(appointmentDashboard);
    setAppointmentLoadError(appointmentDashboardError);
  }, [appointmentDashboard, appointmentDashboardError]);

  useEffect(() => {
    setAppointmentConfigurationData(appointmentConfiguration);
    setAppointmentConfigLoadError(appointmentConfigurationError);
  }, [appointmentConfiguration, appointmentConfigurationError]);

  useEffect(() => {
    if (!isAdmin && activeTab !== "requests" && activeTab !== "appointments") {
      setActiveTab("requests");
    }
  }, [activeTab, isAdmin]);

  // Visibility-aware Polling. Intervall auf 30s erhoeht, damit die
  // Vercel-Invocations und DB-Hits deutlich niedriger bleiben.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (activeTab === "appointments") {
        void getAdminAppointmentDashboard({ weekStart: appointmentDashboardData.weekStart })
          .then((nextDashboard) => {
            setAppointmentDashboardData(nextDashboard);
            setAppointmentLoadError("");
          })
          .catch(() => setAppointmentLoadError("Termine konnten nicht aktualisiert werden."));
        return;
      }

      if (requestPageHistory.length === 0) {
        void getContactRequests()
          .then((nextRequests) => setRequestItems(nextRequests))
          .catch(() => setRequestPaginationError("Anfragen konnten nicht aktualisiert werden."));
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeTab, appointmentDashboardData.weekStart, requestPageHistory.length]);

  const unread = requestItems.filter((request) => !request.read).length;

  async function handleLoadOlderRequests() {
    const cursor = requestItems[requestItems.length - 1]?.id;
    if (!cursor || isLoadingOlderRequests) {
      return;
    }

    setIsLoadingOlderRequests(true);
    setRequestPaginationError("");

    try {
      const olderRequests = await getContactRequests(cursor);

      if (olderRequests.length === 0) {
        setHasOlderRequests(false);
        return;
      }

      setRequestPageHistory((current) => [...current, requestItems]);
      setRequestItems(olderRequests);
      setHasOlderRequests(olderRequests.length >= REQUESTS_PAGE_SIZE);
    } catch {
      setRequestPaginationError("Ältere Anfragen konnten nicht geladen werden.");
    } finally {
      setIsLoadingOlderRequests(false);
    }
  }

  function handleLoadNewerRequests() {
    if (requestPageHistory.length === 0) {
      return;
    }

    const previousPage = requestPageHistory[requestPageHistory.length - 1];
    if (!previousPage) {
      return;
    }

    setRequestItems(previousPage);
    setRequestPageHistory((current) => current.slice(0, -1));
    setHasOlderRequests(true);
    setRequestPaginationError("");
  }

  async function handleReloadAppointmentDashboard(input: AdminAppointmentDashboardInput = {}) {
    try {
      const nextDashboard = await getAdminAppointmentDashboard(input);
      setAppointmentDashboardData(nextDashboard);
      setAppointmentLoadError("");
    } catch {
      setAppointmentLoadError("Termine konnten nicht aktualisiert werden.");
      throw new Error("Appointment dashboard reload failed");
    }
  }

  async function handleReloadAppointmentConfiguration() {
    if (!isAdmin) {
      setAppointmentConfigurationData(null);
      return;
    }

    try {
      const nextConfiguration = await getAppointmentConfiguration();
      setAppointmentConfigurationData(nextConfiguration);
      setAppointmentConfigLoadError("");
    } catch {
      setAppointmentConfigLoadError("Die Terminkonfiguration konnte nicht aktualisiert werden.");
      throw new Error("Appointment configuration reload failed");
    }
  }

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
            <TabButton active={activeTab === "appointments"} onClick={() => setActiveTab("appointments")}>
              <CalendarDays className="w-4 h-4 inline mr-1.5" />
              Termine
              {appointmentDashboardData.pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-bold">
                  {appointmentDashboardData.pendingCount}
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
        {activeTab === "requests" && (
          <RequestsTab
            requests={requestItems}
            onRequestsChange={setRequestItems}
            canLoadNewerRequests={requestPageHistory.length > 0}
            canLoadOlderRequests={hasOlderRequests}
            isLoadingOlderRequests={isLoadingOlderRequests}
            paginationError={requestPaginationError}
            onLoadNewerRequests={handleLoadNewerRequests}
            onLoadOlderRequests={handleLoadOlderRequests}
          />
        )}
        {activeTab === "appointments" && (
          <AppointmentsTab
            dashboard={appointmentDashboardData}
            configuration={appointmentConfigurationData}
            isAdmin={isAdmin}
            dashboardError={appointmentLoadError}
            configurationError={appointmentConfigLoadError}
            onReloadDashboard={handleReloadAppointmentDashboard}
            onReloadConfiguration={handleReloadAppointmentConfiguration}
          />
        )}
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
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
