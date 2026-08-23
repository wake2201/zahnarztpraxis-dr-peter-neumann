"use client";

import {
  type FormEvent,
  type MouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronLeft, Loader2, X } from "lucide-react";
import { AdminAvailabilityPicker } from "./admin-availability-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAdminAppointment, getAdminAppointmentAvailability } from "@/lib/actions";
import { EUROPEAN_COUNTRY_CODES } from "@/lib/country-codes";
import type {
  AppointmentAvailabilityDto,
  AppointmentStatusValue,
  PublicAppointmentTypeDto,
} from "@/lib/appointments/types";
import { cn } from "@/lib/utils";

type DialogStage = "type" | "time" | "patient";

interface AvailabilityRequest {
  appointmentTypeId: string;
  cursor?: string;
  append: boolean;
}

export interface NewAppointmentDialogProps {
  open: boolean;
  appointmentTypes: PublicAppointmentTypeDto[];
  onClose: () => void;
  onCreated: (status: AppointmentStatusValue) => void | Promise<void>;
}

const STAGES: Array<{ id: DialogStage; label: string }> = [
  { id: "type", label: "Terminart" },
  { id: "time", label: "Zeit" },
  { id: "patient", label: "Patient" },
];

const MAX_DETAILS_LENGTH = 1900;
const AVAILABILITY_ERROR =
  "Freie Termine konnten nicht geladen werden. Bitte versuchen Sie es erneut.";

function mergeAvailability(
  current: AppointmentAvailabilityDto | null,
  incoming: AppointmentAvailabilityDto,
): AppointmentAvailabilityDto {
  if (!current) {
    return incoming;
  }

  const days = new Map(current.days.map((day) => [day.date, { ...day, slots: [...day.slots] }]));

  for (const day of incoming.days) {
    const existing = days.get(day.date);
    if (!existing) {
      days.set(day.date, { ...day, slots: [...day.slots] });
      continue;
    }

    const knownStarts = new Set(existing.slots.map((slot) => slot.startAt));
    existing.slots.push(...day.slots.filter((slot) => !knownStarts.has(slot.startAt)));
  }

  return { days: Array.from(days.values()), nextCursor: incoming.nextCursor };
}

