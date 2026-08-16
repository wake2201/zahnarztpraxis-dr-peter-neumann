"use server";

import { revalidatePath } from "next/cache";
import { logUnexpectedAppointmentError } from "../appointments/action-utils";
import { GENERIC_APPOINTMENT_ERROR } from "../appointments/constants";
import {
  adminAppointmentAvailabilitySchema,
  adminAppointmentCreateSchema,
  adminAppointmentDashboardSchema,
  adminAppointmentMutationSchema,
  adminAppointmentRescheduleSchema,
  appointmentEntityIdSchema,
  appointmentSettingsUpdateSchema,
  appointmentTypeCreateSchema,
  appointmentTypeUpdateSchema,
  availabilityExceptionCreateSchema,
  weeklyAvailabilityCreateSchema,
} from "../appointments/schemas";
import {
  buildAppointmentAvailability,
  createAppointmentReservation,
  createConfigurationException,
  createConfigurationType,
  createConfigurationWeekly,
  deleteConfigurationException,
  deleteConfigurationWeekly,
  getAdminDashboardData,
  getConfigurationData,
  isAppointmentUniqueConflict,
  mutateAdminReservation,
  rescheduleAdminReservation,
  safeAppointmentErrorMessage,
  serializeAdminAppointment,
  updateConfigurationSettings,
  updateConfigurationType,
} from "../appointments/service";
import type {
  AdminAppointmentAvailabilityInput,
  AdminAppointmentCreateInput,
  AdminAppointmentDashboardDto,
  AdminAppointmentDashboardInput,
  AdminAppointmentDto,
  AdminAppointmentMutationInput,
  AdminAppointmentRescheduleInput,
  AdminAppointmentTypeDto,
  AppointmentAvailabilityDto,
  AppointmentConfigurationDto,
  AppointmentResult,
  AppointmentSettingsDto,
  AppointmentSettingsUpdateInput,
  AppointmentTypeCreateInput,
  AppointmentTypeUpdateInput,
  AvailabilityExceptionCreateInput,
  AvailabilityExceptionDto,
  WeeklyAvailabilityCreateInput,
  WeeklyAvailabilityDto,
} from "../appointments/types";
import { requireAdmin, requireAuth } from "./auth-helpers";

function auditActor(session: Awaited<ReturnType<typeof requireAuth>>) {
  return {
    userId: session.user.id,
    userName: session.user.name || session.user.email || "Unbekannt",
  };
}

function mutationError(error: unknown): string {
  return isAppointmentUniqueConflict(error)
    ? "Ein identischer Eintrag existiert bereits."
    : safeAppointmentErrorMessage(error);
}

function invalidateAppointmentViews(): void {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/termin");
}

export async function getAdminAppointmentDashboard(
  input: AdminAppointmentDashboardInput = {},
): Promise<AdminAppointmentDashboardDto> {
  await requireAuth();
  const parsed = adminAppointmentDashboardSchema.safeParse(input);
  if (!parsed.success) throw new Error("Ungültige Eingabe.");

  try {
    return await getAdminDashboardData(parsed.data.weekStart);
  } catch (error) {
    logUnexpectedAppointmentError("getAdminAppointmentDashboard", error);
    throw new Error(GENERIC_APPOINTMENT_ERROR);
  }
}

export async function getAdminAppointmentAvailability(
  input: AdminAppointmentAvailabilityInput,
): Promise<AppointmentResult<AppointmentAvailabilityDto>> {
  await requireAuth();
  const parsed = adminAppointmentAvailabilitySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };

  try {
    const data = await buildAppointmentAvailability(
      parsed.data.appointmentTypeId,
      parsed.data.cursor,
      false,
      new Date(),
      parsed.data.appointmentId,
    );
    return { success: true, data };
  } catch (error) {
    logUnexpectedAppointmentError("getAdminAppointmentAvailability", error);
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}

export async function createAdminAppointment(
  input: AdminAppointmentCreateInput,
): Promise<AppointmentResult<AdminAppointmentDto>> {
  const session = await requireAuth();
  const parsed = adminAppointmentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  try {
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
      source: "ADMIN",
      onlineOnly: false,
      auditActor: auditActor(session),
    });
    invalidateAppointmentViews();
    return { success: true, data: serializeAdminAppointment(appointment) };
  } catch (error) {
    logUnexpectedAppointmentError("createAdminAppointment", error);
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}

export async function mutateAdminAppointment(
  input: AdminAppointmentMutationInput,
): Promise<AppointmentResult<AdminAppointmentDto>> {
  const session = await requireAuth();
  const parsed = adminAppointmentMutationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };

  try {
    const appointment = await mutateAdminReservation({
      ...parsed.data,
      auditActor: auditActor(session),
    });
    invalidateAppointmentViews();
    return { success: true, data: serializeAdminAppointment(appointment) };
  } catch (error) {
    logUnexpectedAppointmentError("mutateAdminAppointment", error);
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}

