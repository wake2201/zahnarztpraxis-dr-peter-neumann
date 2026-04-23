"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { publicContent } from "@/content/data";
import { prisma } from "../prisma";
import {
  actionCursorSchema,
  actionIdSchema,
  contactFormSchema,
  ERROR_MESSAGES,
  toggleReadStatusSchema,
} from "../schemas";
import { checkRateLimitDb, cleanupExpiredRateLimits } from "../rate-limit";
import { logger } from "../logger";
import { getClientIp, isTrustedClientIpError } from "../client-ip";
import { requireAuth } from "./auth-helpers";

const MAX_REQUESTS_PER_PAGE = 50;
type ContactFormData = z.output<typeof contactFormSchema>;

function buildContactMessage(data: ContactFormData) {
  const requestTypeLabel =
    publicContent.contact.requestTypeOptions.find((option) => option.value === data.requestType)?.label ?? "Sonstiges";
  const reachabilityLabel =
    typeof data.reachability === "string"
      ? publicContent.contact.reachabilityOptions.find((option) => option.value === data.reachability)?.label ?? ""
      : "";

  const segments = [`Anliegen: ${requestTypeLabel}.`];

  if (reachabilityLabel) {
    segments.push(`Erreichbarkeit: ${reachabilityLabel}.`);
  }

  if (data.details) {
    segments.push(`Zusätzliche Informationen: ${data.details}`);
  }

  return segments.join(" ");
}

export async function submitContactForm(data: z.input<typeof contactFormSchema>) {
  try {
    const ip = await getClientIp();

    if (!(await checkRateLimitDb(`contact:${ip}`))) {
      return { success: false, error: ERROR_MESSAGES.rateLimited };
    }

    // Honeypot trifft Bot - identische Success-Antwort verraet nichts.
    if (typeof data.honeypot === "string" && data.honeypot.length > 0) {
      logger.info({ action: "submitContactForm", honeypot: "triggered" }, "Honeypot-Treffer");
      return { success: true };
    }

    const parsed = contactFormSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || ERROR_MESSAGES.invalidInput;
      return { success: false, error: firstError };
    }

    await prisma.$transaction(async (tx) => {
      await tx.contactRequest.create({
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          countryCode: parsed.data.countryCode,
          phone: parsed.data.phone,
          message: buildContactMessage(parsed.data),
          gdprConsent: parsed.data.gdprConsent,
        },
      });
    });

    after(async () => {
      await cleanupExpiredRateLimits();
    });

    return { success: true };
  } catch (error) {
    if (isTrustedClientIpError(error)) {
      return { success: false, error: ERROR_MESSAGES.unexpectedError };
    }

    logger.error({ err: error, action: "submitContactForm" }, "[submitContactForm] Server Action fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.unexpectedError };
  }
}

/**
 * Kontaktanfragen abrufen mit Cursor-Pagination (take: 50).
 * Verhindert DoS bei wachsender Eintragszahl.
 */
export async function getContactRequests(cursor?: string) {
  await requireAuth();

  const parsedCursor = actionCursorSchema.safeParse(cursor);
  if (!parsedCursor.success) {
    return [];
  }

  const requests = await prisma.contactRequest.findMany({
    take: MAX_REQUESTS_PER_PAGE,
    ...(parsedCursor.data ? { skip: 1, cursor: { id: parsedCursor.data } } : {}),
    orderBy: { createdAt: "desc" },
  });

  return requests.map((request) => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
  }));
}

/**
 * Der gewuenschte Status wird vom Client uebergeben.
 * Die Datenbank schreibt direkt den Zielzustand und vermeidet ein read-modify-write-Rennen.
 */
export async function toggleReadStatus(id: string, newReadStatus: boolean) {
  await requireAuth();

  const parsed = toggleReadStatusSchema.safeParse({ id, newReadStatus });
  if (!parsed.success) {
    return { success: false, error: ERROR_MESSAGES.invalidInput };
  }

  try {
    const updatedCount = await prisma.$transaction(async (tx) => {
      const updated = await tx.contactRequest.updateMany({
        where: { id: parsed.data.id },
        data: { read: parsed.data.newReadStatus },
      });
      return updated.count;
    });

    if (updatedCount === 0) {
      return { success: false, error: ERROR_MESSAGES.requestNotFound };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, action: "toggleReadStatus", requestId: parsed.data.id },
      "[toggleReadStatus] fehlgeschlagen",
    );
    return { success: false, error: ERROR_MESSAGES.statusUpdateFailed };
  }
}

/**
 * DSGVO Art. 17 - Recht auf Loeschung. Audit-Log + Delete bleiben atomar.
 */
export async function deleteContactRequest(id: string) {
  const session = await requireAuth();
  const parsed = actionIdSchema.safeParse(id);
  if (!parsed.success) {
    return { success: false, error: ERROR_MESSAGES.invalidInput };
  }

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const deleteResult = await tx.contactRequest.deleteMany({
        where: { id: parsed.data },
      });
      if (deleteResult.count === 0) {
        return false;
      }

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || session.user.email || "Unbekannt",
          action: "DELETE_REQUEST",
          details: `Kontaktanfrage geloescht (ID: ${parsed.data})`,
        },
      });

      return true;
    });

    if (!deleted) {
      return { success: false, error: ERROR_MESSAGES.requestNotFound };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, action: "deleteContactRequest", requestId: parsed.data },
      "[deleteContactRequest] fehlgeschlagen",
    );
    return { success: false, error: ERROR_MESSAGES.requestDeleteFailed };
  }
}