export function NewAppointmentDialog({
  open,
  appointmentTypes,
  onClose,
  onCreated,
}: NewAppointmentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const availabilityRequestIdRef = useRef(0);
  const lastAvailabilityRequestRef = useRef<AvailabilityRequest | null>(null);
  const creationRequestIdRef = useRef(0);
  const creatingRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  const [stage, setStage] = useState<DialogStage>("type");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedStartAt, setSelectedStartAt] = useState("");
  const [availability, setAvailability] = useState<AppointmentAvailabilityDto | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+49");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [creationError, setCreationError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedType = appointmentTypes.find((type) => type.id === selectedTypeId) ?? null;
  const selectedSlot = useMemo(() => {
    for (const day of availability?.days ?? []) {
      const slot = day.slots.find((candidate) => candidate.startAt === selectedStartAt);
      if (slot) {
        return { ...slot, dateLabel: day.dateLabel };
      }
    }

    return null;
  }, [availability, selectedStartAt]);

  const currentStageIndex = STAGES.findIndex((item) => item.id === stage);
  const isFormComplete = Boolean(
    selectedType
      && selectedStartAt
      && firstName.trim()
      && lastName.trim()
      && countryCode
      && phone
      && gdprConsent,
  );

  const resetDialog = useCallback(() => {
    availabilityRequestIdRef.current += 1;
    creationRequestIdRef.current += 1;
    lastAvailabilityRequestRef.current = null;
    creatingRef.current = false;
    setStage("type");
    setSelectedTypeId("");
    setSelectedStartAt("");
    setAvailability(null);
    setAvailabilityError("");
    setIsLoadingAvailability(false);
    setIsLoadingMore(false);
    setFirstName("");
    setLastName("");
    setCountryCode("+49");
    setPhone("");
    setDetails("");
    setGdprConsent(false);
    setCreationError("");
    setIsCreating(false);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    let focusFrame = 0;

    if (open) {
      resetDialog();
      if (!dialog.open) {
        dialog.showModal();
      }
      focusFrame = window.requestAnimationFrame(() => titleRef.current?.focus());
    } else {
      availabilityRequestIdRef.current += 1;
      if (dialog.open) {
        dialog.close();
      }
    }

    return () => {
      if (focusFrame) {
        window.cancelAnimationFrame(focusFrame);
      }
    };
  }, [open, resetDialog]);

  function focusStageHeading() {
    window.requestAnimationFrame(() => stageHeadingRef.current?.focus());
  }

  function requestClose() {
    if (creatingRef.current) {
      return;
    }

    availabilityRequestIdRef.current += 1;
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    onClose();
  }

  function handleDialogCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    requestClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget || creatingRef.current) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const outsideDialog = event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom;

    if (outsideDialog) {
      requestClose();
    }
  }

  async function loadAvailability(request: AvailabilityRequest) {
    const requestId = ++availabilityRequestIdRef.current;
    lastAvailabilityRequestRef.current = request;
    setAvailabilityError("");

    if (request.append) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingAvailability(true);
      setAvailability(null);
    }

    try {
      const result = await getAdminAppointmentAvailability({
        appointmentTypeId: request.appointmentTypeId,
        ...(request.cursor ? { cursor: request.cursor } : {}),
      });

      if (requestId !== availabilityRequestIdRef.current) {
        return;
      }

      if (!result.success) {
        setAvailabilityError(AVAILABILITY_ERROR);
        return;
      }

      setAvailability((current) => request.append
        ? mergeAvailability(current, result.data)
        : result.data);
    } catch {
      if (requestId === availabilityRequestIdRef.current) {
        setAvailabilityError(AVAILABILITY_ERROR);
      }
    } finally {
      if (requestId === availabilityRequestIdRef.current) {
        setIsLoadingAvailability(false);
        setIsLoadingMore(false);
      }
    }
  }

  function selectAppointmentType(appointmentTypeId: string) {
    setSelectedTypeId(appointmentTypeId);
    setSelectedStartAt("");
    setAvailability(null);
    setCreationError("");
    setStage("time");
    focusStageHeading();
    void loadAvailability({ appointmentTypeId, append: false });
  }

  function showTypeStage() {
    availabilityRequestIdRef.current += 1;
    lastAvailabilityRequestRef.current = null;
    setIsLoadingAvailability(false);
    setIsLoadingMore(false);
    setAvailabilityError("");
    setAvailability(null);
    setSelectedStartAt("");
    setCreationError("");
    setStage("type");
    focusStageHeading();
  }

  function showTimeStage() {
    setCreationError("");
    setStage("time");
    focusStageHeading();
  }

  function selectAppointmentTime(startAt: string) {
    setSelectedStartAt(startAt);
    setCreationError("");
    setStage("patient");
    window.requestAnimationFrame(() => firstNameRef.current?.focus());
  }

  function retryAvailability() {
    const request = lastAvailabilityRequestRef.current;
    if (request) {
      void loadAvailability(request);
    }
  }

  async function handleCreateAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormComplete || !selectedType || creatingRef.current) {
      return;
    }

    creatingRef.current = true;
    const creationRequestId = ++creationRequestIdRef.current;
    setIsCreating(true);
    setCreationError("");

    try {
      const result = await createAdminAppointment({
        appointmentTypeId: selectedType.id,
        startAt: selectedStartAt,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        countryCode,
        phone,
        ...(details.trim() ? { details: details.trim() } : {}),
        gdprConsent,
      });

      if (!result.success) {
        if (creationRequestId !== creationRequestIdRef.current) {
          return;
        }
        setCreationError(result.error || "Der Termin konnte nicht eingetragen werden.");
        setSelectedStartAt("");
        setStage("time");
        focusStageHeading();
        creatingRef.current = false;
        setIsCreating(false);
        void loadAvailability({ appointmentTypeId: selectedType.id, append: false });
        return;
      }

      try {
        await onCreated(result.data.status);
      } catch {
        if (creationRequestId === creationRequestIdRef.current) {
          onClose();
        }
      }
    } catch {
      if (creationRequestId !== creationRequestIdRef.current) {
        return;
      }
      setCreationError("Der Termin konnte nicht eingetragen werden. Bitte versuchen Sie es erneut.");
      setSelectedStartAt("");
      setStage("time");
      focusStageHeading();
      creatingRef.current = false;
      setIsCreating(false);
      void loadAvailability({ appointmentTypeId: selectedType.id, append: false });
    } finally {
      if (creationRequestId === creationRequestIdRef.current) {
        creatingRef.current = false;
        setIsCreating(false);
      }
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-testid="new-appointment-dialog"
      onCancel={handleDialogCancel}
      onClick={handleBackdropClick}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-3xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] min-w-0 flex-col overflow-hidden rounded-3xl bg-white">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              ref={titleRef}
              id={titleId}
              tabIndex={-1}
              className="text-xl font-bold text-slate-800 outline-none sm:text-2xl"
            >
              Neuer Termin
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-slate-500">
              Terminart, freie Zeit und Patientendaten auswählen.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={requestClose}
            disabled={isCreating}
            aria-label="Dialog schließen"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <nav className="shrink-0 border-b border-slate-100 px-4 py-3 sm:px-6" aria-label="Fortschritt">
          <ol className="grid grid-cols-3 gap-2">
            {STAGES.map((item, index) => {
              const active = item.id === stage;
              const complete = index < currentStageIndex;

              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex min-w-0 items-center gap-2 text-xs font-semibold sm:text-sm",
                    active ? "text-primary" : "text-slate-500",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      active && "border-primary bg-primary text-white",
                      complete && "border-green-600 bg-green-600 text-white",
                      !active && !complete && "border-slate-300 bg-white",
                    )}
                    aria-hidden="true"
                  >
                    {complete ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className="truncate">{item.label}</span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6">
          {creationError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              {creationError}
            </div>
          )}

          {stage === "type" && (
            <section aria-labelledby={`${titleId}-type`}>
              <h3
                ref={stageHeadingRef}
                id={`${titleId}-type`}
                tabIndex={-1}
                className="text-lg font-bold text-slate-800 outline-none"
              >
                Welche Terminart?
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Eine Auswahl lädt automatisch die nächsten freien Zeiten.
              </p>

              {appointmentTypes.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="status">
                  Es ist noch keine aktive Terminart eingerichtet.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {appointmentTypes.map((appointmentType) => {
                    const selected = appointmentType.id === selectedTypeId;

                    return (
                      <button
                        key={appointmentType.id}
                        type="button"
                        onClick={() => selectAppointmentType(appointmentType.id)}
                        aria-pressed={selected}
                        className={cn(
                          "min-w-0 rounded-2xl border-2 bg-white p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 hover:border-primary/40 hover:bg-slate-50",
                        )}
                      >
                        <span className="block break-words text-base font-bold text-slate-800">
                          {appointmentType.name}
                        </span>
                        {appointmentType.description && (
                          <span className="mt-1 block break-words text-sm leading-5 text-slate-500">
                            {appointmentType.description}
                          </span>
                        )}
                        <span className="mt-3 block text-sm font-medium text-slate-600">
                          ca. {appointmentType.durationMinutes} Minuten
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-primary">
                          {appointmentType.confirmationMode === "AUTO"
                            ? "Wird direkt bestätigt"
                            : "Muss von der Praxis bestätigt werden"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={requestClose}>
                  Abbrechen
                </Button>
              </div>
            </section>
          )}

          {stage === "time" && selectedType && (
            <section aria-labelledby={`${titleId}-time`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3
                    ref={stageHeadingRef}
                    id={`${titleId}-time`}
                    tabIndex={-1}
                    className="text-lg font-bold text-slate-800 outline-none"
                  >
                    Freie Uhrzeit auswählen
                  </h3>
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {selectedType.name} · ca. {selectedType.durationMinutes} Minuten
                  </p>
                </div>
                <Button type="button" variant="ghost" size="xs" className="self-start" onClick={showTypeStage}>
                  Terminart ändern
                </Button>
              </div>

              <div className="mt-5">
                <AdminAvailabilityPicker
                  availability={availability}
                  selectedStartAt={selectedStartAt}
                  error={availabilityError}
                  loading={isLoadingAvailability}
                  loadingMore={isLoadingMore}
                  onSelect={selectAppointmentTime}
                  onRetry={retryAvailability}
                  onLoadMore={(cursor) => void loadAvailability({
                    appointmentTypeId: selectedType.id,
                    cursor,
                    append: true,
                  })}
                />
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Die ausgewählte Zeit wird beim Eintragen nochmals geprüft.
              </p>
              <div className="mt-6">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={showTypeStage}>
                  <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Zur Terminart
                </Button>
              </div>
            </section>
          )}

          {stage === "patient" && selectedType && selectedSlot && (
            <section aria-labelledby={`${titleId}-patient`}>
              <h3
                ref={stageHeadingRef}
                id={`${titleId}-patient`}
                tabIndex={-1}
                className="text-lg font-bold text-slate-800 outline-none"
              >
                Patientendaten
              </h3>
              <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-bold text-slate-800">{selectedType.name}</p>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    {selectedSlot.dateLabel}, {selectedSlot.startLabel}–{selectedSlot.endLabel} Uhr
                  </p>
                </div>
                <Button type="button" variant="ghost" size="xs" className="self-start" onClick={showTimeStage} disabled={isCreating}>
                  Zeit ändern
                </Button>
              </div>

              <form className="mt-5" onSubmit={handleCreateAppointment}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Vorname" htmlFor={`${titleId}-first-name`} required>
                    <Input
                      ref={firstNameRef}
                      id={`${titleId}-first-name`}
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      autoComplete="given-name"
                      maxLength={50}
                      required
                      disabled={isCreating}
                    />
                  </FormField>
                  <FormField label="Nachname" htmlFor={`${titleId}-last-name`} required>
                    <Input
                      id={`${titleId}-last-name`}
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      autoComplete="family-name"
                      maxLength={50}
                      required
                      disabled={isCreating}
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label="Telefon" htmlFor={`${titleId}-phone`} required>
                    <div className="flex min-w-0 gap-2">
                      <select
                        aria-label="Ländervorwahl"
                        value={countryCode}
                        onChange={(event) => setCountryCode(event.target.value)}
                        className="h-11 w-24 shrink-0 rounded-xl border border-input bg-white px-2 text-sm text-slate-700 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-28"
                        disabled={isCreating}
                        required
                      >
                        {EUROPEAN_COUNTRY_CODES.map((country) => (
                          <option key={`${country.country}-${country.code}`} value={country.code}>
                            {country.country} {country.code}
                          </option>
                        ))}
                      </select>
                      <Input
                        id={`${titleId}-phone`}
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                        autoComplete="tel-national"
                        inputMode="numeric"
                        pattern="[0-9]+"
                        maxLength={20}
                        required
                        disabled={isCreating}
                        className="min-w-0"
                      />
                    </div>
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label="Notiz" htmlFor={`${titleId}-details`} suffix="(optional)">
                    <Textarea
                      id={`${titleId}-details`}
                      value={details}
                      onChange={(event) => setDetails(event.target.value)}
                      maxLength={MAX_DETAILS_LENGTH}
                      disabled={isCreating}
                      className="min-h-24"
                    />
                  </FormField>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={(event) => setGdprConsent(event.target.checked)}
                    required
                    disabled={isCreating}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm leading-6 text-slate-700">
                    Der Patient hat der Verarbeitung seiner Termindaten zugestimmt.
                  </span>
                </label>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="outline" onClick={showTimeStage} disabled={isCreating}>
                    <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    Zurück
                  </Button>
                  <Button type="submit" size="lg" disabled={!isFormComplete || isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                    {isCreating ? "Termin wird eingetragen …" : "Termin eintragen"}
                  </Button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </dialog>
  );
}

function FormField({
  label,
  htmlFor,
  suffix,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  suffix?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="sr-only"> (Pflichtfeld)</span>}
        {suffix && <span className="ml-1 font-normal text-slate-400">{suffix}</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
