import "server-only";
import { cache } from "react";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions, normalizeRole } from "./auth";

function normalizeSession(session: Session | null): Session | null {
  if (!session?.user) {
    return null;
  }

  const sessionUserId = typeof session.user.id === "string" ? session.user.id.trim() : "";
  const normalizedRole = normalizeRole(session.user.role);
  if (!sessionUserId || !normalizedRole) {
    return null;
  }

  return {
    ...session,
    user: {
      id: sessionUserId,
      email: typeof session.user.email === "string" ? session.user.email : null,
      name: typeof session.user.name === "string" ? session.user.name : null,
      role: normalizedRole,
    },
  };
}

/**
 * Request-scoped Session-Cache. `react.cache` dedupliziert identische Aufrufe
 * innerhalb desselben Requests → Layout + Page teilen sich genau einen
 * `getServerSession`-Call statt zwei.
 */
export const getCachedSession = cache(async () => {
  return normalizeSession(await getServerSession(authOptions));
});
