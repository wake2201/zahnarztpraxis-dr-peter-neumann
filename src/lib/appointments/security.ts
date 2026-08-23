import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { APPOINTMENT_SESSION_TTL_MS } from "./constants";

export interface OpaqueSecret {
  value: string;
  hash: string;
}

export function hashAppointmentSecret(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function createAppointmentSecret(): OpaqueSecret {
  const value = randomBytes(32).toString("base64url");
  return { value, hash: hashAppointmentSecret(value) };
}

export function createAppointmentSession(now = new Date()): OpaqueSecret & { expiresAt: Date } {
  return {
    ...createAppointmentSecret(),
    expiresAt: new Date(now.getTime() + APPOINTMENT_SESSION_TTL_MS),
  };
}
