"use server";

import { prisma } from "../prisma";
import { after } from "next/server";
import { z } from "zod";
import { contactFormSchema, ERROR_MESSAGES } from "../schemas";
import { checkRateLimitDb, cleanupExpiredRateLimits } from "../rate-limit";
import { logger } from "../logger";
import { getClientIp } from "../client-ip";
import { requireAuth } from "./auth-helpers";
import { revalidatePath } from "next/cache";

const MAX_REQUESTS_PER_PAGE = 50;

export async function submitContactForm(data: z.input<typeof contactFormSchema>) {
  try {
    const ip = await getClientIp();

    if (!(await checkRateLimitDb(ip))) {
      return { success: false, error: ERROR_MESSAGES.rateLimited };
    }

    // Honeypot trifft Bot — identische Success-Antwort verrät nichts.
    if (typeof data.honeypot === "string" && data.honeypot.length > 0) {
      logger.info({ action: "submitContactForm", honeypot: "triggered" }, "Honeypot-Treffer");
      return { success: true };
    }

    const parsed = contactFormSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || ERROR_MESSAGES.invalidInput;
      return { success: false, error: firstError };
    }

    const cleanPhone = parsed.data.phone.replace(/\D/g, "");
    if (cleanPhone.length === 0) {
      return { success: false, error: ERROR_MESSAGES.phoneInvalid };
    }

    await prisma.contactRequest.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        countryCode: parsed.data.countryCode,
        phone: cleanPhone,
        message: parsed.data.message,
        gdprConsent: parsed.data.gdprConsent,
      },
    });

    after(async () => {
      await cleanupExpiredRateLimits();
    });

    return { success: true };
  } catch (error) {
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

  const requests = await prisma.contactRequest.findMany({
    take: MAX_REQUESTS_PER_PAGE,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
  });

  return requests.map(req => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
  }));
}

/**
 * Der gewünschte Status wird vom Client übergeben — vermeidet TOCTOU Race.
 */
export async function toggleReadStatus(id: string, newReadStatus: boolean) {
  await requireAuth();

  try {
    await prisma.contactRequest.update({
      where: { id },
      data: { read: newReadStatus },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "toggleReadStatus", requestId: id }, "[toggleReadStatus] fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.statusUpdateFailed };
  }
}

/**
 * DSGVO Art. 17 — Recht auf Löschung. Audit-Log + Delete atomar.
 */
export async function deleteContactRequest(id: string) {
  const session = await requireAuth();

  try {
    const request = await prisma.contactRequest.findUnique({ where: { id } });
    if (!request) return { success: false, error: ERROR_MESSAGES.requestNotFound };

    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user?.name || session.user?.email || "Unbekannt",
          action: "DELETE_REQUEST",
          details: `Kontaktanfrage gelöscht (ID: ${request.id})`,
        },
      }),
      prisma.contactRequest.delete({ where: { id } }),
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "deleteContactRequest", requestId: id }, "[deleteContactRequest] fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.requestDeleteFailed };
  }
}
