"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { after } from "next/server";
import { getClientIp, isTrustedClientIpError } from "../client-ip";
import { checkRateLimitDb, cleanupExpiredRateLimits } from "../rate-limit";
import { logUnexpectedAppointmentError } from "../appointments/action-utils";
import {
  APPOINTMENT_ACCESS_ERROR,
  APPOINTMENT_SESSION_COOKIE,
  APPOINTMENT_SESSION_TTL_MS,
  GENERIC_APPOINTMENT_ERROR,
} from "../appointments/constants";
import {
  appointmentManagementCodeSchema,
  managedAvailabilitySchema,
  managedRescheduleSchema,
} from "../appointments/schemas";
import {
  createAppointmentSession,
  hashAppointmentSecret,
} from "../appointments/security";
import {
  cancelManagedReservation,
  deleteManagedSession,
  exchangeManagementCode,
  getManagedAppointmentBySession,
  getManagedAvailability,
  rescheduleManagedReservation,
  safeAppointmentErrorMessage,
  serializeManagedAppointment,
} from "../appointments/service";
import type {
  AppointmentAvailabilityDto,
  AppointmentManagementCodeInput,
  AppointmentResult,
  ManagedAppointmentAvailabilityInput,
  ManagedAppointmentDto,
  ManagedAppointmentRescheduleInput,
} from "../appointments/types";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const RATE_LIMIT_ERROR = "Zu viele Anfragen. Bitte versuchen Sie es später erneut.";

async function consumePatientBudget(
  namespace: "access" | "availability" | "book",
  options: { maxRequests: number; windowMs: number },
): Promise<boolean> {
  const ip = await getClientIp();
  return checkRateLimitDb(`appointment-${namespace}:${ip}`, options);
}

async function readSessionToken(): Promise<string | null> {
  const token = (await cookies()).get(APPOINTMENT_SESSION_COOKIE)?.value;
  return token && TOKEN_PATTERN.test(token) ? token : null;
}

async function writeSessionCookie(value: string, maxAge: number): Promise<void> {
  (await cookies()).set(APPOINTMENT_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/termin",
    maxAge,
  });
}

async function sessionHashOrNull(): Promise<string | null> {
  const token = await readSessionToken();
  return token ? hashAppointmentSecret(token) : null;
}

export async function verifyAppointmentManagementCode(
  input: AppointmentManagementCodeInput,
): Promise<AppointmentResult<ManagedAppointmentDto>> {
  try {
    const allowed = await consumePatientBudget("access", {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!allowed) return { success: false, error: RATE_LIMIT_ERROR };

    const parsed = appointmentManagementCodeSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: APPOINTMENT_ACCESS_ERROR };

    const session = createAppointmentSession();
    const appointment = await exchangeManagementCode({
      managementCodeHash: hashAppointmentSecret(parsed.data.code),
      sessionTokenHash: session.hash,
      expiresAt: session.expiresAt,
    });
    await writeSessionCookie(session.value, APPOINTMENT_SESSION_TTL_MS / 1000);
    after(async () => cleanupExpiredRateLimits());
    revalidatePath("/termin");
    return { success: true, data: serializeManagedAppointment(appointment) };
  } catch (error) {
    if (!isTrustedClientIpError(error)) {
      logUnexpectedAppointmentError("verifyAppointmentManagementCode", error);
    }
    return { success: false, error: APPOINTMENT_ACCESS_ERROR };
  }
}

export async function endAppointmentManagementSession(): Promise<AppointmentResult<null>> {
  const sessionHash = await sessionHashOrNull();
  try {
    if (sessionHash) await deleteManagedSession(sessionHash);
    await writeSessionCookie("", 0);
    revalidatePath("/termin");
    return { success: true, data: null };
  } catch (error) {
    logUnexpectedAppointmentError("endAppointmentManagementSession", error);
    return { success: false, error: GENERIC_APPOINTMENT_ERROR };
  }
}

export async function getManagedAppointment(): Promise<AppointmentResult<ManagedAppointmentDto>> {
  const sessionHash = await sessionHashOrNull();
  if (!sessionHash) return { success: false, error: APPOINTMENT_ACCESS_ERROR };

  try {
    const appointment = await getManagedAppointmentBySession(sessionHash);
    return { success: true, data: serializeManagedAppointment(appointment) };
  } catch (error) {
    logUnexpectedAppointmentError("getManagedAppointment", error);
    return { success: false, error: APPOINTMENT_ACCESS_ERROR };
  }
}

export async function getManagedAppointmentAvailability(
  input: ManagedAppointmentAvailabilityInput = {},
): Promise<AppointmentResult<AppointmentAvailabilityDto>> {
  const parsed = managedAvailabilitySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: GENERIC_APPOINTMENT_ERROR };
  const sessionHash = await sessionHashOrNull();
  if (!sessionHash) return { success: false, error: APPOINTMENT_ACCESS_ERROR };

  try {
    const allowed = await consumePatientBudget("availability", {
      maxRequests: 60,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed) return { success: false, error: RATE_LIMIT_ERROR };
    const data = await getManagedAvailability(sessionHash, parsed.data.cursor);
    return { success: true, data };
  } catch (error) {
    if (!isTrustedClientIpError(error)) {
      logUnexpectedAppointmentError("getManagedAppointmentAvailability", error);
    }
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}

export async function rescheduleManagedAppointment(
  input: ManagedAppointmentRescheduleInput,
): Promise<AppointmentResult<ManagedAppointmentDto>> {
  const parsed = managedRescheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: GENERIC_APPOINTMENT_ERROR };
  const sessionHash = await sessionHashOrNull();
  if (!sessionHash) return { success: false, error: APPOINTMENT_ACCESS_ERROR };

  try {
    const allowed = await consumePatientBudget("book", {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!allowed) return { success: false, error: RATE_LIMIT_ERROR };
    const appointment = await rescheduleManagedReservation(sessionHash, new Date(parsed.data.startAt));
    revalidatePath("/termin");
    revalidatePath("/admin");
    return { success: true, data: serializeManagedAppointment(appointment) };
  } catch (error) {
    if (!isTrustedClientIpError(error)) {
      logUnexpectedAppointmentError("rescheduleManagedAppointment", error);
    }
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}

export async function cancelManagedAppointment(): Promise<AppointmentResult<ManagedAppointmentDto>> {
  const sessionHash = await sessionHashOrNull();
  if (!sessionHash) return { success: false, error: APPOINTMENT_ACCESS_ERROR };

  try {
    const allowed = await consumePatientBudget("book", {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!allowed) return { success: false, error: RATE_LIMIT_ERROR };
    const appointment = await cancelManagedReservation(sessionHash);
    revalidatePath("/termin");
    revalidatePath("/admin");
    return { success: true, data: serializeManagedAppointment(appointment) };
  } catch (error) {
    if (!isTrustedClientIpError(error)) {
      logUnexpectedAppointmentError("cancelManagedAppointment", error);
    }
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}
