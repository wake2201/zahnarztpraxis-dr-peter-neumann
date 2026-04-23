"use client";

import { ScrollText } from "lucide-react";
import { ACTION_LABELS, type AuditLogEntry } from "./types";

interface Props {
  auditLogs: AuditLogEntry[];
}

export function LogsTab({ auditLogs }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Aktivitätslog</h2>
          <p className="text-sm text-slate-500 mt-1">Letzte 100 Aktionen — Anmeldungen, Löschungen, Benutzerverwaltung</p>
          <p className="text-sm text-slate-500 mt-1">Einträge können nicht manuell gelöscht werden.</p>
        </div>
      </div>
      {auditLogs.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Noch keine Aktivitäten protokolliert.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${actionBadgeClass(log.action)}`}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    <span className="text-sm font-medium text-slate-800 truncate overflow-hidden border-b border-transparent leading-tight line-clamp-1 break-all" title={log.userName}>{log.userName}</span>
                  </div>
                  {log.details && <p className="text-sm text-slate-500 truncate">{log.details}</p>}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap" suppressHydrationWarning>
                  {new Date(log.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function actionBadgeClass(action: string): string {
  switch (action) {
    case "LOGIN": return "bg-blue-100 text-blue-700";
    case "DELETE_REQUEST": return "bg-red-100 text-red-700";
    case "CREATE_USER": return "bg-green-100 text-green-700";
    default: return "bg-slate-100 text-slate-700";
  }
}