export async function rescheduleAdminAppointment(
  input: AdminAppointmentRescheduleInput,
): Promise<AppointmentResult<AdminAppointmentDto>> {
  const session = await requireAuth();
  const parsed = adminAppointmentRescheduleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };

  try {
    const appointment = await rescheduleAdminReservation({
      appointmentId: parsed.data.appointmentId,
      expectedRevision: parsed.data.expectedRevision,
      submittedStart: new Date(parsed.data.startAt),
      auditActor: auditActor(session),
    });
    invalidateAppointmentViews();
    return { success: true, data: serializeAdminAppointment(appointment) };
  } catch (error) {
    logUnexpectedAppointmentError("rescheduleAdminAppointment", error);
    return { success: false, error: safeAppointmentErrorMessage(error) };
  }
}

export async function getAppointmentConfiguration(): Promise<AppointmentConfigurationDto> {
  await requireAdmin();
  try {
    return await getConfigurationData();
  } catch (error) {
    logUnexpectedAppointmentError("getAppointmentConfiguration", error);
    throw new Error(GENERIC_APPOINTMENT_ERROR);
  }
}

export async function createAppointmentType(
  input: AppointmentTypeCreateInput,
): Promise<AppointmentResult<AdminAppointmentTypeDto>> {
  const session = await requireAdmin();
  const parsed = appointmentTypeCreateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };
  try {
    const data = await createConfigurationType(parsed.data, auditActor(session));
    invalidateAppointmentViews();
    return { success: true, data };
  } catch (error) {
    logUnexpectedAppointmentError("createAppointmentType", error);
    return { success: false, error: mutationError(error) };
  }
}

export async function updateAppointmentType(
  input: AppointmentTypeUpdateInput,
): Promise<AppointmentResult<AdminAppointmentTypeDto>> {
  const session = await requireAdmin();
  const parsed = appointmentTypeUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };
  try {
    const data = await updateConfigurationType(parsed.data, auditActor(session));
    invalidateAppointmentViews();
    return { success: true, data };
  } catch (error) {
    logUnexpectedAppointmentError("updateAppointmentType", error);
    return { success: false, error: mutationError(error) };
  }
}

export async function createWeeklyAvailability(
  input: WeeklyAvailabilityCreateInput,
): Promise<AppointmentResult<WeeklyAvailabilityDto>> {
  const session = await requireAdmin();
  const parsed = weeklyAvailabilityCreateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };
  try {
    const data = await createConfigurationWeekly(parsed.data, auditActor(session));
    invalidateAppointmentViews();
    return { success: true, data };
  } catch (error) {
    logUnexpectedAppointmentError("createWeeklyAvailability", error);
    return { success: false, error: mutationError(error) };
  }
}

export async function deleteWeeklyAvailability(id: string): Promise<AppointmentResult<null>> {
  const session = await requireAdmin();
  const parsed = appointmentEntityIdSchema.safeParse(id);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };
  try {
    await deleteConfigurationWeekly(parsed.data, auditActor(session));
    invalidateAppointmentViews();
    return { success: true, data: null };
  } catch (error) {
    logUnexpectedAppointmentError("deleteWeeklyAvailability", error);
    return { success: false, error: mutationError(error) };
  }
}

export async function createAvailabilityException(
  input: AvailabilityExceptionCreateInput,
): Promise<AppointmentResult<AvailabilityExceptionDto>> {
  const session = await requireAdmin();
  const parsed = availabilityExceptionCreateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };
  try {
    const data = await createConfigurationException(parsed.data, auditActor(session));
    invalidateAppointmentViews();
    return { success: true, data };
  } catch (error) {
    logUnexpectedAppointmentError("createAvailabilityException", error);
    return { success: false, error: mutationError(error) };
  }
}

export async function deleteAvailabilityException(id: string): Promise<AppointmentResult<null>> {
  const session = await requireAdmin();
  const parsed = appointmentEntityIdSchema.safeParse(id);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };
  try {
    await deleteConfigurationException(parsed.data, auditActor(session));
    invalidateAppointmentViews();
    return { success: true, data: null };
  } catch (error) {
    logUnexpectedAppointmentError("deleteAvailabilityException", error);
    return { success: false, error: mutationError(error) };
  }
}

export async function updateBookingSettings(
  input: AppointmentSettingsUpdateInput,
): Promise<AppointmentResult<AppointmentSettingsDto>> {
  const session = await requireAdmin();
  const parsed = appointmentSettingsUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Ungültige Eingabe." };
  try {
    const data = await updateConfigurationSettings(parsed.data, auditActor(session));
    invalidateAppointmentViews();
    return { success: true, data };
  } catch (error) {
    logUnexpectedAppointmentError("updateBookingSettings", error);
    return { success: false, error: mutationError(error) };
  }
}

