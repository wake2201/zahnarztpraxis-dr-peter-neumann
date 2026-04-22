import Link from "next/link";
import type { Metadata } from "next";
import { publicContent } from "@/content/data";

export const metadata: Metadata = {
  title: publicContent.metadata.impressum.title,
};

export default function ImpressumPage() {
  const { legal, practice } = publicContent;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
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
          {legal.impressumHeading}
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              Angaben gemäß § 5 TMG
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {practice.fullName}
              <br />
              {practice.address.street}<br />
              {practice.address.lineTwo}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              {legal.contactHeading}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Telefon: {practice.phone.display}
              <br />
              Website:{" "}
              <a
                href={practice.website.href}
                className="text-primary hover:underline"
              >
                {practice.website.label}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              Berufsbezeichnung und berufsrechtliche Regelungen
            </h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Gesetzliche Berufsbezeichnung:</strong> Zahnarzt
              (verliehen in der Bundesrepublik Deutschland)
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              <strong>Zuständige Kammer:</strong>
              <br />
              Landeszahnärztekammer Sachsen-Anhalt
              <br />
              Große Diesdorfer Str. 162
              <br />
              39110 Magdeburg
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              Haftungsausschluss
            </h2>

            <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">
              Haftung für Inhalte
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
              sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
              10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen
              oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>

            <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">
              Haftung für Links
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar.
            </p>

            <h3 className="text-lg font-medium text-slate-700 mt-4 mb-2">
              Urheberrecht
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
