import Link from "next/link";
import type { Metadata } from "next";
import { publicContent } from "@/content/data";

export const metadata: Metadata = {
  title: publicContent.metadata.privacy.title,
};

export default function DatenschutzPage() {
  const { legal, practice } = publicContent;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline py-2 px-3 -ml-3 rounded-lg hover:bg-primary-50 transition-colors"
          >
            &larr; {legal.backToHomeLabel}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-8">
          {legal.privacyHeading}
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              1. Verantwortlicher
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              <br />
              {practice.fullName}
              <br />
              {practice.address.street}<br />
              {practice.address.lineTwo}
              <br />
              Telefon: {practice.phone.display}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Beim Besuch unserer Website werden automatisch Informationen
              allgemeiner Natur erfasst (sog. Server-Logfiles). Diese umfassen
              den Browsertyp/-version, das verwendete Betriebssystem, die
              Referrer-URL, den Hostnamen des zugreifenden Rechners sowie die
              Uhrzeit der Serveranfrage.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Diese Daten sind nicht bestimmten Personen zuordenbar. Eine
              Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
              vorgenommen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              3. Kontaktformular
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen,
              werden Ihre Angaben aus dem Formular (Vorname, Nachname,
              Telefonnummer, Anliegen) inklusive der von Ihnen dort angegebenen
              Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von
              Anschlussfragen bei uns gespeichert.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung). Sie können Ihre Einwilligung jederzeit widerrufen.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              <strong>Speicherdauer:</strong> Ihre Daten werden gelöscht,
              sobald Ihre Anfrage abschließend bearbeitet wurde, es sei denn,
              es bestehen gesetzliche Aufbewahrungspflichten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              4. Cookies
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Diese Website verwendet ausschließlich technisch notwendige
              Cookies, die für den ordnungsgemäßen Betrieb der Website
              erforderlich sind. Es werden keine Tracking-Cookies oder Cookies
              von Drittanbietern eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              5. Keine externen Dienste
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Diese Website lädt keine externen Ressourcen wie Google Fonts,
              Google Analytics oder andere Tracking-Dienste. Alle Schriften
              werden lokal gehostet, um Ihre Privatsphäre bestmöglich zu
              schützen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              6. Ihre Rechte
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Sie haben jederzeit das Recht auf:
            </p>
            <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>
                Einschränkung der Verarbeitung (Art. 18 DSGVO)
              </li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              Zur Ausübung Ihrer Rechte können Sie uns unter den oben genannten
              Kontaktdaten erreichen. Zudem steht Ihnen ein Beschwerderecht bei
              der zuständigen Aufsichtsbehörde zu.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
