export interface ContactRequest {
  id: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type UserAccountRole = "admin" | "staff" | "unknown";

export interface UserAccount {
  id: string;
  email: string;
  name: string | null;
  role: UserAccountRole;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export type DashboardTab = "requests" | "appointments" | "users" | "logs";

export const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Anmeldung",
  DELETE_REQUEST: "Anfrage gelöscht",
  CREATE_USER: "Benutzer erstellt",
  DELETE_USER: "Benutzer gelöscht",
  CREATE_APPOINTMENT: "Termin erstellt",
  CONFIRM_APPOINTMENT: "Termin bestätigt",
  REJECT_APPOINTMENT: "Termin abgelehnt",
  CANCEL_APPOINTMENT: "Termin storniert",
  RESCHEDULE_APPOINTMENT: "Termin verschoben",
  CREATE_APPOINTMENT_TYPE: "Terminart erstellt",
  UPDATE_APPOINTMENT_TYPE: "Terminart geändert",
  CREATE_WEEKLY_AVAILABILITY: "Buchungszeit erstellt",
  DELETE_WEEKLY_AVAILABILITY: "Buchungszeit entfernt",
  CREATE_AVAILABILITY_EXCEPTION: "Ausnahme erstellt",
  DELETE_AVAILABILITY_EXCEPTION: "Ausnahme entfernt",
  UPDATE_BOOKING_SETTINGS: "Buchungsregeln geändert",
};
