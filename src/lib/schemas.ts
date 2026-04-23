import { z } from "zod";
import { EUROPEAN_COUNTRY_CODES } from "./country-codes";

// ============================================================================
// FEHLERMELDUNGEN - Zentralisiert fuer potenzielle i18n-Migration
// ============================================================================

export const ERROR_MESSAGES = {
  // Kontaktformular
  firstNameRequired: "Vorname ist erforderlich.",
  firstNameTooLong: "Vorname ist zu lang (max. 50 Zeichen).",
  lastNameRequired: "Nachname ist erforderlich.",
  lastNameTooLong: "Nachname ist zu lang (max. 50 Zeichen).",
  phoneRequired: "Telefonnummer ist erforderlich.",
  phoneTooLong: "Telefonnummer ist zu lang (max. 20 Zeichen).",
  phoneInvalid: "Bitte geben Sie eine gültige Telefonnummer ein.",
  messageTooLong: "Nachricht ist zu lang (max. 2000 Zeichen).",
  gdprConsentRequired: "Bitte stimmen Sie der Datenschutzerklärung zu.",
  invalidInput: "Ungültige Eingabe.",
  rateLimited: "Ihre Anfrage wurde bereits gesendet. Bitte warten Sie, bevor Sie eine weitere Nachricht senden.",
  unexpectedError: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",

  // Benutzerverwaltung
  nameRequired: "Name ist erforderlich.",
  nameTooLong: "Name ist zu lang.",
  emailInvalid: "Ungültige E-Mail-Adresse.",
  passwordTooShort: "Passwort muss mindestens 8 Zeichen lang sein.",
  passwordComplexity: "Passwort muss mindestens 1 Großbuchstaben, 1 Kleinbuchstaben, 1 Ziffer und 1 Sonderzeichen enthalten.",
  emailDuplicate: "Ein Benutzer mit dieser E-Mail existiert bereits.",

  // Auth & Admin
  unauthorized: "Nicht autorisiert",
  adminOnly: "Nur Administratoren können diese Aktion ausführen",
  selfDeleteBlocked: "Sie können Ihren eigenen Account nicht löschen.",
  adminDeleteBlocked: "Admin-Accounts können nicht gelöscht werden.",
  userNotFound: "Benutzer nicht gefunden.",
  requestNotFound: "Anfrage nicht gefunden.",

  // Generische Action-Fehler
  statusUpdateFailed: "Status konnte nicht aktualisiert werden.",
  requestDeleteFailed: "Anfrage konnte nicht geloescht werden.",
  userCreateFailed: "Ein unerwarteter Fehler ist aufgetreten.",
  userDeleteFailed: "Benutzer konnte nicht geloescht werden.",
} as const;

// ============================================================================
// INPUT SANITIZATION - XSS Defense-in-Depth
// ============================================================================

/**
 * Entfernt HTML-Tags und Null-Bytes aus User-Input.
 * Iterativer Ansatz schuetzt gegen verschachtelte Tags (z.B. `<scr<script>ipt>`).
 */
function sanitize(input: string): string {
  let clean = input.replace(/\0/g, "");
  let prev = "";
  while (prev !== clean) {
    prev = clean;
    clean = clean.replace(/<[^>]*>/g, "");
  }
  return clean;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const VALID_COUNTRY_CODES = EUROPEAN_COUNTRY_CODES.map((country) => country.code) as [string, ...string[]];
const CONTACT_REQUEST_TYPES = ["appointment", "callback", "prescription", "other"] as const;
const CONTACT_REACHABILITY_OPTIONS = ["morning", "afternoon", "flexible"] as const;
const MAX_CONTACT_DETAILS_LENGTH = 1900;

/**
 * Preprocess-Helper: sanitize + trim. Die Zod-Laenge prueft den BEREINIGTEN
 * Wert - verhindert den Bypass `<p></p>` (7 Zeichen -> nach sanitize leer).
 */
const clean = (value: unknown) => typeof value === "string" ? sanitize(value).trim() : value;
const optionalClean = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const sanitized = sanitize(value).trim();
  return sanitized.length > 0 ? sanitized : undefined;
};

const requestTypeSchema = z.preprocess(
  clean,
  z.string().refine(
    (value) => (CONTACT_REQUEST_TYPES as readonly string[]).includes(value),
    { message: ERROR_MESSAGES.invalidInput },
  ),
);

const reachabilitySchema = z.preprocess(
  optionalClean,
  z
    .string()
    .refine(
      (value) => (CONTACT_REACHABILITY_OPTIONS as readonly string[]).includes(value),
      { message: ERROR_MESSAGES.invalidInput },
    )
    .optional(),
);

export const contactFormSchema = z.object({
  firstName: z.preprocess(clean, z.string().min(1, ERROR_MESSAGES.firstNameRequired).max(50, ERROR_MESSAGES.firstNameTooLong)),
  lastName: z.preprocess(clean, z.string().min(1, ERROR_MESSAGES.lastNameRequired).max(50, ERROR_MESSAGES.lastNameTooLong)),
  countryCode: z.enum(VALID_COUNTRY_CODES),
  phone: z.preprocess(
    clean,
    z
      .string()
      .min(1, ERROR_MESSAGES.phoneRequired)
      .max(20, ERROR_MESSAGES.phoneTooLong)
      .regex(/^\d+$/, ERROR_MESSAGES.phoneInvalid),
  ),
  requestType: requestTypeSchema,
  reachability: reachabilitySchema,
  details: z.preprocess(
    optionalClean,
    z.string().max(MAX_CONTACT_DETAILS_LENGTH, ERROR_MESSAGES.messageTooLong).optional(),
  ),
  gdprConsent: z.boolean().refine((value) => value === true, { message: ERROR_MESSAGES.gdprConsentRequired }),
  honeypot: z.string().max(100).optional(),
}).strict();

export const createUserSchema = z.object({
  name: z.preprocess(clean, z.string().min(1, ERROR_MESSAGES.nameRequired).max(100, ERROR_MESSAGES.nameTooLong)),
  email: z.email(ERROR_MESSAGES.emailInvalid),
  password: z
    .string()
    .min(8, ERROR_MESSAGES.passwordTooShort)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      ERROR_MESSAGES.passwordComplexity,
    ),
});

/**
 * Interne Action-IDs werden strikt auf nicht-leere, kurze Strings begrenzt.
 * Das verhindert Memory-Bombing und offensichtliche Missbrauchs-Payloads.
 */
export const actionIdSchema = z.preprocess(
  clean,
  z.string().min(1, ERROR_MESSAGES.invalidInput).max(191, ERROR_MESSAGES.invalidInput),
);

export const actionCursorSchema = actionIdSchema.optional();

export const toggleReadStatusSchema = z.object({
  id: actionIdSchema,
  newReadStatus: z.boolean(),
});

export const clientErrorLogSchema = z
  .object({
    digest: z.preprocess(optionalClean, z.string().max(255, ERROR_MESSAGES.invalidInput).optional()),
    pathname: z.preprocess(clean, z.string().max(2048, ERROR_MESSAGES.invalidInput).optional()),
  })
  .strict();
