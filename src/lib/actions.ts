// Barrel-Export: Legacy-Konsumenten (`@/lib/actions`) bleiben stabil.
// Die eigentlichen Server Actions liegen in `src/lib/actions/*.ts`.
export {
  submitContactForm,
  getContactRequests,
  mutateContactRequests,
} from "./actions/contact";

export {
  createUser,
  deleteUser,
  getUsers,
} from "./actions/users";

export {
  getAuditLogs,
} from "./actions/logs";

export {
  bookPublicAppointment,
  getPublicAppointmentAvailability,
  getPublicAppointmentTypes,
} from "./actions/appointments-public";

export {
  cancelManagedAppointment,
  endAppointmentManagementSession,
  getManagedAppointment,
  getManagedAppointmentAvailability,
  rescheduleManagedAppointment,
  verifyAppointmentManagementCode,
} from "./actions/appointments-patient";

export {
  createAdminAppointment,
  createAppointmentType,
  createAvailabilityException,
  createWeeklyAvailability,
  deleteAvailabilityException,
  deleteWeeklyAvailability,
  getAdminAppointmentAvailability,
  getAdminAppointmentDashboard,
  getAppointmentConfiguration,
  mutateAdminAppointment,
  rescheduleAdminAppointment,
  updateAppointmentType,
  updateBookingSettings,
} from "./actions/appointments-admin";
