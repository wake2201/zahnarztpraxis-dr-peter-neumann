import "server-only";
import { Prisma } from "../../generated/prisma";
import { logger } from "../logger";
import { AppointmentDomainError, isAppointmentUniqueConflict } from "./service";

export function logUnexpectedAppointmentError(action: string, error: unknown): void {
  if (error instanceof AppointmentDomainError || isAppointmentUniqueConflict(error)) return;

  const safeError = new Error("Appointment backend operation failed");
  safeError.name = error instanceof Error ? error.name : "UnknownError";
  const errorCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
  logger.error(
    { err: safeError, action, errorCode },
    `[${action}] Termin-Backend fehlgeschlagen`,
  );
}
