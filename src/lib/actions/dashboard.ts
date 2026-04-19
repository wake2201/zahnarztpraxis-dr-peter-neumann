"use server";

import { prisma } from "../prisma";
import { after } from "next/server";
import { logger } from "../logger";
import { requireAuth } from "./auth-helpers";

/**
 * Dashboard-Statistiken (total + unread). Löst Audit-Retention asynchron aus.
 */
export async function getDashboardStats() {
  await requireAuth();

  const [total, unread] = await Promise.all([
    prisma.contactRequest.count(),
    prisma.contactRequest.count({ where: { read: false } }),
  ]);

  after(async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    await prisma
      .$transaction(async (tx) => {
        await tx.auditLog.deleteMany({
          where: { createdAt: { lt: sixMonthsAgo } },
        });
      })
      .catch((err) => logger.error({ err, action: "getDashboardStats" }, "Audit retention cleanup failed"));
  });

  return { total, unread };
}
