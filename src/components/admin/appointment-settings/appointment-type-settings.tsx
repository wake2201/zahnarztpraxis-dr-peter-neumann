"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAppointmentType, updateAppointmentType } from "@/lib/actions";
import type {
  AdminAppointmentTypeDto,
  AppointmentConfirmationModeValue,
  AppointmentTypeCreateInput,
} from "@/lib/appointments/types";
import type { RunSettingsMutation } from "../appointment-settings";

interface Props {
  appointmentTypes: AdminAppointmentTypeDto[];
  pendingOperation: string;
  runMutation: RunSettingsMutation;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

function typeInput(appointmentType: AdminAppointmentTypeDto, active: boolean): AppointmentTypeCreateInput {
  return {
    name: appointmentType.name,
    ...(appointmentType.description ? { description: appointmentType.description } : {}),
    durationMinutes: appointmentType.durationMinutes,
    active,
    onlineBookable: appointmentType.onlineBookable,
    confirmationMode: appointmentType.confirmationMode,
  };
}

export function AppointmentTypeSettings({ appointmentTypes, pendingOperation, runMutation }: Props) {
  const [editorTypeId, setEditorTypeId] = useState<string | "new" | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [customDuration, setCustomDuration] = useState(false);
  const [onlineBookable, setOnlineBookable] = useState(true);
  const [confirmationMode, setConfirmationMode] = useState<AppointmentConfirmationModeValue>("AUTO");
  const [active, setActive] = useState(true);
  const [confirmingStatusId, setConfirmingStatusId] = useState<string | null>(null);

  function resetEditor() {
    setEditorTypeId(null);
    setName("");
    setDescription("");
    setDurationMinutes(30);
    setCustomDuration(false);
    setOnlineBookable(true);
    setConfirmationMode("AUTO");
    setActive(true);
  }

  function openCreateEditor() {
    resetEditor();
    setEditorTypeId("new");
  }

  function openEditEditor(appointmentType: AdminAppointmentTypeDto) {
    setEditorTypeId(appointmentType.id);
    setName(appointmentType.name);
    setDescription(appointmentType.description ?? "");
    setDurationMinutes(appointmentType.durationMinutes);
    setCustomDuration(!DURATION_PRESETS.includes(appointmentType.durationMinutes));
    setOnlineBookable(appointmentType.onlineBookable);
    setConfirmationMode(appointmentType.confirmationMode);
    setActive(appointmentType.active);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!editorTypeId) {
      return;
    }

    const input: AppointmentTypeCreateInput = {
      name,
      ...(description.trim() ? { description } : {}),
      durationMinutes,
      active,
      onlineBookable,
      confirmationMode,
    };

    if (editorTypeId === "new") {
      await runMutation(
        "type:create",
        () => createAppointmentType(input),
        "Die Terminart wurde hinzugefügt.",
        resetEditor,
      );
      return;
    }

    await runMutation(
      `type:update:${editorTypeId}`,
      () => updateAppointmentType({ id: editorTypeId, ...input }),
      "Die Terminart wurde aktualisiert.",
      resetEditor,
    );
  }

  async function changeActiveStatus(appointmentType: AdminAppointmentTypeDto) {
    const nextActive = !appointmentType.active;
    await runMutation(
      `type:status:${appointmentType.id}`,
      () => updateAppointmentType({
        id: appointmentType.id,
        ...typeInput(appointmentType, nextActive),
      }),
      nextActive ? "Die Terminart wurde wieder aktiviert." : "Die Terminart wurde deaktiviert.",
      () => setConfirmingStatusId(null),
    );
  }

