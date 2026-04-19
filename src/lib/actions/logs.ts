"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";
import { ERROR_MESSAGES } from "../schemas";
import { logger } from "../logger";
import { requireAdmin } from "./auth-helpers";

export async function getAuditLogs() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));
}

export async function clearAuditLogs(): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdmin();

  try {
    const count = await prisma.auditLog.count();

    await prisma.$transaction([
      prisma.auditLog.deleteMany({}),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user?.name || session.user?.email || "Admin",
          action: "CLEAR_LOGS",
          details: `${count} Log-Einträge gelöscht`,
        },
      }),
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "clearAuditLogs", userId: session.user.id }, "[clearAuditLogs] Server Action fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.logsClearFailed };
  }
}
