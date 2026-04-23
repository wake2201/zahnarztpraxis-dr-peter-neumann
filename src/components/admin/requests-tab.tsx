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
type MutationSource = "single" | "bulk";
type DeletePhase = "idle" | "confirming" | "pending";

interface RequestMutation {
  action: RequestMutationAction;
  ids: string[];
}

interface DeleteConfirmation {
  ids: string[];
  source: MutationSource;
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
    ? "Anfrage konnte nicht gelöscht werden."
    : "Status konnte nicht aktualisiert werden.";
}

function haveMatchingIds(currentIds: string[], targetIds: string[]) {
  return currentIds.length === targetIds.length && currentIds.every((id) => targetIds.includes(id));
}

export function RequestsTab({ requests, onRequestsChange }: Props) {
  const router = useRouter();
  const [, startRequestTransition] = useTransition();
  const [pendingMutation, setPendingMutation] = useState<RequestMutation | null>(null);
  const [pendingMutationSource, setPendingMutationSource] = useState<MutationSource | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);
  const [requestActionError, setRequestActionError] = useState("");

  useEffect(() => {
    const visibleIds = new Set(requests.map((request) => request.id));

    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
    setDeleteConfirmation((prev) => {
      if (!prev) {
        return null;
      }

      const ids = prev.ids.filter((id) => visibleIds.has(id));
      return ids.length > 0 ? { ...prev, ids } : null;
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
  const isBulkReadPending = pendingMutationSource === "bulk" && pendingMutation?.action === "markRead";
  const isBulkUnreadPending = pendingMutationSource === "bulk" && pendingMutation?.action === "markUnread";
  const bulkDeleteIds = deleteConfirmation?.source === "bulk" ? deleteConfirmation.ids : selectedIds;

  function getDeletePhase(source: MutationSource, ids: string[]): DeletePhase {
    if (ids.length === 0) {
      return "idle";
    }

    if (
      pendingMutationSource === source &&
      pendingMutation?.action === "delete" &&
      haveMatchingIds(pendingMutation.ids, ids)
    ) {
      return "pending";
    }

    if (
      !deleteConfirmation ||
      deleteConfirmation.source !== source ||
      !haveMatchingIds(deleteConfirmation.ids, ids)
    ) {
      return "idle";
    }

    return "confirming";
  }

  const bulkDeletePhase = getDeletePhase("bulk", bulkDeleteIds);
  const isBulkDeletePending = bulkDeletePhase === "pending";

  function handleSelectAll() {
    setRequestActionError("");
    setDeleteConfirmation(null);
    setSelectedIds((current) => {
      const nextAllVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => current.includes(id));
      return nextAllVisibleSelected ? [] : visibleIds;
    });
  }

  function handleToggleSelection(id: string) {
    setRequestActionError("");
    setDeleteConfirmation(null);
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

  function handleMutation(mutation: RequestMutation, source: MutationSource) {
    setRequestActionError("");
    if (mutation.action !== "delete") {
      setDeleteConfirmation(null);
    }
    setPendingMutation(mutation);
    setPendingMutationSource(source);

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
        setDeleteConfirmation(null);
        setPendingMutation(null);
        setPendingMutationSource(null);
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
    }, "single");
  }

  function handleDelete(ids: string[], source: MutationSource) {
    if (ids.length === 0 || pendingMutation) {
      return;
    }

    handleMutation({ action: "delete", ids }, source);
  }

  function startDeleteConfirmation(ids: string[], source: MutationSource) {
    if (ids.length === 0 || pendingMutation) {
      return;
    }

    setRequestActionError("");
    setDeleteConfirmation({ ids, source });
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
                  ariaLabel="Alle sichtbaren Anfragen auswählen"
                />
                <span data-testid="request-selection-count">{selectedCount} ausgewählt</span>
              </div>

              <div
                data-testid="request-bulk-actions"
                className="w-full sm:w-[34rem]"
              >
                <div className="grid w-full gap-2 sm:grid-cols-3">
                  <div className="w-full">
                    {bulkDeletePhase === "idle" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMutation({ action: "markRead", ids: selectedIds }, "bulk")}
                        disabled={selectedCount === 0 || Boolean(pendingMutation)}
                        className="h-9 w-full px-3 text-sm"
                      >
                        {isBulkReadPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        <span className="ml-1.5">{isBulkReadPending ? "Wird aktualisiert..." : "Als gelesen"}</span>
                      </Button>
                    ) : (
                      <div aria-hidden="true" className="hidden h-9 sm:block" />
                    )}
                  </div>
                  <div className="w-full">
                    {bulkDeletePhase === "idle" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMutation({ action: "markUnread", ids: selectedIds }, "bulk")}
                        disabled={selectedCount === 0 || Boolean(pendingMutation)}
                        className="h-9 w-full px-3 text-sm"
                      >
                        {isBulkUnreadPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                        <span className="ml-1.5">{isBulkUnreadPending ? "Wird aktualisiert..." : "Als ungelesen"}</span>
                      </Button>
                    ) : bulkDeletePhase === "confirming" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmation(null)}
                        className="h-9 w-full px-3 text-sm transition-none"
                      >
                        Abbrechen
                      </Button>
                    ) : (
                      <div aria-hidden="true" className="hidden h-9 sm:block" />
                    )}
                  </div>
                  <div className="w-full">
                    {bulkDeletePhase === "idle" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startDeleteConfirmation(selectedIds, "bulk")}
                        disabled={selectedCount === 0 || Boolean(pendingMutation)}
                        className="h-9 w-full px-3 text-sm text-red-600 transition-none hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="ml-1.5">Auswahl löschen</span>
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(bulkDeleteIds, "bulk")}
                        disabled={Boolean(pendingMutation)}
                        className="h-9 w-full px-3 text-sm transition-none"
                      >
                        {isBulkDeletePending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="ml-1.5">Wird gelöscht...</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            <span className="ml-1.5">Auswahl endgültig löschen</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
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
                pendingSource={pendingMutationSource}
                selectionDisabled={Boolean(pendingMutation)}
                deletePhase={getDeletePhase("single", [request.id])}
                onToggleSelection={() => handleToggleSelection(request.id)}
                onToggleRead={() => handleToggleRead(request.id)}
                onRequestDelete={() => startDeleteConfirmation([request.id], "single")}
                onConfirmDelete={() => handleDelete([request.id], "single")}
                onCancelDelete={() => setDeleteConfirmation(null)}
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
              Gemäß Art. 17 DSGVO (Recht auf Löschung) werden gelöschte Anfragen <strong>unwiderruflich</strong> aus der Datenbank entfernt. Stellen Sie sicher, dass die Anfrage vollständig bearbeitet wurde, bevor Sie diese löschen.
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
  pendingSource: MutationSource | null;
  selectionDisabled: boolean;
  deletePhase: DeletePhase;
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
  pendingSource,
  selectionDisabled,
  deletePhase,
  onToggleSelection,
  onToggleRead,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: RowProps) {
  const isUpdatingRead = pendingAction === "markRead" || pendingAction === "markUnread";
  const isDeleting = pendingAction === "delete";
  const isConfirmingDelete = deletePhase !== "idle";
  const isPendingSingleDelete = deletePhase === "pending";
  const isBulkDeleting = isDeleting && pendingSource === "bulk";

  return (
    <div className={`px-6 py-5 transition-colors ${req.read ? "bg-white" : "bg-blue-50/50"} ${selected ? "ring-1 ring-inset ring-primary/20" : ""}`}>
      <div className="flex gap-4">
        <div className="pt-1">
          <SelectionCheckbox
            checked={selected}
            disabled={selectionDisabled}
            onChange={onToggleSelection}
            ariaLabel={`Anfrage von ${req.firstName} ${req.lastName} auswählen`}
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
          {!isDeleting && !isConfirmingDelete && (
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

          {isConfirmingDelete ? (
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <Button variant="destructive" size="sm" onClick={onConfirmDelete} disabled={selectionDisabled} className="w-full h-9 px-3 text-sm sm:w-auto">
                {isPendingSingleDelete ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-1.5">Wird gelöscht...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="ml-1.5">Endgültig löschen</span>
                  </>
                )}
              </Button>
              {deletePhase === "confirming" && <Button variant="outline" size="sm" onClick={onCancelDelete} className="w-full h-9 px-3 text-sm sm:w-auto">Abbrechen</Button>}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestDelete}
              className="w-full h-9 px-3 text-sm text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:w-auto"
              disabled={selectionDisabled}
              title="DSGVO: Unwiderruflich löschen"
            >
              {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span className="ml-1.5">{isBulkDeleting ? "Wird gelöscht..." : "Löschen"}</span>
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
