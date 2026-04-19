"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  Inbox,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleReadStatus, deleteContactRequest } from "@/lib/actions";
import type { ContactRequest } from "./types";

interface Props {
  requests: ContactRequest[];
}

export function RequestsTab({ requests }: Props) {
  const [, startRequestTransition] = useTransition();
  const [pendingReqActions, setPendingReqActions] = useState<Record<string, "read" | "delete">>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [optimisticRequests, addOptimisticAction] = useOptimistic(
    requests,
    (state: ContactRequest[], action: { id: string; type: "toggle" | "delete" }) => {
      if (action.type === "toggle") {
        return state.map((req) => req.id === action.id ? { ...req, read: !req.read } : req);
      }
      if (action.type === "delete") {
        return state.filter((req) => req.id !== action.id);
      }
      return state;
    },
  );

  const displayStats = {
    total: optimisticRequests.length,
    unread: optimisticRequests.filter(req => !req.read).length,
  };

  function handleToggleRead(id: string) {
    const current = optimisticRequests.find(r => r.id === id)?.read ?? false;
    startRequestTransition(async () => {
      addOptimisticAction({ id, type: "toggle" });
      await toggleReadStatus(id, !current);
    });
  }

  function handleDelete(id: string) {
    setPendingReqActions(prev => ({ ...prev, [id]: "delete" }));
    startRequestTransition(async () => {
      addOptimisticAction({ id, type: "delete" });
      await deleteContactRequest(id);
      setDeleteConfirm(null);
      setPendingReqActions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Inbox className="w-5 h-5 text-primary" />} tint="bg-primary/10" label="Gesamt" value={displayStats.total} />
        <StatCard icon={<EyeOff className="w-5 h-5 text-orange-600" />} tint="bg-orange-100" label="Ungelesen" value={displayStats.unread} valueClass="text-orange-600" />
        <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} tint="bg-green-100" label="Erledigt" value={displayStats.total - displayStats.unread} valueClass="text-green-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Patientenanfragen</h2>
          <p className="text-sm text-slate-500 mt-1">Alle eingegangenen Kontaktanfragen — sortiert nach Datum (neueste zuerst)</p>
        </div>
        {optimisticRequests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Noch keine Anfragen eingegangen.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {optimisticRequests.map((req) => (
              <RequestRow
                key={req.id}
                req={req}
                pending={pendingReqActions[req.id]}
                confirmingDelete={deleteConfirm === req.id}
                onToggleRead={() => handleToggleRead(req.id)}
                onRequestDelete={() => setDeleteConfirm(req.id)}
                onConfirmDelete={() => handleDelete(req.id)}
                onCancelDelete={() => setDeleteConfirm(null)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800">DSGVO-Hinweis</h4>
            <p className="text-sm text-amber-700 mt-1">
              Gemäß Art. 17 DSGVO (Recht auf Löschung) werden gelöschte Anfragen <strong>unwiderruflich</strong> aus der Datenbank entfernt. Stellen Sie sicher, dass die Anfrage vollständig bearbeitet wurde, bevor Sie diese löschen.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, tint, label, value, valueClass = "text-slate-800" }: { icon: React.ReactNode; tint: string; label: string; value: number; valueClass?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${tint} rounded-xl flex items-center justify-center`}>{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  req: ContactRequest;
  pending?: "read" | "delete";
  confirmingDelete: boolean;
  onToggleRead: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function RequestRow({ req, pending, confirmingDelete, onToggleRead, onRequestDelete, onConfirmDelete, onCancelDelete }: RowProps) {
  return (
    <div className={`px-6 py-5 transition-colors ${req.read ? "bg-white" : "bg-blue-50/50"}`}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!req.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
            <h3 className="font-semibold text-slate-800 truncate">{req.firstName} {req.lastName}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{req.countryCode} {req.phone}</span>
            <span className="flex items-center gap-1" suppressHydrationWarning>
              <Calendar className="w-3.5 h-3.5" />
              {new Date(req.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{req.message}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 mt-4 lg:mt-0">
          {pending !== "delete" && !confirmingDelete && (
            <Button variant="outline" size="sm" onClick={onToggleRead} title={req.read ? "Als ungelesen markieren" : "Als gelesen markieren"} className="w-full sm:w-auto text-sm px-3 h-9">
              {req.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="ml-1.5">{req.read ? "Ungelesen" : "Gelesen"}</span>
            </Button>
          )}

          {confirmingDelete ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="destructive" size="sm" onClick={onConfirmDelete} disabled={!!pending} className="w-full sm:w-auto text-sm px-3 h-9">
                {pending === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><AlertTriangle className="w-4 h-4 mr-1" />Endgültig löschen</>}
              </Button>
              {!pending && <Button variant="outline" size="sm" onClick={onCancelDelete} className="w-full sm:w-auto text-sm px-3 h-9">Abbrechen</Button>}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={onRequestDelete} className="w-full sm:w-auto text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-sm px-3 h-9" disabled={!!pending} title="DSGVO: Unwiderruflich löschen">
              <Trash2 className="w-4 h-4" /><span className="ml-1.5">Löschen</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
