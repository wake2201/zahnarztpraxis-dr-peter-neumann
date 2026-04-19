/**
 * Admin Layout — Wrapper für alle /admin Routen.
 * Auth-Guard liegt in (protected)/layout.tsx — schützt alle Dashboard-Seiten.
 * Die Login-Seite liegt außerhalb der Route Group und ist frei zugänglich.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
