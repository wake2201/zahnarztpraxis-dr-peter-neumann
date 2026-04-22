"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useRef, useState, useTransition } from "react";
import { motion, useInView } from "framer-motion";
import {
  Check,
  CheckCircle,
  ChevronDown,
  Loader2,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/actions";
import { cn } from "@/lib/utils";

type FormStatus = "idle" | "success" | "error";

type RequestType = "appointment" | "callback" | "prescription" | "other";
type Reachability = "morning" | "afternoon" | "flexible";

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  requestType: RequestType | "";
  reachability: Reachability | "";
  details: string;
  gdprConsent: boolean;
  honeypot: string;
}

const INITIAL_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  requestType: "",
  reachability: "",
  details: "",
  gdprConsent: false,
  honeypot: "",
};

const REQUEST_TYPE_OPTIONS: Array<{ value: RequestType; label: string }> = [
  { value: "appointment", label: "Termin vereinbaren" },
  { value: "callback", label: "Rückruf gewünscht" },
  { value: "prescription", label: "Rezept / Überweisung" },
  { value: "other", label: "Sonstiges" },
];

const REACHABILITY_OPTIONS: Array<{ value: Reachability; label: string }> = [
  { value: "morning", label: "vormittags" },
  { value: "afternoon", label: "nachmittags" },
  { value: "flexible", label: "egal" },
];

const BENEFITS = [
  "Unverbindlich",
  "Schnelle Rückmeldung",
  "Kein Konto erforderlich",
] as const;

const MAX_DETAILS_LENGTH = 1900;

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0049")) {
    return digits.slice(4);
  }

  if (digits.startsWith("49") && digits.length > 2) {
    return digits.slice(2);
  }

  if (digits.startsWith("0") && digits.length > 1) {
    return digits.slice(1);
  }

  return digits;
}

function buildMessage(
  requestType: RequestType,
  reachability: Reachability | "",
  details: string,
) {
  const requestTypeLabel = REQUEST_TYPE_OPTIONS.find((option) => option.value === requestType)?.label ?? "Sonstiges";
  const reachabilityLabel = REACHABILITY_OPTIONS.find((option) => option.value === reachability)?.label ?? "";
  const trimmedDetails = details.trim();

  const segments = [`Anliegen: ${requestTypeLabel}.`];

  if (reachabilityLabel) {
    segments.push(`Erreichbarkeit: ${reachabilityLabel}.`);
  }

  if (trimmedDetails) {
    segments.push(`Zusätzliche Informationen: ${trimmedDetails}`);
  }

  return segments.join(" ");
}

