import "server-only";
import { redirect } from "next/navigation";
import { getCachedSession } from "../session";

export async function requireAuth() {
  const session = await getCachedSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    redirect("/admin");
  }
  return session;
}
