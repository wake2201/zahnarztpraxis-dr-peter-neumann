import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";

/**
 * Auth-Guard für alle geschützten Admin-Routen.
 * Route-Group "(protected)" applies diesen Guard auf alle Unterseiten
 * ohne die Login-Seite zu blockieren.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
