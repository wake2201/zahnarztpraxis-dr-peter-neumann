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

export type DashboardTab = "requests" | "users" | "logs";

export const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Anmeldung",
  DELETE_REQUEST: "Anfrage gelöscht",
  CREATE_USER: "Benutzer erstellt",
  DELETE_USER: "Benutzer gelöscht",
};
