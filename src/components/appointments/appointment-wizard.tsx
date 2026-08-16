"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle,
  Clipboard,
  Loader2,
  LockKeyhole,
  Phone,
} from "lucide-react";
import {
  AppointmentSlotPicker,
  mergeAppointmentAvailabilityDays,
  type AppointmentSlotSelection,
} from "./appointment-slot-picker";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EUROPEAN_COUNTRY_CODES } from "@/lib/country-codes";
import {
  bookPublicAppointment,
  getPublicAppointmentAvailability,
} from "@/lib/actions";
import type {
  AppointmentAvailabilityDayDto,
  PublicAppointmentBookingDto,
  PublicAppointmentTypeDto,
} from "@/lib/appointments/types";
import { cn } from "@/lib/utils";
import { publicContent } from "@/content/data";

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface ContactValues {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  details: string;
  gdprConsent: boolean;
  honeypot: string;
}

const INITIAL_CONTACT_VALUES: ContactValues = {
  firstName: "",
  lastName: "",
  countryCode: "+49",
  phone: "",
  details: "",
  gdprConsent: false,
  honeypot: "",
};

const STEP_LABELS = ["Terminart", "Zeitpunkt", "Kontaktdaten", "Prüfen", "Fertig"] as const;
const MAX_DETAILS_LENGTH = 1900;

function normalizePhone(countryCode: string, phone: string) {
  const digits = phone.replace(/\D/g, "");
  const countryDigits = countryCode.replace(/\D/g, "");

  if (digits.startsWith(`00${countryDigits}`)) {
    return digits.slice(countryDigits.length + 2);
  }

  if (digits.startsWith(countryDigits) && digits.length > countryDigits.length) {
    return digits.slice(countryDigits.length);
  }

  if (digits.startsWith("0") && digits.length > 1) {
    return digits.slice(1);
  }

  return digits;
}

