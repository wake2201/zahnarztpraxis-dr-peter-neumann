import Link from "next/link";
import { CalendarCheck, Phone, MapPin, Heart } from "lucide-react";
import { publicContent } from "@/content/data";

export function Footer() {
  const { footer, practice } = publicContent;

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Praxis-Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">{practice.doctorName}</p>
                <p className="text-sm text-slate-400">{practice.locationLabel}</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Ihr Wohlbefinden und Ihre Gesundheit liegen uns am Herzen. Rund um
              Ihre Zahngesundheit unterstützen wir unsere Patienten durch
              ausführliche, vertrauensvolle Beratung und individuelle
              Leistungen.
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
              {footer.contactHeading}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={practice.phone.href}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {practice.phone.display}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {practice.address.street}<br />
                    {practice.address.lineTwo}
                  </span>
                </div>
              </li>
              <li>
                <Link
                  href="/termin"
                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {footer.manageAppointmentLabel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">
              {footer.legalHeading}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Datenschutzerklärung
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trennlinie + Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {practice.fullName}. {footer.rightsReservedLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
