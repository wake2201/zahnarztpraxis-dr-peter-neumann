"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { mutateContactRequests } from "@/lib/actions";
import type { ContactRequest } from "./types";

type RequestMutationAction = "markRead" | "markUnread" | "delete";

interface RequestMutation {
  action: RequestMutationAction;
  ids: string[];
}

interface Props {
  requests: ContactRequest[];
  onRequestsChange: React.Dispatch<React.SetStateAction<ContactRequest[]>>;
}

function applyRequestMutation(state: ContactRequest[], mutation: RequestMutation) {
  if (mutation.action === "delete") {
    return state.filter((request) => !mutation.ids.includes(request.id));
  }

  return state.map((request) =>
    mutation.ids.includes(request.id)
      ? { ...request, read: mutation.action === "markRead" }
      : request,
  );
}

function fallbackErrorMessage(action: RequestMutationAction) {
  return action === "delete"
    ? "Anfrage konnte nicht geloescht werden."
    : "Status konnte nicht aktualisiert werden.";
}

export function RequestsTab({ requests, onRequestsChange }: Props) {
  const router = useRouter();
  const [, startRequestTransition] = useTransition();
  const [pendingMutation, setPendingMutation] = useState<RequestMutation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[] | null>(null);
  const [requestActionError, setRequestActionError] = useState("");

  useEffect(() => {
    const visibleIds = new Set(requests.map((request) => request.id));

    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
    setDeleteConfirmIds((prev) => {
      if (!prev) {
        return null;
      }

      const next = prev.filter((id) => visibleIds.has(id));
      return next.length > 0 ? next : null;
    });
  }, [requests]);

  const displayStats = {
    total: requests.length,
    unread: requests.filter((request) => !request.read).length,
  };

  const visibleIds = requests.map((request) => request.id);
  const selectedCount = selectedIds.length;
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id));
  const bulkDeleteConfirmation = deleteConfirmIds !== null && deleteConfirmIds.length > 1;

  function handleSelectAll() {
    setRequestActionError("");
    setDeleteConfirmIds(null);
    setSelectedIds((current) => {
      const nextAllVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => current.includes(id));
      return nextAllVisibleSelected ? [] : visibleIds;
    });
  }

  function handleToggleSelection(id: string) {
    setRequestActionError("");
    setDeleteConfirmIds(null);
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function getPendingAction(id: string): RequestMutationAction | null {
    if (!pendingMutation || !pendingMutation.ids.includes(id)) {
      return null;
    }

    return pendingMutation.action;
  }

  function handleMutation(mutation: RequestMutation) {
    setRequestActionError("");
    if (mutation.action !== "delete") {
      setDeleteConfirmIds(null);
    }
    setPendingMutation(mutation);

    startRequestTransition(async () => {
      try {
        const result = await mutateContactRequests(mutation);
        if (result.success) {
          onRequestsChange((current) => applyRequestMutation(current, mutation));

          if (mutation.ids.length > 1) {
            setSelectedIds([]);
          } else if (mutation.action === "delete") {
            setSelectedIds((prev) => prev.filter((id) => !mutation.ids.includes(id)));
          }
        } else {
          setRequestActionError(result.error || fallbackErrorMessage(mutation.action));
          router.refresh();
        }
      } catch {
        setRequestActionError("Netzwerkfehler.");
        router.refresh();
      } finally {
        setDeleteConfirmIds(null);
        setPendingMutation(null);
      }
    });
  }

  function handleToggleRead(id: string) {
    const request = requests.find((item) => item.id === id);
    if (!request || pendingMutation) {
      return;
    }

    handleMutation({
      action: request.read ? "markUnread" : "markRead",
      ids: [id],
    });
  }

  function handleDelete(ids: string[]) {
    if (ids.length === 0 || pendingMutation) {
      return;
    }

    handleMutation({ action: "delete", ids });
  }

  function handleStartBulkDelete() {
    if (selectedCount === 0 || pendingMutation) {
      return;
    }

    setRequestActionError("");
    setDeleteConfirmIds(selectedIds);
  }

  return (
    <>
      <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Inbox className="w-5 h-5 text-primary" />} tint="bg-primary/10" label="Gesamt" value={displayStats.total} testId="request-stat-total" />
        <StatCard icon={<EyeOff className="w-5 h-5 text-orange-600" />} tint="bg-orange-100" label="Ungelesen" value={displayStats.unread} valueClass="text-orange-600" testId="request-stat-unread" />
        <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} tint="bg-green-100" label="Erledigt" value={displayStats.total - displayStats.unread} valueClass="text-green-600" testId="request-stat-done" />
      </div>

      <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-card">
        <div className="px-6 py-4 space-y-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Patientenanfragen</h2>
            <p className="mt-1 text-sm text-slate-500">Alle eingegangenen Kontaktanfragen - sortiert nach Datum (neueste zuerst)</p>
            {requestActionError && <p className="mt-1 text-sm text-red-600">{requestActionError}</p>}
          </div>

          {requests.length > 0 && (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <SelectionCheckbox
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected && !allVisibleSelected}
                  disabled={Boolean(pendingMutation)}
                  onChange={handleSelectAll}
                  ariaLabel="Alle sichtbaren Anfragen auswaehlen"
                />
                <span data-testid="request-selection-count">{selectedCount} ausgewaehlt</span>
              </div>

              {bulkDeleteConfirmation ? (
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(deleteConfirmIds ?? [])}
                    disabled={Boolean(pendingMutation)}
                    className="w-full h-9 px-3 text-sm sm:w-auto"
                  >
                    {pendingMutation?.action === "delete" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="ml-1.5">Wird geloescht...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span className="ml-1.5">Auswahl endgueltig loeschen</span>
                      </>
                    )}
                  </Button>
                  {!pendingMutation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmIds(null)}
                      className="w-full h-9 px-3 text-sm sm:w-auto"
                    >
                      Abbrechen
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMutation({ action: "markRead", ids: selectedIds })}
                    disabled={selectedCount === 0 || Boolean(pendingMutation)}
                    className="w-full h-9 px-3 text-sm sm:w-auto"
                  >
                    {pendingMutation?.action === "markRead" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    <span className="ml-1.5">{pendingMutation?.action === "markRead" ? "Wird aktualisiert..." : "Als gelesen"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMutation({ action: "markUnread", ids: selectedIds })}
                    disabled={selectedCount === 0 || Boolean(pendingMutation)}
                    className="w-full h-9 px-3 text-sm sm:w-auto"
                  >
                    {pendingMutation?.action === "markUnread" ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                    <span className="ml-1.5">{pendingMutation?.action === "markUnread" ? "Wird aktualisiert..." : "Als ungelesen"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartBulkDelete}
                    disabled={selectedCount === 0 || Boolean(pendingMutation)}
                    className="w-full h-9 px-3 text-sm text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-1.5">Auswahl loeschen</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Noch keine Anfragen eingegangen.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <RequestRow
                key={request.id}
                req={request}
                selected={selectedIds.includes(request.id)}
                pendingAction={getPendingAction(request.id)}
                selectionDisabled={Boolean(pendingMutation)}
                confirmingDelete={deleteConfirmIds?.length === 1 && deleteConfirmIds[0] === request.id}
                onToggleSelection={() => handleToggleSelection(request.id)}
                onToggleRead={() => handleToggleRead(request.id)}
                onRequestDelete={() => {
                  setRequestActionError("");
                  setDeleteConfirmIds([request.id]);
                }}
                onConfirmDelete={() => handleDelete([request.id])}
                onCancelDelete={() => setDeleteConfirmIds(null)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 mt-6 border rounded-xl bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800">DSGVO-Hinweis</h4>
            <p className="mt-1 text-sm text-amber-700">
              Gemaess Art. 17 DSGVO (Recht auf Loeschung) werden geloeschte Anfragen <strong>unwiderruflich</strong> aus der Datenbank entfernt. Stellen Sie sicher, dass die Anfrage vollstaendig bearbeitet wurde, bevor Sie diese loeschen.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  tint,
  label,
  value,
  valueClass = "text-slate-800",
  testId,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: number;
  valueClass?: string;
  testId?: string;
}) {
  return (
    <div className="p-6 bg-white border rounded-2xl shadow-card border-slate-100" data-testid={testId}>
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
  selected: boolean;
  pendingAction: RequestMutationAction | null;
  selectionDisabled: boolean;
  confirmingDelete: boolean;
  onToggleSelection: () => void;
  onToggleRead: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function RequestRow({
  req,
  selected,
  pendingAction,
  selectionDisabled,
  confirmingDelete,
  onToggleSelection,
  onToggleRead,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: RowProps) {
  const isUpdatingRead = pendingAction === "markRead" || pendingAction === "markUnread";
  const isDeleting = pendingAction === "delete";

  return (
    <div className={`px-6 py-5 transition-colors ${req.read ? "bg-white" : "bg-blue-50/50"} ${selected ? "ring-1 ring-inset ring-primary/20" : ""}`}>
      <div className="flex gap-4">
        <div className="pt-1">
          <SelectionCheckbox
            checked={selected}
            disabled={selectionDisabled}
            onChange={onToggleSelection}
            ariaLabel={`Anfrage von ${req.firstName} ${req.lastName} auswaehlen`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!req.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
            <h3 className="font-semibold truncate text-slate-800">{req.firstName} {req.lastName}</h3>
          </div>
          <div className="flex items-center gap-4 mb-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {req.countryCode} {req.phone}
            </span>
            <span className="flex items-center gap-1" suppressHydrationWarning>
              <Calendar className="w-3.5 h-3.5" />
              {new Date(req.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{req.message}</p>
        </div>

        <div className="flex flex-col items-stretch gap-2 mt-4 shrink-0 sm:flex-row sm:items-center lg:mt-0">
          {!isDeleting && !confirmingDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleRead}
              title={req.read ? "Als ungelesen markieren" : "Als gelesen markieren"}
              className="w-full h-9 px-3 text-sm sm:w-auto"
              disabled={selectionDisabled}
            >
              {isUpdatingRead ? <Loader2 className="w-4 h-4 animate-spin" /> : req.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="ml-1.5">{isUpdatingRead ? "Wird aktualisiert..." : req.read ? "Ungelesen" : "Gelesen"}</span>
            </Button>
          )}

          {confirmingDelete ? (
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <Button variant="destructive" size="sm" onClick={onConfirmDelete} disabled={selectionDisabled} className="w-full h-9 px-3 text-sm sm:w-auto">
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-1.5">Wird geloescht...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="ml-1.5">Endgueltig loeschen</span>
                  </>
                )}
              </Button>
              {!selectionDisabled && <Button variant="outline" size="sm" onClick={onCancelDelete} className="w-full h-9 px-3 text-sm sm:w-auto">Abbrechen</Button>}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestDelete}
              className="w-full h-9 px-3 text-sm text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:w-auto"
              disabled={selectionDisabled}
              title="DSGVO: Unwiderruflich loeschen"
            >
              <Trash2 className="w-4 h-4" />
              <span className="ml-1.5">Loeschen</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  disabled,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
    />
  );
}
