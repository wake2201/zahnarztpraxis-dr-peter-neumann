export type AppointmentConfirmationModeValue = "AUTO" | "MANUAL";
export type AppointmentStatusValue = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type AppointmentSourceValue = "ONLINE" | "ADMIN";
export type AppointmentExceptionKindValue = "OPEN" | "BLOCK";

export type AppointmentResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PublicAppointmentTypeDto {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  confirmationMode: AppointmentConfirmationModeValue;
}

export interface AppointmentSlotDto {
  startAt: string;
  startLabel: string;
  endLabel: string;
}

export interface AppointmentAvailabilityDayDto {
  date: string;
  dateLabel: string;
  slots: AppointmentSlotDto[];
}

export interface AppointmentAvailabilityDto {
  days: AppointmentAvailabilityDayDto[];
  nextCursor: string | null;
}

export interface AppointmentAvailabilityInput {
  appointmentTypeId: string;
  cursor?: string;
}

export interface PublicAppointmentBookingInput {
  appointmentTypeId: string;
  startAt: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  details?: string;
  gdprConsent: boolean;
  honeypot?: string;
}

export interface AppointmentSummaryDto {
  typeName: string;
  durationMinutes: number;
  confirmationMode: AppointmentConfirmationModeValue;
  startAt: string;
  endAt: string;
  localDate: string;
  dateLabel: string;
  startLabel: string;
  endLabel: string;
  status: AppointmentStatusValue;
}

export interface PublicAppointmentBookingDto {
  appointment: AppointmentSummaryDto;
  managementCode: string;
}

export interface AppointmentManagementCodeInput {
  code: string;
}

export interface ManagedAppointmentDto extends AppointmentSummaryDto {
  canReschedule: boolean;
  canCancel: boolean;
}

export interface ManagedAppointmentAvailabilityInput {
  cursor?: string;
}

export interface ManagedAppointmentRescheduleInput {
  startAt: string;
}

export interface AdminAppointmentDto extends AppointmentSummaryDto {
  id: string;
  appointmentTypeId: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  details: string | null;
  gdprConsent: boolean;
  source: AppointmentSourceValue;
  revision: number;
  createdAt: string;
}

export interface AdminAppointmentDashboardDto {
  appointments: AdminAppointmentDto[];
  manualAppointmentTypes: PublicAppointmentTypeDto[];
  todayLocalDate: string;
  weekStart: string;
  weekEnd: string;
  pendingCount: number;
  todayCount: number;
  weekCount: number;
}

export interface AdminAppointmentDashboardInput {
  weekStart?: string;
}

export interface AdminAppointmentAvailabilityInput extends AppointmentAvailabilityInput {
  appointmentId?: string;
}

export interface AdminAppointmentCreateInput {
  appointmentTypeId: string;
  startAt: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  details?: string;
  gdprConsent: boolean;
}

export type AdminAppointmentMutationAction = "CONFIRM" | "REJECT" | "CANCEL";

export interface AdminAppointmentMutationInput {
  appointmentId: string;
  expectedRevision: number;
  action: AdminAppointmentMutationAction;
}

export interface AdminAppointmentRescheduleInput {
  appointmentId: string;
  expectedRevision: number;
  startAt: string;
}

export interface AppointmentSettingsDto {
  slotMinutes: number;
  minimumNoticeMinutes: number;
  bookingHorizonDays: number;
  timeZone: string;
}

export interface AdminAppointmentTypeDto extends PublicAppointmentTypeDto {
  active: boolean;
  onlineBookable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyAvailabilityDto {
  id: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface AvailabilityExceptionDto {
  id: string;
  localDate: string;
  kind: AppointmentExceptionKindValue;
  startMinute: number;
  endMinute: number;
}

export interface AppointmentConfigurationDto {
  settings: AppointmentSettingsDto;
  appointmentTypes: AdminAppointmentTypeDto[];
  weeklyAvailability: WeeklyAvailabilityDto[];
  exceptions: AvailabilityExceptionDto[];
}

export interface AppointmentTypeCreateInput {
  name: string;
  description?: string;
  durationMinutes: number;
  active: boolean;
  onlineBookable: boolean;
  confirmationMode: AppointmentConfirmationModeValue;
}

export interface AppointmentTypeUpdateInput extends AppointmentTypeCreateInput {
  id: string;
}

export interface WeeklyAvailabilityCreateInput {
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface AvailabilityExceptionCreateInput {
  localDate: string;
  kind: AppointmentExceptionKindValue;
  startMinute: number;
  endMinute: number;
}

export interface AppointmentSettingsUpdateInput {
  minimumNoticeMinutes: number;
  bookingHorizonDays: number;
}
