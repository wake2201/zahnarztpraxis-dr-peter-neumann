"use server";

import { prisma } from "../prisma";
import { Prisma } from "../../generated/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { createUserSchema, ERROR_MESSAGES } from "../schemas";
import { logger } from "../logger";
import { requireAdmin } from "./auth-helpers";

export async function createUser(data: { email: string; password: string; name: string }) {
  const session = await requireAdmin();

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || ERROR_MESSAGES.invalidInput;
    return { success: false, error: firstError };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: parsed.data.email.toLowerCase(),
          password: hashedPassword,
          name: parsed.data.name,
          role: "staff",
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user?.name || session.user?.email || "Admin",
          action: "CREATE_USER",
          details: `Neuer Mitarbeiter (ID: ${user.id})`,
        },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: ERROR_MESSAGES.emailDuplicate };
    }
    logger.error({
      err: error,
      action: "createUser",
      code: error && typeof error === "object" && "code" in error ? (error as Record<string, unknown>).code : undefined,
    }, "[createUser] Server Action fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.userCreateFailed };
  }
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();

  if (session.user.id === id) {
    return { success: false, error: ERROR_MESSAGES.selfDeleteBlocked };
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return { success: false, error: ERROR_MESSAGES.userNotFound };
    }

    if (targetUser.role === "admin") {
      return { success: false, error: ERROR_MESSAGES.adminDeleteBlocked };
    }

    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user?.name || session.user?.email || "Admin",
          action: "DELETE_USER",
          details: `Mitarbeiter gelöscht (ID: ${targetUser.id})`,
        },
      }),
      prisma.user.delete({ where: { id } }),
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "deleteUser", targetUserId: id }, "[deleteUser] fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.userDeleteFailed };
  }
}

export async function getUsers() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
}
