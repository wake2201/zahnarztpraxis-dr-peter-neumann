"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { ERROR_MESSAGES } from "../schemas";
import { logger } from "../logger";
import { requireAdmin } from "./auth-helpers";

export async function getAuditLogs() {
  await requireAdmin();

  after(async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    await prisma
      .$transaction(async (tx) => {
        await tx.auditLog.deleteMany({
          where: { createdAt: { lt: sixMonthsAgo } },
        });
      })
      .catch((err) => logger.error({ err, action: "getAuditLogs" }, "Audit retention cleanup failed"));
  });

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));
}

export async function clearAuditLogs(): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.auditLog.deleteMany({});

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || session.user.email || "Admin",
          action: "CLEAR_LOGS",
          details: `${deleted.count} Log-Eintraege geloescht`,
        },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "clearAuditLogs", userId: session.user.id }, "[clearAuditLogs] Server Action fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.logsClearFailed };
  }
}
