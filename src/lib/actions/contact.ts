"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { publicContent } from "@/content/data";
import { prisma } from "../prisma";
import {
  actionCursorSchema,
  contactRequestMutationSchema,
  contactFormSchema,
  ERROR_MESSAGES,
} from "../schemas";
import { checkRateLimitDb, cleanupExpiredRateLimits } from "../rate-limit";
import { logger } from "../logger";
import { getClientIp, isTrustedClientIpError } from "../client-ip";
import { requireAuth } from "./auth-helpers";

const MAX_REQUESTS_PER_PAGE = 50;
type ContactFormData = z.output<typeof contactFormSchema>;

class ContactRequestMutationNotFoundError extends Error {}

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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return requests.map((request) => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
  }));
}

/**
 * Einheitlicher Mutationseinstieg fuer Einzel- und Sammelaktionen.
 * Alle Kontaktanfragen werden atomar aktualisiert oder geloescht.
 */
export async function mutateContactRequests(input: z.input<typeof contactRequestMutationSchema>) {
  const session = await requireAuth();
  const parsed = contactRequestMutationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: ERROR_MESSAGES.invalidInput };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (parsed.data.action === "delete") {
        const deleted = await tx.contactRequest.deleteMany({
          where: { id: { in: parsed.data.ids } },
        });

        if (deleted.count !== parsed.data.ids.length) {
          throw new ContactRequestMutationNotFoundError();
        }

        await tx.auditLog.createMany({
          data: parsed.data.ids.map((id) => ({
            userId: session.user.id,
            userName: session.user.name || session.user.email || "Unbekannt",
            action: "DELETE_REQUEST",
            details: `Kontaktanfrage geloescht (ID: ${id})`,
          })),
        });

        return;
      }

      const updated = await tx.contactRequest.updateMany({
        where: { id: { in: parsed.data.ids } },
        data: { read: parsed.data.action === "markRead" },
      });

      if (updated.count !== parsed.data.ids.length) {
        throw new ContactRequestMutationNotFoundError();
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    if (error instanceof ContactRequestMutationNotFoundError) {
      return { success: false, error: ERROR_MESSAGES.requestNotFound };
    }

    logger.error(
      { err: error, action: "mutateContactRequests", mutationAction: parsed.data.action, requestIds: parsed.data.ids },
      "[mutateContactRequests] fehlgeschlagen",
    );
    return {
      success: false,
      error: parsed.data.action === "delete" ? ERROR_MESSAGES.requestDeleteFailed : ERROR_MESSAGES.statusUpdateFailed,
    };
  }
}
