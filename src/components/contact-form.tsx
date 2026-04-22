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
import {
  publicContent,
  type ContactReachability,
  type ContactRequestType,
} from "@/content/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/actions";
import { EUROPEAN_COUNTRY_CODES } from "@/lib/country-codes";
import { cn } from "@/lib/utils";

type FormStatus = "idle" | "success" | "error";

interface FormValues {
  firstName: string;
  lastName: string;
  countryCode: (typeof EUROPEAN_COUNTRY_CODES)[number]["code"];
  phone: string;
  requestType: ContactRequestType | "";
  reachability: ContactReachability | "";
  details: string;
  gdprConsent: boolean;
  honeypot: string;
}

const INITIAL_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  countryCode: "+49",
  phone: "",
  requestType: "",
  reachability: "",
  details: "",
  gdprConsent: false,
  honeypot: "",
};

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
  requestType: ContactRequestType,
  reachability: ContactReachability | "",
  details: string,
) {
  const { contact } = publicContent;
  const requestTypeLabel = contact.requestTypeOptions.find((option) => option.value === requestType)?.label ?? "Sonstiges";
  const reachabilityLabel = contact.reachabilityOptions.find((option) => option.value === reachability)?.label ?? "";
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
  const { contact, practice } = publicContent;

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

    const {
      firstName,
      lastName,
      countryCode,
      phone,
      requestType,
      reachability,
      details,
      gdprConsent,
      honeypot,
    } = values;

    if (isSubmitting || requestType === "") {
      return;
    }

    setErrorMessage("");
    setFormStatus("idle");

    startSubmitTransition(async () => {
      try {
        const normalizedPhone = normalizePhone(phone);
        const result = await submitContactForm({
          firstName,
          lastName,
          countryCode,
          phone: normalizedPhone.length > 0 ? normalizedPhone : phone.replace(/\D/g, ""),
          message: buildMessage(requestType, reachability, details),
          gdprConsent,
          honeypot,
        });

        if (result.success) {
          setFormStatus("success");
          setValues(INITIAL_VALUES);
          return;
        }

        setFormStatus("error");
        setErrorMessage(result.error || contact.defaultError);
      } catch {
        setFormStatus("error");
        setErrorMessage(contact.unexpectedError);
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
          >
            <span className="mb-4 inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {contact.eyebrow}
            </span>
            <h2 className="max-w-md text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              {contact.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              {contact.description}
            </p>

            <div className="mt-8 space-y-4">
              <InfoCard icon={<Phone className="h-5 w-5 text-primary" />} label={contact.phoneLabel}>
                <a
                  href={practice.phone.href}
                  className="text-2xl font-bold tracking-tight text-slate-800 transition-colors hover:text-primary"
                >
                  {practice.phone.display}
                </a>
                <p className="mt-1 text-sm text-slate-500">
                  {practice.phone.availabilityLabel}
                </p>
              </InfoCard>

              <InfoCard icon={<MapPin className="h-5 w-5 text-primary" />} label={contact.addressLabel}>
                <address className="not-italic text-base font-semibold leading-7 text-slate-800">
                  {practice.address.singleLine}
                </address>
              </InfoCard>
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
                  {contact.successTitle}
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-green-700 sm:text-base">
                  {contact.successDescription}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  onClick={resetForm}
                >
                  {contact.successActionLabel}
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
                  <FormField label={contact.firstNameLabel} htmlFor="firstName" required>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      maxLength={50}
                      value={values.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                      placeholder={contact.firstNamePlaceholder}
                      className="bg-white"
                    />
                  </FormField>

                  <FormField label={contact.lastNameLabel} htmlFor="lastName" required>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      maxLength={50}
                      value={values.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                      placeholder={contact.lastNamePlaceholder}
                      className="bg-white"
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label={contact.phoneFieldLabel} htmlFor="phone" required>
                    <div className="flex gap-3">
                      <div className="relative w-28 flex-shrink-0">
                        <select
                          aria-label="Ländervorwahl"
                          value={values.countryCode}
                          onChange={(event) => updateField("countryCode", event.target.value as FormValues["countryCode"])}
                          className="flex h-11 w-full appearance-none rounded-xl border border-input bg-white px-4 py-2 pr-9 text-sm text-slate-700 ring-offset-background transition-all duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          {EUROPEAN_COUNTRY_CODES.map((option) => (
                            <option key={`${option.country}-${option.code}`} value={option.code}>
                              {option.country} {option.code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel-national"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={20}
                        value={values.phone}
                        onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, ""))}
                        placeholder={contact.phonePlaceholder}
                        className="bg-white"
                      />
                    </div>
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label={contact.requestTypeLabel} htmlFor="requestType" required>
                    <div className="relative">
                      <select
                        id="requestType"
                        name="requestType"
                        required
                        value={values.requestType}
                        onChange={(event) => updateField("requestType", event.target.value as ContactRequestType | "")}
                        className="flex h-11 w-full appearance-none rounded-xl border border-input bg-white px-4 py-2 pr-12 text-sm text-slate-700 ring-offset-background transition-all duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <option value="" disabled>
                          {contact.requestTypePlaceholder}
                        </option>
                        {contact.requestTypeOptions.map((option) => (
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
                    {contact.reachabilityLegend} <span className="text-slate-400">{contact.optionalLabel}</span>
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {contact.reachabilityOptions.map((option) => {
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
                              updateField("reachability", event.target.value as ContactReachability)
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
                    label={contact.detailsLabel}
                    htmlFor="details"
                    suffix={contact.optionalLabel}
                  >
                    <Textarea
                      id="details"
                      name="details"
                      maxLength={MAX_DETAILS_LENGTH}
                      value={values.details}
                      onChange={(event) => updateField("details", event.target.value)}
                      placeholder={contact.detailsPlaceholder}
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
                      {contact.submittingLabel}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {contact.submitLabel}
                    </>
                  )}
                </Button>

                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {contact.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {contact.responseTimeNotice}
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
                      {contact.gdprConsentPrefix}
                      <Link href="/datenschutz" className="font-medium text-primary hover:underline">
                        {contact.gdprConsentLinkLabel}
                      </Link>
                      {contact.gdprConsentSuffix}
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
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
