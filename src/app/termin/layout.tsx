import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { publicContent } from "@/content/data";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function AppointmentLayout({ children }: { children: React.ReactNode }) {
  const { practice } = publicContent;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Zur Startseite der Zahnarztpraxis"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-shadow group-hover:shadow-lg">
              <Heart className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight text-slate-800">{practice.doctorName}</span>
              <span className="hidden text-xs text-slate-500 sm:block">{practice.locationLabel}</span>
            </span>
          </Link>

          <Button asChild variant="outline" size="sm">
            <a href={practice.phone.href}>
              <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{practice.phone.display}</span>
              <span className="sm:hidden">Anrufen</span>
            </a>
          </Button>
        </div>
      </header>

      {children}
      <Footer />
    </div>
  );
}
