import { z } from "zod";
import { EUROPEAN_COUNTRY_CODES } from "../country-codes";
import {
  APPOINTMENT_SLOT_MINUTES,
  MAX_APPOINTMENT_DURATION_MINUTES,
  MAX_BOOKING_HORIZON_DAYS,
} from "./constants";

const INVALID_INPUT = "Ungültige Eingabe.";
const VALID_COUNTRY_CODES = EUROPEAN_COUNTRY_CODES.map((country) => country.code) as [
  string,
  ...string[],
];

function sanitize(input: string): string {
  let clean = input.replace(/\0/g, "");
  let previous = "";
  while (previous !== clean) {
    previous = clean;
    clean = clean.replace(/<[^>]*>/g, "");
  }
  return clean.trim();
}

const clean = (value: unknown) => typeof value === "string" ? sanitize(value) : value;
const optionalClean = (value: unknown) => {
  if (typeof value !== "string") return value;
  const sanitized = sanitize(value);
  return sanitized.length > 0 ? sanitized : undefined;
};

const idSchema = z.preprocess(clean, z.string().min(1, INVALID_INPUT).max(191, INVALID_INPUT));
const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, INVALID_INPUT)
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day;
  }, INVALID_INPUT);

const utcInstantSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/, INVALID_INPUT)
  .refine((value) => Number.isFinite(Date.parse(value)), INVALID_INPUT);

const minuteSchema = z.number().int().min(0).max(24 * 60);
const intervalSchema = z
  .object({
    startMinute: minuteSchema,
    endMinute: minuteSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.endMinute <= value.startMinute
      || value.startMinute % APPOINTMENT_SLOT_MINUTES !== 0
      || value.endMinute % APPOINTMENT_SLOT_MINUTES !== 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_INPUT });
    }
  });

const personFields = {
  firstName: z.preprocess(clean, z.string().min(1, "Vorname ist erforderlich.").max(50)),
  lastName: z.preprocess(clean, z.string().min(1, "Nachname ist erforderlich.").max(50)),
  countryCode: z.enum(VALID_COUNTRY_CODES),
  phone: z.preprocess(
    clean,
    z.string().min(1, "Telefonnummer ist erforderlich.").max(20).regex(/^\d+$/, "Ungültige Telefonnummer."),
  ),
  details: z.preprocess(optionalClean, z.string().max(1900).optional()),
  gdprConsent: z.boolean().refine((value) => value === true, "Die Einwilligung ist erforderlich."),
};

const typeFields = {
  name: z.preprocess(clean, z.string().min(1).max(100)),
  description: z.preprocess(optionalClean, z.string().max(1000).optional()),
  durationMinutes: z
    .number()
    .int()
    .min(APPOINTMENT_SLOT_MINUTES)
    .max(MAX_APPOINTMENT_DURATION_MINUTES)
    .refine((value) => value % APPOINTMENT_SLOT_MINUTES === 0, INVALID_INPUT),
  active: z.boolean(),
  onlineBookable: z.boolean(),
  confirmationMode: z.enum(["AUTO", "MANUAL"]),
};

export const appointmentAvailabilitySchema = z
  .object({
    appointmentTypeId: idSchema,
    cursor: localDateSchema.optional(),
  })
  .strict();

export const adminAppointmentAvailabilitySchema = z
  .object({
    appointmentTypeId: idSchema,
    cursor: localDateSchema.optional(),
    appointmentId: idSchema.optional(),
  })
  .strict();

export const adminAppointmentDashboardSchema = z
  .object({ weekStart: localDateSchema.optional() })
  .strict();

export const publicAppointmentBookingSchema = z
  .object({
    appointmentTypeId: idSchema,
    startAt: utcInstantSchema,
    ...personFields,
    honeypot: z.string().max(100).optional(),
  })
  .strict();

export const appointmentManagementCodeSchema = z
  .object({ code: z.preprocess(clean, z.string().regex(/^[A-Za-z0-9_-]{43}$/, INVALID_INPUT)) })
  .strict();

export const managedAvailabilitySchema = z
  .object({ cursor: localDateSchema.optional() })
  .strict();

export const managedRescheduleSchema = z.object({ startAt: utcInstantSchema }).strict();

export const adminAppointmentCreateSchema = z
  .object({
    appointmentTypeId: idSchema,
    startAt: utcInstantSchema,
    ...personFields,
  })
  .strict();

export const adminAppointmentMutationSchema = z
  .object({
    appointmentId: idSchema,
    expectedRevision: z.number().int().min(0),
    action: z.enum(["CONFIRM", "REJECT", "CANCEL"]),
  })
  .strict();

export const adminAppointmentRescheduleSchema = z
  .object({
    appointmentId: idSchema,
    expectedRevision: z.number().int().min(0),
    startAt: utcInstantSchema,
  })
  .strict();

export const appointmentTypeCreateSchema = z.object(typeFields).strict();
export const appointmentTypeUpdateSchema = z.object({ id: idSchema, ...typeFields }).strict();

export const weeklyAvailabilityCreateSchema = z
  .object({
    weekday: z.number().int().min(1).max(7),
    startMinute: minuteSchema,
    endMinute: minuteSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const parsed = intervalSchema.safeParse({
      startMinute: value.startMinute,
      endMinute: value.endMinute,
    });
    if (!parsed.success) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_INPUT });
    }
  });

export const availabilityExceptionCreateSchema = z
  .object({
    localDate: localDateSchema,
    kind: z.enum(["OPEN", "BLOCK"]),
    startMinute: minuteSchema,
    endMinute: minuteSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const parsed = intervalSchema.safeParse({
      startMinute: value.startMinute,
      endMinute: value.endMinute,
    });
    if (!parsed.success) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_INPUT });
    }
  });

export const appointmentSettingsUpdateSchema = z
  .object({
    minimumNoticeMinutes: z.number().int().min(0).max(30 * 24 * 60),
    bookingHorizonDays: z.number().int().min(1).max(MAX_BOOKING_HORIZON_DAYS),
  })
  .strict();

export const appointmentEntityIdSchema = idSchema;