  if (editorTypeId) {
    const editingName = editorTypeId === "new"
      ? "Neue Terminart"
      : `„${appointmentTypes.find((type) => type.id === editorTypeId)?.name ?? "Terminart"}“ bearbeiten`;

    return (
      <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-card sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{editingName}</h3>
            <p className="mt-1 text-sm text-slate-500">Nur die Angaben ändern, die Patienten verstehen müssen.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={resetEditor} aria-label="Editor schließen">
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Name
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              className="mt-1.5"
              autoFocus
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Dauer
            <select
              value={customDuration ? "custom" : String(durationMinutes)}
              onChange={(event) => {
                if (event.target.value === "custom") {
                  setCustomDuration(true);
                  return;
                }
                setCustomDuration(false);
                setDurationMinutes(Number(event.target.value));
              }}
              className="w-full h-11 px-3 mt-1.5 bg-white border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {DURATION_PRESETS.map((minutes) => (
                <option key={minutes} value={minutes}>{minutes} Minuten</option>
              ))}
              <option value="custom">Andere Dauer …</option>
            </select>
          </label>

          {customDuration && (
            <label className="text-sm font-medium text-slate-700 lg:col-start-2">
              Eigene Dauer in Minuten
              <Input
                type="number"
                min={15}
                max={480}
                step={15}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                required
                className="mt-1.5"
              />
            </label>
          )}

          <label className="text-sm font-medium text-slate-700 lg:col-span-2">
            Kurzbeschreibung (optional)
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              className="mt-1.5 min-h-24"
            />
          </label>

          <fieldset className="p-4 border border-slate-200 rounded-xl lg:col-span-2">
            <legend className="px-1 text-sm font-semibold text-slate-700">Bestätigung</legend>
            <div className="grid gap-3 mt-2 sm:grid-cols-2">
              <label className="flex items-start gap-3 p-3 text-sm border rounded-xl border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="appointment-confirmation"
                  value="AUTO"
                  checked={confirmationMode === "AUTO"}
                  onChange={() => setConfirmationMode("AUTO")}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-semibold text-slate-800">Sofort bestätigen</span>
                  <span className="block mt-1 text-slate-500">Der Patient erhält direkt einen festen Termin.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 p-3 text-sm border rounded-xl border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="appointment-confirmation"
                  value="MANUAL"
                  checked={confirmationMode === "MANUAL"}
                  onChange={() => setConfirmationMode("MANUAL")}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-semibold text-slate-800">Erst durch die Praxis bestätigen</span>
                  <span className="block mt-1 text-slate-500">Die Anfrage erscheint zuerst unter „Offene Anfragen“.</span>
                </span>
              </label>
            </div>
          </fieldset>

          <label className="flex items-start gap-3 p-4 text-sm border border-slate-200 rounded-xl cursor-pointer lg:col-span-2">
            <input
              type="checkbox"
              checked={onlineBookable}
              onChange={(event) => setOnlineBookable(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="block font-semibold text-slate-800">Patienten können diese Terminart online buchen</span>
              <span className="block mt-1 text-slate-500">Deaktivieren, wenn diese Terminart nur von der Praxis vergeben wird.</span>
            </span>
          </label>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row lg:col-span-2">
            <Button type="submit" disabled={Boolean(pendingOperation)}>
              {pendingOperation.startsWith("type:") ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              )}
              Speichern
            </Button>
            <Button type="button" variant="outline" onClick={resetEditor} disabled={Boolean(pendingOperation)}>
              Abbrechen
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-card sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Vorhandene Terminarten</h3>
          <p className="mt-1 text-sm text-slate-500">Terminarten werden deaktiviert, damit ältere Termine erhalten bleiben.</p>
        </div>
        <Button type="button" onClick={openCreateEditor} disabled={Boolean(pendingOperation)}>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Terminart hinzufügen
        </Button>
      </div>

      <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
        {appointmentTypes.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">Noch keine Terminarten vorhanden.</p>
        ) : (
          appointmentTypes.map((appointmentType) => (
            <article
              key={appointmentType.id}
              aria-label={`Terminart ${appointmentType.name}`}
              className="py-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-800">{appointmentType.name}</h4>
                    {!appointmentType.active && (
                      <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">Deaktiviert</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {appointmentType.durationMinutes} Minuten · {appointmentType.confirmationMode === "AUTO"
                      ? "Wird sofort bestätigt"
                      : "Erst durch die Praxis bestätigt"}
                  </p>
                  {appointmentType.active && (
                    <p className="mt-1 text-sm text-slate-500">
                      {appointmentType.onlineBookable ? "Online buchbar" : "Nur durch die Praxis buchbar"}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditEditor(appointmentType)}
                    disabled={Boolean(pendingOperation)}
                  >
                    <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
                    Bearbeiten
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingStatusId(appointmentType.id)}
                    disabled={Boolean(pendingOperation)}
                    className={appointmentType.active ? "text-red-700 hover:text-red-800 hover:bg-red-50" : "text-green-700 hover:text-green-800 hover:bg-green-50"}
                  >
                    {appointmentType.active ? "Terminart deaktivieren" : "Terminart reaktivieren"}
                  </Button>
                </div>
              </div>

              {confirmingStatusId === appointmentType.id && (
                <div className="flex flex-col gap-3 p-4 mt-4 border border-slate-200 rounded-xl bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-700">
                    {appointmentType.active
                      ? "Diese Terminart kann danach nicht mehr für neue Termine gewählt werden."
                      : "Diese Terminart wieder für neue Termine freigeben?"}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant={appointmentType.active ? "destructive" : "default"}
                      disabled={Boolean(pendingOperation)}
                      onClick={() => void changeActiveStatus(appointmentType)}
                    >
                      {pendingOperation === `type:status:${appointmentType.id}` && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      )}
                      {appointmentType.active ? "Deaktivieren" : "Reaktivieren"}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setConfirmingStatusId(null)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