export function ContactForm() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSubmitting, startSubmitTransition] = useTransition();

  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setValues(INITIAL_VALUES);
    setErrorMessage("");
    setFormStatus("idle");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || values.requestType === "") {
      return;
    }

    setErrorMessage("");
    setFormStatus("idle");

    startSubmitTransition(async () => {
      try {
        const normalizedPhone = normalizePhone(values.phone);
        const result = await submitContactForm({
          firstName: values.firstName,
          lastName: values.lastName,
          countryCode: "+49",
          phone: normalizedPhone.length > 0 ? normalizedPhone : values.phone.replace(/\D/g, ""),
          message: buildMessage(values.requestType, values.reachability, values.details),
          gdprConsent: values.gdprConsent,
          honeypot: values.honeypot,
        });

        if (result.success) {
          setFormStatus("success");
          setValues(INITIAL_VALUES);
          return;
        }

        setFormStatus("error");
        setErrorMessage(result.error || "Ein Fehler ist aufgetreten.");
      } catch {
        setFormStatus("error");
        setErrorMessage("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      }
    });
  }

  return (
    <section id="kontakt" ref={ref} className="bg-white py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-8 text-white shadow-card sm:px-8 sm:py-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,160,206,0.32),_transparent_45%)]" />
            <div className="absolute -right-16 top-24 h-44 w-44 rounded-full border border-white/10" />
            <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

            <div className="relative">
              <span className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
                Kontakt
              </span>
              <h2 className="max-w-md text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Termine online anfragen
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                Kein langes Warten am Telefon – senden Sie uns Ihre Anfrage bequem online.
                Wir melden uns schnellstmöglich bei Ihnen zurück.
              </p>

              <div className="mt-8 space-y-4">
                <InfoCard
                  icon={<Phone className="h-5 w-5 text-primary-200" />}
                  label="Telefon"
                  cardClassName="border-white/10 bg-white/10"
                  labelClassName="text-white/70"
                >
                  <a
                    href="tel:03441223786"
                    className="text-2xl font-bold tracking-tight text-white transition-colors hover:text-primary-100"
                  >
                    03441 223786
                  </a>
                  <p className="mt-1 text-sm text-white/70">
                    Während der Sprechzeiten erreichbar
                  </p>
                </InfoCard>

                <InfoCard
                  icon={<MapPin className="h-5 w-5 text-primary-200" />}
                  label="Adresse"
                  cardClassName="border-white/10 bg-white/5"
                  labelClassName="text-white/70"
                >
                  <address className="not-italic text-base font-semibold leading-7 text-white">
                    Platz der Deutschen Einheit 5, 06712 Zeitz
                  </address>
                </InfoCard>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {formStatus === "success" ? (
              <div className="rounded-[2rem] border border-green-200 bg-green-50 p-8 text-center shadow-card sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-900">
                  Vielen Dank für Ihre Anfrage!
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-green-700 sm:text-base">
                  Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb
                  von 24 Stunden bei Ihnen zurück.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  onClick={resetForm}
                >
                  Neue Anfrage senden
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="relative rounded-[2rem] border border-slate-100 bg-slate-50 p-6 shadow-card sm:p-8"
              >
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    aria-hidden="true"
                    autoComplete="off"
                    value={values.honeypot}
                    onChange={(event) => updateField("honeypot", event.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Vorname" htmlFor="firstName" required>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      maxLength={50}
                      value={values.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                      placeholder="Ihr Vorname"
                      className="bg-white"
                    />
                  </FormField>

                  <FormField label="Nachname" htmlFor="lastName" required>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      maxLength={50}
                      value={values.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                      placeholder="Ihr Nachname"
                      className="bg-white"
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label="Telefonnummer" htmlFor="phone" required>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={30}
                      value={values.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      placeholder="03441 223786"
                      className="bg-white"
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label="Anliegen" htmlFor="requestType" required>
                    <div className="relative">
                      <select
                        id="requestType"
                        name="requestType"
                        required
                        value={values.requestType}
                        onChange={(event) => updateField("requestType", event.target.value as RequestType | "")}
                        className="flex h-11 w-full appearance-none rounded-xl border border-input bg-white px-4 py-2 pr-12 text-sm text-slate-700 ring-offset-background transition-all duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <option value="" disabled>
                          Bitte auswählen
                        </option>
                        {REQUEST_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </FormField>
                </div>

                <fieldset className="mt-6">
                  <legend className="text-sm font-medium text-slate-700">
                    Wann sind Sie erreichbar? <span className="text-slate-400">(optional)</span>
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {REACHABILITY_OPTIONS.map((option) => {
                      const isSelected = values.reachability === option.value;

                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary-50 text-primary shadow-sm"
                              : "border-slate-200 hover:border-primary/30 hover:bg-primary-50/40",
                          )}
                        >
                          <input
                            type="radio"
                            name="reachability"
                            value={option.value}
                            checked={isSelected}
                            onChange={(event) =>
                              updateField("reachability", event.target.value as Reachability)
                            }
                            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-6">
                  <FormField
                    label="Zusätzliche Informationen"
                    htmlFor="details"
                    suffix="(optional)"
                  >
                    <Textarea
                      id="details"
                      name="details"
                      maxLength={MAX_DETAILS_LENGTH}
                      value={values.details}
                      onChange={(event) => updateField("details", event.target.value)}
                      placeholder="Beschreiben Sie kurz Ihr Anliegen…"
                      className="min-h-[144px] bg-white"
                    />
                  </FormField>
                </div>

                {formStatus === "error" && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Anfrage absenden
                    </>
                  )}
                </Button>

                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {BENEFITS.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
                  </p>
                  <label className="mt-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      required
                      checked={values.gdprConsent}
                      onChange={(event) => updateField("gdprConsent", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm leading-6 text-slate-600">
                      Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert
                      werden. Weitere Informationen in der{" "}
                      <Link href="/datenschutz" className="font-medium text-primary hover:underline">
                        Datenschutzerklärung
                      </Link>
                      .
                    </span>
                  </label>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
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
  children: ReactNode;
  required?: boolean;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span aria-hidden="true">*</span>}
        {suffix && <span className="text-slate-400"> {suffix}</span>}
      </label>
      {children}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
  cardClassName,
  labelClassName,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  cardClassName?: string;
  labelClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm",
        cardClassName,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
          {icon}
        </div>
        <div>
          <p className={cn("text-sm", labelClassName)}>{label}</p>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
