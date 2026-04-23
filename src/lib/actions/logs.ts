"use server";

import { after } from "next/server";
import { prisma } from "../prisma";
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
