"use server";

import { after } from "next/server";
import { getClientIp, isTrustedClientIpError } from "../client-ip";
import { cleanupExpiredRateLimits, checkRateLimitDb } from "../rate-limit";
import { logUnexpectedAppointmentError } from "../appointments/action-utils";
import { GENERIC_APPOINTMENT_ERROR } from "../appointments/constants";
import {
  appointmentAvailabilitySchema,
  publicAppointmentBookingSchema,
} from "../appointments/schemas";
import { createAppointmentSecret } from "../appointments/security";
import {
  buildAppointmentAvailability,
  createAppointmentReservation,
  getPublicTypes,
  safeAppointmentErrorMessage,
  serializeAppointmentSummary,
} from "../appointments/service";
import type {
  AppointmentAvailabilityDto,
  AppointmentAvailabilityInput,
  AppointmentResult,
  PublicAppointmentBookingDto,
  PublicAppointmentBookingInput,
  PublicAppointmentTypeDto,
} from "../appointments/types";

const RATE_LIMIT_ERROR = "Zu viele Anfragen. Bitte versuchen Sie es später erneut.";

async function consumePublicBudget(
  namespace: "availability" | "book",
  options: { maxRequests: number; windowMs: number },
): Promise<boolean> {
  const ip = await getClientIp();
  return checkRateLimitDb(`appointment-${namespace}:${ip}`, options);
}

export async function getPublicAppointmentTypes(): Promise<PublicAppointmentTypeDto[]> {
  try {
    return await getPublicTypes();
  } catch (error) {
    logUnexpectedAppointmentError("getPublicAppointmentTypes", error);
    return [];
  }
}

export async function getPublicAppointmentAvailability(
  input: AppointmentAvailabilityInput,
): Promise<AppointmentResult<AppointmentAvailabilityDto>> {
  try {
    const allowed = await consumePublicBudget("availability", {
      maxRequests: 60,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed) return { success: false, error: RATE_LIMIT_ERROR };

    const parsed = appointmentAvailabilitySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_APPOINTMENT_ERROR };
    }

    const data = await buildAppointmentAvailability(
      parsed.data.appointmentTypeId,
      parsed.data.cursor,
      true,
    );
    return { success: true, data };
  } catch (error) {
    if (!isTrustedClientIpError(error)) {
      logUnexpectedAppointmentError("getPublicAppointmentAvailability", error);
    }
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}

export async function bookPublicAppointment(
  input: PublicAppointmentBookingInput,
): Promise<AppointmentResult<PublicAppointmentBookingDto>> {
  try {
    const allowed = await consumePublicBudget("book", {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!allowed) return { success: false, error: RATE_LIMIT_ERROR };

    if (typeof input?.honeypot === "string" && input.honeypot.length > 0) {
      return { success: false, error: GENERIC_APPOINTMENT_ERROR };
    }

    const parsed = publicAppointmentBookingSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? GENERIC_APPOINTMENT_ERROR };
    }

    const managementSecret = createAppointmentSecret();
    const appointment = await createAppointmentReservation({
      appointmentTypeId: parsed.data.appointmentTypeId,
      startAt: new Date(parsed.data.startAt),
      person: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        countryCode: parsed.data.countryCode,
        phone: parsed.data.phone,
        details: parsed.data.details,
        gdprConsent: parsed.data.gdprConsent,
      },
      source: "ONLINE",
      onlineOnly: true,
      managementCodeHash: managementSecret.hash,
    });

    after(async () => cleanupExpiredRateLimits());
    return {
      success: true,
      data: {
        appointment: serializeAppointmentSummary(appointment),
        managementCode: managementSecret.value,
      },
    };
  } catch (error) {
    if (!isTrustedClientIpError(error)) {
      logUnexpectedAppointmentError("bookPublicAppointment", error);
    }
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}
