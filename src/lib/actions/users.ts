"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "../../generated/prisma";
import { prisma } from "../prisma";
import { actionIdSchema, createUserSchema, ERROR_MESSAGES } from "../schemas";
import { logger } from "../logger";
import { normalizeRole } from "../auth";
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
          userName: session.user.name || session.user.email || "Admin",
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
  const parsed = actionIdSchema.safeParse(id);
  if (!parsed.success) {
    return { success: false, error: ERROR_MESSAGES.invalidInput };
  }

  if (session.user.id === parsed.data) {
    return { success: false, error: ERROR_MESSAGES.selfDeleteBlocked };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const deleted = await tx.user.deleteMany({
        where: {
          id: parsed.data,
          role: { equals: "staff", mode: "insensitive" },
        },
      });

      if (deleted.count === 0) {
        const existingUser = await tx.user.findUnique({
          where: { id: parsed.data },
          select: { role: true },
        });

        if (!existingUser) {
          return { status: "missing" as const };
        }

        const targetRole = normalizeRole(existingUser.role);
        if (targetRole === "admin") {
          return { status: "protected" as const };
        }

        return { status: "invalid-role" as const };
      }

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || session.user.email || "Admin",
          action: "DELETE_USER",
          details: `Mitarbeiter geloescht (ID: ${parsed.data})`,
        },
      });

      return { status: "deleted" as const };
    });

    if (result.status === "missing") {
      return { success: false, error: ERROR_MESSAGES.userNotFound };
    }

    if (result.status === "protected") {
      return { success: false, error: ERROR_MESSAGES.adminDeleteBlocked };
    }

    if (result.status === "invalid-role") {
      logger.warn(
        { action: "deleteUser", targetUserId: parsed.data },
        "[deleteUser] Unbekannte Zielrolle blockiert",
      );
      return { success: false, error: ERROR_MESSAGES.userDeleteFailed };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    logger.error({ err: error, action: "deleteUser", targetUserId: parsed.data }, "[deleteUser] fehlgeschlagen");
    return { success: false, error: ERROR_MESSAGES.userDeleteFailed };
  }
}

export async function getUsers() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    ...user,
    role: normalizeRole(user.role) ?? "admin",
    createdAt: user.createdAt.toISOString(),
  }));
}