export function AppointmentWizard({ appointmentTypes }: { appointmentTypes: PublicAppointmentTypeDto[] }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlotSelection | null>(null);
  const [contactValues, setContactValues] = useState<ContactValues>(INITIAL_CONTACT_VALUES);
  const [availabilityDays, setAvailabilityDays] = useState<AppointmentAvailabilityDayDto[]>([]);
  const [availabilityCursor, setAvailabilityCursor] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingResult, setBookingResult] = useState<PublicAppointmentBookingDto | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [isBooking, startBookingTransition] = useTransition();

  const selectedType = appointmentTypes.find((type) => type.id === selectedTypeId) ?? null;

  function focusCurrentHeading() {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  function goToStep(nextStep: WizardStep) {
    setStep(nextStep);
    focusCurrentHeading();
  }

  function updateContactField<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setContactValues((current) => ({ ...current, [key]: value }));
  }

  async function loadAvailability({ append = false, cursor }: { append?: boolean; cursor?: string } = {}) {
    if (!selectedTypeId) {
      return;
    }

    append ? setIsLoadingMore(true) : setIsLoadingAvailability(true);
    setAvailabilityError("");

    try {
      const result = await getPublicAppointmentAvailability({
        appointmentTypeId: selectedTypeId,
        ...(cursor ? { cursor } : {}),
      });

      if (!result.success) {
        setAvailabilityError(result.error);
        return;
      }

      setAvailabilityDays((current) => append ? mergeAppointmentAvailabilityDays(current, result.data.days) : result.data.days);
      setAvailabilityCursor(result.data.nextCursor);
    } catch {
      setAvailabilityError("Freie Termine konnten nicht geladen werden. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoadingAvailability(false);
      setIsLoadingMore(false);
    }
  }

  function handleTypeContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTypeId) {
      return;
    }

    setSelectedSlot(null);
    setAvailabilityDays([]);
    setAvailabilityCursor(null);
    setBookingError("");
    goToStep(2);
    void loadAvailability();
  }

  function handleSlotContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedSlot) {
      goToStep(3);
    }
  }

  function handleContactContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToStep(4);
  }

  function handleBooking() {
    if (!selectedType || !selectedSlot || isBooking) {
      return;
    }

    setBookingError("");
    startBookingTransition(async () => {
      try {
        const result = await bookPublicAppointment({
          appointmentTypeId: selectedType.id,
          startAt: selectedSlot.startAt,
          firstName: contactValues.firstName,
          lastName: contactValues.lastName,
          countryCode: contactValues.countryCode,
          phone: normalizePhone(contactValues.countryCode, contactValues.phone),
          details: contactValues.details || undefined,
          gdprConsent: contactValues.gdprConsent,
          honeypot: contactValues.honeypot || undefined,
        });

        if (!result.success) {
          setBookingError(result.error);
          setSelectedSlot(null);
          setAvailabilityDays([]);
          setAvailabilityCursor(null);
          goToStep(2);
          await loadAvailability();
          return;
        }

        setBookingResult(result.data);
        goToStep(5);
      } catch {
        setBookingError("Die Buchung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.");
        setSelectedSlot(null);
        setAvailabilityDays([]);
        setAvailabilityCursor(null);
        goToStep(2);
        await loadAvailability();
      }
    });
  }

  async function handleCopyCode() {
    if (!bookingResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(bookingResult.managementCode);
      setCopyStatus("Zugangscode wurde kopiert.");
    } catch {
      setCopyStatus("Bitte markieren und kopieren Sie den Zugangscode manuell.");
    }
  }

  if (appointmentTypes.length === 0) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-card sm:p-12">
        <CalendarCheck className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold text-slate-800">Online-Buchung derzeit nicht verfügbar</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Aktuell sind keine Terminarten zur Online-Buchung freigeschaltet. Bitte rufen Sie uns an oder senden Sie eine Anfrage.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <a href={publicContent.practice.phone.href}><Phone className="mr-2 h-4 w-4" aria-hidden="true" />{publicContent.practice.phone.display}</a>
          </Button>
          <Button asChild variant="outline"><Link href="/#kontaktformular">Anfrage senden</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Ohne Konto und E-Mail-Adresse
        </span>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-3xl font-bold tracking-tight text-slate-800 outline-none sm:text-4xl"
        >
          {step === 5 ? "Ihre Buchung ist eingegangen" : "Termin online buchen"}
        </h1>
        {step < 5 && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Wählen Sie einen angezeigten freien Termin. Die Verfügbarkeit wird beim Abschluss nochmals sicher geprüft.
          </p>
        )}
      </div>

      <nav aria-label="Buchungsfortschritt" className="mb-8 overflow-x-auto pb-2">
        <ol className="mx-auto flex min-w-[36rem] max-w-3xl items-center justify-between gap-2">
          {STEP_LABELS.map((label, index) => {
            const number = (index + 1) as WizardStep;
            const completed = number < step;
            const active = number === step;
            return (
              <li key={label} className="flex flex-1 items-center last:flex-none" aria-current={active ? "step" : undefined}>
                <span className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                    active && "border-primary bg-primary text-white",
                    completed && "border-green-600 bg-green-600 text-white",
                    !active && !completed && "border-slate-300 bg-white text-slate-500",
                  )}>
                    {completed ? <Check className="h-4 w-4" aria-hidden="true" /> : number}
                  </span>
                  <span className={cn("text-xs font-semibold", active ? "text-primary" : "text-slate-500")}>{label}</span>
                </span>
                {index < STEP_LABELS.length - 1 && <span className="mx-3 h-px flex-1 bg-slate-200" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        {step === 1 && (
          <form onSubmit={handleTypeContinue}>
            <fieldset>
              <legend className="text-xl font-bold text-slate-800">Welche Terminart benötigen Sie?</legend>
              <p className="mt-2 text-sm leading-6 text-slate-500">Die angezeigte Dauer und Bestätigungsart kommen direkt aus der Praxiskonfiguration.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {appointmentTypes.map((type) => {
                  const selected = selectedTypeId === type.id;
                  return (
                    <label
                      key={type.id}
                      className={cn(
                        "cursor-pointer rounded-2xl border-2 bg-white p-5 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                        selected ? "border-primary bg-primary-50" : "border-slate-200 hover:border-primary/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="appointmentType"
                        value={type.id}
                        checked={selected}
                        onChange={() => setSelectedTypeId(type.id)}
                        className="sr-only"
                        required
                      />
                      <span className="block text-lg font-bold text-slate-800">{type.name}</span>
                      {type.description && <span className="mt-2 block text-sm leading-6 text-slate-600">{type.description}</span>}
                      <span className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">ca. {type.durationMinutes} Minuten</span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                          {type.confirmationMode === "AUTO" ? "Direkt bestätigt" : "Bestätigung durch die Praxis"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="mt-8 flex justify-end">
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!selectedTypeId}>
                Freie Termine anzeigen<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}

        {step === 2 && selectedType && (
          <form onSubmit={handleSlotContinue}>
            <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Terminart</p>
                <p className="mt-1 font-bold text-slate-800">{selectedType.name}</p>
              </div>
              <Button type="button" variant="link" className="h-auto justify-start p-0 sm:justify-center" onClick={() => goToStep(1)}>
                Ändern
              </Button>
            </div>

            {bookingError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert">
                <p>{bookingError}</p>
                <p className="mt-1">Die bisherige Auswahl wurde verworfen. Bitte wählen Sie einen neu angezeigten Zeitpunkt.</p>
              </div>
            )}

            <AppointmentSlotPicker
              days={availabilityDays}
              selectedStartAt={selectedSlot?.startAt ?? null}
              onSelect={(slot) => {
                setSelectedSlot(slot);
                setBookingError("");
              }}
              isLoading={isLoadingAvailability}
              error={availabilityError}
              hasMore={Boolean(availabilityCursor)}
              isLoadingMore={isLoadingMore}
              onLoadMore={() => void loadAvailability({ append: true, cursor: availabilityCursor ?? undefined })}
              inputName="bookingSlot"
            />

            {availabilityError && (
              <Button type="button" variant="outline" className="mt-4" onClick={() => void loadAvailability()}>
                Erneut laden
              </Button>
            )}

            <p className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Der gewählte Zeitpunkt wird erst beim Abschluss serverseitig reserviert. Sollte er zwischenzeitlich vergeben sein, können Sie einen anderen freien Termin wählen.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => goToStep(1)}><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Zurück</Button>
              <Button type="submit" disabled={!selectedSlot}>Weiter zu den Kontaktdaten<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleContactContinue}>
            <h2 className="text-xl font-bold text-slate-800">Wie können wir Sie erreichen?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Wir benötigen nur Ihren Namen und eine Telefonnummer – keine E-Mail-Adresse.</p>

            <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="appointment-website">Website</label>
              <input
                id="appointment-website"
                type="text"
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                value={contactValues.honeypot}
                onChange={(event) => updateContactField("honeypot", event.target.value)}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FormField label="Vorname" htmlFor="appointment-first-name" required>
                <Input id="appointment-first-name" required maxLength={50} autoComplete="given-name" value={contactValues.firstName} onChange={(event) => updateContactField("firstName", event.target.value)} />
              </FormField>
              <FormField label="Nachname" htmlFor="appointment-last-name" required>
                <Input id="appointment-last-name" required maxLength={50} autoComplete="family-name" value={contactValues.lastName} onChange={(event) => updateContactField("lastName", event.target.value)} />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Telefonnummer" htmlFor="appointment-phone" required>
                <div className="flex gap-3">
                  <select
                    aria-label="Ländervorwahl"
                    value={contactValues.countryCode}
                    onChange={(event) => updateContactField("countryCode", event.target.value)}
                    className="h-11 w-28 shrink-0 rounded-xl border border-input bg-white px-3 text-sm text-slate-700 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {EUROPEAN_COUNTRY_CODES.map((option) => <option key={`${option.country}-${option.code}`} value={option.code}>{option.country} {option.code}</option>)}
                  </select>
                  <Input
                    id="appointment-phone"
                    type="tel"
                    required
                    autoComplete="tel-national"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={20}
                    value={contactValues.phone}
                    onChange={(event) => updateContactField("phone", event.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Hinweis für die Praxis" htmlFor="appointment-details" suffix="(optional)">
                <Textarea id="appointment-details" maxLength={MAX_DETAILS_LENGTH} value={contactValues.details} onChange={(event) => updateContactField("details", event.target.value)} />
              </FormField>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
              <input
                type="checkbox"
                required
                checked={contactValues.gdprConsent}
                onChange={(event) => updateContactField("gdprConsent", event.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm leading-6 text-slate-600">
                Ich stimme zu, dass meine Angaben zur Buchung und Verwaltung des Termins gespeichert werden. Weitere Informationen in der <Link href="/datenschutz" className="font-semibold text-primary hover:underline">Datenschutzerklärung</Link>.
              </span>
            </label>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => goToStep(2)}><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Zurück</Button>
              <Button type="submit">Angaben prüfen<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button>
            </div>
          </form>
        )}

        {step === 4 && selectedType && selectedSlot && (
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bitte prüfen Sie Ihre Angaben</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Erst mit dem folgenden Button wird der Zeitpunkt verbindlich serverseitig reserviert.</p>

            <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              <SummaryRow label="Terminart" value={`${selectedType.name} · ca. ${selectedType.durationMinutes} Minuten`} onEdit={() => goToStep(1)} />
              <SummaryRow label="Zeitpunkt" value={`${selectedSlot.dateLabel}, ${selectedSlot.startLabel} – ${selectedSlot.endLabel} Uhr`} onEdit={() => goToStep(2)} />
              <SummaryRow label="Name" value={`${contactValues.firstName} ${contactValues.lastName}`} onEdit={() => goToStep(3)} />
              <SummaryRow label="Telefon" value={`${contactValues.countryCode} ${contactValues.phone}`} onEdit={() => goToStep(3)} />
              {contactValues.details && <SummaryRow label="Hinweis" value={contactValues.details} onEdit={() => goToStep(3)} />}
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => goToStep(3)} disabled={isBooking}><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Zurück</Button>
              <Button type="button" size="lg" onClick={handleBooking} disabled={isBooking}>
                {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <LockKeyhole className="mr-2 h-4 w-4" aria-hidden="true" />}
                {isBooking ? "Buchung wird geprüft …" : "Buchung abschließen"}
              </Button>
            </div>
          </div>
        )}

        {step === 5 && bookingResult && (
          <div className="text-center" aria-live="polite">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <div className="mt-5"><AppointmentStatusBadge status={bookingResult.appointment.status} /></div>
            <h2 className="mt-4 text-2xl font-bold text-slate-800">
              {bookingResult.appointment.status === "CONFIRMED"
                ? "Ihr Termin ist bestätigt"
                : bookingResult.appointment.status === "PENDING"
                  ? "Ihre Buchung wartet auf Bestätigung"
                  : "Der Buchungsstatus wurde aktualisiert"}
            </h2>
            <p className="mt-3 text-slate-600">
              {bookingResult.appointment.typeName}<br />
              <strong>{bookingResult.appointment.dateLabel}, {bookingResult.appointment.startLabel} – {bookingResult.appointment.endLabel} Uhr</strong>
            </p>

            <div className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-primary bg-primary-50 p-6">
              <p className="text-sm font-semibold text-primary">Ihr persönlicher Zugangscode</p>
              <code className="mt-3 block break-all text-2xl font-bold tracking-[0.18em] text-slate-900 sm:text-3xl">
                {bookingResult.managementCode}
              </code>
              <Button type="button" variant="outline" className="mt-5 bg-white" onClick={() => void handleCopyCode()}>
                <Clipboard className="mr-2 h-4 w-4" aria-hidden="true" />Code kopieren
              </Button>
              <p className="mt-3 min-h-5 text-sm text-slate-600" role="status">{copyStatus}</p>
            </div>

            <div className="mx-auto mt-5 flex max-w-xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm leading-6 text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p><strong>Bitte jetzt sicher speichern.</strong> Der Code wird nur auf dieser Bestätigungsseite angezeigt. Sie benötigen ihn, um den Termin später aufzurufen, zu verschieben oder abzusagen.</p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg"><Link href="/termin"><CalendarCheck className="mr-2 h-4 w-4" aria-hidden="true" />Termin verwalten</Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/">Zur Startseite</Link></Button>
            </div>
          </div>
        )}
      </div>

      {step < 5 && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Benötigen Sie Hilfe? <a href={publicContent.practice.phone.href} className="font-semibold text-primary hover:underline">{publicContent.practice.phone.display} anrufen</a>
        </p>
      )}
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  children,
  required = false,
  suffix,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span aria-hidden="true">*</span>}{suffix && <span className="text-slate-400"> {suffix}</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-4 text-left sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
      </div>
      <Button type="button" variant="link" size="sm" className="h-auto justify-start p-0 sm:justify-center" onClick={onEdit}>Ändern</Button>
    </div>
  );
}
