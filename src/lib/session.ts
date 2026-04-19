import "server-only";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Request-scoped Session-Cache. `react.cache` dedupliziert identische Aufrufe
 * innerhalb desselben Requests → Layout + Page teilen sich genau einen
 * `getServerSession`-Call statt zwei.
 */
export const getCachedSession = cache(async () => {
  return getServerSession(authOptions);
});
