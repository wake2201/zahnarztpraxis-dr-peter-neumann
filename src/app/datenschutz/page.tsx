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
              Verantwortlich f&uuml;r die Datenverarbeitung auf dieser Website ist:
              <br />
              {practice.fullName}
              <br />
              {practice.address.street}
              <br />
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
              Beim technischen Betrieb unserer Website werden nur solche Daten
              verarbeitet, die f&uuml;r die Auslieferung der Inhalte, die
              Stabilit&auml;t des Systems und den Schutz vor Missbrauch
              erforderlich sind. Dazu k&ouml;nnen insbesondere Zeitpunkt des
              Zugriffs, angeforderte Pfade und sicherheitsrelevante technische
              Verbindungsdaten geh&ouml;ren.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Eine Nutzung zu Tracking-, Profiling- oder Werbezwecken findet
              nicht statt. Fehler- und Sicherheitsprotokolle werden auf das
              erforderliche Ma&szlig; begrenzt; insbesondere werden keine
              Inhalte aus dem Kontaktformular, keine vollst&auml;ndigen
              Browser-Stacks und keine vollst&auml;ndigen Ger&auml;tekennungen
              zu Diagnosezwecken protokolliert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              3. Kontaktformular
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Wenn Sie uns &uuml;ber das Kontaktformular Anfragen zukommen lassen,
              werden Ihre Angaben aus dem Formular (Vorname, Nachname,
              Telefonnummer, Anliegen sowie optional Ihre bevorzugte
              Erreichbarkeit und zus&auml;tzliche Informationen) inklusive der
              von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der
              Anfrage und f&uuml;r den Fall von Anschlussfragen bei uns
              gespeichert.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung). Sie k&ouml;nnen Ihre Einwilligung jederzeit
              widerrufen.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              <strong>Speicherdauer:</strong> Ihre Daten werden f&uuml;r die
              Bearbeitung Ihrer Anfrage und m&ouml;gliche Anschlussfragen
              gespeichert. Nach abschlie&szlig;ender Bearbeitung werden
              Kontaktanfragen durch autorisierte Mitarbeitende manuell
              gel&ouml;scht, sofern keine gesetzlichen Aufbewahrungspflichten
              entgegenstehen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              4. Online-Terminbuchung und Terminverwaltung
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Wenn Sie einen Termin online buchen, verarbeiten wir die von
              Ihnen eingegebenen Angaben (Vorname, Nachname, Telefonnummer,
              Terminart und gew&auml;hlter Zeitpunkt sowie gegebenenfalls
              zus&auml;tzliche Informationen), um den Termin anzulegen,
              durchzuf&uuml;hren und zu verwalten. Eine E-Mail-Adresse oder ein
              Benutzerkonto ist daf&uuml;r nicht erforderlich.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Nach der Buchung erhalten Sie einen pers&ouml;nlichen Zugangscode.
              Der Code wird nicht im Klartext gespeichert. Er dient dazu,
              Ihren Terminstatus aufzurufen und zul&auml;ssige &Auml;nderungen oder
              eine Absage vorzunehmen. Bewahren Sie ihn daher vor dem Zugriff
              durch Dritte gesch&uuml;tzt auf.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung) sowie, soweit die Verarbeitung der Vorbereitung
              oder Durchf&uuml;hrung einer Behandlung dient, Art. 6 Abs. 1 lit. b
              DSGVO. Termindaten werden nur so lange gespeichert, wie dies zur
              Terminverwaltung und aufgrund gesetzlicher Pflichten erforderlich
              ist.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              5. Cookies
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Diese Website verwendet ausschlie&szlig;lich technisch notwendige
              Cookies, die f&uuml;r den ordnungsgem&auml;&szlig;en Betrieb der
              Website erforderlich sind. Es werden keine Tracking-Cookies oder
              Cookies von Drittanbietern eingesetzt.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Nach erfolgreicher Eingabe eines Termin-Zugangscodes wird ein
              kurzlebiges, technisch notwendiges und vor clientseitigem
              Auslesen gesch&uuml;tztes Sitzungscookie gesetzt. Es erm&ouml;glicht die
              Terminverwaltung, wird nicht zu Trackingzwecken verwendet und
              verliert nach kurzer Zeit seine G&uuml;ltigkeit.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Der eingeblendete Datenschutzhinweis dient nur der Information und
              speichert keine Auswahl dauerhaft im Browser, insbesondere weder
              per Cookie noch per <code>localStorage</code>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              6. Keine externen Dienste
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Diese Website l&auml;dt keine externen Ressourcen wie Google Fonts,
              Google Analytics oder andere Tracking-Dienste. Alle Schriften
              werden lokal gehostet. Es findet keine unn&ouml;tige
              Wiedererkennung, kein Fingerprinting und keine personenbezogene
              Protokollierung zu Marketingzwecken statt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              7. Ihre Rechte
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Sie haben jederzeit das Recht auf:
            </p>
            <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
              <li>Auskunft &uuml;ber Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>L&ouml;schung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschr&auml;nkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Daten&uuml;bertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              Zur Aus&uuml;bung Ihrer Rechte k&ouml;nnen Sie uns unter den oben
              genannten Kontaktdaten erreichen. Zudem steht Ihnen ein
              Beschwerderecht bei der zust&auml;ndigen Aufsichtsbeh&ouml;rde zu.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
