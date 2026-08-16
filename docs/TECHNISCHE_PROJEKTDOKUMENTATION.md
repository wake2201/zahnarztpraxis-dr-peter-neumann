# Technische Projektdokumentation – Zahnarztpraxis Dr. Peter Neumann

## 1. Titel, Inhaltsverzeichnis und Dokumentstatus

Diese Referenz beschreibt den am **16. August 2026** lokal vorgefundenen Quellstand von `zahnarztpraxis-dr-neumann`. Sie behandelt ausschließlich belegtes Verhalten. Die verbindlichen Statusmarken sind **Implemented**, **Partially implemented**, **Planned only**, **Obsolete or unused**, **Inferred** und **Unknown**.

**Dokumentstatus:** Vollständiger statischer Ist-Bericht innerhalb des analysierbaren Repository-Umfangs. Die Laufzeit- und Deployment-Grenzen sind ausdrücklich als **Unknown** ausgewiesen; die Abschlussbilanz steht in [Abschnitt 36](#36-coverage-ledger-und-finaler-vollständigkeitsbericht).

### Inhaltsverzeichnis

1. [Titel, Inhaltsverzeichnis und Dokumentstatus](#1-titel-inhaltsverzeichnis-und-dokumentstatus)
2. [Analysedatum, Git-Branch, Commit und Working Tree](#2-analysedatum-git-branch-commit-und-working-tree)
3. [Umfang, Methodik, Evidenzregeln und Ausschlüsse](#3-umfang-methodik-evidenzregeln-und-ausschlüsse)
4. [Technische Zusammenfassung](#4-technische-zusammenfassung)
5. [Tatsächlicher aktueller Implementierungsstand](#5-tatsächlicher-aktueller-implementierungsstand)
6. [Implementierte, partielle, geplante und ungenutzte Funktionalität](#6-implementierte-partielle-geplante-und-ungenutzte-funktionalität)
7. [Vollständige Repository- und Verzeichnisübersicht](#7-vollständige-repository--und-verzeichnisübersicht)
8. [Anwendungen, Workspaces, Pakete, Dienste und Module](#8-anwendungen-workspaces-pakete-dienste-und-module)
9. [Technologie-Stack und Laufzeitumgebungen](#9-technologie-stack-und-laufzeitumgebungen)
10. [Direkte Abhängigkeiten, Versionen, Zweck und Nutzung](#10-direkte-abhängigkeiten-versionen-zweck-und-nutzung)
11. [Gesamtarchitektur](#11-gesamtarchitektur)
12. [Schicht- und Modulverantwortung](#12-schicht--und-modulverantwortung)
13. [Abhängigkeitsrichtungen und Architekturgrenzen](#13-abhängigkeitsrichtungen-und-architekturgrenzen)
14. [Einstiegspunkte, Bootstrap, Start, Lebenszyklus und Shutdown](#14-einstiegspunkte-bootstrap-start-lebenszyklus-und-shutdown)
15. [Vollständiger Funktionskatalog](#15-vollständiger-funktionskatalog)
16. [Benutzeroberflächen, Seiten, Komponenten, Navigation und Zustände](#16-benutzeroberflächen-seiten-komponenten-navigation-und-zustände)
17. [APIs, Routen, Protokolle, Ereignisse und Nachrichtenformate](#17-apis-routen-protokolle-ereignisse-und-nachrichtenformate)
18. [Domänenlogik, Geschäftsregeln und Validierung](#18-domänenlogik-geschäftsregeln-und-validierung)
19. [Datenmodelle, Persistenz, Migrationen, Indizes und Transaktionen](#19-datenmodelle-persistenz-migrationen-indizes-und-transaktionen)
20. [Authentifizierung, Autorisierung, Sessions und Identität](#20-authentifizierung-autorisierung-sessions-und-identität)
21. [Sicherheit, Datenschutz, Vertrauensgrenzen und Secrets](#21-sicherheit-datenschutz-vertrauensgrenzen-und-secrets)
22. [Kryptografie und Schlüssel-Lebenszyklus](#22-kryptografie-und-schlüssel-lebenszyklus)
23. [Externe Dienste und Integrationen](#23-externe-dienste-und-integrationen)
24. [Hintergrundarbeit, Queues, Scheduler, Caching, Retries und Nebenläufigkeit](#24-hintergrundarbeit-queues-scheduler-caching-retries-und-nebenläufigkeit)
25. [Konfiguration und Umgebungsvariablen](#25-konfiguration-und-umgebungsvariablen)
26. [Fehlerbehandlung, Logging, Metriken, Tracing und Beobachtbarkeit](#26-fehlerbehandlung-logging-metriken-tracing-und-beobachtbarkeit)
27. [Build, Entwicklung, Tests, Deployment und Betrieb](#27-build-entwicklung-tests-deployment-und-betrieb)
28. [Testarchitektur, Szenarien, Abdeckung und Lücken](#28-testarchitektur-szenarien-abdeckung-und-lücken)
29. [Technische Datei-für-Datei-Referenz](#29-technische-datei-für-datei-referenz)
30. [Vollständige Funktions- und Symbolreferenz](#30-vollständige-funktions--und-symbolreferenz)
31. [Aufrufgraph, Abhängigkeitskarte und Änderungsfolgen](#31-aufrufgraph-abhängigkeitskarte-und-änderungsfolgen)
32. [TODOs, FIXMEs, Stubs, Dead Code und technische Schulden](#32-todos-fixmes-stubs-dead-code-und-technische-schulden)
33. [Sicherheits-, Betriebs-, Zuverlässigkeits- und Wartungsrisiken](#33-sicherheits--betriebs--zuverlässigkeits--und-wartungsrisiken)
34. [Widersprüche zwischen Code, Konfiguration und Dokumentation](#34-widersprüche-zwischen-code-konfiguration-und-dokumentation)
35. [Glossar](#35-glossar)
36. [Coverage-Ledger und finaler Vollständigkeitsbericht](#36-coverage-ledger-und-finaler-vollständigkeitsbericht)

## 2. Analysedatum, Git-Branch, Commit und Working Tree

| Merkmal | Ergebnis | Evidenz und Grenze |
|---|---|---|
| Analysedatum | 2026-08-16, Zeitzone Europe/Berlin | Arbeitsumgebung der Analyse |
| Repository-Wurzel | `D:\zahnarztpraxis-dr-peter-neumann-main` | Geöffneter Projektordner |
| Git-Branch | **Unknown** | Im Projekt liegt kein lesbares `.git/` vor; `git status` und `git ls-files` melden „not a git repository“. |
| Git-Commit | **Unknown** | Ohne `.git/` ist keine Commit-ID ableitbar. |
| Working-Tree-Status | **Unknown** | Ohne Git-Metadaten sind „tracked“, „untracked“ und bestehende Benutzeränderungen nicht bestimmbar. |
| Ausgangsbestand | 79 relevante Dateien plus zwei generierte Playwright-Artefakte | Vollständige Dateisuche; Einzelstatus in Abschnitt 36 |
| Zieländerung | ausschließlich `docs/TECHNISCHE_PROJEKTDOKUMENTATION.md` | Hashvergleich der 79 Ausgangsdateien, siehe Abschnitt 36 |

**Unknown:** Ein späterer Import dieses Verzeichnisses in ein Git-Repository kann Branch, Commit und ursprünglichen Änderungszustand nachliefern; der lokale Inhalt allein kann diese Metadaten nicht rekonstruieren.

## 3. Umfang, Methodik, Evidenzregeln und Ausschlüsse

### 3.1 Analysierter Umfang

Analysiert wurden alle 79 vorgefundenen relevanten Projektdateien: 14 Root-Dateien, sieben Workflow-Referenzen unter `.agents/`, zwei Prisma-Dateien, ein lokales Ausführungsskript, 47 Dateien unter `src/` und acht E2E-Dateien. Die neu erzeugte Referenz ist als 80. relevante Datei im finalen Ledger enthalten. Berücksichtigt wurden Quellcode, deklarative Symbole, Importe/Exporte, App-Router-Registrierung, Server Actions, Datenbankschema, Lockfile, Skripte, Tests, Konfiguration, bestehende Architektur- und Betriebsdokumentation sowie tatsächlich vorhandene Testartefakte.

### 3.2 Vorgehen und Quellenrang

1. `AGENTS.md:1-267` und `ARCHITECTURE.md:1-522` wurden vollständig gelesen. Die vorgeschriebenen lokalen Abläufe aus `.agents/skills/*.md` wurden für Planung, Risiko, Review und Validierung angewandt.
2. Die Dateiinventur erfolgte repository-weit; versteckte Dateien wurden gesondert erfasst. Importe, Exporte, App-Router-Dateinamen, npm-Skripte, Umgebungszugriffe, Prisma-Symbole und Testregistrierungen wurden gegengeprüft.
3. Ein bereits lokal vorhandener TypeScript-Compiler 5.9.3 wurde nur lesend als AST-Parser verwendet. Er fand 396 projektgeschriebene Funktions-, Methoden- und Callback-Körper: 223 in `src/`, 161 in `tests/e2e/`, fünf in `prisma/seed.ts`, sechs in `scripts/run-local-env.mjs` und einen in `next.config.ts`. Jede Einheit hat in Abschnitt 30 eine eigene Zeile.
4. Ausführbarer Code und aktive Konfiguration haben Vorrang vor `README.md` und `ARCHITECTURE.md`. Aussagen aus Markdown ohne Codebeleg werden **Planned only**, **Partially implemented** oder **Unknown** zugeordnet.
5. Die Datenbank wurde nicht verbunden. Schema und SQL-Nutzung sind statisch belegt; der reale Datenbankzustand bleibt **Unknown**.
6. Die erzeugten Playwright-Ausgaben wurden nur lesend auf Provenienz und Alter geprüft. Ihr Bericht wurde nicht als Nachweis für den aktuellen Quellstand gewertet.

„Statisch bestätigt“ bedeutet einen direkten Import, Aufruf oder eine Framework-Dateiregistrierung. „Framework-registriert“ bedeutet eine Next.js-, NextAuth-, React-, Prisma-, npm- oder Playwright-Konvention. „Inferred“ kennzeichnet eine aus mehreren Belegen abgeleitete, aber nicht zur Laufzeit beobachtete Aussage. „Unknown“ markiert fehlende Laufzeit-, Deployment-, Git- oder Datenbankevidenz.

### 3.3 Sicherheitsbedingte Ausführungsgrenze

Die E2E-Suite wurde nicht ausgeführt. `package.json:19-21` und `playwright.config.ts:1,33-37` können die normale Umgebung und einen wiederverwendeten lokalen Server verwenden. Gleichzeitig löschen Testhelper globale Tabellenbestände (`tests/e2e/helpers/db-cleanup.ts:75-79,104-121,220-237`) und `role-visibility.spec.ts:29-42` überschreibt den über `ADMIN_EMAIL` bezeichneten Benutzer ohne vollständige Wiederherstellung. Selbst `scripts/run-local-env.mjs:38-97` prüft nur einen Loopback-Datenbankhost, nicht einen als wegwerfbar verifizierten Datenbanknamen; ein wiederverwendeter Server kann zudem mit anderer Umgebung laufen. Ein sicherer Ausschluss externer oder produktiver Mutationen war deshalb nicht beweisbar.

### 3.4 Ausschlüsse und fehlende Kategorien

| Kategorie | Zustand | Warum ausgeschlossen oder nicht analysierbar | Generator/autoritative Quelle und Nutzung |
|---|---|---|---|
| `.git/` | fehlt | VCS-Metadaten sind keine Anwendungslogik; hier zusätzlich nicht vorhanden | Ein externes Git-Repository würde sie erzeugen; Branch/Commit bleiben **Unknown**. |
| `node_modules/` | fehlt | Drittanbieterquellen und installierter Zustand | `package.json:26-63` deklariert, `package-lock.json` löst auf; npm würde installieren. |
| `src/generated/prisma/` | fehlt, ignoriert | abgeleiteter Prisma-Client | `prisma/schema.prisma:4-7`, Prisma Generator; Importe in `src/lib/prisma.ts:3`, `src/lib/auth.ts:6`, `src/lib/actions/users.ts:5`. |
| `.next/`, `out/`, `build/`, `.vercel/` | fehlen | Build-/Hosting-Ausgaben | Next.js-Build aus `src/` und `next.config.ts`. |
| `coverage/` | fehlt | erzeugte Testabdeckung | Kein Coverage-Skript in `package.json:5-21`. |
| `playwright-report/index.html` | vorhanden, eine Datei | generierter HTML-Testbericht, nicht autoritativer Quellcode | Playwright-Reporter aus `playwright.config.ts:10`; Statusanalyse in Abschnitt 28. |
| `test-results/.last-run.json` | vorhanden, eine Datei | generierter Laufstatus | Playwright; Statusanalyse in Abschnitt 28. |
| `prisma/migrations/` | fehlt, ignoriert | keine versionierte Migrationshistorie | `prisma/schema.prisma` ist Schemaquelle; `README.md:161-175` und `ARCHITECTURE.md:127-132` schreiben `db push` vor. |
| `.env`, `.env*.local` | fehlen/ignoriert und nicht gelesen | können Secrets enthalten | Namen und sichere Formate stammen ausschließlich aus `.env.example` und Codezugriffen. |
| `public/` | fehlt | kein Ausschluss, sondern belegter Bestand von null projekt-eigenen Medien | Keine `next/image`-, `<img>`- oder CSS-`url(...)`-Nutzung. |
| CI/CD, Container, IaC, Prozessmanager | keine Dateien vorhanden | kein analysierbarer Implementierungsbestand | Nur manuelle Hinweise in `README.md`; Implementierung **Unknown** beziehungsweise **Planned only**. |

`package-lock.json` wurde trotz maschineller Erzeugung einbezogen, weil es die im aktuellen Bestand verbindliche Versionsauflösung und Transitivabhängigkeiten belegt.

## 4. Technische Zusammenfassung

**Implemented:** Das Projekt ist eine einzelne Next.js-15-App-Router-Anwendung für eine Zahnarztpraxis. Sie stellt eine öffentliche deutschsprachige Landingpage, Impressum, Datenschutzerklärung, Kontaktformular, Cookie-Informationsbanner, einen Credentials-basierten Admin-/Staff-Zugang und ein rollenabhängiges Verwaltungsdashboard bereit (`src/app/page.tsx:1-18`, `src/app/admin/**`, `src/components/**`). Persistenz erfolgt über Prisma 7 mit dem PostgreSQL-Adapter (`prisma/schema.prisma:4-80`, `src/lib/prisma.ts:1-79`).

**Implemented:** Die serverseitigen Kernfähigkeiten sind Kontaktanlage und -verwaltung, Staff-Benutzerverwaltung, Auditprotokollierung, Login-Sperren, zwei datenbankbasierte Rate Limits, CSP-/Security-Header und ein gedrosselter Clientfehler-Endpunkt (`src/lib/actions/**`, `src/lib/auth.ts`, `src/lib/rate-limit.ts`, `src/middleware.ts`, `next.config.ts`, `src/app/api/log/client-error/route.ts`). Alle gefundenen Produktionsmutationen liegen in `prisma.$transaction`.

**Partially implemented:** Der Quellbestand ist nicht unmittelbar ausführbar: `node_modules/`, der generierte Prisma-Client, Laufzeit-Secrets und eine nachweislich synchronisierte Datenbank fehlen. Audit- und Rate-Limit-Retention werden nur durch Verkehr ausgelöst; Kontaktanfragen haben keine automatische Retention. Dashboard-Statistiken basieren auf höchstens 50 geladenen Anfragen, und partielle Serverfehler werden als leere Datensätze dargestellt (`src/app/admin/(protected)/page.tsx:13-44`).

**Unknown:** Es gibt keine Git-, CI-, Hosting-, Migrations- oder Live-Datenbankevidenz. Ein aktueller Build-, Lint-, Typecheck- oder Laufzeiterfolg ist nicht nachgewiesen. Der vorhandene Playwright-Bericht ist älter als der aktuelle Testbestand.

Die wichtigsten Sicherheitsbefunde sind ein durch User-Agent-Rotation umgehbares Login-Bucketing (`src/lib/auth.ts:96-102`), nicht ausreichend isolierte destruktive E2E-Helfer, die Protokollierung eines clientkontrollierten `digest`, rohe IP-Adressen in `RateLimit`, fehlende Eingabelängengrenzen vor teuren Authentifizierungsoperationen und anwendungs-, nicht datenbankseitig erzwungene Rollen- und Auditwerte. Details und Prioritäten stehen in Abschnitt 33.

## 5. Tatsächlicher aktueller Implementierungsstand

| Bereich | Status | Tatsächlicher Stand | Hauptbelege |
|---|---|---|---|
| Öffentliche Website | **Implemented** | Fünf routbare Ansichten: `/`, `/impressum`, `/datenschutz`, `/admin/login`, `/admin`; `/robots.txt` wird dynamisch erzeugt. | `src/app/page.tsx`, `src/app/{impressum,datenschutz}/page.tsx`, `src/app/admin/**`, `src/app/robots.ts` |
| Kontaktaufnahme | **Implemented** | Strikte Zod-Validierung, Honeypot, IP-Rate-Limit und transaktionale PostgreSQL-Anlage; keine E-Mail-Zustellung. | `src/components/contact-form.tsx`, `src/lib/actions/contact.ts:24-91`, `src/lib/schemas.ts:68-126` |
| Admin-Authentifizierung | **Partially implemented** | NextAuth Credentials/JWT, DB-Revalidierung und Sperrlogik vorhanden; Account-Bucket ist wegen IP- und User-Agent-Anteil nicht account-global. | `src/lib/auth.ts:68-300`, `src/lib/session.ts`, `src/app/admin/login/page.tsx` |
| Anfrageverwaltung | **Implemented** | Cursor-Read bis 50, Read/Unread und atomare Bulk-Löschung mit Audit. | `src/lib/actions/contact.ts:97-177`, `src/components/admin/requests-tab.tsx` |
| Benutzerverwaltung | **Implemented** | Admin kann Staff anlegen/löschen; Self-Delete und Admin-Delete gesperrt; keine Rollenänderung oder Passwortzurücksetzung. | `src/lib/actions/users.ts:13-153`, `src/components/admin/users-tab.tsx` |
| Auditlog | **Partially implemented** | Vier Aktionsarten, neueste 100, reaktiver Sechsmonats-Cleanup; keine Pagination, DB-Enum oder periodische Garantie. | `src/lib/actions/logs.ts:8-32`, Schreiborte in `auth.ts`, `contact.ts`, `users.ts` |
| Security Header/CSP | **Implemented** | Request-spezifische Nonce-CSP in Middleware plus globale Header und Admin-`noindex`. | `src/middleware.ts:4-66`, `next.config.ts:3-52` |
| Clientfehler-Logging | **Partially implemented** | Öffentlicher JSON-Endpunkt mit Zod und 10/10-Minuten-Rate-Limit; `digest` bleibt clientkontrollierter Logtext. | `src/app/api/log/client-error/route.ts:6-79`, `src/lib/schemas.ts:172-177` |
| Datenbankbereitstellung | **Partially implemented** | Schema, Seed und `db push`-Skripte vorhanden; keine Migrationen oder Drift-Evidenz. | `prisma/schema.prisma`, `prisma/seed.ts`, `package.json:12-18` |
| Tests | **Partially implemented** | Sieben E2E-Specs mit 44 Fällen; keine Unit-/Komponenten-Suite und kein sicherer aktueller Laufnachweis. | `tests/e2e/*.spec.ts`, `playwright.config.ts` |
| Build/Deployment | **Partially implemented** | npm-Build und manueller README-Betriebspfad vorhanden; CI, Container, IaC und Hostingkonfiguration fehlen. | `package.json:6-10`, `README.md` |
| Medien/Assets | **Implemented** | Belegter Projektbestand: null lokale Medien; Icons/Animationen sind Komponentenabhängigkeiten, Inter kommt über `next/font/google`. | `src/app/layout.tsx:1-13`, Importinventar |

## 6. Implementierte, partielle, geplante und ungenutzte Funktionalität

| Funktion/Kapazität | Status | Einordnung und Evidenz |
|---|---|---|
| Landingpage mit Navigation, Hero, Praxisdarstellung, Sprechzeiten, Kontakt und Footer | **Implemented** | Zusammensetzung in `src/app/page.tsx:1-18`; Inhalte aus `src/content/data.ts`. |
| Responsive Navigation und mobiles Menü | **Implemented** | `src/components/navbar.tsx`; Menu-State und `AnimatePresence`, jedoch Accessibility-Lücke in Abschnitt 16. |
| Kontaktformular mit Anliegen, Erreichbarkeit, Telefon und Einwilligung | **Implemented** | `src/components/contact-form.tsx`, `submitContactForm` in `src/lib/actions/contact.ts`. |
| Kontaktversand per E-Mail | **Planned only** | In der vorhandenen Implementierung existiert keine Mail-Abhängigkeit oder Netzwerkintegration; Kontakte werden nur in PostgreSQL gespeichert. |
| Cookie-Informationsbanner ohne Tracking-Consent-State | **Implemented** | `src/components/cookie-banner.tsx`; nur lokaler Sichtbarkeitszustand, keine Cookie-/Storage-Schreiboperation. |
| Impressum und Datenschutzerklärung | **Implemented** | `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`. Rechtliche Richtigkeit bleibt außerhalb statischer Codeevidenz **Unknown**. |
| Credentials-Login, JWT-Session, rollenbasierte Guards | **Implemented** | `src/lib/auth.ts`, `src/lib/session.ts`, `src/lib/actions/auth-helpers.ts`, geschütztes Admin-Layout. |
| Belastbares accountweites Login-Lockout | **Partially implemented** | Zwei DB-Buckets existieren, aber beide enthalten IP und User-Agent (`src/lib/auth.ts:96-102`). |
| Anfrage-Tabelle, Polling, Cursor-Nachladen, Markieren und Löschen | **Implemented** | `dashboard-client.tsx`, `requests-tab.tsx`, `actions/contact.ts`. |
| Dashboard-Gesamtstatistik | **Partially implemented** | Berechnung nur aus dem jeweils geladenen Fenster von maximal 50 Datensätzen (`getContactRequests`, `dashboard-client.tsx`). |
| Staff-Anlage/-Löschung und rollenabhängige Sichtbarkeit | **Implemented** | `users-tab.tsx`, `actions/users.ts`, `role-visibility.spec.ts`. |
| Rollenwechsel, Passwortänderung, Passwortreset | **Planned only** | Kein Handler, Formular oder Route im Inventar. |
| Auditprotokoll für Login, Kontaktlöschung, Staff-Anlage/-Löschung | **Implemented** | `LOGIN`, `DELETE_REQUEST`, `CREATE_USER`, `DELETE_USER` in den jeweiligen Transaktionen. |
| Auditprotokoll für Read/Unread, fehlgeschlagene Logins, Seed-Änderungen | **Planned only** | Keine entsprechenden Schreiborte. |
| Harte, zeitgesteuerte Retention | **Partially implemented** | Audit- und Rate-Cleanup sind nur an Requests gekoppelt; Kontakte werden manuell gelöscht. |
| Öffentlicher Clientfehler-Endpunkt | **Implemented** | `POST /api/log/client-error`; keine Benutzeranmeldung erforderlich. |
| Nonce-basierte CSP und Sicherheitsheader | **Implemented** | `src/middleware.ts`, `next.config.ts`. |
| Mehrsprachigkeit/i18n | **Planned only** | In `ARCHITECTURE.md` erwähnt; kein Locale-Routing oder Übersetzungsbestand. |
| Redis/Upstash-Rate-Limit | **Planned only** | Nur dokumentarische Alternative; aktive Implementierung nutzt PostgreSQL. |
| Dark Mode | **Obsolete or unused** | `darkMode: ["class"]` in `tailwind.config.ts:5`, aber keine `dark:`-Klassen oder Theme-Umschaltung im Projekt. |
| `ERROR_MESSAGES.unauthorized` und `.adminOnly` | **Obsolete or unused** | Deklariert in `src/lib/schemas.ts:32-33`, ohne Quellreferenz außerhalb der Definition. |
| `publicContent.practice.city`, `address.postalCode` | **Obsolete or unused** | Werte in `src/content/data.ts:19,27,129,137`; Import-/Propertysuche zeigt keine aktive Darstellung. |
| Sitemap | **Planned only** | Middleware schließt `sitemap.xml` aus (`src/middleware.ts:64`), aber keine Sitemap-Route/Datei ist vorhanden. |
| Metriken, verteiltes Tracing, Queue, Worker, Cron | **Planned only** | Kein ausführbarer Bestand oder Dienstadapter vorhanden. |

## 7. Vollständige Repository- und Verzeichnisübersicht

```text
./
├── .agents/skills/                 7 lokale Workflow-Referenzen
├── docs/                           diese technische Referenz
├── playwright-report/              1 ausgeschlossene generierte Datei
├── prisma/
│   ├── schema.prisma               5 PostgreSQL-Modelle
│   └── seed.ts                     Admin-Upsert
├── scripts/
│   └── run-local-env.mjs           lokale Umgebungsgrenze
├── src/
│   ├── app/                        Next.js App Router, 15 Dateien
│   ├── components/                 UI und Admin-UI, 14 Dateien
│   ├── content/data.ts             statische Praxisinhalte
│   ├── lib/                        Auth, Actions, DB, Schemas, 14 Dateien
│   ├── styles/globals.css          globale Tailwind-/CSS-Regeln
│   ├── types/next-auth.d.ts        Session-/JWT-Augmentierung
│   └── middleware.ts               CSP und Nonce
├── test-results/                   1 ausgeschlossene generierte Datei
├── tests/e2e/                      7 Specs plus 1 DB-Helper
├── .env.example                    sichere Variablennamen/Beispielformate
├── .gitignore                      Ausschlussregeln
├── AGENTS.md                       verbindlicher Agentenprozess
├── ARCHITECTURE.md                 Soll- und Ist-Architekturreferenz
├── README.md                       Entwicklung/Betrieb/Produkttext
├── eslint.config.mjs               ESLint Flat Config
├── next.config.ts                  Next-/HTTP-Header-Konfiguration
├── package.json                    16 Befehle, 32 direkte Pakete
├── package-lock.json               npm-Lockfile v3, 619 Paketdatensätze
├── playwright.config.ts            zwei Browserprojekte
├── postcss.config.js               Tailwind/Autoprefixer
├── prisma.config.ts                Prisma-CLI-Datasource/Seed
├── tailwind.config.ts              Design-Tokens und Scanpfade
└── tsconfig.json                   strikte TypeScript-Konfiguration
```

Physisch fehlen `public/`, `src/generated/prisma/`, `prisma/migrations/`, `.next/`, `node_modules/`, CI-/Container-/IaC-Verzeichnisse und `.git/`. Eine individuelle Zuordnung jeder vorhandenen Datei steht in Abschnitt 29 und Abschnitt 36.

## 8. Anwendungen, Workspaces, Pakete, Dienste und Module

| Einheit | Status | Verantwortung | Grenze/Einstieg |
|---|---|---|---|
| Next.js-Webanwendung | **Implemented** | öffentliche Praxiswebsite und Verwaltungsoberfläche | App Router unter `src/app/`; ein npm-Paket, kein Workspace |
| Öffentliche UI | **Implemented** | Marketing-/Praxisinhalte, Kontakt, Rechtstexte | `src/app/page.tsx`, `src/components/{navbar,hero,about,schedule,contact-form,footer,cookie-banner}.tsx` |
| Admin-UI | **Implemented** | Login, Anfrage-, Benutzer- und Auditansicht | `src/app/admin/**`, `src/components/admin/**` |
| Server-Actions-Schicht | **Implemented** | sieben mutierende/lesende Operationen mit Auth- und Validierungsgrenzen | `src/lib/actions.ts`, `src/lib/actions/*.ts` |
| Authentifizierungsschicht | **Implemented** | NextAuth Credentials, Lockout, JWT-/Session-Callbacks | `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`, `src/lib/session.ts` |
| Persistenzschicht | **Implemented** | PostgreSQL-Pool, Prisma-Adapter/-Client, fünf Modelle | `src/lib/prisma.ts`, `prisma/schema.prisma` |
| Sicherheitsrand | **Implemented** | IP-Vertrauen, DB-Rate-Limit, CSP, Header, Schema-Sanitization | `src/lib/{client-ip,rate-limit,schemas}.ts`, `src/middleware.ts`, `next.config.ts` |
| Logging | **Implemented** | strukturierte Pino-Ereignisse und DB-Auditlog | `src/lib/logger.ts`, `AuditLog`-Schreiborte |
| Seed-CLI | **Implemented** | validierter initialer Admin-Upsert | `prisma/seed.ts`, npm-/Prisma-Registrierung |
| Lokaler Befehlswrapper | **Partially implemented** | lädt `.env.test.local`/`.env.local` und erzwingt Loopback-DB-Host | `scripts/run-local-env.mjs`; Datenbankname und Serverumgebung nicht hinreichend isoliert |
| Playwright-E2E-Paket | **Partially implemented** | Browser-/DB-Integrationstests | `tests/e2e/`, aktuell nicht sicher ausführbar und kein aktueller Laufnachweis |

Es existieren keine separaten Frontend-/Backend-Packages, keine Mobile-/Desktop-Anwendung, kein Monorepo-Workspace und kein eigenständiger Microservice. Next.js verbindet Browser-Rendering, React Server Components, Route Handler und Server Actions in einem Deploymentartefakt.

## 9. Technologie-Stack und Laufzeitumgebungen

| Bereich | Technologie/Version | Belegter Einsatz | Laufzeitstatus |
|---|---|---|---|
| Webframework | Next.js, Lock 15.5.15 | App Router, Middleware, Route Handler, Server Actions, `after()`, `next/font` | installiert/gestartet **Unknown** |
| UI | React/React DOM, Lock 19.2.5 | Server-/Client-Komponenten, Hooks, `cache` | installiert/gestartet **Unknown** |
| Sprache | TypeScript, Lock 5.9.3; Ziel ES2017 | 45 ausführbare TS/TSX-Dateien unter `src/`, Tests und Konfiguration | AST statisch analysiert; Projekt-Typecheck **Unknown** |
| Styling | Tailwind CSS 3.4.19, PostCSS 8.5.9, Autoprefixer 10.4.27 | globale Direktiven, Tokens, Utility-Klassen | Build **Unknown** |
| Datenzugriff | Prisma/Client/Adapter 7.7.0, `pg` 8.20.0 | PostgreSQL über `PrismaPg` und Pool | generierter Client/DB fehlen |
| Identität | NextAuth 4.24.13, `bcryptjs` 2.4.3 | Credentials, JWT, bcrypt-Hash/-Vergleich | Laufzeit **Unknown** |
| Validierung | Zod 4.3.6 | Kontakt, Benutzer, IDs, Clientfehler | statisch **Implemented** |
| Logging | Pino 9.14.0 | strukturierte Logs | Sink/Transport im Deployment **Unknown** |
| Browsertests | Playwright 1.59.1 | Desktop Chrome und Pixel-5-Chromium-Konfiguration | aktueller sicherer Lauf **Unknown** |
| Modulsystem | ESM/Bundler-Auflösung | TypeScript und `.mjs`; Alias `@/* → ./src/*` | `tsconfig.json:12-29` |
| Datenbank | PostgreSQL | einzig unterstütztes Laufzeitprotokoll im Adapterpfad | reale Version, Schema-Drift, Rechte **Unknown** |
| Betriebssystemkopplung | `npm.cmd` in Playwright-Webserver | Windows-spezifischer E2E-Start | widerspricht Ubuntu-Beispiel in `README.md` |

`package.json` definiert weder `engines` noch `packageManager`; unterstützte Node-/npm-Versionen sind daher **Unknown**. `tsconfig.json:10` aktiviert `strict`, lässt mit `skipLibCheck: true` jedoch Fremdtypprüfungen aus. `allowJs: true` gilt, während `include` nur TS/TSX-Muster und Next-Typen explizit nennt (`tsconfig.json:8,31-35`).

## 10. Direkte Abhängigkeiten, Versionen, Zweck und Nutzung

Die Tabelle nennt die 32 direkten Pakete aus `package.json:26-63`. „Lock“ ist die durch `package-lock.json` aufgelöste Version; mangels `node_modules/` ist die tatsächlich installierte Version **Unknown**.

| Paket | Art | Lock | Zweck und konkrete Nutzung |
|---|---|---:|---|
| `@prisma/adapter-pg` | Runtime | 7.7.0 | `PrismaPg(pool)` in `src/lib/prisma.ts:1-3,69-72` |
| `@prisma/client` | Runtime | 7.7.0 | Generator-/Runtimebasis des fehlenden Clients aus `prisma/schema.prisma:4-7`; keine direkten Quellimporte |
| `@radix-ui/react-slot` | Runtime | 1.2.4 | `Slot` für `Button.asChild` in `src/components/ui/button.tsx:1-46` |
| `bcryptjs` | Runtime | 2.4.3 | Passwort-Hash in `prisma/seed.ts`/`actions/users.ts`, Vergleich in `src/lib/auth.ts`, Testbenutzer im DB-Helper |
| `class-variance-authority` | Runtime | 0.7.1 | Button-Varianten in `src/components/ui/button.tsx` |
| `clsx` | Runtime | 2.1.1 | Eingabe für `cn` in `src/lib/utils.ts:1-6` |
| `dotenv` | Runtime | 16.6.1 | Standardimport in Prisma/Playwright und explizites Laden im lokalen Wrapper |
| `framer-motion` | Runtime | 12.38.0 | Animationen/In-View in `about`, `contact-form`, `cookie-banner`, `hero`, `navbar`, `schedule` |
| `lucide-react` | Runtime | 0.474.0 | Icon-Komponenten in 14 UI-Dateien; keine lokalen Bildassets |
| `next` | Runtime | 15.5.15 | Framework für App Router, Navigation, Cache, Header, Middleware und Build |
| `next-auth` | Runtime | 4.24.13 | Credentials-Route, Browser-`signIn`/`signOut`, Server-Session und Typaugmentierung |
| `pg` | Runtime | 8.20.0 | PostgreSQL-`Pool` in `src/lib/prisma.ts` |
| `pino` | Runtime | 9.14.0 | Logger-Fabrik in `src/lib/logger.ts`; Nutzung in Serverpfaden und Seed |
| `react` | Runtime | 19.2.5 | JSX/Hooks, Server-`cache`, `forwardRef` |
| `react-dom` | Runtime | 19.2.5 | Next-/React-DOM-Laufzeit; kein direkter Projektimport |
| `tailwind-merge` | Runtime | 3.5.0 | Konfliktauflösung in `cn`, `src/lib/utils.ts` |
| `tailwindcss-animate` | Runtime | 1.0.7 | Pluginregistrierung in `tailwind.config.ts:2,75` |
| `zod` | Runtime | 4.3.6 | Grenzschemas und `ZodError` in `src/lib/schemas.ts`/`actions/contact.ts` |
| `@playwright/test` | Entwicklung | 1.59.1 | Konfiguration und alle sieben E2E-Specs |
| `@types/bcryptjs` | Entwicklung | 2.4.6 | Typdeklarationen; keine direkte Laufzeitnutzung |
| `@types/node` | Entwicklung | 22.19.17 | Node-/`process`-/Crypto-/PG-Typen in Server, Skript und Konfiguration |
| `@types/pg` | Entwicklung | 8.20.0 | Pool-Typen für `src/lib/prisma.ts` |
| `@types/react` | Entwicklung | 19.2.14 | JSX-, Hook- und Komponenten-Typen |
| `@types/react-dom` | Entwicklung | 19.2.3 | React-DOM-Typen für Next/JSX |
| `autoprefixer` | Entwicklung | 10.4.27 | PostCSS-Plugin in `postcss.config.js` |
| `eslint` | Entwicklung | 9.39.4 | `npm run lint`, Flat Config `eslint.config.mjs` |
| `eslint-config-next` | Entwicklung | 16.2.3 | `@next/eslint-plugin-next`-Core-Web-Vitals in `eslint.config.mjs:1,16` |
| `postcss` | Entwicklung | 8.5.9 | CSS-Pipeline aus `postcss.config.js` |
| `prisma` | Entwicklung | 7.7.0 | Generate, Validate, `db push`, Schema/Seed-CLI |
| `tailwindcss` | Entwicklung | 3.4.19 | Utility-CSS-Compiler und `tailwind.config.ts` |
| `tsx` | Entwicklung | 4.21.0 | Ausführung von `prisma/seed.ts` |
| `typescript` | Entwicklung | 5.9.3 | TS-Compiler/Sprachtypisierung; Projektversion im Lockfile |

Zusätzlich erzwingt `package.json:46-48` für die transitive Abhängigkeit `@hono/node-server` mindestens 1.19.13; das Lockfile löst 1.19.14. `eslint.config.mjs:1-3` importiert `@next/eslint-plugin-next`, `@typescript-eslint/parser` und `@typescript-eslint/eslint-plugin`, obwohl diese nicht als direkte Manifestabhängigkeiten erscheinen; sie sind vom transitiven Installationslayout abhängig. Die Versionskombination Next 15.5.15 versus `eslint-config-next` 16.2.3 ist nicht als kompatibel verifiziert und wird als Wartungsrisiko geführt.

## 11. Gesamtarchitektur

```mermaid
flowchart LR
    B["Browser: öffentliche und Admin-UI"]
    M["Next Middleware: CSP/Nonce"]
    R["App Router: Seiten und Route Handler"]
    A["Server Actions und Auth-Callbacks"]
    V["Zod, Guards, IP- und Rate-Limit"]
    P["Prisma Client + pg Pool"]
    D[("PostgreSQL: 5 Tabellen")]
    L["Pino-Prozessausgabe"]
    B -->|"HTTPS/React/Server-Action-Aufruf"| M
    M --> R
    R --> A
    A --> V
    V --> P
    P --> D
    R --> L
    A --> L
```

Die Anwendung ist ein modularer Monolith. Browserkomponenten rufen entweder von Next gerenderte Routen oder typisierte Server Actions auf; ein separat versioniertes HTTP-Backend existiert nicht. NextAuth registriert seine GET-/POST-Handler über die Catch-all-Route. PostgreSQL ist der einzige aktive persistente/externe Laufzeitdienst. Pino schreibt strukturierte Prozesslogs; Auditereignisse werden zusätzlich in PostgreSQL gespeichert.

### 11.1 Primärer Kontaktfluss

```mermaid
sequenceDiagram
    participant U as Benutzer
    participant F as ContactForm
    participant S as submitContactForm
    participant I as getClientIp / RateLimit
    participant Z as Zod / Sanitization
    participant DB as PostgreSQL
    U->>F: Formular ausfüllen und senden
    F->>F: Browser-Pflichtfelder, Telefon-Normalisierung
    F->>S: Server Action mit Formularobjekt
    S->>I: vertrauenswürdige IP und contact:-Bucket
    I->>DB: atomarer RateLimit-UPsert
    alt Budget überschritten
        S-->>F: success=false, rateLimited
    else Honeypot gefüllt
        S-->>F: success=true ohne Kontaktanlage
    else Schema ungültig
        Z-->>F: erste Validierungsnachricht
    else gültig
        S->>Z: strict safeParse und Sanitization
        S->>DB: Transaktion: ContactRequest.create
        S-->>F: success=true
        S-->>DB: after(): globaler RateLimit-Cleanup
    end
```

Das Rate-Limit wird vor Honeypot und Schema festgeschrieben (`src/lib/actions/contact.ts:47-65`); somit verbrauchen auch Bots und ungültige Eingaben das gemeinsame NAT-IP-Budget. Es gibt keine Idempotenz-ID; die UI sperrt nur während ihrer lokalen Transition.

### 11.2 Admin- und Authentifizierungsfluss

```mermaid
sequenceDiagram
    participant C as Login-Seite
    participant N as NextAuth Credentials
    participant A as authorize
    participant DB as PostgreSQL
    participant J as JWT/Session-Callbacks
    participant G as Layout/Action-Guard
    C->>N: signIn(email,password,redirect=false)
    N->>A: Credentials + Requestheader
    A->>A: IP/UA hashen, Rollen normalisieren
    A->>DB: interaktive Transaktion
    DB-->>A: LoginAttempts + User
    A->>A: bcrypt.compare
    alt gesperrt/ungültig
        A->>DB: Attempts/Lockout aktualisieren
        A-->>C: null / CredentialsSignin
    else gültig
        A->>DB: Buckets löschen + LOGIN-Audit
        A-->>J: minimales Userobjekt
        J->>DB: Session-Revalidierung des Users
        J-->>G: JWT-Session mit id/role
    end
    G->>G: requireAuth oder requireAdmin
```

Alle Login-Datenbankoperationen und `bcrypt.compare` liegen in derselben interaktiven Transaktion (`src/lib/auth.ts:103-223`). Das stärkt Atomizität, hält aber bei Poolgröße fünf während des CPU-Aufwands eine Verbindung. Die Session wird bei jedem serverseitigen Abruf gegen die User-Tabelle revalidiert (`src/lib/auth.ts:275-297`).

## 12. Schicht- und Modulverantwortung

| Schicht | Module | Verantwortung | Nicht erlaubt/tatsächlich nicht vorhanden |
|---|---|---|---|
| Routing/Rendering | `src/app/**`, `src/middleware.ts` | Routekonvention, Metadata, RSC/Client-Grenzen, CSP, Error-/Loading-Boundaries | kein direkter SQL-Zugriff in UI-Dateien |
| Präsentation | `src/components/**`, `src/content/data.ts`, `src/styles/globals.css` | Eingabe, lokaler UI-State, responsive Darstellung, statischer Text | keine Prisma-Importe; Mutationen nur über Actions |
| Server-Orchestrierung | `src/lib/actions/*.ts`, `src/app/api/**/route.ts` | Auth, Validierung, Transaktionen, Response-/Action-Ergebnisse | keine externen Serviceadapter |
| Identität | `src/lib/auth.ts`, `src/lib/session.ts`, `src/lib/actions/auth-helpers.ts`, `src/types/next-auth.d.ts` | Credentials, Sperren, Rollen, JWT/Session, Redirect-Guards | Rollen nur `admin`/`staff` auf Anwendungsebene |
| Sicherheits-/Validierungskern | `src/lib/schemas.ts`, `src/lib/client-ip.ts`, `src/lib/rate-limit.ts` | Sanitization, Zod, vertrauenswürdige Client-IP, atomare Budgets | IP-Syntax/-Länge nicht validiert; keine Redis-Implementierung |
| Persistenz | `src/lib/prisma.ts`, `prisma/schema.prisma` | URL-Normalisierung, Pool, Adapter, Modellvertrag | keine Repository-Klassen, Migrationen oder DB-Relationen |
| Beobachtbarkeit | `src/lib/logger.ts`, `AuditLog` | Prozesslogs und fachliche Auditereignisse | keine Metriken/Trace-IDs/Sinks im Code |
| Betrieb/Tests | `package.json`, `scripts/run-local-env.mjs`, `prisma/seed.ts`, `tests/e2e/**` | lokale Befehle, Initialadmin, Browser-/DB-Tests | keine CI-/Deploymentautomation |

`src/lib/actions.ts:1-17` ist ein reines Public-Barrel für sieben Server Actions. `src/components/ui/` enthält drei manuell implementierte Basisbausteine. `src/content/data.ts` ist die zentrale, statische deutschsprachige Inhaltsquelle; eine CMS- oder Lokalisierungsschicht existiert nicht.

## 13. Abhängigkeitsrichtungen und Architekturgrenzen

```mermaid
flowchart TD
    APP["src/app"] --> COMP["src/components"]
    APP --> LIB["src/lib"]
    COMP --> ACTIONS["src/lib/actions"]
    COMP --> CONTENT["src/content"]
    ACTIONS --> GUARDS["auth-helpers/session/auth"]
    ACTIONS --> SCHEMA["schemas/client-ip/rate-limit"]
    ACTIONS --> PRISMA["prisma singleton"]
    PRISMA --> GEN["generated Prisma Client"]
    GEN --> MODEL["prisma/schema.prisma"]
    TESTS["tests/e2e"] --> UIHTTP["laufende Next-App"]
    TESTS --> PRISMA
```

### 13.1 Bestätigte Grenzen

- Clientkomponenten importieren keine Prisma-Symbole; Datenmutationen laufen über Server Actions oder HTTP-Route Handler.
- `server-only` in `src/lib/actions/auth-helpers.ts:1` verhindert beabsichtigte Client-Bündelung der Guards. Server-Action-Dateien tragen `"use server"`.
- `getCachedSession` kapselt `getServerSession` über React-`cache` (`src/lib/session.ts:1-11`). Das Caching gilt für den React-Requestkontext, nicht als verteilter oder dauerhafter Cache.
- Nur `src/lib/prisma.ts` erzeugt Pool und Client. `prisma/seed.ts` und Testhelper importieren denselben Singleton.
- Projektregeln verlangen Transaktionen für Mutationen (`AGENTS.md`); statisch wurden 21 `$transaction`-Aufruforte gefunden. Alle Produktions-/Seed-Mutationen sind transaktional.
- UI-Typen in `src/components/admin/types.ts` sind Transportverträge, keine automatisch aus Prisma generierten DTOs. Deshalb kann `getContactRequests` durch den Objekt-Spread `gdprConsent` zusätzlich serialisieren (`actions/contact.ts:105-114`).

### 13.2 Durchbrochene oder schwache Grenzen

- `src/lib/rate-limit.ts:50-66` dupliziert physische Tabellen-/Spaltennamen in Raw SQL; Schemaänderungen werden nicht typisiert weitergetragen.
- `src/lib/auth.ts` mischt Lockout-Domäne, Passwortprüfung, Transaktionsretry, Audit und NextAuth-Konfiguration in einem Modul.
- `src/content/data.ts` liefert sowohl UI-Inhalte als auch serverseitige Labels für persistierte Kontaktnachrichten; Textänderungen verändern neue Persistenzwerte.
- Tests greifen direkt auf die Datenbank zu und löschen globale Bestände. Ein isoliertes Testrepository oder eine verbindliche Test-DB-Kennung fehlt.
- Die Datenbank erzwingt weder Rollen- noch Audit-Aktionsdomäne; Anwendung und externe Schreiber können divergieren.

## 14. Einstiegspunkte, Bootstrap, Start, Lebenszyklus und Shutdown

| Einstieg/Registrierung | Typ | Bootstrap und Lebenszyklus | Shutdown/Fehler |
|---|---|---|---|
| `npm run dev` | CLI | `next dev` (`package.json:6`) | Next-Prozessverhalten; projektspezifischer Hook fehlt |
| `npm run build` | CLI | `prisma generate && next build` (`package.json:8`) | stoppt bei fehlgeschlagenem Teilbefehl; erzeugt Client/`.next` |
| `npm start` | CLI | `next start` für vorhandenen Build (`package.json:9`) | kein eigener Signalhandler |
| App Root | Framework | `RootLayout` lädt Inter, Metadata, globale CSS und rendert `children` (`src/app/layout.tsx:1-41`) | Next Error Boundary |
| Middleware | Framework | `middleware(request)` vor gematchten Routen, erzeugt Nonce und CSP (`src/middleware.ts:4-66`) | keine I/O-Retries |
| Seiten/Layouts | Framework | Dateibasiert registrierte Server-/Clientkomponenten unter `src/app` | `global-error.tsx`, Admin-`error.tsx`/`loading.tsx` |
| NextAuth GET/POST | Factory/Framework | `NextAuth(authOptions)` in `src/app/api/auth/[...nextauth]/route.ts:1-6` | NextAuth-Fehlervertrag; zwei Exportnamen teilen einen Factory-Handler |
| Clientfehler POST | Route Handler | `POST(request)` in `src/app/api/log/client-error/route.ts:36-79` | explizit 204/400/429/500/503 |
| sieben Server Actions | Framework | Exporte aus `src/lib/actions.ts`; Next serialisiert Aufruf/Antwort | Fehler meist in Ergebnisobjekt oder Redirect |
| Prisma-Modulimport | Initialisierung | liest `DATABASE_URL`, normalisiert TLS, baut Pool(max 5), startet nicht abgewartetes Warmup, erzeugt Client (`src/lib/prisma.ts:6-79`) | kein Web-Shutdown; Warmupfehler nur Warnlog |
| `prisma/seed.ts` | CLI | top-level `main()`: Credentials, bcrypt, transaktionales Upsert | `catch` setzt Exitcode; `finally` trennt Prisma und beendet Pool (`:60-68`) |
| `run-local-env.mjs` | CLI-Wrapper | bestimmt Env-Datei, lädt mit Override, prüft URL/Host/Secrets, spawnt übergebenen Befehl (`:1-143`) | leitet Exitcode/Signal weiter; kein expliziter Child-`error`-Handler |
| Playwright | Test-Runner | zwei Projekte, ein Worker, optional wiederverwendeter Devserver (`playwright.config.ts:4-38`) | DB-Helper `disconnectPrisma`; Pool bleibt dabei offen |
| `nextConfig.headers` | Build-/Runtimekonfiguration | asynchrone Headerregistrierung (`next.config.ts:7-51`) | deklarativ, keine Ressourcen |

### 14.1 Prozessstart der Webanwendung

Beim ersten Import eines datenbankabhängigen Moduls wird `DATABASE_URL` synchron geprüft. `normalizeConnectionString` hebt `sslmode=prefer|require|verify-ca` auf `verify-full`, lässt fehlenden Modus, `disable` und `uselibpqcompat=true` jedoch zu (`src/lib/prisma.ts:13-37`). Der Pool startet ein nicht abgewartetes `connect()`-Warmup und wird im Entwicklungsmodus auf `globalThis` wiederverwendet. In Produktion ist der Modulcache die Singleton-Grenze. Eine horizontale Laufzeit kann daher pro Prozess/Isolat bis zu fünf Poolverbindungen öffnen.

### 14.2 Request-Lebenszyklus

Die Middleware setzt CSP sowohl auf dem weitergegebenen Request als auch der Response. RootLayout ruft `headers()` auf und erzwingt dadurch dynamische Requestauswertung, liest `x-nonce` jedoch nicht explizit (`src/app/layout.tsx:28-30`). Server-Actions und Route Handler können `after()`-Callbacks für Cleanup registrieren; deren Fehler werden im Cleanup selbst protokolliert. Es gibt keine Queue-, Cron- oder Wiederanlaufgarantie.

### 14.3 Shutdown

**Implemented:** Nur der Seed schließt Prisma und `pg.Pool` explizit. **Partially implemented:** Der E2E-Helper ruft lediglich `prisma.$disconnect()` (`tests/e2e/helpers/db-cleanup.ts:264-269`). **Unknown:** Next-/Hosting-Prozessbeendigung verlässt sich vollständig auf Framework und Betriebssystem; ein projektspezifischer Graceful-Shutdown-Hook fehlt.

## 15. Vollständiger Funktionskatalog

### 15.1 Öffentliche Praxisdarstellung

**Implemented.** `/` rendert Navigation, Hero, Praxisvorteile, Sprechzeiten, Kontaktformular, Footer und Banner in fester Reihenfolge (`src/app/page.tsx:1-18`). `publicContent` enthält Praxisname, Telefon, Adresse, Öffnungszeiten, Navigation, Formularoptionen und Rechtstexte (`src/content/data.ts`). Navigation erfolgt über Hash-Links, `next/link`, Telefon-Links und `/impressum`/`/datenschutz`. Inhalte sind statisch; Laden, API-Fehler und leere CMS-Zustände existieren nicht. Animationen werden clientseitig mit Framer Motion ausgelöst; bei deaktiviertem JavaScript bleibt servergerendertes Markup, interaktive Menüs/Formulare funktionieren dann nicht. Tests decken Teile von Kontakt und Sicherheitsheadern, nicht die vollständige öffentliche Komposition.

### 15.2 Kontaktaufnahme

**Implemented mit dokumentierten Grenzen.**

- Einstieg: `ContactForm` (`src/components/contact-form.tsx`) → `submitContactForm` (`src/lib/actions/contact.ts:45-91`).
- UI-State: kontrollierte Felder, Honeypot-Ref, `useTransition`, Ergebnisstatus; Submitbutton ist während der Transition deaktiviert. Erfolg leert Felder und zeigt Bestätigung, Fehler zeigt Servertext. Es gibt keine Abbruchsteuerung oder Wiederaufnahme.
- Vorverarbeitung: die Browserlogik trennt Landesvorwahl/Telefon. Sie entfernt hartcodiert `+49`, `0049` oder führende `0`, obwohl andere europäische Vorwahlen auswählbar sind (`contact-form.tsx:55-70`). Ein eingefügtes `+43` kann deshalb doppelt präfigiert werden.
- Serversequenz: vertrauenswürdige IP → `contact:<ip>`-Budget drei/Stunde → Honeypot → striktes Zod-Schema/Sanitization → lokalisierte Nachricht → eigene Transaktion/`ContactRequest.create` → `after()`-Cleanup.
- Daten: Vor-/Nachname, Vorwahl, Zifferntelefon, kombinierte Nachricht, Einwilligung, Zeitstempel; direkte PII und potenziell gesundheitsbezogene Anliegen. Keine E-Mail oder externe Übermittlung.
- Fehler: Rate-Limit und erster Zod-Fehler werden nutzerlesbar; IP-Vertrauens- und DB-Fehler werden generisch beantwortet, DB-Fehler strukturiert geloggt. Ein Honeypot-Treffer meldet absichtlich Erfolg ohne Speicherung.
- Grenzen: keine Idempotenz-ID, kein automatisches Löschen, Rate-Budget schon vor Validierung, Details-Limit 1900 trotz Meldung „2000“ (`schemas.ts:17,71,120-123`).
- Tests: `contact.spec.ts`, Doppel-Submit in `chaos.spec.ts`, Persistenz/Administration in `admin-dashboard.spec.ts` und `admin-logic.spec.ts`.

### 15.3 Rechtliches und Cookie-Hinweis

**Implemented.** `/impressum` und `/datenschutz` sind statische Serverkomponenten mit Metadata und Rücknavigation. `CookieBanner` ist ein rein visueller, schließbarer Hinweis; es setzt weder Cookie noch Local Storage und verwaltet keine Kategorien. Da kein Tracking-/Analytics-Code vorliegt, ist kein technischer Consent-Gate implementiert. Die rechtliche Vollständigkeit und Aktualität sind **Unknown**; die absolute DSGVO-Konformitätsbehauptung in `README.md` ist nicht statisch beweisbar.

### 15.4 Anmeldung und Session

**Partially implemented.** `/admin/login` nutzt `signIn("credentials", {redirect:false})`, kontrollierte E-Mail/Passwortfelder, Passwortsichtbarkeit und Lade-/Fehlerzustand. Erfolg navigiert per `window.location.href` nach `/admin`; bekannte Fehlschläge zeigen eine einheitliche Meldung. Ein geworfener `signIn`-Fehler wird nicht per `try/finally` gefangen, sodass `loading` wahr bleiben kann. Serverseitig werden IP/User-Agent-Identifier, Lockout, Userlesung, bcrypt und Login-Audit transaktional verarbeitet. Die Rolle wird fail-closed auf `admin|staff` normalisiert. Die vermeintliche Account-Sperre kann jedoch durch User-Agent-Wechsel neue Buckets erzeugen. Details stehen in Abschnitt 20.

### 15.5 Dashboard-Datenaggregation

**Partially implemented.** Das geschützte Layout verlangt eine gültige Session. `AdminDashboardPage` lädt Kontakte, Benutzer und Logs parallel mit `Promise.allSettled` (`src/app/admin/(protected)/page.tsx:13-44`). Staff erhält keine Benutzer/Logs. Fehlgeschlagene Teilabfragen werden geloggt und durch leere Arrays ersetzt, sodass UI-Leere und Serverfehler nicht unterscheidbar sind. `AdminDashboardClient` verwaltet Tabs, 30-Sekunden-Kontaktpolling bei sichtbarer erster Seite, Cursor-Nachladen und Logout. Statistiken beziehen sich nur auf die maximal 50 aktuell geladenen Kontakte.

### 15.6 Kontaktadministration

**Implemented.** Authentifizierte Rollen `admin` und `staff` dürfen bis zu 50 Kontakte ab einem optionalen Cursor lesen (`getContactRequests`). Ungültige Cursor ergeben still `[]`. `RequestsTab` bietet Auswahl, Einzellesen, Bulk-Markierung und Bulk-Löschung; `mutateContactRequests` akzeptiert 1–50 eindeutige IDs mit den Aktionen `markRead`, `markUnread`, `delete`. Count-Mismatch rollt die gesamte Transaktion zurück. Löschung erzeugt pro ID einen `DELETE_REQUEST`-Auditdatensatz; Statusänderungen werden nicht auditiert. Erfolgreiche Mutation revalidiert `/admin`, die Clientkomponente aktualisiert optimistisch beziehungsweise per Router-Refresh. Fehler werden in der UI angezeigt. Der Read serialisiert durch Spread auch `gdprConsent`, obwohl der UI-Typ es nicht führt.

### 15.7 Benutzeradministration

**Implemented mit begrenztem Umfang.** Nur `admin` sieht und nutzt `UsersTab`. `createUser` säubert Name, prüft E-Mail und Passwortkomplexität, hasht mit bcrypt cost 12 und legt ausschließlich `staff` plus `CREATE_USER`-Audit atomar an. `createUserSchema` ist anders als die übrigen Boundary-Objekte nicht `.strict()`; Zusatzfelder werden ignoriert. `deleteUser` validiert die ID, blockiert Self-Delete, löscht nur case-insensitive `staff`, unterscheidet fehlenden, geschützten Admin- und unbekannten Rollenfall und auditiert Erfolg. Listen enthalten kein Passwort, sind aber unpaginiert. Rollenwechsel, Passwortänderung und Reset fehlen. UI hat Formular-, Loading-, optimistische Lösch-, Bestätigungs- und Fehlerzustände.

### 15.8 Auditansicht

**Partially implemented.** Nur Admins lesen die neuesten 100 Einträge absteigend. `LogsTab` übersetzt vier Aktionscodes über `ACTION_LABELS`. Ein `after()`-Job löscht Einträge älter als sechs Monate, wird jedoch ausschließlich bei diesem Read ausgelöst und läuft nach der Antwort; alte Einträge können im auslösenden Ergebnis enthalten sein. Es gibt keine Pagination, Suche, Export- oder Scheduler-Garantie.

### 15.9 Clientfehlererfassung

**Partially implemented.** `GlobalError` sendet nach einem Fehler `digest` und `window.location.pathname` per `fetch` an `POST /api/log/client-error`; Netzwerkfehler werden clientseitig absichtlich geschluckt. Die Route ermittelt die IP, verbraucht 10 Requests pro 10 Minuten, parsed JSON, validiert ein striktes Objekt, normalisiert Pfade auf eine kleine Kategorienmenge und schreibt ein Warnlog. `digest` kann jedoch beliebiger bereinigter Clienttext bis 255 Zeichen sein und wird unverändert geloggt. Die UI bietet „erneut versuchen“ über `reset` und einen Telefonlink.

### 15.10 Sicherheitsheader und Suchmaschinensteuerung

**Implemented.** Middleware generiert je Request eine Base64-Nonce und setzt eine CSP mit `default-src 'self'`, Nonce für Scripts, `strict-dynamic`, eingeschränkten Styles/Fonts/Images/Connections sowie Objekt-/Frame-/Base-/Form-Regeln (`src/middleware.ts:4-57`). `next.config.ts` ergänzt HSTS, DENY-Framing, Nosniff, Referrer- und Permissions-Policy sowie `X-Robots-Tag` für `/admin`. `robots.ts` erlaubt öffentliche Pfade, verbietet `/admin` und `/api`. Laufzeitheader wurden mangels sicher startbarer Anwendung nicht dynamisch geprüft.

### 15.11 Seed und lokale Betriebsgrenze

**Partially implemented.** `prisma/seed.ts` verlangt Adminvariablen, mindestens zwölf Zeichen sowie Groß-/Kleinbuchstabe, Zahl, Sonderzeichen und verbietet eine kleine exakte Weak-List. Es prüft die E-Mail nicht syntaktisch. Der transaktionale Upsert setzt bei bestehendem User Passwort und Adminrolle neu, aktualisiert aber den Namen nicht und schreibt kein DB-Audit. `run-local-env.mjs` erzwingt für gewrappte Befehle einen Loopback-PostgreSQL-Host und Mindestwerte für NextAuth/Admin-Secrets; es garantiert keinen wegwerfbaren Datenbanknamen und kapselt die ungewrappten E2E-Skripte nicht.

## 16. Benutzeroberflächen, Seiten, Komponenten, Navigation und Zustände

### 16.1 Routbare Ansichten

| Route/Ansicht | Render-Einstieg | Verantwortung, State und Navigation | Zustände/Responsive/A11y | Dienste und Tests |
|---|---|---|---|---|
| `/` | `HomePage`, `src/app/page.tsx:9-18` | komponiert sieben öffentliche Bereiche; Hashnavigation und Rechtlinks | servergerendert; responsive Utility-Klassen; Teilkomponenten animiert | Kontakt-Action; `contact`, `chaos`, Teile `security` |
| `/impressum` | `ImpressumPage`, `src/app/impressum/page.tsx:9` | statischer Anbietertext und Link zurück | keine Lade-/Fehlerzustände; semantische Überschriften | keine eigene Spec |
| `/datenschutz` | `DatenschutzPage`, `src/app/datenschutz/page.tsx:9` | statische Datenschutzangaben | keine dynamischen Zustände | keine eigene Spec |
| `/admin/login` | `AdminLoginPage`, `src/app/admin/login/page.tsx:10` | E-Mail, Passwort, Sichtbarkeit, signIn, Telefon/Home | `loading`, `error`, disabled; mobil/desktop gestylt; Iconbutton nur `title` | NextAuth; `auth`, `role-visibility`, `security` |
| `/admin` | `ProtectedAdminLayout` + `AdminDashboardPage` | Sessionguard, rollenabhängige Tabs, Polling/Pagination/Mutationen/Logout | Admin Loading/Error Boundary; leere/Fehler-/Pending-Zustände in Tabs | sieben Server Actions; Admin-Specs |
| `/robots.txt` | `robots`, `src/app/robots.ts:3` | Regeln/Sitemap-Basis ohne Sitemap-Route | maschinenlesbarer Text, keine UI | `security.spec.ts` teilweise |

### 16.2 Alle 31 Render-Einheiten

| Render-Einheit | Datei | Props/Ereignisse und lokaler Zustand | Wichtige Zustände, A11y und Verbindung |
|---|---|---|---|
| `RootLayout` | `src/app/layout.tsx` | `{children}`; kein lokaler State | `<html lang="de">`, Metadata, Inter, globale CSS; `headers()` erzwingt dynamisch |
| `HomePage` | `src/app/page.tsx` | keine Props | reine Komposition |
| `GlobalError` | `src/app/global-error.tsx` | `{error, reset}`; Effect sendet Log | Fehleransicht, Retrybutton, Telefon; Root-`html/body` |
| `ImpressumPage` | `src/app/impressum/page.tsx` | keine Props | statischer Rechtstext, Backlink |
| `DatenschutzPage` | `src/app/datenschutz/page.tsx` | keine Props | statischer Rechtstext, Backlink |
| `AdminLayout` | `src/app/admin/layout.tsx` | `{children}` | neutrale Layoutgrenze |
| `AdminLoginPage` | `src/app/admin/login/page.tsx` | E-Mail/Passwort/Error/Loading/ShowPassword | Submit, Toggle, disabled; NextAuth-Browserclient |
| `ProtectedAdminLayout` | `src/app/admin/(protected)/layout.tsx` | `{children}` | serverseitiger Redirect bei fehlender Session |
| `AdminDashboardPage` | `src/app/admin/(protected)/page.tsx` | keine Props; Serverdaten | Partialfehler werden zu Leerlisten; loggt Fehler |
| `AdminLoading` | `src/app/admin/(protected)/loading.tsx` | keine Props | Skeleton für Kopf, Statistik, Inhalt |
| `AdminError` | `src/app/admin/(protected)/error.tsx` | `{error, reset}`; `retrying/retryCount` | einmaliger Retryversuch, Home/Telefon; Retry-State kann festhängen |
| `AdminDashboardClient` | `src/app/admin/(protected)/dashboard-client.tsx` | initiale Kontakte/User/Logs/Session | Tabs, Cursor-Historie, Polling, Logout; Stats nur aktuelle Seite |
| `TabButton` | gleiche Datei | Label/Icon/active/onClick | Button mit aktivem visuellen Zustand |
| `About` | `src/components/about.tsx` | keine Props; Ref/InView | animierte Karten; kein Reduced-Motion-Zweig |
| `Footer` | `src/components/footer.tsx` | keine Props | Telefon/Adresse/Rechtlinks |
| `Hero` | `src/components/hero.tsx` | keine Props | CTA-Links, animierte Dekoration, responsive |
| `Navbar` | `src/components/navbar.tsx` | `isOpen` | Desktop-/Mobilnavigation; Toggle ohne `aria-expanded`/dynamisches Label |
| `Schedule` | `src/components/schedule.tsx` | Ref/InView | Öffnungszeiten-/Notfallkarten; Animation |
| `ContactForm` | `src/components/contact-form.tsx` | kontrollierte Felder, Transition, Status, Ref | Validierungsattribute, disabled, Erfolg/Fehler; Server Action |
| `FormField` | gleiche Datei | Label/ID/required/children | semantisches Label und Pflichtmarkierung |
| `InfoCard` | gleiche Datei | Icon/Title/Children | reine Darstellung |
| `CookieBanner` | `src/components/cookie-banner.tsx` | `isVisible/isMounted` | SSR-verdeckt bis Effect, Close; keine Persistenz |
| `Button` | `src/components/ui/button.tsx` | native Props + Variant/Size/asChild | `forwardRef`, Slot oder `<button>`, Fokusklassen |
| `Input` | `src/components/ui/input.tsx` | native Inputprops | `forwardRef`, Fokus/disabled |
| `Textarea` | `src/components/ui/textarea.tsx` | native Textareaprops | `forwardRef`, Fokus/disabled |
| `LogsTab` | `src/components/admin/logs-tab.tsx` | `{logs}` | Empty State oder Tabelle; keine Pagination |
| `RequestsTab` | `src/components/admin/requests-tab.tsx` | Requests, Cursor-/Paging-Callbacks | Auswahl, Dialog/Expand, pending, Fehler, leere Seite |
| `StatCard` | gleiche Datei | Icon/Label/Value | reine Statistikdarstellung |
| `RequestRow` | gleiche Datei | Request/Selection/Handlers | Status, Details, Toggle/Delete; mehrere interaktive Zustände |
| `SelectionCheckbox` | gleiche Datei | checked/indeterminate/onChange/label | setzt `indeterminate` imperativ; zugängliches Label |
| `UsersTab` | `src/components/admin/users-tab.tsx` | initialUsers/currentUserId | Formular, Passworttoggle, Optimistic Delete, Pending/Error/Empty |

### 16.3 Navigation und globale Zustände

Es gibt keinen globalen Clientstore und keinen React Context. Sessiondaten gelangen als Serverprop ins Dashboard oder über NextAuth-Clientfunktionen. Öffentlich navigieren `Link`, Hashanker und `tel:`. Das Admin-Dashboard wechselt Tabs lokal, aktualisiert die URL nicht und verliert den aktiven Tab beim Remount. Der Logout ruft `signOut({redirect:false})` und navigiert anschließend. Formular- und Adminmutationen haben keine `AbortController`-basierte Abbruchmöglichkeit.

### 16.4 Accessibility- und Responsive-Befunde

Semantische Labels, Button-Typen, Fokusklassen, `aria-live`-ähnliche sichtbare Statusbereiche und das `indeterminate`-Checkboxverhalten sind teilweise vorhanden. Konkrete Lücken: Navbar-Toggle ohne `aria-expanded`, Passwort-Sichtbarkeitsbuttons nur mit `title`, keine nachgewiesene Fokusfalle/Focus-Rückgabe für mobile Navigation oder Detailzustände und keine `prefers-reduced-motion`-Behandlung trotz sechs Framer-Motion-Dateien. Mobile Chrome wird für fünf Specs genutzt; Kontakt- und Admin-Dashboard-Specs sind mobil ausgeschlossen (`playwright.config.ts:24-29`).

## 17. APIs, Routen, Protokolle, Ereignisse und Nachrichtenformate

Es gibt drei explizite HTTP-Methodenoperationen und sieben Server Actions, insgesamt zehn API-Operationen. Server Actions sind Next-intern transportiert; ihre Drahtform und Statuscodes sind Frameworkdetails und im Repository nicht als öffentlicher HTTP-Vertrag festgelegt.

### 17.1 Explizite HTTP-Operationen

| Operation | Registrierung/Handler | Auth und Eingabe | Antwort/Fehler | Seiteneffekt, Limit, Client, Tests |
|---|---|---|---|---|
| `GET /api/auth/[...nextauth]` | Factory `NextAuth(authOptions)`, Export `GET`, `src/app/api/auth/[...nextauth]/route.ts:1-6` | NextAuth-Protokoll; je Unterroute Cookies/Query; Credentials-Authorize nutzt E-Mail/Passwort | NextAuth-4-Responses, Redirects und Cookies; genaue Unterrouten dynamisch **Framework-registriert** | JWT-/Sessionlesen; Browser/Server-NextAuth; `auth`, `security` |
| `POST /api/auth/[...nextauth]` | derselbe Factory-Handler, Export `POST` | CSRF-/Credentials-Protokoll von NextAuth; `authorize` verlangt nichtleere Strings, ohne explizite Längencaps | NextAuth-Erfolg/`CredentialsSignin`; Anwendung gibt bei Fehler `null` | LoginAttempt/User/Audit-Transaktion; E-Mail-Bucket 3, IP-Bucket 9, 15 Minuten; Loginseite; `auth`, `chaos`, `role-visibility` |
| `POST /api/log/client-error` | `POST`, `src/app/api/log/client-error/route.ts:36-79` | öffentlich; JSON `{digest?: string<=255, pathname?: string<=2048}`, strikt und bereinigt | `204` Erfolg; `400` JSON/Schema; `429` Budget; `500` sonstiger Ratefehler; `503` keine vertrauenswürdige IP | DB-Bucket 10/10 min, Pino-Warnlog; `GlobalError`; `security.spec.ts:84-146` |

### 17.2 Server Actions

| Operation | Handler/Registrierung | Auth, Parameter und Validierung | Ergebnis/Fehler | DB/Seiteneffekt, Caller und Tests |
|---|---|---|---|---|
| `submitContactForm` | `src/lib/actions/contact.ts:45-91`, Barrel `actions.ts:1-7` | öffentlich; `z.input<contactFormSchema>`; IP-Limit vor Honeypot und strict Schema | `{success:true}` oder `{success:false,error}`; wirft intern nicht weiter | RateLimit-Transaktion, optional ContactRequest-Transaktion, After-Cleanup; `ContactForm`; Kontakt-/Chaos-Specs |
| `getContactRequests` | `actions/contact.ts:97-115` | `requireAuth`; `cursor?: string`, `actionCursorSchema`; ungültig → `[]` | Array mit ISO-`createdAt`; DB-Fehler propagiert | Read `take:50`, Cursor/Sort; Dashboard/Polling; Admin-Specs |
| `mutateContactRequests` | `actions/contact.ts:121-177` | `requireAuth`; strict `{ids:1..50 unique short strings, action}` | Success/Errorobjekt; not-found bei Count-Mismatch | atomare Update-/Delete-/Audit-Transaktion, `revalidatePath`; `RequestsTab`; Admin-Specs |
| `createUser` | `actions/users.ts:13-58` | `requireAdmin`; `{email,password,name}`; Zod, aber Objekt nicht strict | Success/Error; `P2002` → duplicate | bcrypt 12 vor Transaktion, User+Audit atomar, revalidate; `UsersTab`; Admin-Specs |
| `deleteUser` | `actions/users.ts:60-132` | `requireAdmin`; ID ≤191; Self-/Admin-/Unknown-role blockiert | differenzierte Errorobjekte oder Success | konditionale Userlöschung+Audit atomar, revalidate; `UsersTab`; Admin-Specs |
| `getUsers` | `actions/users.ts:134-153` | `requireAdmin`; keine Parameter | `UserAccount[]`, ISO-Datum, Rolle ggf. `unknown`; DB-Fehler propagiert | unpaginierter Read ohne Passwort; Dashboard; Admin-Specs |
| `getAuditLogs` | `actions/logs.ts:8-32` | `requireAdmin`; keine Parameter | neueste 100 mit ISO-Datum; DB-Fehler propagiert | Read plus After-Retention-Transaktion; Dashboard; `admin-dashboard.spec.ts` |

### 17.3 Weitere Framework-Protokolle und Ereignisse

- `robots()` liefert `MetadataRoute.Robots` mit `allow: "/"`, `disallow: ["/admin", "/api"]` und `sitemap`-URL (`src/app/robots.ts`). Die angegebene Sitemap-Ressource ist nicht implementiert.
- NextAuth-Callbacks `jwt` und `session` formen Token/Session. Die Augmentierung in `src/types/next-auth.d.ts` ergänzt `id` und `role`.
- Server Actions können Next-Redirect-Ausnahmen aus `requireAuth`/`requireAdmin` auslösen; diese sind Kontrollfluss und werden nicht als JSON-Fehlerobjekt transportiert.
- Auditaktionen sind freie Strings `LOGIN`, `DELETE_REQUEST`, `CREATE_USER`, `DELETE_USER`; es gibt kein Message-Bus- oder Event-Schema.
- Es existieren keine WebSockets, GraphQL-, RPC-, OpenAPI-, gRPC-, Queue- oder Webhook-Protokolle.

## 18. Domänenlogik, Geschäftsregeln und Validierung

### 18.1 Kontaktregeln

| Feld/Regel | Serververtrag | UI-Vorverarbeitung | Grenze/Befund |
|---|---|---|---|
| `firstName`, `lastName` | bereinigt/getrimmt, 1–50 | required, kontrolliert | HTML-Tags/Nullbytes werden iterativ entfernt |
| `countryCode` | Enum aus `EUROPEAN_COUNTRY_CODES` | Auswahl europäischer Vorwahlen | Default `+49`; DB erzwingt Enum nicht |
| `phone` | nur Ziffern, 1–20 | entfernt Leer-/Sonderzeichen und DE-Präfixe | nicht-DE-Einfügen fehleranfällig |
| `requestType` | `appointment\|callback\|prescription\|other` | Select aus Contentdaten | als deutsches Label in `message` denormalisiert |
| `reachability` | optional `morning\|afternoon\|flexible` | optionale Auswahl | ebenfalls in Nachricht denormalisiert |
| `details` | optional, bereinigt, max. 1900 | Textarea/Counter 1900 | Fehlertext nennt 2000 |
| `gdprConsent` | muss exakt `true` sein | Pflichtcheckbox | wird gespeichert und unnötig zurückserialisiert |
| `honeypot` | optional max. 100 im Schema | verborgen | jede nichtleere Stringlänge wird vor Schema als Erfolg verworfen |

`sanitize` ist Defense-in-Depth, keine HTML-Sicherheitsgarantie für jeden Kontext. React escaped dargestellte Strings standardmäßig; das Projekt nutzt kein `dangerouslySetInnerHTML`. Kontaktnachrichten werden durch `buildContactMessage` irreversibel aus strukturierten Auswahlwerten und Details zusammengesetzt.

### 18.2 Benutzer- und Rollenregeln

- `createUserSchema`: Name 1–100 nach Säuberung, Zod-E-Mail, Passwort mindestens acht Zeichen und je Groß-, Kleinbuchstabe, Ziffer, Zeichen aus der festgelegten Sonderzeichenklasse (`src/lib/schemas.ts:128-138`). Es gibt kein Passwort-Maximum.
- Produktionsanlage normalisiert E-Mail auf lowercase und erzwingt Rolle `staff`; die Datenbank hat nur einen Unique-Index, aber keine Lowercase-Constraint.
- `normalizeRole` akzeptiert ausschließlich case-insensitive `admin`/`staff`, sonst `null`; Session und Löschung behandeln Unbekanntes fail-closed (`src/lib/auth.ts:28-52`, `actions/users.ts:90-95`).
- Nur Admin darf Benutzerlisten und -mutationen ausführen. Eigener Account und jeder Adminaccount sind über den produktiven Löschpfad geschützt.
- Seedregeln sind strenger (zwölf Zeichen plus Weak-List), weichen aber vom Produktionsschema ab und validieren die E-Mail nur auf Nichtleerheit (`prisma/seed.ts:14-35`).

### 18.3 ID-, Cursor- und Bulkregeln

`actionIdSchema` säubert und begrenzt auf 1–191 Zeichen. `contactRequestMutationSchema` ist strict, akzeptiert 1–50 eindeutige IDs und genau drei Aktionen (`src/lib/schemas.ts:140-170`). Cursorfehler werden beim Read nicht als Fehler gemeldet, sondern zu einem leeren Ergebnis. Für Mutationen ist ein Count-Mismatch eine domänenspezifische Not-found-Situation und rollt alles zurück.

### 18.4 Rate-Limit-Regeln

`checkRateLimitDb` nutzt ein einzelnes PostgreSQL-UPsert je namespaced Key. Default sind drei Versuche pro 3.600.000 ms; Clientfehler überschreiben auf zehn pro 600.000 ms. Der Rückgabewert ist `attempts <= maxRequests`. Fenstergrenze kommt aus Appzeit, `last_reset` aus DB-`NOW()`. Der pro-Key-After-Cleanup wird vor dem UPsert registriert, findet nach einem erfolgreichen abgelaufenen Reset aber den auf `NOW()` gesetzten Datensatz nicht mehr; auf dem Normalpfad ist er daher wirkungslos. Der globale Ein-Stunden-Cleanup läuft nur nach erfolgreicher Kontaktanlage.

### 18.5 IP-Vertrauen

`getClientIp` vertraut in Vercel nur bei `VERCEL="1"` dem ersten `x-vercel-forwarded-for`; bei `TRUST_PROXY="true"` nutzt es `x-real-ip`, dann den letzten nichtleeren `x-forwarded-for`-Teil; außerhalb Produktion fällt es auf `127.0.0.1`; Produktion ohne vertrauenswürdige Quelle wirft `TrustedClientIpError` (`src/lib/client-ip.ts:29-58`). Syntax und Länge werden nicht validiert. Das Login gibt bei diesem Fehler `null`, Kontakt generischen Fehler, Clientfehlerroute HTTP 503 zurück.

## 19. Datenmodelle, Persistenz, Migrationen, Indizes und Transaktionen

### 19.1 Schemaüberblick und Provenienz

Autoritative Quelle ist `prisma/schema.prisma:4-80`; `provider = "postgresql"` steht in `prisma.config.ts`/Datasource-Kontext, der Clientgenerator schreibt nach `src/generated/prisma`. Der erzeugte Client fehlt aktuell. Das deklarierte Schema umfasst fünf Modelle und 30 Felder: drei nullable Felder, fünf Primärschlüssel, drei zusätzliche Unique-Felder, 15 Defaults, ein `@updatedAt`, vier Sekundärindizes und zwei `@db.Text`. Es gibt null Relationen, Fremdschlüssel, Enums, Checks, zusammengesetzte Schlüssel/Indizes oder Cascades.

```mermaid
erDiagram
    ContactRequest {
        string id PK
        string firstName
        string lastName
        string countryCode
        string phone
        text message
        boolean gdprConsent
        boolean read
        datetime createdAt
    }
    User {
        string id PK
        string email UK
        string password
        string name "nullable"
        string role
        datetime createdAt
    }
    LoginAttempt {
        string id PK
        string identifier UK
        int attempts
        datetime lockedUntil "nullable"
        datetime updatedAt
    }
    AuditLog {
        string id PK
        string userId
        string userName
        string action
        text details "nullable"
        datetime createdAt
    }
    RateLimit {
        string id PK
        string ip UK
        int attempts
        datetime lastReset
    }
```

Zwischen den Entitäten sind absichtlich keine Prisma-/DB-Relationen deklariert. `AuditLog.userId` ist nur ein historischer Skalar; Userlöschung cascadiert nicht. Ein real deploytes Schema kann zusätzliche externe Objekte besitzen; ohne Migrationen oder Live-Introspektion ist das **Unknown**.

### 19.2 `ContactRequest` → `contact_requests`

Quelle `prisma/schema.prisma:13-28`.

| Feld | Typ/null | Default/Automatik | Schlüssel/Index/Mapping | Zweck |
|---|---|---|---|---|
| `id` | `String`, nein | `cuid()` | PK | interne Anfrage-ID |
| `firstName` | `String`, nein | – | `first_name` | direkte PII |
| `lastName` | `String`, nein | – | `last_name` | direkte PII |
| `countryCode` | `String`, nein | `"+49"` | `country_code` | Telefonvorwahl; keine DB-Whitelist |
| `phone` | `String`, nein | – | – | direkte PII; App erlaubt 1–20 Ziffern |
| `message` | `String @db.Text`, nein | – | – | denormalisierte Anliegen-/Erreichbarkeits-/Detailnachricht |
| `gdprConsent` | `Boolean`, nein | `true` | `gdpr_consent` | Einwilligungs-Snapshot |
| `read` | `Boolean`, nein | `false` | – | einziger Bearbeitungszustand |
| `createdAt` | `DateTime`, nein | `now()` | `created_at`, Sekundärindex | Sortierung/Pagination |

Anlage: ausschließlich `submitContactForm`, eigene Transaktion (`src/lib/actions/contact.ts:65-76`). Read: `getContactRequests`, maximal 50, keine Feldselektion (`:97-115`). Mutation: `mutateContactRequests`, atomare `updateMany`/`deleteMany`, Delete mit je einem Audit (`:121-177`). Testzugriffe stehen in `tests/e2e/helpers/db-cleanup.ts:28-69,195-211`. Es gibt kein `updatedAt`, keinen Erledigtstatus und keine automatische Retention; manuelle Admin-/Staff-Löschung ist der einzige Produktionslöschpfad.

### 19.3 `User` → `users`

Quelle `prisma/schema.prisma:30-41`.

| Feld | Typ/null | Default | Schlüssel/Mapping | Zweck |
|---|---|---|---|---|
| `id` | `String`, nein | `cuid()` | PK | Identitäts-ID in JWT/Audit |
| `email` | `String`, nein | – | Unique | Loginname; App-Schreiber lowercasen |
| `password` | `String`, nein | – | – | bcrypt-Hash; Cost 12 |
| `name` | `String`, ja | – | – | Anzeigename/PII |
| `role` | `String`, nein | `"staff"` | keine Enum/Check | `admin\|staff` nur durch App-Logik |
| `createdAt` | `DateTime`, nein | `now()` | `created_at` | Listenreihenfolge |

Seed-Upsert liegt in `prisma/seed.ts:41-52`; produktive Staff-Anlage/Löschung samt Audit in `src/lib/actions/users.ts:13-132`; Liste in `:134-153`; Authlesungen in `src/lib/auth.ts:103-113,275-297`. Passwort wird nie an die UI selektiert. Keine Produktionsfunktion ändert Rolle oder Passwort. Userlöschung lässt Audit-Snapshots mangels FK stehen. Keine Update-/Delete-Zeitpunkte oder Retention.

### 19.4 `LoginAttempt` → `login_attempts`

Quelle `prisma/schema.prisma:43-54`.

| Feld | Typ/null | Default/Automatik | Schlüssel/Index/Mapping | Zweck |
|---|---|---|---|---|
| `id` | `String`, nein | `cuid()` | PK | technische Zeile |
| `identifier` | `String`, nein | – | Unique | SHA-256-Bucket, kein Klartext |
| `attempts` | `Int`, nein | `0` | – | Fehlversuchszähler |
| `lockedUntil` | `DateTime`, ja | – | `locked_until`, Sekundärindex | Sperrende |
| `updatedAt` | `DateTime`, nein | `@updatedAt` | `updated_at` | Stale-Cleanup |

Der Lebenszyklus liegt in `authorize` (`src/lib/auth.ts:76-246`): zwei Identifier, Reads, abgelaufene Sperrlöschung, User-/bcrypt-Prüfung, Upsert/Sperre oder erfolgreiche Löschung plus `LOGIN`-Audit. E-Mail-Kontext sperrt ab drei, IP-Kontext ab neun Fehlversuchen für 15 Minuten. Danach startet ein nicht abgewarteter Cleanup abgelaufener/alter Einträge. Testhelper können alle Zeilen löschen oder global altern (`db-cleanup.ts:72-112`). SHA-256 ohne Secret macht Werte pseudonym, nicht anonym.

### 19.5 `AuditLog` → `audit_logs`

Quelle `prisma/schema.prisma:56-68`.

| Feld | Typ/null | Default | Schlüssel/Index/Mapping | Zweck |
|---|---|---|---|---|
| `id` | `String`, nein | `cuid()` | PK | Ereignis-ID |
| `userId` | `String`, nein | – | `user_id`, kein FK | Actor-Snapshot |
| `userName` | `String`, nein | – | `user_name` | Anzeigename, Fallback kann E-Mail sein |
| `action` | `String`, nein | – | keine Enum/Check | freie Aktionskennung |
| `details` | `String @db.Text`, ja | – | – | interne Entity-ID/Detailtext |
| `createdAt` | `DateTime`, nein | `now()` | `created_at`, Sekundärindex | Reihenfolge/Retention |

Schreiber: `LOGIN` (`auth.ts:203-211`), `DELETE_REQUEST` (`actions/contact.ts:139-146`), `CREATE_USER` (`actions/users.ts:35-42`) und `DELETE_USER` (`:98-105`). Jede Zeile ist atomar an die fachliche Mutation gekoppelt. `getAuditLogs` liest 100 und plant Löschung `< sechs Monate` (`actions/logs.ts:8-32`). Ohne Adminread/erfolgreichen After-Job besteht keine Löschgarantie. Tests können die gesamte Tabelle snapshotten, löschen und wiederherstellen (`db-cleanup.ts:214-261`).

### 19.6 `RateLimit` → `rate_limits`

Quelle `prisma/schema.prisma:70-80`.

| Feld | Typ/null | Default | Schlüssel/Index/Mapping | Zweck |
|---|---|---|---|---|
| `id` | `String`, nein | `cuid()` | PK | Insert-ID; Runtime erzeugt abweichenden Zufalls-/Zeitstring |
| `ip` | `String`, nein | – | Unique | tatsächlich namespaced Roh-IP-Key |
| `attempts` | `Int`, nein | `0` | – | aktueller Fensterzähler |
| `lastReset` | `DateTime`, nein | `now()` | `last_reset`, Sekundärindex | Fensterbeginn/Cleanup |

`checkRateLimitDb` schreibt `contact:<ip>` oder `client-error:<ip>` per parameterisiertem Raw-SQL-UPsert in eigener Transaktion (`src/lib/rate-limit.ts:31-71`). `cleanupExpiredRateLimits` löscht global älter als eine Stunde und wird nur nach erfolgreichem Kontakt geplant (`:77-85`, `actions/contact.ts:78-80`). Der Clientfehler-10-Minuten-Bucket hat damit keine harte 10-Minuten-Retention. Tests löschen alle Buckets global (`db-cleanup.ts:114-121`). Das Feld enthält personenbezogene/pseudonyme Netzwerkdaten ohne Anwendungsschichtverschlüsselung.

### 19.7 Migrationen und Schema-Synchronisierung

**Partially implemented:** `prisma/migrations/` fehlt und wird durch `.gitignore:38` ausgeschlossen. Der vorgesehene Weg ist `prisma db push` (`package.json:14-16`, `README.md:161-175`, `ARCHITECTURE.md:127-132`). Damit sind Rollback, historische DDL, Deploymentreihenfolge und Drift aus dem Repository nicht rekonstruierbar. `prisma.config.ts:4-10` registriert Datasource und Seed, aber keine Migration. Keine Trigger, Stored Procedures oder SQL-Schemadateien wurden gefunden.

### 19.8 Transaktionsinventar und Konsistenz

Statisch existieren 21 `$transaction`-Aufruforte: elf Produktion/Seed (Seed 1, Contact 2, Users 2, Logs 1, Auth 2, Rate Limit 3) und zehn E2E-Helper. Mutierende Produktionspfade sind transaktional. Reads außerhalb: Kontakt-, User-, Audit- und Session-User-Read sowie Testreads. Kein Aufruf setzt explizit `isolationLevel`; nur Login wiederholt Prisma `P2034` maximal dreimal ohne Backoff.

- RateLimit-Commit und Kontaktanlage sind getrennt; ein später Fehler erstattet Budget nicht.
- Useranlage/-löschung und jeweiliges Audit sind gemeinsam atomar.
- Kontaktlöschung und alle zugehörigen Audits sind gemeinsam atomar; Count-Abweichung rollt alles zurück.
- LoginAttempt-Änderungen und erfolgreicher Login-Audit sind gemeinsam atomar.
- Retention-Cleanups sind getrennte After-/Fire-and-forget-Transaktionen und nicht Teil der Response-Atomizität.

## 20. Authentifizierung, Autorisierung, Sessions und Identität

### 20.1 NextAuth-Konfiguration

`authOptions` in `src/lib/auth.ts:68-300` registriert einen Credentials-Provider, JWT-Sessionstrategie mit acht Stunden `maxAge`, `/admin/login` als Sign-in-Seite und ein beim Modulimport geprüftes `NEXTAUTH_SECRET`. Die Catch-all-Route exportiert den Factory-Handler als GET und POST (`src/app/api/auth/[...nextauth]/route.ts:1-6`). Credentials werden inline nur auf String/Nichtleerheit geprüft (`auth.ts:76-91`); E-Mail-, Passwort- und User-Agent-Längengrenzen fehlen vor SHA-256, DB-Lookup und bcrypt.

### 20.2 Lockout-Algorithmus

1. `getClientIp()` bestimmt fail-closed die IP; `headers()` liefert User-Agent oder leeren String.
2. E-Mail wird getrimmt/lowercase. `hashIdentifier` bildet SHA-256 mit Nullseparator (`auth.ts:31-35`).
3. `emailIdentifier = hash("email", email, ip, userAgent)` und `ipIdentifier = hash("ip", ip, userAgent)` (`:96-102`). Beide ändern sich bei User-Agent-Rotation; auch der erste ist nicht accountglobal.
4. Innerhalb einer retrybaren Transaktion werden beide Attempts und der User gelesen, abgelaufene Locks entfernt und aktive Locks geprüft (`:103-139`).
5. Für nicht existierende User wird ein statischer Dummy-bcrypt-Hash verglichen, um Enumerationstiming zu reduzieren; bei vorhandenen Usern wird das echte Passwort verglichen (`:140-145`).
6. Unbekannte Rolle oder falsches Passwort gilt als Fehlversuch. E-Mail-Bucket sperrt beim dritten, IP-Bucket beim neunten Versuch bis `now + 15 min` (`:146-193`).
7. Erfolg löscht beide Buckets und schreibt `LOGIN` mit acht Zeichen Hashpräfix in derselben Transaktion (`:199-221`).
8. Danach läuft ein nicht abgewarteter Cleanup alter Buckets (`:225-246`).

**Sicherheitswirkung:** atomare Zähler und generische Loginantworten sind **Implemented**. Der accountweite Schutz ist **Partially implemented**, weil ein Angreifer User-Agent und gegebenenfalls IP drehen kann. Bestehende Tests verwenden einen stabilen Browser-User-Agent und beweisen diesen Bypass nicht.

### 20.3 Rollen und Autorisierung

`normalizeRole` trimmt/lowercaset und akzeptiert nur `admin|staff` (`auth.ts:37-48`). Ungültige DB-Rollen verhindern Login beziehungsweise werden in der Userliste `unknown`. `requireAuth` schützt Kontaktread/-mutation; `requireAdmin` schützt User- und Auditoperationen (`src/lib/actions/auth-helpers.ts:5-19`). Das geschützte Layout redirectet ohne Session, erlaubt aber bewusst beide gültigen Rollen (`src/app/admin/(protected)/layout.tsx:9-17`). Admin-Tabs sind zusätzlich clientseitig verborgen; diese Sichtbarkeit ersetzt nicht die serverseitigen Gates.

| Operation | Unauthentifiziert | `staff` | `admin` |
|---|---:|---:|---:|
| öffentliche Seiten/Kontaktanlage/Clientfehler | erlaubt | erlaubt | erlaubt |
| `/admin`, Kontakte lesen/markieren/löschen | Redirect/gesperrt | erlaubt | erlaubt |
| Benutzerliste/-anlage/-löschung | Redirect/gesperrt | Redirect zu `/admin` | erlaubt |
| Auditlogs lesen | Redirect/gesperrt | Redirect zu `/admin` | erlaubt |
| eigenen User löschen | – | Staff kann Action nicht aufrufen | explizit blockiert |
| Admin-User löschen | – | – | explizit blockiert |

### 20.4 JWT und Session

Der `jwt`-Callback übernimmt beim Login User-ID und normalisierte Rolle in das Token (`auth.ts:268-273`). Falls die Providerrolle unerwartet ungültig wäre, fällt er auf `staff` zurück; `authorize` blockiert solche User zuvor. Der `session`-Callback verlangt Token-ID, liest den User bei jedem Sessionabruf, fängt DB-Fehler als `null`, normalisiert Rolle und liefert andernfalls `null` (`:275-297`). Dadurch werden gelöschte, herabgestufte oder ungültige User fail-closed, aber jede Session ist an DB-Verfügbarkeit gekoppelt.

`normalizeSession` prüft erneut User, ID und Rolle (`src/lib/session.ts:7-32`). `getCachedSession = cache(async ...)` dedupliziert `getServerSession` im React-Requestkontext (`:34-36`). Es ist kein globaler oder verteilter Cache. `authOptions.session.maxAge` begrenzt die JWT-Session auf acht Stunden (`src/lib/auth.ts:260-263`); Cookieattribute, JWT-Codierung und weitere NextAuth-Details bleiben **Framework-registriert** und wurden nicht zur Laufzeit verifiziert.

### 20.5 Identitäts-Lebenszyklus und Grenzen

Adminbootstrap erfolgt ausschließlich per Seed; reguläre Admins können nur Staff erstellen/löschen. Seedwiederholung rotiert Passwort und erzwingt Adminrolle ohne DB-Audit. Staff-Erstellung und -Löschung werden auditiert. Es fehlen Einladung, Verifikation, Reset, Passwortänderung, MFA, Rollenänderung, Sessionübersicht und Tokenrevokationsliste. DB-Revalidierung macht Userlöschung/Rollenänderung effektiv, aber bestehende JWTs werden nicht separat inventarisiert.

## 21. Sicherheit, Datenschutz, Vertrauensgrenzen und Secrets

### 21.1 Vertrauensgrenzen

```mermaid
flowchart LR
    Internet["Nicht vertrauenswürdig: Browser/IP/Header/Formulare"]
    Proxy["Bedingt vertrauenswürdig: Vercel oder konfigurierter Reverse Proxy"]
    Next["Next Middleware, Route Handler, Server Actions"]
    Validate["Zod, Rollen-Gates, Rate-/Lockout-Logik"]
    DB[("Vertrauenswürdige PostgreSQL-Grenze")]
    Logs["Betriebslogs: separater Datenschutzbereich"]
    Internet --> Proxy --> Next --> Validate --> DB
    Next --> Logs
    Validate --> Logs
```

- Clientdaten bleiben bis zur serverseitigen Zod-/Authprüfung untrusted. Native HTML-Validierung und clientseitige Normalisierung sind nur Komfort.
- Proxyheader sind nur bei `VERCEL=1` beziehungsweise `TRUST_PROXY=true` vertrauenswürdig. Eine falsche Proxykonfiguration betrifft Login, Kontakt und Clientfehler gleichzeitig.
- Server Actions sind kein Autorisierungsnachweis durch Unsichtbarkeit; jede privilegierte Action ruft deshalb einen Serverguard.
- PostgreSQL enthält Credentials-Hashes, Kontakt-PII, IPs, Identitätssnapshots und Sicherheitszustand. Keine Feldverschlüsselung ist implementiert.
- Pino-Ausgabe verlässt gegebenenfalls den Prozess/Host; konkreter Sink, Zugriff, Retention und Transport sind **Unknown**.

### 21.2 Eingabe- und Ausgabeschutz

**Implemented:** strict Kontakt-, Mutation- und Clientfehlerschemas; Sanitization von Nullbytes/Tags; React-Escaping; parameterisiertes Prisma-Template-Raw-SQL; keine `dangerouslySetInnerHTML`-Nutzung; CSP/Nonce; Securityheader; generische Auth-/Serverfehler; Passwort-Hashes statt Klartext.

**Partially implemented:** `createUserSchema` ist nicht strict; Authcredentials/UA/IP besitzen keine Längencaps; IP-Syntax wird nicht validiert; `digest` ist frei kontrollierbarer bereinigter Logtext; Datenbankconstraints spiegeln Anwendungsvalidierung nicht. Pino-Redaction erfasst bekannte Objektpfade, kann aber freie Error-Message/Stack-Inhalte nicht garantieren.

### 21.3 Datenschutzinventar

| Datenkategorie | Speicher/Transport | Zweck | Löschung/Retention | Befund |
|---|---|---|---|---|
| Name, Telefon, Anliegen, Einwilligung | `contact_requests`; Server Action | Rückruf-/Terminbearbeitung | nur manuelle Admin-/Staff-Löschung | direkte PII, potenziell Gesundheitsbezug; keine technische Frist |
| Benutzername/E-Mail | `users`, JWT/Session, Admin-UI | Mitarbeiteridentität | manuelle Staff-Löschung; Adminseed | keine Update-/Deletehistorie außer ausgewählten Audits |
| Passwort | Browser → NextAuth/Action; bcrypt-Hash in `users` | Authentifizierung | bei Seed/Userlöschung; kein Resetpfad | Klartext nur transient; keine Maxlänge |
| Login-Kontext | SHA-256 in `login_attempts` | Lockout | requestabhängiger 15-Minuten-Cleanup | pseudonym, über Kontext korrelierbar |
| Roh-IP | namespaced in `rate_limits` | Abuse-Schutz | opportunistisch >1 Stunde | client-error-Fenster 10 min, aber keine harte 10-min-Retention |
| Actorname, User-ID, interne IDs | `audit_logs` | Nachvollziehbarkeit | reaktiv nach sechs Monaten | Snapshot überlebt Userlöschung; keine periodische Garantie |
| Fehlerdigest/Pfadkategorie | Pino | Diagnose | deploymentabhängig **Unknown** | Digest kann PII-fähigen Clienttext enthalten |

`getContactRequests` gibt alle Prismafelder einschließlich `gdprConsent` an den Client weiter, obwohl `ContactRequest`-UI-Typ dieses Feld auslässt. Das verstößt gegen Datenminimierung, ohne einen direkten UI-Renderbeleg. Audit-`userName` kann auf E-Mail zurückfallen. Die Datenschutzerklärung beschreibt manuelle Kontaktlöschung korrekt, doch tatsächliche Prozessdisziplin ist **Unknown**.

### 21.4 Secrets

`DATABASE_URL`, `NEXTAUTH_SECRET` und `ADMIN_PASSWORD` sind Geheimnisse. Reale Werte wurden nicht gelesen. `.gitignore` schließt `.env*` mit Ausnahme `.env.example` aus. `NEXTAUTH_SECRET` wird beim Auth-Modulimport auf mindestens 32 Zeichen geprüft; der lokale Wrapper prüft dieselbe Länge. Seed prüft Adminpasswortkomplexität. Es gibt keine Secret-Manager-Integration, Rotation, Key-ID, Dual-Key-Phase oder dokumentierte automatische Rotation. `README.md` und Tests enthalten bekannte Fallback-/Beispielcredentials; sie dürfen nicht produktiv verwendet werden.

## 22. Kryptografie und Schlüssel-Lebenszyklus

| Mechanismus | Implementierung | Schlüssel/Parameter | Lebenszyklus und Grenzen |
|---|---|---|---|
| Passwort-Hash | `bcryptjs.hash(password, 12)` in `prisma/seed.ts:39`, `actions/users.ts:22`; `compare` in `auth.ts:143-145` | adaptiver Cost 12, Salt durch bcrypt | Hash bleibt bis Userlöschung/Seedrotation; kein Rehash-on-login, Reset oder Algorithmusmigration |
| Dummy-Passworthash | statische bcrypt-Zeichenfolge in `auth.ts` | verhindert offensichtliche Userenumeration per Vergleichspfad | Sourcekonstante, kein Secret; genaue Timinggleichheit **Unknown** |
| Login-Identifier | Node `crypto.createHash("sha256")`, `auth.ts:31-35` | kein Secret/Pepper; Nullseparator | neue Hashes je Kontext; Löschung opportunistisch; pseudonym, nicht anonym |
| CSP-Nonce | `crypto.randomUUID()` → `btoa`, `src/middleware.ts:23-26` | je gematchtem Request neu | nur Header-/Requestlebensdauer; Tests prüfen Variation, nicht Entropie |
| NextAuth JWT-Signatur/-Verschlüsselung | NextAuth mit `NEXTAUTH_SECRET`, `auth.ts:17-22,68-313` | mindestens 32 Zeichen erzwungen | Rotation/mehrere aktive Schlüssel nicht implementiert; genaue Frameworkkryptografie **Framework-registriert** |
| PostgreSQL TLS | URL-Normalisierung in `src/lib/prisma.ts:13-37` | einige Modi → `verify-full` | fehlender Modus, `disable`, `uselibpqcompat=true` bleiben möglich; Zertifikatsrotation extern |
| Transport TLS/HSTS | HSTS in `next.config.ts:10-12`; README-Nginx | 63.072.000 s, Subdomains, preload | TLS-Termination/Certificate/Preloadstatus **Unknown** |

Es gibt keine Anwendungsschichtverschlüsselung für Datenbankfelder, keine KMS-/HSM-Anbindung, keine eigene Zufallsschlüsselverwaltung und keine Signatur von Auditlogs. Secretrotation kann aktive Sessions invalidieren; ein koordinierter Ablauf ist nicht im Code implementiert.

## 23. Externe Dienste und Integrationen

| Dienst/Integration | Status | Verwendung | Daten/Netzwerk und Grenze |
|---|---|---|---|
| PostgreSQL | **Implemented** | PrismaPg/`pg.Pool`, fünf Tabellen | einziger aktive Laufzeitdienst; Host/Version/Rechte/Backups **Unknown** |
| NextAuth intern | **Implemented** | Credentials/JWT, keine OAuth-Provider | Teil derselben Next-App; keine externe Identity-API |
| Google Fonts über `next/font/google` | **Implemented** | Inter in `src/app/layout.tsx:2,7-13` | Buildzeitdownload möglich, danach selbst gehosteter Buildoutput; Buildnetzwerk nicht geprüft |
| Vercel Headerkonvention | **Partially implemented** | `VERCEL=1` aktiviert signierten Forwarded-Headerpfad | keine `.vercel`-/Deploymentkonfiguration; tatsächliches Hosting **Unknown** |
| Reverse Proxy | **Partially implemented** | `TRUST_PROXY=true` für Nginx/Traefik-Header | nur App-Logik und README-Beispiel; reale Proxykonfiguration **Unknown** |
| Pino-Logplattform | **Unknown** | JSON nach stdout/stderr/Hosttransport | Vercel/PM2 werden nur kommentiert/dokumentiert; kein Adapter/Sink |
| E-Mail, SMS, Kalender, CMS, Maps, Analytics, Ads | **Planned only** | keine Abhängigkeit, Route oder Netzwerknutzung | Kontakt bleibt ausschließlich in DB/Dashboard |
| Redis/Upstash | **Planned only** | Kommentar für >1000 req/min (`rate-limit.ts:8`) | keine Pakete oder Konfiguration |

Es gibt keine Webhooks, externe API-Keys, Zahlungsdienste, Queue-Broker, Objektstorage oder projekt-eigene Medien-CDN-Nutzung. Lucide und Framer Motion sind gebündelte npm-Komponenten, keine Laufzeitdienste.

## 24. Hintergrundarbeit, Queues, Scheduler, Caching, Retries und Nebenläufigkeit

### 24.1 Hintergrund-/After-Arbeit

| Aufgabe | Trigger | Ausführung | Fehler/Retention-Grenze |
|---|---|---|---|
| per-Key RateLimit-Cleanup | jeder `checkRateLimitDb` | Next `after()`, Transaktion | Fehler geloggt; nach Reset normal wirkungslos (`rate-limit.ts:36-45`) |
| globaler RateLimit-Cleanup | erfolgreiche Kontaktanlage | verschachteltes `after()` → `cleanupExpiredRateLimits` | löscht >1 h; ohne erfolgreiche Kontakte kein Lauf |
| Audit-Cleanup | Admin ruft `getAuditLogs` | `after()`, Transaktion | löscht <6 Monate erst nach Read; ohne Adminverkehr kein Lauf |
| LoginAttempt-Cleanup | abgeschlossener Authorize-Versuch | `void prisma.$transaction(...).catch(...)` | nicht `after()` und nicht awaited; serverless Abbruch möglich |
| Dashboard-Polling | Client, erste Seite, sichtbares Dokument | `setInterval` 30 s → `router.refresh()` | Cleanup bei Unmount; pausiert auf älteren Seiten |
| UI-Meldungen/Banner | Clientmount/Erfolg | Timer 1,5 s beziehungsweise 4 s | Effect-Cleanup vorhanden |
| DB-Warmup | Prisma-Modulimport | `pool.connect().then(release).catch(warn)` | nicht awaited; Start läuft trotz Fehler weiter |

Es gibt keine Queue, Worker, Cron, Schedulerdatei oder Lease. Begriffe „periodisch“/„automatisch“ sind für Retention nur bedingt zutreffend.

### 24.2 Caching

`React.cache` dedupliziert `getServerSession` im Server-Renderrequest. Next `revalidatePath("/admin")` invalidiert nach Kontakt-/Usermutationen; `/admin` ist zusätzlich `force-dynamic`. Die Clientpagination hält bereits geladene Seiten in `requestPageHistory`, ohne TTL und nur bis Remount. Kein Redis, HTTP-Responsecache, SWR/React Query oder Service Worker ist vorhanden.

### 24.3 Retries, Parallelität und Rennen

- Nur Logintransaktionen wiederholen `P2034` bis zu drei Versuche, ohne Backoff (`auth.ts:50-66`). Operationen sind innerhalb der Transaktion wiederholbar; externe Side Effects liegen dort nicht vor.
- RateLimit-UPsert ist ein einzelnes SQL-Statement und race-resistent; App-/DB-Zeitquellen können dennoch abweichen.
- Kontakt-/User-/Bulkmutationen haben keine automatische Wiederholung oder Idempotency Keys. UI-Transitions verhindern nur lokale Doppelausführung; ein anderer Client kann parallel handeln.
- Bulk-Countguards erzwingen atomaren Rollback bei stale IDs. Userlöschung konditioniert auf Rolle und prüft danach den Status innerhalb derselben Transaktion.
- `bcrypt.compare` innerhalb der Logintransaktion kann alle fünf Poolverbindungen unter Last binden.
- `Promise.allSettled` lädt Dashboardquellen parallel, verbirgt aber Teilfehler als Leere.
- Playwright nutzt einen Worker, vermindert aber keine Gefahren gegenüber parallel laufenden externen Prozessen.

## 25. Konfiguration und Umgebungsvariablen

### 25.1 Vollständige Variablenreferenz

| Variable | Erforderlich/Default | Validierung und sicheres Format | Lesestellen/Auswirkung |
|---|---|---|---|
| `DATABASE_URL` | Runtime zwingend; kein Default | `postgresql://USER:PASS@HOST:5432/DB?sslmode=verify-full`; Runtime prüft nur vorhanden, normalisiert einige SSL-Modi | `src/lib/prisma.ts:6-11`; `prisma.config.ts:9`; lokaler Wrapper `:52-97` |
| `NEXTAUTH_SECRET` | Auth zwingend | mindestens 32 Zeichen; zufällige lange Zeichenfolge | `src/lib/auth.ts:17-22`; Wrapper `:55,66-68`; NextAuth JWT |
| `NEXTAUTH_URL` | für NextAuth/Wrapper erforderlich, Code liest nicht direkt | absolute App-URL, Beispiel HTTPS | `.env.example:8`; Wrapper `:54`; Frameworkkonvention |
| `ADMIN_EMAIL` | Seed zwingend; fünf Specs haben bekannten Fallback | Seed trim/lowercase, nur nichtleer; sichere echte Adminadresse | `prisma/seed.ts:15`; Tests; Wrapper `:56` |
| `ADMIN_PASSWORD` | Seed zwingend; fünf Specs haben bekannten Fallback | Seed ≥12, Komplexität, nicht in Weak-Set; Wrapper nur vorhanden | `prisma/seed.ts:16-35`; Tests; Wrapper `:57` |
| `TRUST_PROXY` | optional Runtime; Wrapper verlangt exakt vorhandenen Wert und lokal nicht `true` | nur String `"true"` aktiviert Proxyvertrauen | `src/lib/client-ip.ts:38`; `.env.example:15-21`; Wrapper `:58,70-72` |
| `LOG_LEVEL` | optional, Default `info` | keine Whitelist/Validierung | `src/lib/logger.ts:12`; steuert Pino-Level |
| `NODE_ENV` | Frameworkgesetzt | `development\|production\|test` erwartet, nicht selbst validiert | `src/middleware.ts:25`, `src/lib/client-ip.ts:54`, `src/lib/prisma.ts:76` |
| `VERCEL` | optional, Default nicht aktiv | exakt `"1"` aktiviert Vercel-IP-Header | `src/lib/client-ip.ts:32-35` |
| `CI` | optional, truthy semantisch | Boolean über Vorhandensein/Truthy | `playwright.config.ts:7-8,36`: forbidOnly, 2 Retries, kein Server-Reuse |
| `DOTENV_CONFIG_PATH` | nur Child des Wrappers | absoluter Pfad zu `.env.test.local` | vom Wrapper in Child-Env gesetzt (`scripts/run-local-env.mjs:130`) |
| `DOTENV_CONFIG_OVERRIDE` | nur Child, fest `true` | Wrapperwert | erzwingt Dateivorrang (`:131`) |
| `DOTENV_CONFIG_QUIET` | nur Child, fest `true` | Wrapperwert | unterdrückt dotenv-Ausgabe (`:132`) |

### 25.2 Konfigurationsquellen und Präzedenz

- Normale direkte Befehle verlassen sich auf Next/Prisma/`dotenv/config` und die ambient Prozessumgebung. `playwright.config.ts:1` und `prisma.config.ts:1` laden Standard-dotenv.
- `run-local-env.mjs` lädt ausschließlich `.env.test.local` mit `override:true` und setzt die drei `DOTENV_CONFIG_*`-Werte an den Childprozess; Dateiwert schlägt ambient Wert.
- `.env.example` ist nur Referenz. `.env.test.local` fehlt im aktuellen Bestand.
- `NEXT_PUBLIC_*`-Variablen und Featureflag-Systeme existieren nicht. `darkMode` ist ein ungenutzter Build-/CSS-Schalter, kein Laufzeitflag.
- Entwicklung nutzt bei fehlender IP Loopback und globalen Prisma-Singleton; Produktion failt IP closed und speichert Singleton nur im Modulcache. CI verändert Playwright-Retries/Reuse. Eine Staging-spezifische Konfiguration fehlt.

### 25.3 Statische Konfigurationen

`next.config.ts` setzt Header und verbietet ESLint-Ignorieren beim Build. `tailwind.config.ts` scannt nur `src/components` und `src/app`, nicht `src/lib`; dort entstehen keine zu erhaltenden dynamischen UI-Klassen. `postcss.config.js` registriert Tailwind/Autoprefixer. `tsconfig.json` ist strict/noEmit mit Alias. `eslint.config.mjs` verbietet Console, meldet explizites `any` nur als Warnung und ignoriert generierte/Testreport-Verzeichnisse.

## 26. Fehlerbehandlung, Logging, Metriken, Tracing und Beobachtbarkeit

### 26.1 Pino-Konfiguration

`src/lib/logger.ts:11-44` erzeugt einen Prozesslogger mit `LOG_LEVEL || "info"`, Standard-Error-Serializern, ISO-Zeit und großgeschriebenem Level. Redigiert werden bekannte Pfade unter `data`, `user`, `payload` sowie top-level `password` und `userAgent`; Censor ist `[REDACTED]`. Top-level Name/E-Mail werden bewusst nicht pauschal redigiert, um Strukturfelder nicht zu beschädigen. Freie Error-Stacks/-Messages und das Client-`digest` können außerhalb dieser Pfade PII enthalten. Der Kommentar behauptet Trace-ID-Unterstützung und non-blocking I/O, aber es gibt weder erzeugten/weitergereichten Tracekontext noch eine projektspezifische Transportkonfiguration.

### 26.2 Fehlerpfade

| Bereich | Behandlung | Nutzersicht | Beobachtbarkeit/Grenze |
|---|---|---|---|
| Kontaktanlage | Catch, Trusted-IP gesondert, sonst `logger.error` | generischer deutscher Fehler | keine DB-/PII-Payload im expliziten Logobjekt; `err` kann intern enthalten |
| Kontaktmutation | Not-found-Klasse gesondert; sonst Errorlog mit Action/IDs | aktionsbezogener Fehler | IDs werden geloggt; UI refresht bei Fehler |
| Useranlage | `P2002` gesondert; sonst Errorlog | Duplicate oder generisch | Fehlercode geloggt, Passwort nicht |
| Userlöschung | Statusfälle + Warn für unknown role; Catch Error | differenzierte deutsche Fehler | Ziel-ID geloggt |
| Audit-/Rate-Cleanup | Promise-Catch + Errorlog | Antwort bleibt erfolgreich | keine Retry-/Alarmierung |
| Login | bekannte Gründe als JSON-codierter NextAuth-Error; unerwartet geloggt/generisch | einheitlicher/Lockouttext | keine Fehlversuch-Audits; Cleanupfehler Log |
| Clientfehlerroute | IP/Ratefehler ohne Serverlog, JSON/Schema 400 | leer oder generischer JSON-Fehler | gültig: Warnlog; ungültig/rate failure schwer diagnostizierbar |
| Dashboard-Queries | `allSettled`, jeder Reject Errorlog | betroffener Tab erscheint leer | Fehler/echte Leere ununterscheidbar |
| Root Error Boundary | best-effort POST, Catch verworfen | Retry/Telefon | keine Zustellgarantie |
| Admin Error Boundary | einmaliger lokaler Retry | Retry/Telefon/Digest | Retry-State kann festhängen |
| Prisma-Warmup | Warnlog, kein Startabbruch | späterer Request kann fehlschlagen | kein Healthcheck |
| Seed/Wrapper | Pino + Exitcode beziehungsweise stderr + `exit(1)` | CLI-Fehler | Seed-Cleanupfehler nach `finally` nicht erneut gefangen |

### 26.3 Metriken, Health und Tracing

**Planned only:** Es gibt keine Metrikbibliothek, Counter/Histogramme, Traces/Spans, Correlation-ID, Health-/Readiness-Route, Error-Aggregation, Alertregel oder Dashboardkonfiguration. AuditLog ist fachliche Nachvollziehbarkeit, keine technische Telemetrie. HTTP-/Datenbanklatenzen, Poolauslastung, Rate-Limit-Treffer und Cleanup-Ergebnisse sind nicht messbar instrumentiert.

## 27. Build, Entwicklung, Tests, Deployment und Betrieb

### 27.1 Alle 16 npm-Skripte

| Skript | Befehl | Zweck/Output | Sicherheits- und Voraussetzungshinweis |
|---|---|---|---|
| `dev` | `next dev` | Entwicklungsserver | ambient Env; benötigt Dependencies/generierten Client/DB |
| `postinstall` | `prisma generate` | generiert `src/generated/prisma` | schreibt abgeleiteten Code; aktuell nicht ausgeführt |
| `build` | `prisma generate && next build` | Prisma-Client und `.next`-Produktionsbuild | kann Fontnetzwerk nutzen; schreibt Outputs; nicht ausgeführt |
| `start` | `next start` | startet vorhandenen Produktionsbuild | `.next` fehlt |
| `lint` | `eslint .` | statische Regeln | `node_modules` fehlt; nicht ausgeführt |
| `dev:local` | Wrapper `next dev` | lokaler Server mit `.env.test.local` | Loopback-DB-Hostguard, kein Wegwerf-DB-Namensguard |
| `prisma:generate` | `prisma generate` | Clientgenerierung | ambient Env/CLI; Writeoutput |
| `prisma:generate:local` | Wrapper `prisma generate` | lokal gegardete Generierung | `.env.test.local` und Dependencies erforderlich |
| `prisma:push` | `prisma db push` | mutiert Zielschema | **nicht ausführen ohne explizite Zielprüfung**; ambient DB |
| `prisma:push:local` | Wrapper `prisma db push` | lokaler Schema-Push | mutiert Loopback-DB, nicht automatisch wegwerfbar |
| `prisma:validate:local` | Wrapper `prisma validate` | Schema-/Konfigvalidierung | lokale Env/Dependencies erforderlich; read-mostly |
| `prisma:seed` | `tsx prisma/seed.ts` | Admin-Upsert | kritische ambient DB-/Credentialmutation |
| `prisma:seed:local` | Wrapper `tsx prisma/seed.ts` | lokaler Admin-Upsert | kritische lokale DB-Mutation |
| `test:e2e` | `playwright test` | Browser-/DB-Suite | **unsicher**: ambient Env und globale Testlöschungen |
| `test:e2e:local` | Wrapper `playwright test` | E2E auf Loopback-DB-Host | nicht hinreichend wegwerfbar; Server-Reuse-Risiko |
| `test:e2e:ui` | `playwright test --ui` | interaktive E2E-UI | unguarded ambient Env, gleiche destruktive Helper |

Es fehlen dedizierte `typecheck`, Unit-Test-, Format-, Coverage-, Clean-, Deploy- und Release-Skripte. `tsconfig` würde Tests und generierte Typen einbeziehen. `playwright.config.ts:34` nutzt Windows-spezifisch `npm.cmd run dev`, während `README.md` Ubuntu-Betrieb beschreibt.

### 27.2 Reproduzierbarer Aufbau aus dem Bestand

Der statisch belegte Sollweg ist: passende Node/npm-Version wählen (**Unknown**, da keine Engine), Dependencies aus Lockfile installieren, sichere Env bereitstellen, Prisma-Client generieren, PostgreSQL-Schema per bewusstem `db push` synchronisieren, optional Seed ausführen, linten/builden und erst auf isolierter Testdatenbank testen. In dieser Analyse wurden Installation, Generate, Push, Seed, Build und E2E wegen Scope, fehlender Dependencies oder Mutationsrisiko nicht ausgeführt.

### 27.3 Deployment und Betrieb

`README.md` beschreibt manuell Ubuntu, PostgreSQL, PM2, Nginx, Certbot, UFW und Backups. Im Repository fehlen Dockerfile, Compose, PM2-Ecosystemdatei, systemd Unit, CI-Workflow, Vercelprojekt, IaC, Secret-Manager-, Backup- oder Restoreautomation. Der Nginx-Ausschnitt referenziert ein nicht vorhandenes `public/` und setzt `X-Frame-Options SAMEORIGIN`, während die aktive App `DENY` setzt. Deploymenttopologie, Replikazahl, TLS-Terminierung, Datenbankbackups und Restoretests sind **Unknown**.

## 28. Testarchitektur, Szenarien, Abdeckung und Lücken

### 28.1 Bestand und Planung

| Spec | Suite | Fälle | Desktop | Mobile | Kernabdeckung |
|---|---|---:|---:|---:|---|
| `admin-dashboard.spec.ts` | Admin Dashboard | 13 | 13 | 0 | Tabs, Pagination, CRUD, Pending-Kopplung, Bulk, Zod, Rolle, Audit |
| `admin-logic.spec.ts` | Admin Logic Corrections | 5 | 5 | 5 | stale UI, Rollback, ungültige Rolle, Rollenverlust |
| `auth.spec.ts` | Admin Login & Lockout | 6 | 6 | 6 | Erfolg, 3er-Lockout, Hashprivacy, Cleanup, Parallelität, Rolle |
| `chaos.spec.ts` | Chaos & Integrity | 2 | 2 | 2 | Double-Submit, Tag-only-Sanitization |
| `contact.spec.ts` | Kontaktformular | 4 | 4 | 0 | Retentiontext, Persistenz, Honeypot, manipuliertes Telefon |
| `role-visibility.spec.ts` | Role Visibility & Normalization | 3 | 3 | 3 | Admin-/Staff-Tabs, Uppercase-Normalisierung |
| `security.spec.ts` | Security — Edge Cases | 11 | 11 | 11 | Guards, Robots, Header, CSP, Lockout, Fehlerroute |
| **Summe** | 7 Suites | **44** | **44** | **27** | **71 geplante Projekt-Testausführungen** |

Playwright nutzt einen Worker, keine volle Parallelität, 30-s-Timeout, HTML-Reporter, Trace beim ersten Retry und Screenshot nur bei Fehler (`playwright.config.ts:4-17`). CI verbietet `.only`, wiederholt zweimal und startet keinen wiederverwendeten Server; lokal darf ein bereits lauschender Server weiterverwendet werden. Die Suite enthält 14 Lifecycle-Hooks, sieben Suitecallbacks und zahlreiche DB-/Browserhelper; alle 161 testseitigen ausführbaren Einheiten sind in Abschnitt 30 einzeln erfasst.

### 28.2 Abdeckung nach Verhalten

Stark abgedeckt sind Kontaktanlage/Honeypot/Servervalidierung, Admin-Kontaktmutationen inklusive stale/atomar, Staff-CRUD, Rollenanzeige, Login-Lockout/Parallelität, ausgewählte Securityheader/CSP und Clientfehler-Body/Rate-Limit. Tests verbinden Browser und direkte Prisma-Reads und prüfen dadurch Persistenzendzustände.

Nicht oder nur indirekt abgedeckt:

- keine Unit-/Komponenten-, Firefox- oder WebKit-Suite;
- keine Produktionstests für Proxy-fail-closed, `VERCEL`, TLS oder echte Deploymentheader;
- keine User-Agent-Rotation gegen beide Login-Buckets und keine Auth-Eingabegrößenlimits;
- kein vierter Kontaktrequest/Stundenfenster-Reset, RateLimit-Retention oder fehlgeschlagener After-Job;
- kein Audit-Cleanup > sechs Monate und keine Kontakt-Retention;
- kein Seed-, `normalizeConnectionString`-, Pool-Warmup/-Shutdown-, Generate-, Schema-Drift- oder DB-Constraint-Test;
- keine Tests für Global/Admin Error UI, Impressum, vollständige Landingpage, Navbar, Hero, About, Schedule oder Footer;
- keine direkte Server-Action-Autorisierung mit manipulierten Rollen/Requests jenseits UI-Navigation;
- keine invaliden Cursor, >50/duplizierten IDs, Self-Delete, Passwort-Maxgröße, Clientdigest-Inhalt oder nichtdeutsche Telefonnummern;
- kein gezielter Teilqueryfehler im Dashboard und keine Unterscheidung von Fehler/Leere;
- Kontakt und großer Dashboardpfad werden im Mobile-Projekt ignoriert.

### 28.3 Sicherheitsgrenze der Testausführung

Die Helfer löschen sämtliche `login_attempts` (`db-cleanup.ts:75-79`), sämtliche `rate_limits` (`:117-121`), altern alle nicht gesperrten Attempts (`:104-112`) und ersetzen die gesamte Audit-Tabelle (`:220-237`). `role-visibility` überschreibt den ambient Adminuser und restauriert ihn nicht. Deshalb wurde keine E2E-Variante ausgeführt. Ein sicherer zukünftiger Lauf erfordert mindestens eine nachweislich disposable Datenbankkennung, serverseitige Testmodus-Verifikation, kein Server-Reuse mit abweichender Env und auf Testnamespace beschränkte Cleanupdaten.

### 28.4 Vorhandene, aber veraltete Testergebnisse

`test-results/.last-run.json:1-4` meldet `passed` und keine fehlgeschlagenen IDs. Der in `playwright-report/index.html:90` eingebettete Bericht wurde read-only dekodiert: Start 2026-04-19T17:11:51.260Z, 70,044 s, 30 expected, null unexpected/flaky/skipped, Desktop+Mobile, ein Worker. Er enthält nur sechs Specs; `admin-logic.spec.ts` fehlt, und die damaligen Fallzahlen ergeben 30 statt aktuell 44 beziehungsweise 71 Projektausführungen. **Unknown:** Der aktuelle Quellstand hat keinen gültigen Pass/Fail-Nachweis; aus dem Artefakt wird kein „Tests grün“ abgeleitet.

## 29. Technische Datei-für-Datei-Referenz

Jede der 80 relevanten Dateien einschließlich dieser Referenz erhält hier eine individuelle technische Einordnung. Der genau einmal vergebene Coverage-Status je Datei steht ausschließlich im kanonischen Ledger in Abschnitt 36.

| Nr. | Datei | Individuelle Verantwortung und wichtige Symbole | Verknüpfungen, Grenzen und Wartungshinweise |
|---:|---|---|---|
| 1 | `.agents/skills/commit.md` | Definiert selektives Staging, englische Commitnachricht und Abschluss eines validierten logischen Changes. | Setzt funktionsfähiges Git voraus; in diesem Bestand nicht ausführbar. |
| 2 | `.agents/skills/diff-aware-review.md` | Zweistufige Scope-, Architektur-, Auth-, Action-, Daten- und Testprüfung mit Verdict. | Prüft, behebt nicht; benötigt verlässlichen Diff. |
| 3 | `.agents/skills/plan.md` | Erzwingt Taskverständnis, Scope, Dateien, Risiko und Minimalplan. | Verknüpft `risk-level`; prozedural, nicht durch Buildtools erzwungen. |
| 4 | `.agents/skills/review-dirty.md` | Tiefenreview uncommitteter Änderungen gegen `AGENTS.md`/`ARCHITECTURE.md`. | Git-basierte Teile sind ohne `.git/` nur durch Dateihashvergleich ersetzbar. |
| 5 | `.agents/skills/review-plus-fix.md` | Review-/Minimalfix-Schleife mit höchstens fünf Iterationen. | Für diesen Auftrag dürfen Fixes nur die Zieldokumentation betreffen. |
| 6 | `.agents/skills/risk-level.md` | Klassifiziert LOW bis CRITICAL und legt Safeguards fest. | Qualitative, manuell angewandte Bewertung. |
| 7 | `.agents/skills/take-over.md` | Orchestriert Review, kritische Validierung, E2E, Commit und Bericht. | E2E/Commit sind hier wegen DB-Risiko beziehungsweise fehlendem Git nicht sicher möglich. |
| 8 | `.env.example` | Referenz für DB-, NextAuth-, Seed-, Proxy- und Loggingvariablen. | Beispielpasswort erfüllt Seedregeln und darf nicht produktiv übernommen werden; Datei ist keine aktive Konfiguration. |
| 9 | `.gitignore` | Schließt Dependencies, Builds, lokale Secrets, Coverage, Migrationen und Prisma-Client aus. | Ignorierte Migrationen verhindern versionierte DB-Historie; `playwright-report/` und `test-results/` fehlen in den Ignoremustern. |
| 10 | `AGENTS.md` | Verbindliche Workflow-, Security-, Sprach-, Transaktions- und Schema-Sync-Regeln. | „Kein realer Multi-Agent-Runtime“ ist umgebungsspezifisch; technische Regeln sind nicht automatisch erzwungen. |
| 11 | `ARCHITECTURE.md` | Bestehende Soll-/Ist-Referenz für Module, Flows, Auth, Privacy, Tests und Betrieb. | Code hat Vorrang; konkrete Drifts stehen in Abschnitt 34. |
| 12 | `eslint.config.mjs` | Next Core Web Vitals, TypeScript-Parser, `no-console`, Unused-/Any-Regeln und Ignoremuster. | Drei importierte ESLint-Plugins sind nicht direkte Manifestabhängigkeiten; transitive Auflösung ist fragil. |
| 13 | `next.config.ts` | `nextConfig.headers()` baut globale Securityheader und Admin-`X-Robots-Tag`. | CSP liegt separat in Middleware; HSTS setzt korrekte HTTPS-Bereitstellung voraus. |
| 14 | `package.json` | Paketmanifest mit 16 npm-Skripten, 18 Runtime- und 14 Dev-Abhängigkeiten, Prisma-Seed und Override. | Ungeguardete Push-/Seed-/E2E-Basisskripte; Next-/ESLint-Majorversionen weichen ab. |
| 15 | `package-lock.json` | npm-Lockfile v3 mit 619 Paketdatensätzen und Integritäten. | Maschinell erzeugt, aber autoritativ für konkrete Auflösung; muss zum Manifest synchron bleiben. |
| 16 | `playwright.config.ts` | Definiert 44 Fälle über Desktop Chrome und teilweise Pixel 5, einen Worker, Reporter und Devserver. | Ambient dotenv, `reuseExistingServer` und `npm.cmd`; Kommentar nennt falsche Rate-Einheit. |
| 17 | `postcss.config.js` | Registriert Tailwind CSS und Autoprefixer als PostCSS-Plugins. | Verhalten hängt vollständig von Paketversionen/Build ab. |
| 18 | `prisma.config.ts` | `defineConfig`, `env("DATABASE_URL")` und Seedkommando für Prisma CLI. | Lädt ambient dotenv; direkte CLI-Mutationen besitzen keinen lokalen Guard. |
| 19 | `prisma/schema.prisma` | Generator, PostgreSQL-Datasource und fünf Modelle/30 Felder. | Keine Relationen, Checks, Enums oder Migrationen; Rollen/Aktionen bleiben Freitext. |
| 20 | `prisma/seed.ts` | `getSeedCredentials`, `main`, bcrypt und transaktionaler Admin-Upsert. | Überschreibt Passwort/Rolle ohne DB-Audit; E-Mail-Syntax ungeprüft; schließt Pool explizit. |
| 21 | `README.md` | Manuelles Runbook für Installation, PostgreSQL, PM2, Nginx, TLS, Firewall und Backup. | Keine ausführbare Ops-Automation; Nginx/Public/Header- und Credential-Widersprüche. |
| 22 | `scripts/run-local-env.mjs` | Lädt `.env.test.local`, validiert Variablen/Loopback-Postgres und spawnt vier erlaubte Toolentrypoints. | Prüft keinen disposable DB-Namen/NEXTAUTH_URL-Host; Basisskripte umgehen Wrapper; kein Child-`error`-Listener. |
| 23 | `src/app/admin/(protected)/dashboard-client.tsx` | `AdminDashboardClient`, `TabButton`, Tabstate, 50er-Seiten, History, 30-s-Polling und Logout. | Stats sind seitenlokal; Polling pausiert auf älteren Seiten; Refresh verwirft History. |
| 24 | `src/app/admin/(protected)/error.tsx` | `AdminError`, `handleRetry`, Routerrefresh, Boundaryreset und Telefonfallback. | `retrying` wird nicht zurückgesetzt; Retrylimit kann bei Remount zurückfallen. |
| 25 | `src/app/admin/(protected)/layout.tsx` | `ProtectedAdminLayout` lädt gecachte Session und redirectet unauthentifiziert. | Primärer `/admin`-Routeguard; beide gültigen Rollen sind beabsichtigt erlaubt. |
| 26 | `src/app/admin/(protected)/loading.tsx` | `AdminLoading` rendert drei Statistik- und vier Zeilen-Skeletons. | Keine Live-Region; Struktur ist statisch an aktuelle Dashboardform gekoppelt. |
| 27 | `src/app/admin/(protected)/page.tsx` | `AdminDashboardPage`, `force-dynamic`, Session und paralleles `Promise.allSettled` für drei Quellen. | Abgelehnte Queries werden geloggt und als Leerlisten dargestellt. |
| 28 | `src/app/admin/layout.tsx` | Passiver `AdminLayout`-Wrapper für Login und geschützte Gruppe. | Kein eigener Schutz/Metadata; Sicherheit liegt im Unterlayout. |
| 29 | `src/app/admin/login/page.tsx` | `AdminLoginPage`, `handleSubmit`, Credentialsstate, Fehlercode-Mapping und Passworttoggle. | JSON-kodierte NextAuth-Fehlerkopplung; kein Catch/Finally um `signIn`; schwacher Icon-A11y-Name. |
| 30 | `src/app/api/auth/[...nextauth]/route.ts` | Erzeugt NextAuth-Factoryhandler und exportiert ihn als `GET`/`POST`. | Verhalten hängt vollständig an `authOptions` und NextAuth-Protokoll. |
| 31 | `src/app/api/log/client-error/route.ts` | `normalizeLoggedPathname`, `POST`, IP-Rate-Limit, strict Zod und Pino-Warnlog. | Budget vor JSON; Digest frei; RateLimit speichert rohe IP; interne Ratefehler werden nicht geloggt. |
| 32 | `src/app/datenschutz/page.tsx` | Metadata und statische Datenschutzseite aus `publicContent` plus Text. | Rechtliche Aktualität und tatsächliche Betriebsprozesse sind nicht durch Code bewiesen. |
| 33 | `src/app/global-error.tsx` | `GlobalError`, Effect mit `fetch(...keepalive)`, Rejection-Swallow und Reset. | Keine Zustellgarantie/Retry; sendet Digest und kategorisierbaren Pfad. |
| 34 | `src/app/impressum/page.tsx` | Metadata, Praxis-/Kammer-/Haftungsangaben und Rücknavigation. | Rechtliche Aktualität ungetestet. |
| 35 | `src/app/layout.tsx` | Root-Metadata, Inter, globale CSS, `<html lang="de">`, `RootLayout` und `headers()`. | Alle Seiten werden dynamisch; Fontbezug kann Buildnetzwerk benötigen; kein OpenGraph-Bild. |
| 36 | `src/app/page.tsx` | `HomePage` komponiert Navbar, Hero, About, Schedule, ContactForm, Footer, CookieBanner. | Keine eigene Loading-/Errorgrenze; interaktive Kinder benötigen Hydration. |
| 37 | `src/app/robots.ts` | `robots()` erzeugt Allow/Disallow und Sitemapangabe. | Robots ist kein Zugriffsschutz; die angegebene Sitemap fehlt. |
| 38 | `src/components/about.tsx` | `About`, Featurekonstante, `useInView` und animierte Karten. | Texte liegen außerhalb `publicContent`; kein Reduced-Motion-Zweig. |
| 39 | `src/components/admin/logs-tab.tsx` | `LogsTab`, `actionBadgeClass`, leere Ansicht und Auditzeilen. | Rendert Identity/Details; unbekannte Aktion neutral; keine Pagination >100. |
| 40 | `src/components/admin/requests-tab.tsx` | `RequestsTab`, Mutationreducer, Auswahl, Bulk-/Einzelaktionen, `StatCard`, `RequestRow`, `SelectionCheckbox`. | Komplex gekoppelte States; „erledigt“ entspricht nur `read`; Stats seitenlokal. |
| 41 | `src/components/admin/types.ts` | `ContactRequest`, `UserAccount`, `AuditLogEntry`, Rollen-/Tabtypen und `ACTION_LABELS`. | Contact-DTO lässt `gdprConsent` aus, Server liefert es trotzdem; `action` ist frei. |
| 42 | `src/components/admin/users-tab.tsx` | `UsersTab`, Createform, optimistische Stafflöschung, Rollenlabel/-badge. | Fehlerrollback via Refresh; Passwort-UI zeigt nur Mindestlänge; serverseitiger Admin-Gate maßgeblich. |
| 43 | `src/components/contact-form.tsx` | `ContactForm`, `normalizePhone`, State/Transition, Honeypot, `FormField`, `InfoCard`. | Doppelte Client-/Serverregeln; nichtdeutsche Präfixnormalisierung fehleranfällig; kein Idempotency Key. |
| 44 | `src/components/cookie-banner.tsx` | `CookieBanner`, verzögertes Einblenden und `dismiss`. | Keine Cookie-/Storage-Persistenz; erscheint bei neuem Mount erneut. |
| 45 | `src/components/footer.tsx` | `Footer`, Praxisdaten, Kontakt, Rechtlinks und dynamisches Jahr. | Beschreibung zusätzlich hartcodiert; Jahr folgt Serverzeit. |
| 46 | `src/components/hero.tsx` | `Hero`, CTAs, Badges, Motion und Praxisprofil. | Marketingzahlen sind hartcodiert/nicht technisch belegt; Desktopgrafik mobil verborgen. |
| 47 | `src/components/navbar.tsx` | `Navbar`, Desktop-/Mobilnavigation und Menu-State. | Toggle ohne `aria-expanded`, Label bleibt „Menü öffnen“; keine Focus-Falle. |
| 48 | `src/components/schedule.tsx` | `Schedule`, hartcodierte Öffnungszeiten, Telefon, Adresse und Barrierefreiheit. | Betriebsdaten liegen zusätzlich außerhalb zentraler Contentquelle. |
| 49 | `src/components/ui/button.tsx` | `buttonVariants`, `ButtonProps`, ForwardRef-`Button`, Radix Slot/CVA. | `asChild` kann Nicht-Button rendern; Semantik liegt dann beim Aufrufer. |
| 50 | `src/components/ui/input.tsx` | `InputProps` und ForwardRef-`Input` mit Standardstyles. | Label-, Fehler- und ARIA-Verknüpfung liegt beim Aufrufer. |
| 51 | `src/components/ui/textarea.tsx` | `TextareaProps` und ForwardRef-`Textarea`. | `resize-none`; Semantik und Fehlerbezug liegen beim Aufrufer. |
| 52 | `src/content/data.ts` | Inhaltsinterfaces, Kontaktoptionstypen und `publicContent` für Praxis/Navigation/Metadata. | Nicht alle UI-Texte/Öffnungszeiten zentralisiert; einige Properties ungenutzt. |
| 53 | `src/lib/actions.ts` | Stabiler Barrel-Reexport für sieben Server Actions aus Contact, Users und Logs. | Server-Action-Grenzen müssen beim Reexport erhalten bleiben; kann Graphtransparenz reduzieren. |
| 54 | `src/lib/actions/auth-helpers.ts` | `requireAuth` und `requireAdmin` auf `getCachedSession`/Redirectbasis. | Redirect ist Framework-Kontrollfluss, kein Ergebnisobjekt. |
| 55 | `src/lib/actions/contact.ts` | `buildContactMessage`, öffentliche Anlage, authentifizierter Read und atomare Kontaktmutation. | Rate-Limit vor Validierung; voller Modellspread; manuelle Retention. |
| 56 | `src/lib/actions/logs.ts` | `getAuditLogs`, Adminread, ISO-Serialisierung und After-Retention. | Cleanup erst nach Read und nur durch Adminverkehr. |
| 57 | `src/lib/actions/users.ts` | `createUser`, `deleteUser`, `getUsers`, bcrypt, Rollenschutz und Audit. | Freitextrolle; Policy-Drift zum Seed; keine Rollen-/Passwortänderung. |
| 58 | `src/lib/auth.ts` | `hashIdentifier`, `normalizeRole`, Transaktionsretry, `authOptions`, Authorize/JWT/Session. | UA-rotierbare Buckets, unbeschränkte Inputs, bcrypt in Transaktion, fire-and-forget Cleanup. |
| 59 | `src/lib/client-ip.ts` | `TrustedClientIpError`, `getClientIp`, Vercel-/Proxy-/Dev-Reihenfolge und Predicate. | Keine IP-Syntax/-Längenprüfung; Sicherheit hängt an Hostingvariablen. |
| 60 | `src/lib/country-codes.ts` | `EUROPEAN_COUNTRY_CODES`, 45 statische europäische Vorwahloptionen. | Manuelle Aktualisierung; keine länderspezifische Rufnummernlogik. |
| 61 | `src/lib/logger.ts` | Zentraler Pino-Logger, Error-Serializer, Redaction, Level-Formatter und ISO-Zeit. | Redaction bekannter Pfade, aber keine Garantie für freie Error-/Digesttexte; Trace IDs fehlen. |
| 62 | `src/lib/prisma.ts` | `normalizeConnectionString`, Pool(max 5), Warmup, `createPrismaClient`, Singleton. | TLS nicht absolut erzwungen; Warmup unawaited; kein Web-Shutdown; Clientoutput fehlt. |
| 63 | `src/lib/rate-limit.ts` | `checkRateLimitDb`, Raw-SQL-UPsert, per-Key/globaler Cleanup. | per-Key-Cleanup normal wirkungslos; rohe IP; App-/DB-Zeitmix; Schema-Namenskopplung. |
| 64 | `src/lib/schemas.ts` | `ERROR_MESSAGES`, `sanitize`, Preprocessoren und sechs exportierte Boundary-Schemas. | `createUserSchema` nicht strict; Detailslimittext driftet; Regexsäuberung nur Defense-in-depth. |
| 65 | `src/lib/session.ts` | `normalizeSession` und requestlokal gecachtes `getCachedSession`. | Ungültige Rolle fail-closed; kein globaler Authcache. |
| 66 | `src/lib/utils.ts` | `cn(...inputs)` kombiniert `clsx` und `tailwind-merge`. | Kleine externe Verhaltensabhängigkeit, keine Domänenlogik. |
| 67 | `src/middleware.ts` | `middleware`, noncebasierte CSP auf Request/Response und `config.matcher`. | `style-src 'unsafe-inline'`; Auth bewusst nicht hier; Prefetch/Assets ausgeschlossen. |
| 68 | `src/styles/globals.css` | Tailwinddirektiven, CSS-Variablen, Basisstile, Smooth Scroll und WebKit-Scrollbar. | Kein Reduced-Motion-, Print- oder Dark-Theme-Ausgleich. |
| 69 | `src/types/next-auth.d.ts` | Augmentiert NextAuth `User`, `Session` und `JWT` um `id`/`role`. | Runtimeinvariante muss `auth.ts`/`session.ts` sichern. |
| 70 | `tailwind.config.ts` | Scanpfade, Farben, Inter, Radien, Schatten, Dark-Mode-Schalter, Animate-Plugin. | Dark Mode ungenutzt; dynamische Klassen müssen statisch auffindbar bleiben. |
| 71 | `tests/e2e/admin-dashboard.spec.ts` | 13 Fälle und Helper für Dashboard, Pagination, Pending, Bulk, CRUD, Rollen, Audit und Layoutstabilität. | Timing-/Next-Action-Kopplung; globale Auditrestauration und Cleanup-Risiko. |
| 72 | `tests/e2e/admin-logic.spec.ts` | Fünf Fälle für stale State, atomaren Rollback, ungültige Rollen und Rollenverlust. | Direkte DB-Rollen-/Kontaktemanipulation; feste Wartezeiten. |
| 73 | `tests/e2e/auth.spec.ts` | Sechs Fälle für Login, Lockout, Hashprivacy, Cleanup, Parallelität und ungültige Rolle. | bekannte Fallbackcredentials; globale LoginAttempt-Löschung/-Alterung. |
| 74 | `tests/e2e/chaos.spec.ts` | Zwei Integritätstests für Double-Submit und Tag-only-Input. | Begrenzte Chaosabdeckung; globaler RateLimit-Cleanup. |
| 75 | `tests/e2e/contact.spec.ts` | Vier Fälle für Retentiontext, Persistenz, Honeypot und manipuliertes Telefon. | Next-Action-Payloadinterception versionsfragil; mobil ausgeschlossen. |
| 76 | `tests/e2e/helpers/db-cleanup.ts` | 23 benannte Prismahelper für Setup, Cleanup, Snapshot, direkte Reads und Disconnect. | Global destruktive LoginAttempt-/RateLimit-/Auditoperationen; Pool nicht explizit beendet. |
| 77 | `tests/e2e/role-visibility.spec.ts` | Drei Fälle für Admin-/Staff-Tabs und Uppercase-Sessionnormalisierung. | Überschreibt ambient Admin und stellt ihn nicht wieder her; UI-Test ersetzt kein Action-Gate. |
| 78 | `tests/e2e/security.spec.ts` | Elf Fälle für Guards, Robots, Header, CSP, Lockout und Clientfehlerroute. | Dev-IP unterscheidet sich von Produktion; globale Sicherheitszustandslöschung. |
| 79 | `tsconfig.json` | Strict/noEmit, Bundlerauflösung, Next-Plugin, `@/*`-Alias und Include/Exclude. | `skipLibCheck`; erwartet fehlende Next-/Prisma-Typoutputs; kein eigenes Typecheck-Skript. |
| 80 | `docs/TECHNISCHE_PROJEKTDOKUMENTATION.md` | Diese evidenzbasierte Gesamt-, Datei-, Funktions-, Risiko- und Coverage-Referenz. | Abgeleitete Momentaufnahme; bei Codeänderung erneut inventarisieren, AST zählen und genau einen Vollständigkeitsabgleich durchführen. |

## 30. Vollständige Funktions- und Symbolreferenz

Legende:

- **ID** ist eine stabile, innerhalb dieser Momentaufnahme eindeutige Referenz.
- **Datei:Zeile** nennt den relativen Quellpfad und die 1-basierte Startzeile des Funktionskörpers bzw. Callbacks.
- **Typ / Name** unterscheidet Funktion, Komponente, Handler, Hook-/Promise-/Array-Callback, Objektmethode und Konstruktor.
- **Sichtbarkeit + Signatur** dokumentiert Exportstatus, lokalen/inline Scope und die statisch erkennbare Signatur.
- **Verantwortung / Ablauf** beschreibt den direkt implementierten Kontroll- und Datenfluss.
- **Registrierung / Aufrufer + Abhängigkeiten** kennzeichnet Beziehungen ausdrücklich als **Framework-registriert** oder **statisch**; dynamische Runtime-Aufrufer sind nur aufgeführt, wenn sie im Code eindeutig registriert sind.
- **Effekte / Async / Security** nennt Zustands-, Netzwerk-, Datenbank-, Logging- oder Navigationswirkungen sowie relevante Sicherheitsgrenzen.
- **Status / Runtime / Test / Risiko** verwendet **Implemented** ausschließlich für im Quelltext vorhandene Implementierung. Da in dieser Dokumentationsrunde kein Runtime- oder Testlauf ausgeführt wurde, bleibt der Laufstatus **Unknown**; vorhandene Tests werden nur als statische Zuordnung genannt.

| ID | Datei:Zeile | Typ / Name | Sichtbarkeit + Signatur | Verantwortung / Ablauf | Registrierung / Aufrufer + Abhängigkeiten | Effekte / Async / Security | Status / Runtime / Test / Risiko |
|---|---|---|---|---|---|---|---|
| SRC-001 | `src/middleware.ts:23` | Middleware `middleware` | Export; `middleware(request: NextRequest)` | Erzeugt Nonce/CSP, kopiert Request-Header und setzt CSP auf die Response. | Framework-registriert durch Next-Middleware; `NextResponse`, Web Crypto; Matcher `:58`. | Header-Mutation; synchron; zentrale CSP, Auth-Guard bewusst nicht hier. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch `security.spec.ts`; Risiko: mittel. |
| SRC-002 | `src/app/admin/(protected)/dashboard-client.tsx:25` | Komponente `AdminDashboardClient` | Export; `AdminDashboardClient(Props)` | Verwaltet Tabs, Request-Seite, History, Polling und rollenabhängige UI. | Statisch durch `AdminDashboardPage`; `RequestsTab`, `UsersTab`, `LogsTab`, Router, NextAuth. | Client-State und Navigation; asynchrone Kinder; Server-Actions bleiben autoritativ. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard/Role-E2E; Risiko: mittel. |
| SRC-003 | `src/app/admin/(protected)/dashboard-client.tsx:41` | Effect `syncRequests` | Inline; `() => void` | Synchronisiert Server-Props und setzt Pagination zurück. | Framework-registriert durch `useEffect` in SRC-002; Abhängigkeit `requests`. | Vier State-Updates; synchron; stellt Server-Wahrheit wieder her. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch `admin-logic.spec.ts`; Risiko: niedrig. |
| SRC-004 | `src/app/admin/(protected)/dashboard-client.tsx:48` | Effect `enforceVisibleTab` | Inline; `() => void` | Springt bei verlorenem Adminstatus auf Requests zurück. | Framework-registriert durch `useEffect`; `activeTab`, `isAdmin`. | State-Update; synchron; Defense-in-depth bei Rollenverlust. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role-Loss-E2E; Risiko: niedrig. |
| SRC-005 | `src/app/admin/(protected)/dashboard-client.tsx:56` | Effect `requestPolling` | Inline; `() => cleanup` | Registriert sichtbarkeitsabhängiges 30-Sekunden-Polling. | Framework-registriert durch `useEffect`; `setInterval`, Router, History-Länge. | Timer-Registrierung; asynchron ausgelöst; keine eigene Autorisierung. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-006 | `src/app/admin/(protected)/dashboard-client.tsx:57` | Timer-Callback `pollRefresh` | Inline; `() => void` | Refresht nur bei sichtbarem Dokument und erster Request-Seite. | Statisch durch `setInterval` in SRC-005; `document`, `router.refresh`. | RSC-Refresh/Netzwerk; zeitgesteuert; Session wird serverseitig neu geprüft. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role-Loss-E2E; Risiko: niedrig. |
| SRC-007 | `src/app/admin/(protected)/dashboard-client.tsx:63` | Cleanup `clearPolling` | Inline; `() => void` | Entfernt das Polling-Intervall. | Framework-registriert als Cleanup-Rückgabe von SRC-005; `clearInterval`. | Timer-Cleanup; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-008 | `src/app/admin/(protected)/dashboard-client.tsx:66` | Filter `countUnread` | Inline; `(request) => boolean` | Ermittelt ungelesene Requests der aktuellen Seite. | Statisch durch `requestItems.filter` im Render von SRC-002. | Seiteneffektfrei; synchron; Zähler ist seitenlokal. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Statistik-E2E; Risiko: niedrig. |
| SRC-009 | `src/app/admin/(protected)/dashboard-client.tsx:68` | Handler `handleLoadOlderRequests` | Lokal; `async () => Promise<void>` | Lädt Cursor-Seite, speichert History und behandelt Leer-/Fehlerzustand. | Statisch als `RequestsTab`-Prop; `getContactRequests`, State-Setter. | Server-Action und State; async; Action nutzt `requireAuth`. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Pagination-E2E; Risiko: mittel. |
| SRC-010 | `src/app/admin/(protected)/dashboard-client.tsx:85` | State-Updater `appendPageHistory` | Inline; `(current) => ContactRequest[][]` | Hängt die aktuelle Request-Seite an die History. | Framework-registriert durch `setRequestPageHistory` in SRC-009. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Pagination-E2E; Risiko: niedrig. |
| SRC-011 | `src/app/admin/(protected)/dashboard-client.tsx:95` | Handler `handleLoadNewerRequests` | Lokal; `() => void` | Stellt die zuletzt gecachte neuere Seite wieder her. | Statisch als `RequestsTab`-Prop; History-/Request-State. | State-Updates; synchron; Cache kann kurz stale sein. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Pagination-E2E; Risiko: niedrig. |
| SRC-012 | `src/app/admin/(protected)/dashboard-client.tsx:106` | State-Updater `popPageHistory` | Inline; `(current) => ContactRequest[][]` | Entfernt die wiederhergestellte Seite aus der History. | Framework-registriert durch `setRequestPageHistory` in SRC-011. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-013 | `src/app/admin/(protected)/dashboard-client.tsx:126` | Click-Callback `logout` | Inline; `() => Promise/void` | Meldet den Benutzer ab und navigiert zum Login. | Framework-registriert als Button-`onClick`; NextAuth `signOut`. | Session und Navigation; async intern; beendet authentifizierte Sitzung. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-014 | `src/app/admin/(protected)/dashboard-client.tsx:133` | Click-Callback `showRequests` | Inline; `() => void` | Aktiviert den Requests-Tab. | Framework-registriert als `TabButton.onClick`; `setActiveTab`. | State-Update; synchron; für beide Rollen sichtbar. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: niedrig. |
| SRC-015 | `src/app/admin/(protected)/dashboard-client.tsx:144` | Click-Callback `showUsers` | Inline; `() => void` | Aktiviert den Benutzer-Tab. | Framework-registriert unter `isAdmin`; `setActiveTab`. | State-Update; synchron; UI-Gate plus Server-Gate. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role-E2E; Risiko: niedrig. |
| SRC-016 | `src/app/admin/(protected)/dashboard-client.tsx:148` | Click-Callback `showLogs` | Inline; `() => void` | Aktiviert den Audit-Log-Tab. | Framework-registriert unter `isAdmin`; `setActiveTab`. | State-Update; synchron; UI- und Server-Gate. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: niedrig. |
| SRC-017 | `src/app/admin/(protected)/dashboard-client.tsx:178` | Komponente `TabButton` | Lokal; `TabButton({active,onClick,children})` | Rendert einen einheitlichen Tab-Schalter. | Statisch nur durch SRC-002; natives Button-Event. | Delegierter Click; synchron; keine eigene Autorisierung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch indirekt; Risiko: niedrig. |
| SRC-018 | `src/app/admin/(protected)/error.tsx:9` | Komponente `AdminError` | Default-Export; `AdminError({error,reset})` | Rendert Dashboard-Fehler, Digest, Retry und Telefon-Fallback. | Framework-registriert als Next Error Boundary; Router, Content, Button. | Client-State; synchroner Render; exponiert nur Digest. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-019 | `src/app/admin/(protected)/error.tsx:21` | Handler `handleRetry` | Lokal; `() => void` | Setzt Retry-Status, erhöht Zähler, refresht und resetet Boundary. | Framework-registriert als Retry-Button-Handler; Router und `reset`. | State/Navigation; synchron; `retrying` wird nicht explizit zurückgesetzt. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-020 | `src/app/admin/(protected)/error.tsx:23` | State-Updater `incrementRetry` | Inline; `(c) => number` | Erhöht den Retry-Zähler. | Framework-registriert durch `setRetryCount` in SRC-019. | Client-State; synchron; kann bei Remount verloren gehen. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-021 | `src/app/admin/(protected)/layout.tsx:9` | Layout `ProtectedAdminLayout` | Default-Export; `async ({children}) => JSX` | Prüft Session und redirectet unauthentifizierte Aufrufe. | Framework-registriert als Next Route-Group-Layout; `getCachedSession`, `redirect`. | Session-DB-Lookup/Redirect; async; primärer Route-Guard. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Security/Admin-E2E; Risiko: hoch. |
| SRC-022 | `src/app/admin/(protected)/loading.tsx:3` | Komponente `AdminLoading` | Default-Export; `AdminLoading()` | Rendert Dashboard-Skeleton. | Framework-registriert als Next `loading.tsx`; Lucide. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-023 | `src/app/admin/(protected)/loading.tsx:25` | Map-Callback `statSkeleton` | Inline; `(i) => JSX` | Erzeugt drei Statistik-Skeletons. | Statisch durch Array-`map` in SRC-022. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-024 | `src/app/admin/(protected)/loading.tsx:44` | Map-Callback `rowSkeleton` | Inline; `(i) => JSX` | Erzeugt vier Zeilen-Skeletons. | Statisch durch Array-`map` in SRC-022. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-025 | `src/app/admin/(protected)/page.tsx:13` | Seite `AdminDashboardPage` | Default-Export; `async () => Promise<JSX/null>` | Revalidiert Session, lädt drei Datenquellen parallel und rendert Dashboard. | Framework-registriert als Next `/admin`; Session, Actions, Logger, SRC-002. | DB-Lesen/Logging; async; rollenabhängige Queries, Teilfehler werden leer dargestellt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin/Role-E2E; Risiko: mittel. |
| SRC-026 | `src/app/admin/(protected)/page.tsx:33` | Iterations-Callback `logRejectedQuery` | Inline; `(result,index) => void` | Loggt abgelehnte Teilqueries mit Index. | Statisch durch `settled.forEach` in SRC-025; Pino. | Logging; synchron; kein Query-Payload. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-027 | `src/app/admin/layout.tsx:6` | Layout `AdminLayout` | Default-Export; `AdminLayout({children})` | Transparenter Wrapper aller Admin-Routen. | Framework-registriert als Next `/admin`-Layout. | Seiteneffektfrei; synchron; Guard liegt in geschützter Route-Group. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-028 | `src/app/admin/login/page.tsx:10` | Seite `AdminLoginPage` | Default-Export; `AdminLoginPage()` | Verwaltet Credentials, Sichtbarkeit, Lade-/Fehlerzustand und Login-UI. | Framework-registriert als Next `/admin/login`; NextAuth, Button, Input, Content. | Client-State; async indirekt; öffentlicher Login-Einstieg. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth/Security-E2E; Risiko: mittel. |
| SRC-029 | `src/app/admin/login/page.tsx:18` | Handler `handleSubmit` | Lokal; `async (e: React.FormEvent) => Promise<void>` | Ruft Credentials-Login auf, mappt Fehlercodes und navigiert per Full Page. | Framework-registriert als Formular-`onSubmit`; `signIn`, JSON, `window.location`. | Netzwerk/State/Navigation; async; generische Fehler, kein Catch um `signIn`. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth-E2E; Risiko: mittel. |
| SRC-030 | `src/app/admin/login/page.tsx:89` | Change-Callback `setEmail` | Inline; `(e) => void` | Übernimmt E-Mail in den State. | Framework-registriert als Input-`onChange`. | Credential-State; synchron; wird nicht geloggt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth-E2E; Risiko: niedrig. |
| SRC-031 | `src/app/admin/login/page.tsx:105` | Change-Callback `setPassword` | Inline; `(e) => void` | Übernimmt Passwort in den State. | Framework-registriert als Input-`onChange`. | Sensibler Client-State; synchron; nur im Browser-Memory. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth-E2E; Risiko: niedrig. |
| SRC-032 | `src/app/admin/login/page.tsx:111` | Click-Callback `togglePassword` | Inline; `() => void` | Schaltet die Passwortdarstellung. | Framework-registriert als Icon-Button-`onClick`. | State/UI; synchron; bewusste Klartextanzeige, schwacher Accessibility-Name. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-033 | `src/app/api/log/client-error/route.ts:16` | Funktion `normalizeLoggedPathname` | Lokal; `(pathname?: string) => string` | Reduziert Pfade auf Whitelist oder sichere Kategorien. | Statisch durch SRC-034; `SAFE_LOGGED_PATHNAMES`. | Seiteneffektfrei; synchron; verhindert freie Pfade in Logs. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Security-E2E; Risiko: niedrig. |
| SRC-034 | `src/app/api/log/client-error/route.ts:36` | Route-Handler `POST` | Export; `async (request: Request) => Promise<Response>` | Trusted-IP, Rate-Limit, JSON, Schema, kategorisiertes Warn-Log und 204. | Framework-registriert als Next API; IP, Rate-Limit, Schema, Logger. | DB-Budget/Logging; async; fail-closed IP, Digest bleibt freier Clientstring. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch `security.spec.ts`; Risiko: hoch. |
| SRC-035 | `src/app/datenschutz/page.tsx:9` | Seite `DatenschutzPage` | Default-Export; `DatenschutzPage()` | Rendert Datenschutzinformationen aus Content und statischem Text. | Framework-registriert als Next `/datenschutz`; `Link`, `publicContent`. | Seiteneffektfrei; synchron; Datenschutzdarstellung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch `contact.spec.ts`; Risiko: niedrig. |
| SRC-036 | `src/app/global-error.tsx:5` | Komponente `GlobalError` | Default-Export; `GlobalError({error,reset})` | Rendert globalen Fehlerfallback und registriert Fehler-Ingestion. | Framework-registriert als Next Global Error Boundary; React Effect. | Client-Logging indirekt; synchroner Render; nur Digest/Pfad vorgesehen. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Security-E2E; Risiko: mittel. |
| SRC-037 | `src/app/global-error.tsx:12` | Effect `reportGlobalError` | Inline; `() => void` | POSTet Digest und aktuellen Pfad mit `keepalive`. | Framework-registriert durch `useEffect`; `fetch`. | Netzwerk; async fire-and-forget; keine Stack-/Message-Übertragung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Security-E2E; Risiko: mittel. |
| SRC-038 | `src/app/global-error.tsx:23` | Rejection-Callback `ignoreReportFailure` | Inline; `() => void` | Unterdrückt Fehler der Telemetrie-Anfrage. | Statisch als Promise-`catch` von SRC-037. | Fehler wird verworfen; async Callback; verhindert Fehlerkaskade. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-039 | `src/app/global-error.tsx:35` | Click-Callback `resetGlobalError` | Inline; `() => void` | Ruft den Error-Boundary-Reset auf. | Framework-registriert als Retry-Button-`onClick`; `reset`. | React-Reset; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-040 | `src/app/impressum/page.tsx:9` | Seite `ImpressumPage` | Default-Export; `ImpressumPage()` | Rendert Impressum und Praxisdaten. | Framework-registriert als Next `/impressum`; `Link`, `publicContent`. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-041 | `src/app/layout.tsx:28` | Layout `RootLayout` | Default-Export; `async ({children}) => Promise<JSX>` | Erzwingt dynamisches Rendering und setzt Sprache/Font-Wrapper. | Framework-registriert als Next Root Layout; `headers`, Inter, CSS. | Headerzugriff; async; ermöglicht per-Request-CSP-Nonce. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Security-E2E; Risiko: mittel. |
| SRC-042 | `src/app/page.tsx:9` | Seite `HomePage` | Default-Export; `HomePage()` | Komponiert die komplette öffentliche Startseite. | Framework-registriert als Next `/`; sieben lokale Komponenten. | Effekte durch Kinder; synchron; Kontakt-Action indirekt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact/Chaos-E2E; Risiko: niedrig. |
| SRC-043 | `src/app/robots.ts:3` | Metadata-Handler `robots` | Default-Export; `robots(): MetadataRoute.Robots` | Liefert Robots-Regeln für Startseite, Admin und API. | Framework-registriert als Next `/robots.txt`; Metadata API. | HTTP-Metadaten; synchron; nur advisory, kein Zugriffsschutz. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch `security.spec.ts`; Risiko: niedrig. |
| SRC-044 | `src/components/about.tsx:34` | Komponente `About` | Export; `About()` | Rendert den animierten Über-uns-Bereich. | Statisch durch `HomePage`; React Ref, Framer Motion. | Viewport-Beobachtung; synchroner Render. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-045 | `src/components/about.tsx:66` | Map-Callback `renderFeature` | Inline; `(feature,index) => JSX` | Rendert vier animierte Feature-Karten. | Statisch durch `features.map` in SRC-044. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-046 | `src/components/admin/logs-tab.tsx:10` | Komponente `LogsTab` | Export; `LogsTab({auditLogs}: Props)` | Rendert Leerzustand oder die letzten Audit-Einträge. | Statisch durch SRC-002; `ACTION_LABELS`, SRC-048. | Synchron; erhält Admin-Daten als Prop. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: niedrig. |
| SRC-047 | `src/components/admin/logs-tab.tsx:27` | Map-Callback `renderAuditLog` | Inline; `(log) => JSX` | Rendert Badge, Benutzer, Details und lokalisiertes Datum. | Statisch durch `auditLogs.map` in SRC-046. | Synchron; DB-Inhalt wird React-escaped. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: niedrig. |
| SRC-048 | `src/components/admin/logs-tab.tsx:51` | Funktion `actionBadgeClass` | Lokal; `(action: string) => string` | Ordnet Audit-Aktionen Badge-Farben zu. | Statisch durch SRC-047. | Seiteneffektfrei; synchron; unbekannte Aktion fällt neutral zurück. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-049 | `src/components/admin/requests-tab.tsx:45` | Funktion `applyRequestMutation` | Lokal; `(state,mutation) => ContactRequest[]` | Wendet bestätigte Delete-/Read-Mutation auf Client-State an. | Statisch durch SRC-076; nutzt SRC-050/SRC-051. | Immutable; synchron; erst nach Servererfolg. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Mutation-E2E; Risiko: niedrig. |
| SRC-050 | `src/components/admin/requests-tab.tsx:47` | Filter `removeDeletedRequests` | Inline; `(request) => boolean` | Entfernt erfolgreich gelöschte IDs. | Statisch durch `state.filter` in SRC-049. | Seiteneffektfrei; synchron; Servererfolg vorausgesetzt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: niedrig. |
| SRC-051 | `src/components/admin/requests-tab.tsx:50` | Map `updateReadState` | Inline; `(request) => ContactRequest` | Setzt Read-Flag ausgewählter Requests. | Statisch durch `state.map` in SRC-049. | Seiteneffektfrei; synchron; Servererfolg vorausgesetzt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Read/Bulk-E2E; Risiko: niedrig. |
| SRC-052 | `src/components/admin/requests-tab.tsx:57` | Funktion `fallbackErrorMessage` | Lokal; `(action: RequestMutationAction) => string` | Liefert aktionsbezogene Fallback-Fehlermeldung. | Statisch durch SRC-074. | Seiteneffektfrei; synchron; keine internen Details. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: niedrig. |
| SRC-053 | `src/components/admin/requests-tab.tsx:63` | Funktion `haveMatchingIds` | Lokal; `(currentIds,targetIds) => boolean` | Vergleicht zwei ID-Mengen reihenfolgeunabhängig. | Statisch durch SRC-066; nutzt SRC-054. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete/Bulk-E2E; Risiko: niedrig. |
| SRC-054 | `src/components/admin/requests-tab.tsx:64` | Every-Callback `targetContainsId` | Inline; `(id) => boolean` | Prüft Mitgliedschaft jeder aktuellen ID. | Statisch durch `currentIds.every` in SRC-053. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-055 | `src/components/admin/requests-tab.tsx:67` | Komponente `RequestsTab` | Export; `RequestsTab(Props)` | Orchestriert Statistiken, Auswahl, Mutation, Pagination und Zeilen. | Statisch durch SRC-002; Router, `mutateContactRequests`, lokale Helfer. | Umfangreicher Client-State; async indirekt; Server-Action gegatet. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard/Admin-Logic-E2E; Risiko: mittel. |
| SRC-056 | `src/components/admin/requests-tab.tsx:85` | Effect `reconcileVisibleRequests` | Inline; `() => void` | Bereinigt Auswahl und Delete-Bestätigung bei geänderter Liste. | Framework-registriert durch `useEffect`; Abhängigkeit `requests`. | State-Updates; synchron; verhindert Aktionen auf stale IDs. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: niedrig. |
| SRC-057 | `src/components/admin/requests-tab.tsx:86` | Map `collectVisibleIds` | Inline; `(request) => string` | Erstellt ein Set sichtbarer IDs. | Statisch durch `requests.map` in SRC-056. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-058 | `src/components/admin/requests-tab.tsx:88` | State-Updater `reconcileSelection` | Inline; `(prev) => string[]` | Filtert Auswahl auf sichtbare IDs. | Framework-registriert durch `setSelectedIds`; nutzt SRC-059. | Client-State; synchron; stale-ID-Schutz. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: niedrig. |
| SRC-059 | `src/components/admin/requests-tab.tsx:88` | Filter `selectedIdIsVisible` | Inline; `(id) => boolean` | Behält nur sichtbare Auswahl-IDs. | Statisch durch `prev.filter` in SRC-058. | Seiteneffektfrei; synchron; stale-ID-Schutz. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-060 | `src/components/admin/requests-tab.tsx:89` | State-Updater `reconcileConfirmation` | Inline; `(prev) => DeleteConfirmation/null` | Bereinigt oder verwirft Delete-Bestätigung. | Framework-registriert durch `setDeleteConfirmation`; nutzt SRC-061. | Client-State; synchron; stale-ID-Schutz. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: niedrig. |
| SRC-061 | `src/components/admin/requests-tab.tsx:94` | Filter `confirmedIdIsVisible` | Inline; `(id) => boolean` | Filtert bestätigte IDs auf die sichtbare Liste. | Statisch durch `prev.ids.filter` in SRC-060. | Seiteneffektfrei; synchron; stale-ID-Schutz. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-062 | `src/components/admin/requests-tab.tsx:101` | Filter `countPageUnread` | Inline; `(request) => boolean` | Zählt ungelesene Requests der aktuellen Seite. | Statisch durch `requests.filter` im Render von SRC-055. | Seiteneffektfrei; synchron; Wert ist seitenlokal. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Statistik-E2E; Risiko: mittel. |
| SRC-063 | `src/components/admin/requests-tab.tsx:104` | Map `pageVisibleIds` | Inline; `(request) => string` | Erstellt die ID-Liste der aktuellen Seite. | Statisch durch `requests.map` in SRC-055. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-064 | `src/components/admin/requests-tab.tsx:106` | Every `allVisibleSelected` | Inline; `(id) => boolean` | Berechnet die Vollauswahl. | Statisch durch `visibleIds.every` in SRC-055. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-065 | `src/components/admin/requests-tab.tsx:107` | Some `someVisibleSelected` | Inline; `(id) => boolean` | Berechnet Teil-/Indeterminate-Auswahl. | Statisch durch `visibleIds.some` in SRC-055. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-066 | `src/components/admin/requests-tab.tsx:112` | Funktion `getDeletePhase` | Lokal; `(source,ids) => DeletePhase` | Leitet idle/confirming/pending aus Mutation und Confirmation ab. | Statisch durch SRC-055 und Row-Props; SRC-053. | Seiteneffektfrei; synchron; verhindert falsche Bestätigungsanzeige. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: niedrig. |
| SRC-067 | `src/components/admin/requests-tab.tsx:139` | Handler `handleSelectAll` | Lokal; `() => void` | Verwirft Fehler/Confirmation und toggelt sichtbare IDs. | Framework-registriert als Master-Checkbox-Handler. | Client-State; synchron; Auswahl nur sichtbarer IDs. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-068 | `src/components/admin/requests-tab.tsx:142` | State-Updater `toggleAllVisible` | Inline; `(current) => string[]` | Entscheidet zwischen leerer und vollständiger Auswahl. | Framework-registriert durch `setSelectedIds`; nutzt SRC-069. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-069 | `src/components/admin/requests-tab.tsx:143` | Every `currentContainsVisible` | Inline; `(id) => boolean` | Prüft, ob aktuell alle sichtbaren IDs gewählt sind. | Statisch durch `visibleIds.every` in SRC-068. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-070 | `src/components/admin/requests-tab.tsx:148` | Handler `handleToggleSelection` | Lokal; `(id: string) => void` | Toggelt Einzel-ID und verwirft Fehler/Confirmation. | Statisch durch Row-Callback SRC-089. | Client-State; synchron; ID stammt aus gerendertem Request. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-071 | `src/components/admin/requests-tab.tsx:151` | State-Updater `toggleSelectedId` | Inline; `(current) => string[]` | Fügt ID hinzu oder entfernt sie. | Framework-registriert durch `setSelectedIds`; nutzt SRC-072. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-072 | `src/components/admin/requests-tab.tsx:153` | Filter `removeSelectedId` | Inline; `(selectedId) => boolean` | Entfernt die getoggelte ID. | Statisch durch `current.filter` in SRC-071. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-073 | `src/components/admin/requests-tab.tsx:158` | Funktion `getPendingAction` | Lokal; `(id: string) => RequestMutationAction/null` | Liefert die laufende Aktion pro Request. | Statisch durch Row-Props im Request-Map. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Pending-E2E; Risiko: niedrig. |
| SRC-074 | `src/components/admin/requests-tab.tsx:166` | Handler `handleMutation` | Lokal; `(mutation,source) => void` | Setzt Pending-State, startet Action, aktualisiert bei Erfolg und refresht bei Fehler. | Statisch durch Bulk-/Einzelhandler; `mutateContactRequests`, Router, SRC-052/SRC-075. | State/Server-Action/Refresh; async via Transition; Server validiert. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch umfangreiche Mutation-E2E; Risiko: mittel. |
| SRC-075 | `src/components/admin/requests-tab.tsx:174` | Transition `executeRequestMutation` | Inline; `async () => Promise<void>` | Führt Action aus, koppelt UI-Update an Erfolg und räumt Pending-State auf. | Framework-registriert durch `startRequestTransition` in SRC-074. | Netzwerk/State; async; keine optimistische Vorwegnahme. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Completion-coupled-E2E; Risiko: mittel. |
| SRC-076 | `src/components/admin/requests-tab.tsx:178` | State-Updater `commitRequestMutation` | Inline; `(current) => ContactRequest[]` | Wendet bestätigte Mutation über SRC-049 an. | Framework-registriert durch `onRequestsChange` in SRC-075. | Parent-State; synchron; nur nach Servererfolg. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Mutation-E2E; Risiko: niedrig. |
| SRC-077 | `src/components/admin/requests-tab.tsx:183` | State-Updater `removeDeletedSelection` | Inline; `(prev) => string[]` | Entfernt nach Einzeldelete gelöschte ID aus der Auswahl. | Framework-registriert durch `setSelectedIds`; nutzt SRC-078. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: niedrig. |
| SRC-078 | `src/components/admin/requests-tab.tsx:183` | Filter `selectionNotDeleted` | Inline; `(id) => boolean` | Behält nicht gelöschte IDs. | Statisch durch `prev.filter` in SRC-077. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-079 | `src/components/admin/requests-tab.tsx:200` | Handler `handleToggleRead` | Lokal; `(id: string) => void` | Findet Request und startet passende Read-/Unread-Mutation. | Statisch durch Row-Callback SRC-090; SRC-080/SRC-074. | Delegierte Action; synchron; blockiert bei Pending. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Read-E2E; Risiko: niedrig. |
| SRC-080 | `src/components/admin/requests-tab.tsx:201` | Find `findRequestById` | Inline; `(item) => boolean` | Sucht den Request für den aktuellen Read-Zustand. | Statisch durch `requests.find` in SRC-079. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-081 | `src/components/admin/requests-tab.tsx:212` | Handler `handleDelete` | Lokal; `(ids,source) => void` | Prüft lokalen Zustand und delegiert Delete-Mutation. | Statisch durch Bulk-/Row-Confirm-Callbacks; SRC-074. | Delegierte Action; synchron; blockiert leer/pending. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: niedrig. |
| SRC-082 | `src/components/admin/requests-tab.tsx:220` | Handler `startDeleteConfirmation` | Lokal; `(ids,source) => void` | Öffnet Confirmation für einen ID-Snapshot. | Statisch durch Bulk-/Row-Delete-Buttons. | Client-State; synchron; explizite Destructive-Confirmation. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: niedrig. |
| SRC-083 | `src/components/admin/requests-tab.tsx:269` | Click `bulkMarkRead` | Inline; `() => void` | Startet Bulk-Read für die aktuelle Auswahl. | Framework-registriert als Bulk-Button; SRC-074. | Action indirekt; synchron; Server-Schema begrenzt IDs. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-084 | `src/components/admin/requests-tab.tsx:285` | Click `bulkMarkUnread` | Inline; `() => void` | Startet Bulk-Unread für die Auswahl. | Framework-registriert als Bulk-Button; SRC-074. | Action indirekt; synchron; Servervalidierung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-085 | `src/components/admin/requests-tab.tsx:297` | Click `confirmBulkDelete` | Inline; `() => void` | Bestätigt Bulk-Delete. | Framework-registriert als Destructive-Button; SRC-081. | Action indirekt; synchron; zweistufige Bestätigung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-Delete-E2E; Risiko: mittel. |
| SRC-086 | `src/components/admin/requests-tab.tsx:317` | Click `cancelBulkDelete` | Inline; `() => void` | Schließt die Bulk-Confirmation. | Framework-registriert als Cancel-Button; State-Setter. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-087 | `src/components/admin/requests-tab.tsx:333` | Click `requestBulkDelete` | Inline; `() => void` | Öffnet Bulk-Confirmation mit ausgewählten IDs. | Framework-registriert als Bulk-Delete-Button; SRC-082. | Client-State; synchron; Confirmation vor Mutation. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-Delete-E2E; Risiko: niedrig. |
| SRC-088 | `src/components/admin/requests-tab.tsx:389` | Map `renderRequestRow` | Inline; `(request) => JSX` | Rendert RequestRow mit abgeleiteten Zuständen und Callbacks. | Statisch durch `requests.map` in SRC-055; SRC-095. | Synchron; PII/Text werden React-escaped. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: niedrig. |
| SRC-089 | `src/components/admin/requests-tab.tsx:398` | Row-Callback `toggleSelection` | Inline; `() => void` | Bindet Request-ID an SRC-070. | Framework-registriert als `RequestRow.onToggleSelection`. | State indirekt; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-090 | `src/components/admin/requests-tab.tsx:399` | Row-Callback `toggleRead` | Inline; `() => void` | Bindet Request-ID an SRC-079. | Framework-registriert als `RequestRow.onToggleRead`. | Action indirekt; synchron; Server-Gate. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Read-E2E; Risiko: niedrig. |
| SRC-091 | `src/components/admin/requests-tab.tsx:400` | Row-Callback `requestDelete` | Inline; `() => void` | Öffnet Einzeldelete-Confirmation. | Framework-registriert als `RequestRow.onRequestDelete`; SRC-082. | Client-State; synchron; Confirmation. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: niedrig. |
| SRC-092 | `src/components/admin/requests-tab.tsx:401` | Row-Callback `confirmDelete` | Inline; `() => void` | Bestätigt Einzeldelete. | Framework-registriert als `RequestRow.onConfirmDelete`; SRC-081. | Action indirekt; synchron; atomarer Serverdelete. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: mittel. |
| SRC-093 | `src/components/admin/requests-tab.tsx:402` | Row-Callback `cancelDelete` | Inline; `() => void` | Verwirft Delete-Confirmation. | Framework-registriert als `RequestRow.onCancelDelete`; State-Setter. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-094 | `src/components/admin/requests-tab.tsx:424` | Komponente `StatCard` | Lokal; `StatCard(props)` | Rendert Statistik-Karte und Test-ID. | Statisch dreimal durch SRC-055. | Seiteneffektfrei; synchron; Werte sind seitenlokal. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch `request-stat-*`; Risiko: niedrig. |
| SRC-095 | `src/components/admin/requests-tab.tsx:466` | Komponente `RequestRow` | Lokal; `RequestRow(RowProps)` | Rendert PII, Status und completion-coupled Einzelaktionen. | Statisch durch SRC-088; Button, SRC-096. | Delegierte Events; synchron; authentifizierte Daten, React-escaped. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: mittel. |
| SRC-096 | `src/components/admin/requests-tab.tsx:566` | Komponente `SelectionCheckbox` | Lokal; `SelectionCheckbox(props)` | Rendert Checkbox und verwaltet DOM-`indeterminate`. | Statisch durch SRC-055/SRC-095; React Ref/Effect. | DOM-Property/Event; synchron; keine Sicherheitsgrenze. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-097 | `src/components/admin/requests-tab.tsx:581` | Effect `setIndeterminate` | Inline; `() => void` | Synchronisiert die native Indeterminate-Eigenschaft. | Framework-registriert durch `useEffect` in SRC-096. | Direkte DOM-Mutation; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Bulk-E2E; Risiko: niedrig. |
| SRC-098 | `src/components/admin/users-tab.tsx:15` | Komponente `UsersTab` | Export; `UsersTab({users}: Props)` | Verwaltet Benutzerformular, optimistische Löschung und Rollenanzeige. | Statisch durch SRC-002; Router, `createUser`, `deleteUser`, UI. | State/Actions; async indirekt; UI nur Admin, Actions zusätzlich gegatet. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard/Admin-Logic-E2E; Risiko: mittel. |
| SRC-099 | `src/components/admin/users-tab.tsx:28` | Effect `scheduleSuccessReset` | Inline; `() => cleanup/void` | Registriert Timer zum Ausblenden der Erfolgsmeldung. | Framework-registriert durch `useEffect`; `userFormSuccess`. | Timer-Registrierung; asynchron ausgelöst. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-100 | `src/components/admin/users-tab.tsx:30` | Timer `clearSuccess` | Inline; `() => void` | Setzt Erfolgsmeldung nach vier Sekunden zurück. | Statisch durch `setTimeout` in SRC-099. | Client-State; zeitgesteuert async. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-101 | `src/components/admin/users-tab.tsx:31` | Cleanup `clearSuccessTimer` | Inline; `() => void` | Entfernt den Erfolgstimer. | Framework-registriert als Cleanup-Rückgabe von SRC-099. | Timer-Cleanup; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-102 | `src/components/admin/users-tab.tsx:36` | Optimistic-Reducer `deleteUserOptimistically` | Inline; `(state,userIdToDelete) => UserAccount[]` | Erzeugt optimistische Benutzerliste ohne Ziel. | Framework-registriert durch `useOptimistic`; nutzt SRC-103. | Optimistischer Client-State; synchron; Server entscheidet final. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: niedrig. |
| SRC-103 | `src/components/admin/users-tab.tsx:36` | Filter `userIsNotDeleted` | Inline; `(user) => boolean` | Entfernt Ziel-ID aus optimistischer Liste. | Statisch durch `state.filter` in SRC-102. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-104 | `src/components/admin/users-tab.tsx:39` | Handler `handleCreateUser` | Lokal; `(e: React.FormEvent) => void` | Resetet Meldungen und startet Create-Transition. | Framework-registriert als Formular-`onSubmit`; SRC-105. | Client-State; async indirekt; Admin-Action. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch User/Validation-E2E; Risiko: mittel. |
| SRC-105 | `src/components/admin/users-tab.tsx:43` | Transition `executeCreateUser` | Inline; `async () => Promise<void>` | Ruft Create-Action auf und aktualisiert Erfolgs-/Fehlerstate. | Framework-registriert durch `startCreateUserTransition`; `createUser`. | Netzwerk/State; async; Passwort an Server Action. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: mittel. |
| SRC-106 | `src/components/admin/users-tab.tsx:56` | Handler `handleDeleteUser` | Lokal; `(id: string) => void` | Schließt Confirmation und startet optimistischen Delete. | Framework-registriert durch Confirm-Button; SRC-107. | Client-State; async indirekt; Admin-Action. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch User/Delete-E2E; Risiko: mittel. |
| SRC-107 | `src/components/admin/users-tab.tsx:60` | Transition `executeDeleteUser` | Inline; `async () => Promise<void>` | Optimiert Liste, ruft Delete-Action und refresht bei Fehler. | Framework-registriert durch `startDeleteUserTransition`; `deleteUser`, Router. | Netzwerk/State/Refresh; async; Server schützt Admin/Self. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: mittel. |
| SRC-108 | `src/components/admin/users-tab.tsx:95` | Change `setNewUserName` | Inline; `(e) => void` | Übernimmt den Namen. | Framework-registriert als Name-Input-`onChange`. | PII-State; synchron; nicht geloggt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch User-E2E; Risiko: niedrig. |
| SRC-109 | `src/components/admin/users-tab.tsx:106` | Change `setNewUserEmail` | Inline; `(e) => void` | Übernimmt die E-Mail. | Framework-registriert als E-Mail-Input-`onChange`. | PII-State; synchron; nicht geloggt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Validation-E2E; Risiko: niedrig. |
| SRC-110 | `src/components/admin/users-tab.tsx:119` | Change `setNewUserPassword` | Inline; `(e) => void` | Übernimmt das neue Passwort. | Framework-registriert als Passwort-Input-`onChange`. | Sensibler Client-State; synchron; nur Browser-Memory. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Password-E2E; Risiko: niedrig. |
| SRC-111 | `src/components/admin/users-tab.tsx:125` | Click `toggleNewUserPassword` | Inline; `() => void` | Schaltet die Passwortanzeige. | Framework-registriert als Icon-Button-`onClick`. | State/UI; synchron; bewusste Klartextanzeige. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-112 | `src/components/admin/users-tab.tsx:150` | Map `renderUser` | Inline; `(user) => JSX` | Rendert Rolle, Identität und gegebenenfalls Delete-Controls. | Statisch durch `optimisticUsers.map`; SRC-116/SRC-117. | Synchron; Delete nur für `staff` sichtbar. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role/User-E2E; Risiko: niedrig. |
| SRC-113 | `src/components/admin/users-tab.tsx:167` | Click `confirmUserDelete` | Inline; `() => void` | Bindet Benutzer-ID an SRC-106. | Framework-registriert als Destructive Confirm-Button. | Action indirekt; synchron; Server schützt Zielrolle. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: mittel. |
| SRC-114 | `src/components/admin/users-tab.tsx:176` | Click `cancelUserDelete` | Inline; `() => void` | Schließt die Benutzer-Confirmation. | Framework-registriert als Cancel-Button. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-115 | `src/components/admin/users-tab.tsx:186` | Click `openUserDelete` | Inline; `() => void` | Öffnet Confirmation für die Benutzer-ID. | Framework-registriert als Remove-Button. | Client-State; synchron; nur Staff-Zeile. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch User-E2E; Risiko: niedrig. |
| SRC-116 | `src/components/admin/users-tab.tsx:202` | Funktion `roleLabel` | Lokal; `(role: UserAccountRole) => string` | Mappt Rolle auf deutschen Text, unknown bleibt neutral. | Statisch durch SRC-112. | Seiteneffektfrei; synchron; unknown wird nicht aufgewertet. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: niedrig. |
| SRC-117 | `src/components/admin/users-tab.tsx:213` | Funktion `roleBadgeClass` | Lokal; `(role: UserAccountRole) => string` | Wählt Badge-Farbe, Primary nur für Admin. | Statisch durch SRC-112. | Seiteneffektfrei; synchron; rein visuell. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-118 | `src/components/contact-form.tsx:55` | Funktion `normalizePhone` | Lokal; `(phone: string) => string` | Entfernt Nichtziffern und deutsche 49-/0049-/0-Präfixe. | Statisch durch SRC-124. | Seiteneffektfrei; synchron; Client-Normalisierung, Server validiert erneut. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: mittel bei nicht-deutschen Vorwahlen. |
| SRC-119 | `src/components/contact-form.tsx:73` | Komponente `ContactForm` | Export; `ContactForm()` | Verwaltet Formular, Animation, Validierungs-UI und Erfolg/Fehler. | Statisch durch `HomePage`; Actions, Content, Country Codes, UI. | Client-State; async indirekt; Honeypot/Consent/Servervalidierung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact/Chaos-E2E; Risiko: mittel. |
| SRC-120 | `src/components/contact-form.tsx:83` | Funktion `updateField` | Lokal generisch; `updateField<K>(key,value)` | Aktualisiert ein Formularfeld immutable. | Statisch durch alle Feld-Callbacks; SRC-121. | Client-State; synchron; keine Vertrauensgrenze. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-121 | `src/components/contact-form.tsx:84` | State-Updater `mergeFormField` | Inline; `(prev) => FormValues` | Kopiert State und überschreibt den dynamischen Schlüssel. | Framework-registriert durch `setValues` in SRC-120. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-122 | `src/components/contact-form.tsx:87` | Funktion `resetForm` | Lokal; `() => void` | Setzt Werte, Fehler und Status zurück. | Framework-registriert als Erfolgsbutton-Handler. | Client-State; synchron; löscht Formulardaten aus State. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-123 | `src/components/contact-form.tsx:93` | Handler `handleSubmit` | Lokal; `(event: FormEvent<HTMLFormElement>) => void` | Verhindert Default, extrahiert Werte und startet Transition. | Framework-registriert als Formular-`onSubmit`; SRC-124. | Client-State; async indirekt; Clientchecks nicht autoritativ. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact/Chaos-E2E; Risiko: mittel. |
| SRC-124 | `src/components/contact-form.tsx:115` | Transition `executeContactSubmit` | Inline; `async () => Promise<void>` | Normalisiert Telefon, ruft Action und setzt Success/Error. | Framework-registriert durch `startSubmitTransition`; `submitContactForm`, SRC-118. | Server-Action/State; async; Payload bleibt untrusted bis Serverprüfung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact/Chaos-E2E; Risiko: mittel. |
| SRC-125 | `src/components/contact-form.tsx:226` | Change `setHoneypot` | Inline; `(event) => void` | Übernimmt das versteckte Bot-Feld. | Framework-registriert als Honeypot-Input-`onChange`; SRC-120. | Client-State; synchron; Abuse-Signal. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Honeypot-E2E; Risiko: niedrig. |
| SRC-126 | `src/components/contact-form.tsx:239` | Change `setFirstName` | Inline; `(event) => void` | Übernimmt den Vornamen. | Framework-registriert als Input-`onChange`; SRC-120. | PII-State; synchron; Server sanitize/validate. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact/Chaos-E2E; Risiko: niedrig. |
| SRC-127 | `src/components/contact-form.tsx:253` | Change `setLastName` | Inline; `(event) => void` | Übernimmt den Nachnamen. | Framework-registriert als Input-`onChange`; SRC-120. | PII-State; synchron; Servervalidierung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-128 | `src/components/contact-form.tsx:269` | Change `setCountryCode` | Inline; `(event) => void` | Übernimmt die ausgewählte Vorwahl. | Framework-registriert als Select-`onChange`; SRC-120. | Client-State; synchron; Server-Enum. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-129 | `src/components/contact-form.tsx:272` | Map `renderCountryCode` | Inline; `(option) => JSX` | Rendert 45 Vorwahloptionen. | Statisch durch `EUROPEAN_COUNTRY_CODES.map`. | Seiteneffektfrei; synchron; statische Whitelist. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-130 | `src/components/contact-form.tsx:290` | Change `setPhoneDigits` | Inline; `(event) => void` | Entfernt Nichtziffern vor dem State-Update. | Framework-registriert als Telefoninput-`onChange`; SRC-120. | PII-State; synchron; Defense-in-depth. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Phone-Validation-E2E; Risiko: mittel mit SRC-118. |
| SRC-131 | `src/components/contact-form.tsx:306` | Change `setRequestType` | Inline; `(event) => void` | Übernimmt den Anliegen-Typ. | Framework-registriert als Select-`onChange`; SRC-120. | Client-State; synchron; Server-Whitelist. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-132 | `src/components/contact-form.tsx:312` | Map `renderRequestType` | Inline; `(option) => JSX` | Rendert Anliegenoptionen. | Statisch durch Content-Options-`map`. | Seiteneffektfrei; synchron; Schemawerte separat dupliziert. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-133 | `src/components/contact-form.tsx:328` | Map `renderReachability` | Inline; `(option) => JSX` | Berechnet Auswahl und rendert Radio-Karte. | Statisch durch Content-Options-`map`; `cn`. | Seiteneffektfrei; synchron; Server-Whitelist. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-134 | `src/components/contact-form.tsx:346` | Change `setReachability` | Inline; `(event) => void` | Übernimmt den Erreichbarkeitswert. | Framework-registriert als Radio-`onChange`; SRC-120. | Client-State; synchron; Server-Enum. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-135 | `src/components/contact-form.tsx:369` | Change `setDetails` | Inline; `(event) => void` | Übernimmt Freitext bis zum Client-Maximum. | Framework-registriert als Textarea-`onChange`; SRC-120. | PII/Freitext-State; synchron; Server sanitize/max 1900. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig, Fehlertext nennt 2000. |
| SRC-136 | `src/components/contact-form.tsx:403` | Map `renderBenefit` | Inline; `(benefit) => JSX` | Rendert Vertrauensmerkmale. | Statisch durch Content-Benefits-`map`. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-137 | `src/components/contact-form.tsx:420` | Change `setGdprConsent` | Inline; `(event) => void` | Übernimmt die Consent-Checkbox. | Framework-registriert als Checkbox-`onChange`; SRC-120. | Consent-State; synchron; Server erzwingt `true`. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-138 | `src/components/contact-form.tsx:441` | Komponente `FormField` | Lokal; `FormField(props)` | Rendert Label, Pflichtmarkierung, Suffix und Kind. | Statisch mehrfach durch SRC-119. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-139 | `src/components/contact-form.tsx:465` | Komponente `InfoCard` | Lokal; `InfoCard(props)` | Rendert eine Kontakt-Informationskarte. | Statisch zweimal durch SRC-119. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-140 | `src/components/cookie-banner.tsx:13` | Komponente `CookieBanner` | Export; `CookieBanner()` | Verwaltet rein informatives Banner ohne Persistenz. | Statisch durch `HomePage`; State, Motion. | Client-State; synchroner Render; keine Cookie-/Storage-Schreibwirkung. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-141 | `src/components/cookie-banner.tsx:16` | Effect `scheduleBanner` | Inline; `() => cleanup` | Plant das verzögerte Einblenden. | Framework-registriert durch einmaligen `useEffect`; SRC-142/SRC-143. | Timer-Registrierung; asynchron ausgelöst. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-142 | `src/components/cookie-banner.tsx:18` | Timer `showBanner` | Inline; `() => void` | Setzt das Banner nach 1,5 Sekunden sichtbar. | Statisch durch `setTimeout` in SRC-141. | Client-State; zeitgesteuert async. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-143 | `src/components/cookie-banner.tsx:19` | Cleanup `clearBannerTimer` | Inline; `() => void` | Entfernt den Banner-Timer. | Framework-registriert als Effect-Cleanup. | Timer-Cleanup; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-144 | `src/components/cookie-banner.tsx:22` | Handler `dismiss` | Lokal; `() => void` | Blendet das Banner für die aktuelle Mount-Lebensdauer aus. | Framework-registriert durch beide Banner-Buttons. | Client-State; synchron; keine Persistenz. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-145 | `src/components/footer.tsx:5` | Komponente `Footer` | Export; `Footer()` | Rendert Praxis-, Kontakt-, Rechts- und Copyrightdaten. | Statisch durch `HomePage`; Content, Link, Date. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-146 | `src/components/hero.tsx:14` | Komponente `Hero` | Export; `Hero()` | Rendert animierten Hero, CTAs und Praxisprofil. | Statisch durch `HomePage`; Content, Motion, Button. | Animation/Linknavigation; synchroner Render. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-147 | `src/components/hero.tsx:90` | Map `renderBadge` | Inline; `(badge) => JSX` | Rendert Vertrauens-Badges. | Statisch durch `badges.map` in SRC-146. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-148 | `src/components/navbar.tsx:10` | Komponente `Navbar` | Export; `Navbar()` | Rendert responsive Navigation mit Mobile-State. | Statisch durch `HomePage`; Content, Motion, Button. | Client-State; synchroner Render. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-149 | `src/components/navbar.tsx:50` | Map `renderDesktopLink` | Inline; `(link) => JSX` | Rendert Desktop-Navigationslinks. | Statisch durch Content-Links-`map`. | Linknavigation; synchron; statischer Content. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-150 | `src/components/navbar.tsx:77` | Click `toggleMobileMenu` | Inline; `() => void` | Öffnet oder schließt das Mobile-Menü. | Framework-registriert als Hamburger-Button-`onClick`. | Client-State; synchron; Label bleibt immer „öffnen“. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-151 | `src/components/navbar.tsx:96` | Map `renderMobileLink` | Inline; `(link) => JSX` | Rendert Mobile-Navigationslinks. | Statisch durch Content-Links-`map`. | Linknavigation; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-152 | `src/components/navbar.tsx:100` | Click `closeMenuOnLink` | Inline; `() => void` | Schließt das Menü nach einem Navigationslink. | Framework-registriert als Mobile-`Link.onClick`. | Client-State; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-153 | `src/components/navbar.tsx:115` | Click `closeMenuOnContact` | Inline; `() => void` | Schließt das Menü beim Kontakt-CTA. | Framework-registriert als Anchor-`onClick`. | State und Anchor-Navigation; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-154 | `src/components/schedule.tsx:22` | Komponente `Schedule` | Export; `Schedule()` | Rendert Öffnungszeiten, Telefon, Adresse und Barrierefreiheit. | Statisch durch `HomePage`; Content, Motion, Viewport Hook. | Viewport-Beobachtung; synchroner Render. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-155 | `src/components/schedule.tsx:67` | Map `renderHours` | Inline; `(item) => JSX` | Rendert die hartcodierten Wochentagszeiten. | Statisch durch `hours.map` in SRC-154. | Seiteneffektfrei; synchron; Content separat gepflegt. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-156 | `src/components/ui/button.tsx:44` | ForwardRef-Komponente `Button` | Lokal exportiert; `(props,ref) => JSX` | Wählt Slot/Button und kombiniert CVA-Klassen. | Statisch durch UI-Aufrufer; Radix Slot, `buttonVariants`, `cn`. | Delegierte DOM-Events; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch breit indirekt; Risiko: niedrig. |
| SRC-157 | `src/components/ui/input.tsx:8` | ForwardRef-Komponente `Input` | Lokal exportiert; `(props,ref) => JSX` | Rendert standardisiertes Input mit Klassen und Ref. | Statisch durch Login, Contact und Users; `cn`. | Delegierte Events; synchron; behandelt Credentials/PII ohne Logging. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch E2E indirekt; Risiko: niedrig. |
| SRC-158 | `src/components/ui/textarea.tsx:8` | ForwardRef-Komponente `Textarea` | Lokal exportiert; `(props,ref) => JSX` | Rendert standardisierte Textarea. | Statisch durch ContactForm; `cn`. | Delegierte Events; synchron; Freitext bleibt untrusted. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-159 | `src/lib/actions/auth-helpers.ts:5` | Gate `requireAuth` | Export; `async () => Promise<Session>` | Lädt gecachte Session und redirectet ohne gültigen Benutzer. | Statisch durch Contact-Read/Mutation und SRC-160; `getCachedSession`, `redirect`. | Session-DB-Lookup/Redirect; async; Server-Action-Gate. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Security/Admin-E2E; Risiko: hoch. |
| SRC-160 | `src/lib/actions/auth-helpers.ts:13` | Gate `requireAdmin` | Export; `async () => Promise<Session>` | Baut auf SRC-159 auf und redirectet Nicht-Admins. | Statisch durch User-/Log-Actions; `requireAuth`, `redirect`. | Redirect; async; Admin-Gate. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role/Admin-E2E; Risiko: hoch. |
| SRC-161 | `src/lib/actions/contact.ts:24` | Funktion `buildContactMessage` | Lokal; `(data: ContactFormData) => string` | Baut den persistierten Text nur aus validierten Feldern und Labels. | Statisch durch SRC-165; Content-Optionen, SRC-162/SRC-163. | Seiteneffektfrei; synchron; validierter/sanitisierter Input. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E; Risiko: niedrig. |
| SRC-162 | `src/lib/actions/contact.ts:26` | Find `findRequestTypeLabel` | Inline; `(option) => boolean` | Findet das Label zum validierten Anliegen. | Statisch durch Content-Options-`find` in SRC-161. | Seiteneffektfrei; synchron; Fallback „Sonstiges“. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-163 | `src/lib/actions/contact.ts:29` | Find `findReachabilityLabel` | Inline; `(option) => boolean` | Findet das optionale Erreichbarkeitslabel. | Statisch durch Content-Options-`find` in SRC-161. | Seiteneffektfrei; synchron; leeres Fallback. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-164 | `src/lib/actions/contact.ts:45` | Server Action `submitContactForm` | Export; `async (data: z.input<ContactSchema>) => Result` | Trusted-IP, Rate-Budget, Honeypot, Schema, Transaktion, Cleanup und Fehlerabbildung. | Framework-registriert als Server Action; statisch durch ContactForm; IP, Rate-Limit, Schema, Prisma, Logger. | DB/Log/After; async; öffentlich, fail-closed IP, strict Zod; Budget vor Validierung. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact/Chaos-E2E; Risiko: mittel. |
| SRC-165 | `src/lib/actions/contact.ts:65` | Transaktions-Callback `createContactRequest` | Inline; `async (tx) => Promise<void>` | Persistiert PII, servergebauten Text und Consent atomar. | Statisch durch `prisma.$transaction` in SRC-164; SRC-161. | DB-Mutation; async; nur geparste Daten. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Contact-E2E/DB; Risiko: hoch. |
| SRC-166 | `src/lib/actions/contact.ts:78` | After-Callback `cleanupRateLimitsAfterSubmit` | Inline; `async () => Promise<void>` | Startet globale Rate-Limit-Bereinigung nach erfolgreichem Submit. | Framework-registriert durch Next `after` in SRC-164; `cleanupExpiredRateLimits`. | Deferred DB-Cleanup; async; Response unabhängig. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-167 | `src/lib/actions/contact.ts:97` | Server Action `getContactRequests` | Export; `async (cursor?: string) => Promise<ContactRequest[]>` | Authentifiziert, validiert Cursor, liest maximal 50 und serialisiert Datum. | Framework-registriert als Server Action; statisch durch Admin-Seite/Pagination; SRC-159, Schema, Prisma. | DB-Lesen; async; Auth-Gate; vollständiger Modellspread. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Pagination-E2E; Risiko: mittel. |
| SRC-168 | `src/lib/actions/contact.ts:111` | Map `serializeContactRequest` | Inline; `(request) => object` | Wandelt `createdAt` in ISO und übernimmt übrige Spalten. | Statisch durch `requests.map` in SRC-167. | Seiteneffektfrei; synchron; überträgt auch nicht typisierte Modellfelder. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: mittel. |
| SRC-169 | `src/lib/actions/contact.ts:121` | Server Action `mutateContactRequests` | Export; `async (input) => Result` | Auth-Gate, strict Schema, atomare Read/Delete-Mutation, Audit und Revalidation. | Framework-registriert als Server Action; statisch durch RequestsTab; SRC-159, Prisma, Logger, Schema. | DB/Revalidation/Log; async; eindeutige maximal 50 IDs. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard/Admin-Logic-E2E; Risiko: hoch. |
| SRC-170 | `src/lib/actions/contact.ts:129` | Transaktions-Callback `mutateRequestsAtomically` | Inline; `async (tx) => Promise<void>` | DeleteMany plus Count-Guard/Audit oder UpdateMany plus Count-Guard. | Statisch durch `prisma.$transaction` in SRC-169; SRC-171. | Atomare DB-Mutationen; async; Rollback bei stale ID. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Atomic-Bulk-E2E; Risiko: hoch. |
| SRC-171 | `src/lib/actions/contact.ts:140` | Map `buildDeleteAuditRows` | Inline; `(id) => AuditData` | Erzeugt einen Audit-Eintrag je gelöschter Anfrage. | Statisch durch `tx.auditLog.createMany` in SRC-170. | Erzeugt Auditdaten; synchron; keine Kontaktinhalte, nur ID/Akteur. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Delete-E2E; Risiko: niedrig. |
| SRC-172 | `src/lib/actions/logs.ts:8` | Server Action `getAuditLogs` | Export; `async () => Promise<AuditLog[]>` | Admin-Gate, Retention-Registrierung und Read der neuesten 100 Logs. | Framework-registriert als Server Action; statisch durch Admin-Seite; SRC-160, Prisma, Logger. | DB-Lesen/After; async; Admin-only. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: mittel. |
| SRC-173 | `src/lib/actions/logs.ts:11` | After-Callback `scheduleAuditRetention` | Inline; `async () => Promise<void>` | Berechnet die Sechsmonatsgrenze und startet Cleanup. | Framework-registriert durch Next `after` in SRC-172; SRC-174. | Deferred DB; async; Datenschutz-Retention. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-174 | `src/lib/actions/logs.ts:16` | Transaktions-Callback `deleteExpiredAuditLogs` | Inline; `async (tx) => Promise<void>` | Löscht Audit-Logs älter als sechs Monate. | Statisch durch `prisma.$transaction` in SRC-173. | Irreversible DB-Löschung; async; Retention. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-175 | `src/lib/actions/logs.ts:21` | Rejection `logAuditCleanupFailure` | Inline; `(err) => void` | Loggt fehlgeschlagenes Retention-Cleanup. | Statisch als Promise-`catch` von SRC-174; Pino. | Logging; async Callback; keine Payload. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-176 | `src/lib/actions/logs.ts:29` | Map `serializeAuditLog` | Inline; `(log) => object` | Wandelt das Audit-Datum in ISO. | Statisch durch `logs.map` in SRC-172. | Seiteneffektfrei; synchron; Admin-Daten. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: niedrig. |
| SRC-177 | `src/lib/actions/users.ts:13` | Server Action `createUser` | Export; `async (data) => Result` | Admin-Gate, Zod, bcrypt, transaktionales Staff-/Audit-Create und Revalidation. | Framework-registriert als Server Action; statisch durch UsersTab; SRC-160, Schema, bcrypt, Prisma. | DB/Revalidation; async; Admin-only, Passwort-Hash; Schema nicht strict. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch User/Validation-E2E; Risiko: hoch. |
| SRC-178 | `src/lib/actions/users.ts:25` | Transaktions-Callback `createUserAndAudit` | Inline; `async (tx) => Promise<void>` | Erstellt Staff-Benutzer und Audit-Eintrag atomar. | Statisch durch `prisma.$transaction` in SRC-177. | DB-Mutationen; async; Hash statt Passwort. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard-E2E; Risiko: hoch. |
| SRC-179 | `src/lib/actions/users.ts:60` | Server Action `deleteUser` | Export; `async (id: string) => Result` | Admin-Gate, ID-Schema, Self-Guard, staff-only Delete, Statusmapping und Audit. | Framework-registriert als Server Action; statisch durch UsersTab; SRC-160, Role-Normalisierung, Prisma. | DB/Revalidation/Log; async; Self/Admin/unknown geschützt. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-E2E; Risiko: hoch. |
| SRC-180 | `src/lib/actions/users.ts:72` | Transaktions-Callback `deleteStaffAndAudit` | Inline; `async (tx) => Status` | Löscht Staff, unterscheidet missing/protected/invalid-role und auditiert Erfolg. | Statisch durch `prisma.$transaction` in SRC-179. | Atomare DB-Löschung/Audit; async; Rolle fail-closed. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role-Escalation-E2E; Risiko: hoch. |
| SRC-181 | `src/lib/actions/users.ts:134` | Server Action `getUsers` | Export; `async () => Promise<UserAccount[]>` | Admin-Gate, selektives User-Lesen und Rollen-Normalisierung. | Framework-registriert als Server Action; statisch durch Admin-Seite; SRC-160, Prisma, SRC-182. | DB-Lesen; async; Admin-only, kein Passwort-Select. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Dashboard/Role-E2E; Risiko: niedrig. |
| SRC-182 | `src/lib/actions/users.ts:142` | Map `serializeUser` | Inline; `(user) => UserAccount` | Normalisiert Rolle oder setzt `unknown`, serialisiert Datum. | Statisch durch `users.map` in SRC-181; `normalizeRole`. | Seiteneffektfrei; synchron; unbekannte Rolle wird nicht privilegiert. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-Logic-E2E; Risiko: niedrig. |
| SRC-183 | `src/lib/auth.ts:33` | Funktion `hashIdentifier` | Lokal; `(...parts: string[]) => string` | SHA-256-hasht Bucket-Kontext mit Nullseparator. | Statisch durch SRC-187; Node Crypto. | Seiteneffektfrei; synchron; pseudonymisiert, aber ungepeppert. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Identifier-E2E; Risiko: mittel. |
| SRC-184 | `src/lib/auth.ts:37` | Funktion `normalizeRole` | Export; `(role) => NormalizedRole/null` | Trimmt/lowercaset und whitelisted Admin/Staff. | Statisch durch Auth-Callbacks, Session und User-Actions. | Seiteneffektfrei; synchron; unknown fail-closed. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role-E2E; Risiko: niedrig. |
| SRC-185 | `src/lib/auth.ts:50` | Funktion `isRetryableTransactionError` | Lokal; `(error) => type predicate` | Erkennt Prisma-Konfliktcode `P2034`. | Statisch durch SRC-186; generierter Prisma-Typ. | Seiteneffektfrei; synchron. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Parallel-Lockout-E2E; Risiko: niedrig. |
| SRC-186 | `src/lib/auth.ts:54` | Funktion `runTransactionWithRetry` | Lokal generisch; `async (operation) => Promise<T>` | Wiederholt Operation bis zu dreimal bei `P2034`. | Statisch durch SRC-187; SRC-185. | Wiederholt übergebene Operation; async; Login-Atomizität. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Parallel-Login-E2E; Risiko: mittel. |
| SRC-187 | `src/lib/auth.ts:76` | Provider-Methode `authorize` | Objektmethode; `async authorize(credentials)` | Trusted-IP/Headers, Lockout-Buckets, User-/Passwortprüfung, Audit und Cleanup. | Framework-registriert in `CredentialsProvider`; NextAuth-Route; SRC-183–SRC-192. | DB/Audit/Fehler; async; zentrale Auth, beide Buckets per User-Agent rotierbar. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth/Security-E2E; Risiko: hoch. |
| SRC-188 | `src/lib/auth.ts:103` | Retry-Closure `runLoginTransaction` | Inline; `() => Promise<Result>` | Übergibt die Login-Transaktion an den Retry-Wrapper. | Statisch durch SRC-186 innerhalb SRC-187; SRC-189. | Delegierte DB-Transaktion; async; Lockout. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Parallel-Login-E2E; Risiko: hoch. |
| SRC-189 | `src/lib/auth.ts:104` | Transaktions-Callback `evaluateLogin` | Inline; `async (tx) => LoginResult` | Liest Attempts/User, bereinigt Locks, prüft bcrypt, erhöht/sperrt oder auditiert Erfolg. | Statisch durch `prisma.$transaction` aus SRC-188; bcrypt, Prisma. | Atomare DB-Mutationen; async; Timing-Dummy/Lockout/Audit. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth-E2E; Risiko: hoch. |
| SRC-190 | `src/lib/auth.ts:120` | Filter `expiredIdentifierPresent` | Inline; `(identifier) => identifier is string` | Entfernt Nullwerte aus abgelaufenen Lock-Buckets. | Statisch durch Array-`filter` in SRC-189. | Seiteneffektfrei; synchron; Lockout-Cleanup. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Stale-Cleanup-E2E; Risiko: niedrig. |
| SRC-191 | `src/lib/auth.ts:228` | Transaktions-Callback `cleanupLoginAttempts` | Inline; `async (tx) => Promise<void>` | Löscht abgelaufene Locks und alte ungesperrte Versuche. | Statisch als Fire-and-forget nach SRC-189. | DB-Löschung; async unawaited; Datenhygiene, nicht über `after()`. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Stale-Cleanup-E2E; Risiko: mittel. |
| SRC-192 | `src/lib/auth.ts:241` | Rejection `logLoginCleanupFailure` | Inline; `(error) => void` | Loggt Cleanup-Fehler. | Statisch als Promise-`catch` von SRC-191; Pino. | Logging; async Callback; keine Credentials. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-193 | `src/lib/auth.ts:268` | NextAuth-Callback `jwt` | Objektmethode; `async jwt({token,user})` | Übernimmt ID und normalisierte Rolle beim Login in JWT. | Framework-registriert als `callbacks.jwt`; SRC-184. | Token-Mutation; async; ungültige Rolle fällt auf Staff zurück. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth/Role-E2E; Risiko: hoch. |
| SRC-194 | `src/lib/auth.ts:275` | NextAuth-Callback `session` | Objektmethode; `async session({session,token})` | Revalidiert Benutzer/Rolle bei jeder Session gegen die DB. | Framework-registriert als `callbacks.session`; Prisma, SRC-184/SRC-195. | DB-Lesen/Sessionmutation; async; gelöschte/ungültige User fail-closed. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Role-Loss-E2E; Risiko: hoch. |
| SRC-195 | `src/lib/auth.ts:285` | Rejection `sessionLookupFailClosed` | Inline; `() => null` | Wandelt jeden DB-Lookup-Fehler in fehlenden Benutzer um. | Statisch als Promise-`catch` in SRC-194. | Fehlerunterdrückung; async Callback; fail-closed. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-196 | `src/lib/client-ip.ts:8` | Konstruktor `TrustedClientIpError` | Exportierte Klasse; `constructor(message: string)` | Initialisiert einen typisierten Fehler für nicht vertrauenswürdig bestimmbare Client-IP-Adressen. | Statisch durch `throw new TrustedClientIpError(...)` in SRC-197; Basisklasse `Error`. | Erzeugt Fehlerobjekt; synchron; fail-closed IP-Vertrauensgrenze. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-197 | `src/lib/client-ip.ts:29` | Funktion `getClientIp` | Exportiert; `async getClientIp(): Promise<string>` | Ermittelt die Client-IP aus Vercel-, vertrauenswürdigen Proxy- oder Entwicklungs-Headern und bricht andernfalls typisiert ab. | Statisch durch Auth, Kontakt-Action und Client-API; `headers`, SRC-196/SRC-198. | Liest Request-Header; async; zentrale Anti-Abuse-/Proxy-Vertrauensgrenze. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch API-/Kontakt-E2E; Risiko: hoch. |
| SRC-198 | `src/lib/client-ip.ts:47` | Mapping `trimForwardedIp` | Inline; `(part: string) => string` | Trimmt die Segmente einer `X-Forwarded-For`-Kette. | Statisch durch `split(...).map(...)` in SRC-197. | Seiteneffektfrei; synchron; wählt im vertrauenswürdigen Proxy-Pfad die letzte Adresse ohne Formatvalidierung. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-199 | `src/lib/client-ip.ts:61` | Funktion `isTrustedClientIpError` | Exportiert; `(error: unknown) => error is TrustedClientIpError` | Erkennt den typisierten IP-Vertrauensfehler für gezielte fail-closed Behandlung. | Statisch durch Auth, Kontakt-Action und Client-API; SRC-196. | Seiteneffektfrei; synchron; verhindert unspezifisches Weiterverarbeiten unbekannter IPs. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch API-/Kontakt-E2E; Risiko: niedrig. |
| SRC-200 | `src/lib/logger.ts:41` | Formatter `formatLogLevel` | Inline Objektmethode; `(label: string) => { level: string }` | Formatiert Pino-Level als benanntes JSON-Feld. | Framework-registriert in der Pino-Konfiguration; `pino`. | Beeinflusst Logausgabe; synchron; Redaction wird separat konfiguriert. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-201 | `src/lib/prisma.ts:13` | Funktion `normalizeConnectionString` | Lokal; `(connectionString: string) => string` | Parst die PostgreSQL-URL und normalisiert SSL-Parameter für den Adapter. | Statisch beim Modulaufbau; `URL`, Umgebungsvariable `DATABASE_URL`. | Keine externe Mutation; synchron; TLS-/Verbindungs-Konfiguration. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-202 | `src/lib/prisma.ts:60` | Fulfillment `releaseWarmupClient` | Inline; `(client) => void` | Gibt den beim Pool-Warmup erhaltenen Client sofort wieder frei. | Statisch als Promise-`then` nach `pool.connect()` beim Modulaufbau. | Pool-Verbindung wird freigegeben; async Callback; Ressourcenhygiene. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-203 | `src/lib/prisma.ts:61` | Rejection `logWarmupFailure` | Inline; `(err: unknown) => void` | Protokolliert einen fehlgeschlagenen Datenbank-Warmup. | Statisch als Promise-`catch` nach SRC-202; Logger. | Logging; async Callback; strukturierte Fehlerausgabe. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-204 | `src/lib/prisma.ts:69` | Factory `createPrismaClient` | Lokal; `() => PrismaClient` | Erzeugt den Prisma-Client mit PostgreSQL-Adapter und gemeinsamem Pool. | Statisch beim Modulaufbau beziehungsweise Singleton-Fallback; `PrismaPg`, `Pool`. | Erzeugt DB-Client; synchron; zentrale Datenbankkonfiguration. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: hoch. |
| SRC-205 | `src/lib/rate-limit.ts:31` | Funktion `checkRateLimitDb` | Exportiert; `async checkRateLimitDb(key: string, limit: number, windowMs: number): Promise<RateLimitResult>` | Plant Bucket-Cleanup, führt atomaren Upsert aus und entscheidet anhand der Versuchszahl über Zulassung und Retry-Zeit. | Statisch durch Kontakt-Action und Client-API; SRC-206/SRC-209, Prisma. | DB-Mutation plus Deferred Work; async; zentrale Abuse-Schutzgrenze. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Rate-Limit-E2E; Risiko: hoch. |
| SRC-206 | `src/lib/rate-limit.ts:37` | After-Callback `scheduleBucketCleanup` | Inline; `async () => Promise<void>` | Plant die Bereinigung des gerade geprüften abgelaufenen Buckets nach der Response. | Framework-registriert über Next.js `after()` in SRC-205; SRC-207/SRC-208. | Deferred DB-Arbeit; async; Cleanup darf die Hauptentscheidung nicht blockieren. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-207 | `src/lib/rate-limit.ts:39` | Transaktions-Callback `deleteExpiredBucket` | Inline; `async (tx) => Promise<void>` | Löscht den konkreten Rate-Limit-Bucket nur, wenn sein Fenster abgelaufen ist. | Statisch durch `prisma.$transaction` in SRC-206. | DB-Löschung; async; transaktionale Race-Begrenzung. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-208 | `src/lib/rate-limit.ts:44` | Rejection `logBucketCleanupFailure` | Inline; `(err: unknown) => void` | Protokolliert Fehler bei der verzögerten Bucket-Bereinigung. | Statisch als Promise-`catch` in SRC-206; Logger. | Logging; async Callback; keine Rate-Limit-Entscheidung wird geändert. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-209 | `src/lib/rate-limit.ts:50` | Transaktions-Callback `atomicRateLimitUpsert` | Inline; `async (tx) => Promise<RateLimitRow[]>` | Erstellt oder aktualisiert den Bucket per parametrisierter SQL-Anweisung und erhöht atomar den Zähler. | Statisch durch `prisma.$transaction` in SRC-205; Prisma Raw SQL. | DB-Schreibzugriff; async; atomarer, parametrisierter Anti-Race-Pfad. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Parallelitäts-E2E; Risiko: hoch. |
| SRC-210 | `src/lib/rate-limit.ts:77` | Funktion `cleanupExpiredRateLimits` | Exportiert; `async cleanupExpiredRateLimits(): Promise<void>` | Plant eine globale Bereinigung aller abgelaufenen Rate-Limit-Buckets. | Statisch durch die Kontakt-Action; Next.js `after`, SRC-211/SRC-212. | Deferred DB-Löschung; async; Datenhygiene. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-211 | `src/lib/rate-limit.ts:80` | Transaktions-Callback `deleteAllExpiredRateLimits` | Inline; `async (tx) => Promise<void>` | Löscht alle Buckets, deren Fensterende in der Vergangenheit liegt. | Statisch durch `prisma.$transaction` in SRC-210. | DB-Massenlöschung nach Prädikat; async; transaktional. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: mittel. |
| SRC-212 | `src/lib/rate-limit.ts:85` | Rejection `logGlobalRateCleanupFailure` | Inline; `(err: unknown) => void` | Protokolliert Fehler der globalen Rate-Limit-Bereinigung. | Statisch als Promise-`catch` in SRC-210; Logger. | Logging; async Callback; Hauptrequest bleibt unbeeinflusst. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-213 | `src/lib/schemas.ts:54` | Funktion `sanitize` | Lokal; `(value: string) => string` | Entfernt Nullzeichen und HTML-artige Inhalte iterativ aus Texteingaben. | Statisch durch SRC-215/SRC-216; Sanitizer-Bibliothek/Regex. | Seiteneffektfrei; synchron; XSS-/Steuerzeichen-Abwehr. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Chaos-/Validierungs-E2E; Risiko: mittel. |
| SRC-214 | `src/lib/schemas.ts:68` | Mapping `extractCountryCode` | Inline; `(country) => string` | Leitet beim Modulaufbau die erlaubten Ländercodes aus den Länderoptionen ab. | Statisch durch Array-`map`; Länderkonstante. | Seiteneffektfrei; synchron; baut Validierungs-Whitelist. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |
| SRC-215 | `src/lib/schemas.ts:77` | Transform `clean` | Lokal; `(value: unknown) => unknown` | Sanitisiert Stringwerte und trimmt sie vor der Schemaauswertung. | Statisch in mehreren Zod-Preprocess-Schemata; SRC-213. | Seiteneffektfrei; synchron; Eingabevalidierungsgrenze. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Validierungs-E2E; Risiko: mittel. |
| SRC-216 | `src/lib/schemas.ts:78` | Transform `optionalClean` | Lokal; `(value: unknown) => unknown` | Reinigt optionale Stringwerte und wandelt leere Ergebnisse in `undefined` um. | Statisch in optionalen Zod-Feldern; SRC-213. | Seiteneffektfrei; synchron; normalisiert optionale Eingaben. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Validierungs-E2E; Risiko: niedrig. |
| SRC-217 | `src/lib/schemas.ts:90` | Refinement `isRequestTypeAllowed` | Inline; `(value: string) => boolean` | Prüft die Anfrageart gegen die statische Allowlist. | Statisch durch Zod-`refine`; Request-Type-Konstante. | Seiteneffektfrei; synchron; serverseitige Whitelist. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Kontakt-E2E; Risiko: mittel. |
| SRC-218 | `src/lib/schemas.ts:100` | Refinement `isReachabilityAllowed` | Inline; `(value: string) => boolean` | Prüft die Erreichbarkeitsangabe gegen die statische Allowlist. | Statisch durch Zod-`refine`; Reachability-Konstante. | Seiteneffektfrei; synchron; serverseitige Whitelist. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Kontakt-E2E; Risiko: mittel. |
| SRC-219 | `src/lib/schemas.ts:124` | Refinement `consentIsTrue` | Inline; `(value: boolean) => boolean` | Erzwingt die ausdrückliche Datenschutz-Einwilligung. | Statisch durch Zod-`refine` im Kontakt-Schema. | Seiteneffektfrei; synchron; Consent-Gate. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Kontakt-E2E; Risiko: hoch. |
| SRC-220 | `src/lib/schemas.ts:160` | Super-Refinement `idsAreUnique` | Inline; `(items, ctx) => void` | Erkennt doppelte Kennungen in Batch-Eingaben und fügt feldbezogene Validierungsfehler hinzu. | Statisch durch Zod-`superRefine`; `Set`, Validierungskontext. | Mutiert nur den Zod-Fehlerkontext; synchron; verhindert mehrdeutige Batch-Mutationen. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Admin-E2E; Risiko: mittel. |
| SRC-221 | `src/lib/session.ts:7` | Funktion `normalizeSession` | Lokal; `(session: Session \| null) => Session \| null` | Validiert User-ID und normalisiert die Sessionrolle; unvollständige Sessions werden verworfen. | Statisch durch SRC-222; Rollen-Normalisierung. | Seiteneffektfrei; synchron; fail-closed Auth-Grenze. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth-/Role-E2E; Risiko: hoch. |
| SRC-222 | `src/lib/session.ts:34` | Cache-Closure `getCachedSession` | Exportierte gecachte Closure; `async () => Promise<Session \| null>` | Lädt die NextAuth-Session einmal pro Render-/Request-Kontext und normalisiert sie. | Statisch durch Layouts, Seiten und Server Actions; React `cache`, `getServerSession`, `authOptions`, SRC-221. | Session-/DB-Lesen; async; zentrale serverseitige Auth-Grenze. | **Implemented**; Runtime: Unknown; Test: Unknown, statisch Auth-/Admin-E2E; Risiko: hoch. |
| SRC-223 | `src/lib/utils.ts:4` | Funktion `cn` | Exportiert; `(...inputs: ClassValue[]) => string` | Kombiniert bedingte Klassen und löst Tailwind-Klassenkonflikte auf. | Statisch durch UI- und Kontakt-Komponenten; `clsx`, `tailwind-merge`. | Seiteneffektfrei; synchron; keine Security-Grenze. | **Implemented**; Runtime: Unknown; Test: Unknown; Risiko: niedrig. |

**Kontrollsumme: 223/223**

### Ausführbare Einheiten außerhalb von `src/`

Legende: Jede `EXT-*`-ID bezeichnet genau einen projektgeschriebenen Funktions- oder Callback-Körper. **DB-DESTRUKTIV** kennzeichnet Lösch-, Überschreib- oder globale Zustandsänderungen mit möglichem Datenverlust. Der Status **Implemented** bestätigt ausschließlich den statisch vorhandenen Körper; weil keine Laufzeit- oder Testausführung stattfand, bleiben Runtime und Testausführung jeweils **Unknown**.

| ID | Datei:Zeilen | Typ / Name | Sichtbarkeit + Signatur | Verantwortung / Ablauf | Registrierung / Aufrufer + Abhängigkeiten | Effekte / Async / DB / OS / Security / Tests | Status / Runtime / Test / Risiko |
|---|---|---|---|---|---|---|---|
| EXT-001 | `tests/e2e/admin-dashboard.spec.ts:29-41` | Funktion `expectStableBoundingBox` | Lokal; `(current: BoundingRect, baseline: BoundingRect) => void` | Prüft Existenz und maximal ein Pixel Abweichung aller Boxdimensionen. | Statisch durch Bulk-UI-Tests; Playwright `expect`. | Synchron; keine DB/OS-Effekte; visueller Testhelper. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-002 | `tests/e2e/admin-dashboard.spec.ts:43-53` | Funktion `expectLeftButtonToLeadAndFit` | Lokal; `(left: BoundingRect, right: BoundingRect) => void` | Prüft Reihenfolge und größere Breite des linken Buttons. | Statisch durch Bulk-Delete-Test; `expect`. | Synchron; keine DB/OS-Effekte; visueller Testhelper. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-003 | `tests/e2e/admin-dashboard.spec.ts:55-62` | Helper `loginAsAdmin` | Lokal; `async (page: Page) => Promise<void>` | Öffnet Login, füllt Admin-Credentials, meldet an und wartet auf Dashboard. | Statisch durch zwölf Dashboard-Tests; NextAuth/UI. | Async HTTP/Session; LoginAttempt/AuditLog; Security-Identitätstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-004 | `tests/e2e/admin-dashboard.spec.ts:64-78` | Helper `openUsersTab` | Lokal; `async (page: Page) => Promise<void>` | Öffnet Benutzer-Tab mit zwei Sichtbarkeitsversuchen. | Statisch durch User-/Validierungs-/Rollen-Tests. | Async Browserinteraktion/Timer; keine direkte DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-005 | `tests/e2e/admin-dashboard.spec.ts:70` | Catch `usersForm fallback` | Inline; `() => false` | Wandelt Locator-Timeout in `false` um. | Statisch in EXT-004; Locator-Promise. | Async-Rejection wird bewusst neutralisiert; Testrobustheit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-006 | `tests/e2e/admin-dashboard.spec.ts:80-87` | Helper `openLogsTab` | Lokal; `async (page: Page) => Promise<void>` | Öffnet Audit-Tab und wartet auf Überschrift. | Statisch durch Tab-/Audit-Test. | Async Browser/HTTP; nachfolgend Audit-Read/Retention möglich. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-007 | `tests/e2e/admin-dashboard.spec.ts:89-93` | Helper `disableUserFormValidation` | Lokal; `async (page: Page) => Promise<void>` | Deaktiviert native Formularvalidierung im Browser. | Statisch durch zwei Server-Zod-Tests; EXT-008. | Async Browser-DOM-Mutation; absichtlicher Client-Validierungs-Bypass. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-008 | `tests/e2e/admin-dashboard.spec.ts:90-92` | Browser-Callback `form.evaluate` | Page-Context; `(form: HTMLFormElement) => void` | Setzt `form.noValidate = true`. | Framework-registriert durch `page.evaluate` in EXT-007. | Synchron im Browser; DOM-Mutation; Security-Testpfad. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-009 | `tests/e2e/admin-dashboard.spec.ts:95-97` | Funktion `requestRow` | Lokal; `(page: Page, message: string) => Locator` | Lokalisiert erste Request-Zeile anhand Nachricht. | Statisch durch Request-Tests; Playwright Locator. | Synchron; keine DB/OS-Effekte; Selektor ist CSS-/Text-gekoppelt. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-010 | `tests/e2e/admin-dashboard.spec.ts:99-101` | Funktion `userRow` | Lokal; `(page: Page, email: string) => Locator` | Lokalisiert erste User-Zeile anhand E-Mail. | Statisch durch Rolleneskalationstest. | Synchron; keine DB/OS-Effekte; verarbeitet Test-E-Mail. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-011 | `tests/e2e/admin-dashboard.spec.ts:103-111` | Helper `requestStatValue` | Lokal; `async (page, kind) => Promise<number>` | Mappt Statistiktyp auf Test-ID und parst Textzahl. | Statisch durch Read-/Delete-/Bulk-Tests. | Async DOM-Read; kein DB/OS; Nichtzahl fällt auf 0. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-012 | `tests/e2e/admin-dashboard.spec.ts:113-133` | Helper `delayNextServerAction` | Lokal; `async (page: Page, delayMs=1200) => Promise<controls>` | Registriert Route, verzögert erste Next-Action und liefert Status/Dispose. | Statisch durch Completion-coupled Tests; EXT-013 bis EXT-016. | Async Netzwerkinterception/Timer; Race-Test; keine direkte DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-013 | `tests/e2e/admin-dashboard.spec.ts:116-125` | Route-Callback `handler` | Closure; `async (route: Route) => Promise<void>` | Erkennt erste POST-Next-Action, wartet und setzt Request fort. | Framework-registriert durch `page.route` in EXT-012. | Async Netzwerk-Timing; Server-Action kann DB mutieren; Concurrency-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-014 | `tests/e2e/admin-dashboard.spec.ts:121` | Promise-Executor `delay timer` | Closure; `(resolve) => void` | Plant `resolve` nach `delayMs`. | Statisch durch `new Promise` in EXT-013; `setTimeout`. | OS-Timer; async Auslösung; keine DB/Security-Wirkung. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-015 | `tests/e2e/admin-dashboard.spec.ts:130` | Closure `wasIntercepted` | Lokal; `() => boolean` | Liest gekapselten Interception-Status. | Statisch durch Mutationstests. | Synchroner Closure-Read; keine DB/OS-Effekte. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-016 | `tests/e2e/admin-dashboard.spec.ts:131` | Closure `dispose` | Lokal; `async () => Promise<void>` | Entfernt registrierten Route-Handler. | Statisch in `finally`-Blöcken; `page.unroute`. | Async Browser-Routing-Cleanup; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-017 | `tests/e2e/admin-dashboard.spec.ts:135-582` | Suite `Admin Dashboard` | Playwright-registriert; `() => void` | Registriert zwei Hooks und dreizehn Tests. | Framework-registriert durch `test.describe`. | Synchroner Registrierungsbody; Tests können DB/Sessions mutieren. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-018 | `tests/e2e/admin-dashboard.spec.ts:136-138` | Hook `beforeAll` | Playwright-registriert; `async () => Promise<void>` | Löscht vor Suite alle LoginAttempts. | Framework-registriert; `cleanupLoginAttempts`. | **DB-DESTRUKTIV**; async globales Delete; schwächt Lockout-State bei falscher DB. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-019 | `tests/e2e/admin-dashboard.spec.ts:140-149` | Hook `afterAll` | Playwright-registriert; `async () => Promise<void>` | Löscht definierte User, Testkontakte, alle Attempts und trennt Prisma. | Framework-registriert; vier DB-Helfer. | **DB-DESTRUKTIV**; mehrere Deletes, eines global; DB-Disconnect; Cleanup bei Abbruch unsicher. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-020 | `tests/e2e/admin-dashboard.spec.ts:151-159` | Test `Statistik-Karten und Anfragen-Tab` | Playwright; `async ({page}) => Promise<void>` | Loggt ein und prüft zentrale Dashboardelemente. | EXT-003; Dashboard Server Component. | Async HTTP; LOGIN-Audit/DB-Reads/Retention; Auth-/UI-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-021 | `tests/e2e/admin-dashboard.spec.ts:161-192` | Test `Pagination erreichbar und verwaltbar` | Playwright; `async ({page}) => Promise<void>` | Löscht Testkontakte, erzeugt 51, lädt Seite 2 und markiert ältesten gelesen. | Contact-Helfer, Pagination-/Mutation-Action; EXT-022/023. | **DB-DESTRUKTIV**; async DeleteMany, 51 Inserts, Update, Login-Audit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-022 | `tests/e2e/admin-dashboard.spec.ts:166-173` | Array-Callback `pagination request factory` | Closure; `(_, index) => Promise<ContactRequest>` | Erzeugt je Index datierte Testanfrage. | Statisch durch `Array.from`/`Promise.all`; DB-Helfer. | Async; pro Aufruf transaktionaler DB-Insert. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-023 | `tests/e2e/admin-dashboard.spec.ts:190` | Poll `oldest read state` | Closure; `async () => Promise<boolean\|null>` | Liest wiederholt Read-Status des ältesten Requests. | Framework-registriert durch `expect.poll`; DB-Helfer. | Async wiederholte DB-Reads; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-024 | `tests/e2e/admin-dashboard.spec.ts:194-208` | Test `Admin sieht User- und Log-Tabs` | Playwright; `async ({page}) => Promise<void>` | Prüft privilegierte Tabs und Inhalte. | EXT-003/004/006; Admin-Dashboard. | Async LOGIN-Audit, User-/Audit-Reads und Retention. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-025 | `tests/e2e/admin-dashboard.spec.ts:210-237` | Test `Mitarbeiter erstellen und loeschen` | Playwright; `async ({page}) => Promise<void>` | Erstellt Staff, reloadet, löscht ihn und prüft Entfernung. | User-Actions/UI; EXT-003/004. | **DB-DESTRUKTIV**; async User Insert/Delete und zwei Audit-Aktionen. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-026 | `tests/e2e/admin-dashboard.spec.ts:239-242` | Test `Unautorisierter Zugriff` | Playwright; `async ({page}) => Promise<void>` | Öffnet `/admin` ohne Session und prüft Login-Redirect. | Protected Layout. | Async HTTP/Session-Read; keine beabsichtigte DB-Mutation; Auth-Guard-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-027 | `tests/e2e/admin-dashboard.spec.ts:244-282` | Test `Status erst nach Abschluss` | Playwright; `async ({page}) => Promise<void>` | Erzeugt Request, verzögert Action und prüft Pending, DB und Zähler. | EXT-003/009/011/012; Contact-Mutation. | Async Insert/Update/Login-Audit und Netzwerkinterception. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-028 | `tests/e2e/admin-dashboard.spec.ts:270` | Poll `single read completion` | Closure; `async () => Promise<boolean\|null>` | Wartet auf persistierten Read-Status. | `expect.poll`; DB-Helfer. | Async DB-Reads; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-029 | `tests/e2e/admin-dashboard.spec.ts:271` | Poll `single unread counter` | Closure; `async () => Promise<number>` | Wartet auf UI-Zähler nach Erfolg. | `expect.poll`; EXT-011. | Async DOM-Reads; keine DB/OS-Effekte. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-030 | `tests/e2e/admin-dashboard.spec.ts:284-322` | Test `Einzelnes Loeschen erst nach Abschluss` | Playwright; `async ({page}) => Promise<void>` | Verzögert bestätigtes Delete und prüft DB, Zähler, Audit und Reload. | Contact-Delete, EXT-012; EXT-031 bis EXT-033. | **DB-DESTRUKTIV**; async Contact-Delete und DELETE_REQUEST-Audit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-031 | `tests/e2e/admin-dashboard.spec.ts:310` | Poll `single request deleted` | Closure; `async () => Promise<object\|null>` | Wartet, bis Request-Lookup null liefert. | `expect.poll`; DB-Helfer. | Async DB-Reads; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-032 | `tests/e2e/admin-dashboard.spec.ts:311` | Poll `single total counter` | Closure; `async () => Promise<number>` | Wartet auf reduzierten Gesamtzähler. | `expect.poll`; EXT-011. | Async DOM-Reads; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-033 | `tests/e2e/admin-dashboard.spec.ts:312-314` | Poll `single delete audit` | Closure; `async () => Promise<boolean>` | Sucht passenden DELETE_REQUEST-Audit. | `expect.poll`; Audit-Helfer. | Async AuditLog-Reads; Security-Nachvollziehbarkeitstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-034 | `tests/e2e/admin-dashboard.spec.ts:324-402` | Test `Bulk gelesen und ungelesen` | Playwright; `async ({page}) => Promise<void>` | Erzeugt zwei Requests und prüft Bulk-Pendingzustände sowie Geometrie. | RequestsTab, EXT-012, DB-Helfer; EXT-035 bis EXT-040. | Async zwei Inserts/zwei Bulk-Updates/Login-Audit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-035 | `tests/e2e/admin-dashboard.spec.ts:367` | Poll `bulk first read` | Closure; `async () => Promise<boolean\|null>` | Wartet auf Read=true des ersten Requests. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-036 | `tests/e2e/admin-dashboard.spec.ts:368` | Poll `bulk second read` | Closure; `async () => Promise<boolean\|null>` | Wartet auf Read=true des zweiten Requests. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-037 | `tests/e2e/admin-dashboard.spec.ts:369` | Poll `bulk read counter` | Closure; `async () => Promise<number>` | Wartet auf um zwei reduzierten Ungelesen-Zähler. | `expect.poll`; EXT-011. | Async DOM-Read; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-038 | `tests/e2e/admin-dashboard.spec.ts:394` | Poll `bulk first unread` | Closure; `async () => Promise<boolean\|null>` | Wartet auf Read=false des ersten Requests. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-039 | `tests/e2e/admin-dashboard.spec.ts:395` | Poll `bulk second unread` | Closure; `async () => Promise<boolean\|null>` | Wartet auf Read=false des zweiten Requests. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-040 | `tests/e2e/admin-dashboard.spec.ts:396` | Poll `bulk unread counter` | Closure; `async () => Promise<number>` | Wartet auf ursprünglichen Ungelesen-Zähler. | `expect.poll`; EXT-011. | Async DOM-Read; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-041 | `tests/e2e/admin-dashboard.spec.ts:404-494` | Test `Bulk-Loeschen erst nach Abschluss` | Playwright; `async ({page}) => Promise<void>` | Prüft Confirm/Cancel-Geometrie, Pending, atomisches Delete und zwei Audits. | RequestsTab, EXT-012; EXT-042 bis EXT-046. | **DB-DESTRUKTIV**; async zwei Inserts/Deletes und zwei Audits. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-042 | `tests/e2e/admin-dashboard.spec.ts:482` | Poll `bulk first deleted` | Closure; `async () => Promise<object\|null>` | Wartet auf Löschung des ersten Requests. | `expect.poll`; DB-Helfer. | Async DB-Reads; keine eigene Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-043 | `tests/e2e/admin-dashboard.spec.ts:483` | Poll `bulk second deleted` | Closure; `async () => Promise<object\|null>` | Wartet auf Löschung des zweiten Requests. | `expect.poll`; DB-Helfer. | Async DB-Reads; keine eigene Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-044 | `tests/e2e/admin-dashboard.spec.ts:484` | Poll `bulk total counter` | Closure; `async () => Promise<number>` | Wartet auf um zwei reduzierten Gesamtzähler. | `expect.poll`; EXT-011. | Async DOM-Reads; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-045 | `tests/e2e/admin-dashboard.spec.ts:485-487` | Poll `bulk first audit` | Closure; `async () => Promise<boolean>` | Sucht DELETE_REQUEST-Audit für ersten Request. | `expect.poll`; Audit-Helfer. | Async AuditLog-Reads; Nachvollziehbarkeitstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-046 | `tests/e2e/admin-dashboard.spec.ts:488-490` | Poll `bulk second audit` | Closure; `async () => Promise<boolean>` | Sucht DELETE_REQUEST-Audit für zweiten Request. | `expect.poll`; Audit-Helfer. | Async AuditLog-Reads; Nachvollziehbarkeitstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-047 | `tests/e2e/admin-dashboard.spec.ts:496-510` | Test `Zod blockiert ungueltige E-Mail` | Playwright; `async ({page}) => Promise<void>` | Umgeht Browservalidierung, sendet ungültige E-Mail und prüft fehlenden User. | UsersTab/User-Action/Zod; EXT-048. | Async Login-Audit; kein beabsichtigter User-Insert; Security-Validationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-048 | `tests/e2e/admin-dashboard.spec.ts:509` | Poll `invalid email absent` | Closure; `async () => Promise<boolean>` | Prüft wiederholt, dass kein User angelegt wurde. | `expect.poll`; User-Read-Helfer. | Async DB-Reads; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-049 | `tests/e2e/admin-dashboard.spec.ts:512-528` | Test `Zod blockiert schwaches Passwort` | Playwright; `async ({page}) => Promise<void>` | Umgeht Browservalidierung, sendet schwaches Passwort und prüft Ablehnung. | UsersTab/User-Action/Zod; EXT-050. | Async Login-Audit; kein beabsichtigter User-Insert; Password-Policy-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-050 | `tests/e2e/admin-dashboard.spec.ts:527` | Poll `weak-password user absent` | Closure; `async () => Promise<boolean>` | Prüft wiederholt fehlenden User. | `expect.poll`; User-Read-Helfer. | Async DB-Reads; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-051 | `tests/e2e/admin-dashboard.spec.ts:530-555` | Test `stale Role-Eskalation blockiert Delete` | Playwright; `async ({page}) => Promise<void>` | Upsertet Staff, ändert Rolle direkt zu Admin und prüft blockiertes UI-Delete. | User-Helfer/User-Action; EXT-052. | **DB-DESTRUKTIV** durch Credential-/Rollenüberschreibung; async; Authorizationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-052 | `tests/e2e/admin-dashboard.spec.ts:549` | Poll `promoted user remains` | Closure; `async () => Promise<boolean>` | Prüft wiederholt Fortbestand des eskalierten Users. | `expect.poll`; User-Read-Helfer. | Async DB-Reads; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-053 | `tests/e2e/admin-dashboard.spec.ts:557-581` | Test `Aktivitaetslog ohne Clear-Aktion` | Playwright; `async ({page}) => Promise<void>` | Snapshottet alle Logs, legt Testlog an, prüft UI und restauriert Gesamttabelle. | Audit-Helfer/LogsTab. | **DB-DESTRUKTIV**; async globales AuditLog-Delete/Recreate, Concurrent-Log-Verlust möglich. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-054 | `tests/e2e/admin-logic.spec.ts:23-29` | Helper `loginAs` | Lokal; `async (page: Page, email: string, password: string) => Promise<void>` | Führt Login aus und wartet auf Dashboard. | Statisch durch fünf Admin-Logic-Tests; NextAuth/UI. | Async HTTP/Session; LoginAttempt/AuditLog; Auth-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-055 | `tests/e2e/admin-logic.spec.ts:31-47` | Helper `openUsersTab` | Lokal; `async (page: Page) => Promise<void>` | Versucht bis zu viermal, den Benutzer-Tab zu öffnen. | Statisch durch Rollen-/User-Tests; EXT-056. | Async Browserinteraktion/Timer; keine direkte DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-056 | `tests/e2e/admin-logic.spec.ts:37` | Catch `usersVisible fallback` | Closure; `() => false` | Wandelt Sichtbarkeitstimeout in false um. | Statisch in EXT-055. | Async-Rejection wird neutralisiert; Testrobustheit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-057 | `tests/e2e/admin-logic.spec.ts:49-51` | Funktion `requestRows` | Lokal; `(page: Page, message: string) => Locator` | Lokalisiert alle passenden Request-Zeilen. | Statisch durch stale Request-/Bulk-Tests. | Synchron; keine DB/OS-Effekte; CSS-/Text-gekoppelt. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-058 | `tests/e2e/admin-logic.spec.ts:53-55` | Funktion `userRow` | Lokal; `(page: Page, email: string) => Locator` | Lokalisiert erste passende User-Zeile. | Statisch durch Rollen-Tests. | Synchron; keine DB/OS-Effekte; verarbeitet Test-E-Mail. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-059 | `tests/e2e/admin-logic.spec.ts:57-218` | Suite `Admin Logic Corrections` | Playwright-registriert; `() => void` | Registriert zwei Hooks und fünf Tests. | Framework-registriert durch `test.describe`. | Synchroner Registrierungsbody; Kinder mutieren DB/Sessions. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-060 | `tests/e2e/admin-logic.spec.ts:58-60` | Hook `beforeAll` | Playwright-registriert; `async () => Promise<void>` | Löscht alle LoginAttempts. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales Delete; Lockout-State-Verlust. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-061 | `tests/e2e/admin-logic.spec.ts:62-71` | Hook `afterAll` | Playwright-registriert; `async () => Promise<void>` | Löscht drei User, Testkontakte, alle Attempts und trennt Prisma. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async mehrere Deletes, eines global; DB-Disconnect. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-062 | `tests/e2e/admin-logic.spec.ts:73-88` | Test `Ungueltige Rollen sichtbar, aber blockiert` | Playwright; `async ({page}) => Promise<void>` | Erzeugt `owner`-User und prüft neutrale Darstellung ohne Delete. | User-Helfer/UsersTab; EXT-054/055/058. | Async User-Upsert/Admin-LOGIN-Audit; Authorizationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-063 | `tests/e2e/admin-logic.spec.ts:90-115` | Test `Fehlgeschlagene User-Loeschung stellt Wahrheit her` | Playwright; `async ({page}) => Promise<void>` | Erstellt Staff, eskaliert direkt zu Admin und prüft blockiertes Delete/UI-Refresh. | User-Helfer/User-Action. | **DB-DESTRUKTIV** durch Rollenüberschreibung; async; Authorizationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-064 | `tests/e2e/admin-logic.spec.ts:117-149` | Test `stale Anfrage-Aktion refresht UI` | Playwright; `async ({page}) => Promise<void>` | Zweite Seite löscht Request; erste versucht stale Read und muss refreshen. | Contact-Helfer/-Action; EXT-065. | **DB-DESTRUKTIV**; async Insert/Delete, DELETE_REQUEST-/LOGIN-Audit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-065 | `tests/e2e/admin-logic.spec.ts:140` | Poll `stale request deletion` | Closure; `async () => Promise<object\|null>` | Wartet auf Löschung durch zweite Seite. | `expect.poll`; DB-Helfer. | Async DB-Reads; keine eigene Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-066 | `tests/e2e/admin-logic.spec.ts:151-196` | Test `Bulk-Aktion bleibt bei stale Request atomar` | Playwright; `async ({page}) => Promise<void>` | Erzeugt zwei Requests, löscht einen parallel und prüft unveränderten verbleibenden Request. | Contact-Helfer/-Actions; EXT-067/068. | **DB-DESTRUKTIV**; async Inserts/Delete/Audit/Login; Atomicity-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-067 | `tests/e2e/admin-logic.spec.ts:184` | Poll `stale bulk request deletion` | Closure; `async () => Promise<object\|null>` | Wartet auf Löschung des zweiten Requests. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-068 | `tests/e2e/admin-logic.spec.ts:192` | Poll `first request remains unread` | Closure; `async () => Promise<boolean\|null>` | Prüft atomaren Rollback über unveränderten Read-Status. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-069 | `tests/e2e/admin-logic.spec.ts:198-217` | Test `Rollenverlust springt auf Anfragen` | Playwright; `async ({page}) => Promise<void>` | Erstellt Admin, loggt ein, stuft direkt zu Staff herab und prüft Reload-UI. | User-Helfer/Session-Normalisierung. | **DB-DESTRUKTIV** durch Rollenüberschreibung; async; Authorizationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-070 | `tests/e2e/auth.spec.ts:19-24` | Helper `submitLogin` | Lokal; `async (page: Page, email: string, password: string) => Promise<void>` | Öffnet Login, füllt Credentials und sendet. | Statisch durch sechs Auth-Tests. | Async HTTP; Auth-Transaktionen und ggf. Audit; verarbeitet Secrets im Browser. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-071 | `tests/e2e/auth.spec.ts:26-150` | Suite `Admin Login & Lockout` | Playwright-registriert; `() => void` | Registriert Hooks und sechs Tests. | Framework-registriert durch `test.describe`. | Synchroner Registrierungsbody; Kinder mutieren Auth-DB. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-072 | `tests/e2e/auth.spec.ts:27-29` | Hook `beforeEach` | Playwright-registriert; `async () => Promise<void>` | Löscht vor jedem Test alle LoginAttempts. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales Delete; Lockout-State-Verlust. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-073 | `tests/e2e/auth.spec.ts:31-35` | Hook `afterAll` | Playwright-registriert; `async () => Promise<void>` | Löscht Invalid-Role-User, alle Attempts und trennt Prisma. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales Attempt-Delete/User-Delete/Disconnect. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-074 | `tests/e2e/auth.spec.ts:37-44` | Test `Erfolgreicher Login mit Seed-Daten` | Playwright; `async ({page}) => Promise<void>` | Prüft erfolgreichen Admin-Login. | EXT-070; NextAuth/AuthOptions. | **DB-DESTRUKTIV** durch Löschen eigener Buckets; async LOGIN-Audit; Auth-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-075 | `tests/e2e/auth.spec.ts:46-60` | Test `Lockout nach 3 Fehlversuchen` | Playwright; `async ({page}) => Promise<void>` | Sendet drei falsche Passwörter und prüft Sperrtext. | EXT-070; Auth-Lockout. | Async LoginAttempt-Upserts/Sperrupdate; Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-076 | `tests/e2e/auth.spec.ts:62-79` | Test `Identifier ohne Klartext-E-Mail` | Playwright; `async ({page}) => Promise<void>` | Erzeugt Fehlversuch, liest zwei Identifier und prüft Hashformat/PII-Abwesenheit. | EXT-070; Auth/DB-Helfer. | Async LoginAttempt-Inserts/Reads; Datenschutztest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-077 | `tests/e2e/auth.spec.ts:81-99` | Test `Stale LoginAttempts werden bereinigt` | Playwright; `async ({page}) => Promise<void>` | Erzeugt Buckets, altert global ungesperrte Einträge und triggert Cleanup. | Raw-SQL-Helfer/Auth; EXT-078/079. | **DB-DESTRUKTIV**; async globales Timestamp-Update/Delete; Lockout-State-Risiko. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-078 | `tests/e2e/auth.spec.ts:89` | Poll `initial attempt count` | Closure; `async () => Promise<number>` | Wartet auf exakt zwei LoginAttempt-Zeilen. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-079 | `tests/e2e/auth.spec.ts:98` | Poll `post-cleanup attempt count` | Closure; `async () => Promise<number>` | Wartet auf zwei frische Buckets nach Cleanup. | `expect.poll`; DB-Helfer. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-080 | `tests/e2e/auth.spec.ts:101-133` | Test `Parallele Fehlversuche triggern Lockout` | Playwright; `async ({context}) => Promise<void>` | Öffnet vier Seiten, meldet parallel falsch an und prüft Sperre/korrekten Login. | Auth/BrowserContext; EXT-081 bis EXT-083. | Async parallele DB-Transaktionen/Browserseiten; Concurrency-/Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-081 | `tests/e2e/auth.spec.ts:111-115` | Map `parallel login pages` | Closure; `async (page: Page) => Promise<void>` | Führt Fehlversuch und UI-Prüfung je Seite aus. | `Promise.all` in EXT-080; EXT-070. | Async parallele HTTP-/LoginAttempt-Mutationen. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-082 | `tests/e2e/auth.spec.ts:118` | Poll `active lock exists` | Closure; `async () => Promise<boolean>` | Prüft wiederholt mindestens eine aktive Sperre. | `expect.poll`; DB-Helfer. | Async DB-Reads; Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-083 | `tests/e2e/auth.spec.ts:131` | Map `close parallel pages` | Closure; `(page: Page) => Promise<void>` | Schließt alle Parallelseiten. | `Promise.all` im `finally` von EXT-080. | Async Browser-/OS-Ressourcen-Cleanup; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-084 | `tests/e2e/auth.spec.ts:135-149` | Test `User mit ungueltiger Rolle abgelehnt` | Playwright; `async ({page}) => Promise<void>` | Upsertet `owner`-User und prüft abgelehnten Login. | User-Helfer/Auth-Normalisierung; EXT-070. | **DB-DESTRUKTIV** durch Credential-/Rollen-Upsert; LoginAttempt-Inserts. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-085 | `tests/e2e/chaos.spec.ts:13-19` | Helper `dismissCookieBanner` | Lokal; `async (page: Page) => Promise<void>` | Schließt Banner, falls sichtbar. | Statisch durch zwei Chaos-Tests; EXT-086. | Async Browser-DOM; keine DB/OS-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-086 | `tests/e2e/chaos.spec.ts:15` | Catch `banner fallback` | Closure; `() => false` | Behandelt Sichtbarkeitstimeout als nicht sichtbar. | Statisch in EXT-085. | Async-Rejection neutralisiert; Testrobustheit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-087 | `tests/e2e/chaos.spec.ts:21-80` | Suite `Chaos & Integrity` | Playwright-registriert; `() => void` | Registriert Hooks und zwei Tests. | Framework-registriert durch `test.describe`. | Synchroner Registrierungsbody; Kinder mutieren DB. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-088 | `tests/e2e/chaos.spec.ts:22-24` | Hook `beforeEach` | Playwright-registriert; `async () => Promise<void>` | Löscht alle RateLimits vor jedem Test. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales Delete; Abuse-Control-State-Verlust. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-089 | `tests/e2e/chaos.spec.ts:26-30` | Hook `afterAll` | Playwright-registriert; `async () => Promise<void>` | Löscht alle RateLimits, Testkontakte und trennt Prisma. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales Delete/Prefix-Delete/Disconnect. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-090 | `tests/e2e/chaos.spec.ts:32-55` | Test `Double-Click erzeugt einen DB-Eintrag` | Playwright; `async ({page}) => Promise<void>` | Füllt Formular, doppelklickt Submit und zählt Kontakte. | ContactForm/Action/RateLimit; EXT-085. | Async RateLimit-Mutation/Contact-Insert; Race-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-091 | `tests/e2e/chaos.spec.ts:57-79` | Test `HTML-Tags im Vornamen abgelehnt` | Playwright; `async ({page}) => Promise<void>` | Sendet Tag-only Vorname und prüft Validierungsfehler/keinen Kontakt. | Sanitization/Zod/ContactAction. | Async RateLimit-Mutation vor Validierung; kein Contact-Insert; Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-092 | `tests/e2e/contact.spec.ts:18-24` | Helper `dismissCookieBanner` | Lokal; `async (page: Page) => Promise<void>` | Schließt Banner und wartet auf Hidden. | Statisch durch drei Formulartests; EXT-093. | Async Browser-DOM; keine DB/OS-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-093 | `tests/e2e/contact.spec.ts:20` | Catch `banner fallback` | Closure; `() => false` | Behandelt Timeout als unsichtbares Banner. | Statisch in EXT-092. | Async-Rejection neutralisiert; Testrobustheit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-094 | `tests/e2e/contact.spec.ts:26-175` | Suite `Kontaktformular` | Playwright-registriert; `() => void` | Registriert Hooks und vier Tests. | Framework-registriert durch `test.describe`. | Synchroner Registrierungsbody; Kinder mutieren DB/RateLimit. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-095 | `tests/e2e/contact.spec.ts:27-29` | Hook `beforeEach` | Playwright-registriert; `async () => Promise<void>` | Löscht vor jedem Test alle RateLimits. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales Delete; Abuse-Control-State-Verlust. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-096 | `tests/e2e/contact.spec.ts:31-35` | Hook `afterAll` | Playwright-registriert; `async () => Promise<void>` | Löscht RateLimits, Testkontakte und trennt Prisma. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales/Prefix-Delete und DB-Disconnect. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-097 | `tests/e2e/contact.spec.ts:37-44` | Test `Datenschutzerklaerung beschreibt Loeschung` | Playwright; `async ({page}) => Promise<void>` | Prüft Überschrift und manuellen Löschhinweis. | Datenschutzseite. | Async HTTP/DOM-Read; keine DB-Mutation; Texttest, keine Rechtsgarantie. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-098 | `tests/e2e/contact.spec.ts:46-79` | Test `Formular erfolgreich absenden` | Playwright; `async ({page}) => Promise<void>` | Prüft Telefonfilter, Submit, Erfolg und persistierte Felder. | ContactForm/Action/DB-Helfer. | Async RateLimit-Mutation/Contact-Insert; personenbezogene Testdaten. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-099 | `tests/e2e/contact.spec.ts:81-122` | Test `Honeypot blockiert Spam` | Playwright; `async ({page}) => Promise<void>` | Setzt Honeypot nativ, sendet und prüft Erfolgstäuschung ohne Insert. | ContactForm/Honeypot; EXT-100. | Async RateLimit-Mutation; kein Contact-Insert; Anti-Spam-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-100 | `tests/e2e/contact.spec.ts:99-112` | Browser-Callback `honeypot evaluate` | Page-Context; `(element: HTMLInputElement) => void` | Setzt nativen Input-Wert und dispatcht Input/Change. | `page.evaluate` in EXT-099; DOM APIs. | Synchron im Browser; DOM-Mutation; wirft bei fehlendem Setter. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-101 | `tests/e2e/contact.spec.ts:124-174` | Test `manipulierte Telefonnummer serverseitig blockiert` | Playwright; `async ({page}) => Promise<void>` | Interceptiert Action, ersetzt Telefonnummer und prüft Ablehnung/kein Insert. | ContactAction/Zod; EXT-102. | Async Request-Manipulation/RateLimit-Mutation; Security-Validationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-102 | `tests/e2e/contact.spec.ts:141-155` | Route-Callback `tamper phone handler` | Closure; `async (route: Route) => Promise<void>` | Erkennt passende Next-Action, ersetzt Payload einmal und setzt sonst fort. | Framework-registriert durch `page.route` in EXT-101. | Async Netzwerkpayload-Manipulation; Server kann RateLimit mutieren. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-103 | `tests/e2e/role-visibility.spec.ts:12-18` | Helper `loginAs` | Lokal; `async (page: Page, email: string, password: string) => Promise<void>` | Meldet angegebenen User an und wartet auf Dashboard. | Statisch durch drei Rollentests. | Async Session/LoginAttempt/AuditLog; Auth-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-104 | `tests/e2e/role-visibility.spec.ts:20-26` | Funktion `tabLocators` | Lokal; `(page: Page) => locator object` | Liefert Locator für Requests, Users und Logs. | Statisch durch drei Rollentests. | Synchron; keine DB/OS-Effekte. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-105 | `tests/e2e/role-visibility.spec.ts:28-79` | Suite `Role Visibility & Normalization` | Playwright-registriert; `() => void` | Registriert Hooks und drei Tests. | Framework-registriert durch `test.describe`. | Synchroner Registrierungsbody; Kinder überschreiben Identity-Daten. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-106 | `tests/e2e/role-visibility.spec.ts:29-43` | Hook `beforeAll` | Playwright-registriert; `async () => Promise<void>` | Löscht Attempts und upsertet ambient Admin sowie uppercase-Staff. | Framework-registriert; `ensureTestUser`. | **DB-DESTRUKTIV**; überschreibt Admin-Passwort/Name/Rolle; globales Attempt-Delete. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-107 | `tests/e2e/role-visibility.spec.ts:45-49` | Hook `afterAll` | Playwright-registriert; `async () => Promise<void>` | Löscht Staff-Testuser, alle Attempts und trennt Prisma. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; Admin wird nicht restauriert; globales Attempt-Delete. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-108 | `tests/e2e/role-visibility.spec.ts:51-58` | Test `Admin sieht alle Tabs` | Playwright; `async ({page}) => Promise<void>` | Prüft drei sichtbare Admin-Tabs. | EXT-103/104; Dashboard. | Async LOGIN-Audit/Admin-Reads/Retention; Authorizationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-109 | `tests/e2e/role-visibility.spec.ts:60-67` | Test `Staff sieht nur Anfragen` | Playwright; `async ({page}) => Promise<void>` | Prüft Requests sichtbar und privilegierte Tabs verborgen. | EXT-103/104; Rollenlogik. | Async LOGIN-Audit/Session-Reads; UI-Gate-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-110 | `tests/e2e/role-visibility.spec.ts:69-78` | Test `Normalisierte Staff-Session nach Reload` | Playwright; `async ({page}) => Promise<void>` | Prüft Normalisierung von `STAFF` und fortbestehende UI-Beschränkung. | Auth-/Session-Normalisierung; EXT-103/104. | Async LOGIN-Audit/Session-Reads; Authorizationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-111 | `tests/e2e/security.spec.ts:7-10` | Helper `expectInvalidInputResponse` | Lokal; `async (response: APIResponse) => Promise<void>` | Parst JSON und prüft exakte Invalid-Input-Antwort. | Statisch durch drei Client-Error-Tests. | Async Response-Read; keine DB/OS-Mutation; API-Vertragstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-112 | `tests/e2e/security.spec.ts:14-157` | Suite `Security — Edge Cases` | Playwright-registriert; `() => void` | Registriert Hooks und elf Tests. | Framework-registriert durch `test.describe`. | Synchroner Registrierungsbody; Kinder mutieren Security-State. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-113 | `tests/e2e/security.spec.ts:15-17` | Hook `beforeEach` | Playwright-registriert; `async () => Promise<void>` | Löscht vor jedem Test alle RateLimits. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; async globales Delete; Abuse-Control-State-Verlust. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-114 | `tests/e2e/security.spec.ts:19-23` | Hook `afterAll` | Playwright-registriert; `async () => Promise<void>` | Löscht alle RateLimits/LoginAttempts und trennt Prisma. | Framework-registriert; DB-Helfer. | **DB-DESTRUKTIV**; zwei globale Deletes/DB-Disconnect. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-115 | `tests/e2e/security.spec.ts:25-28` | Test `Unauthenticated Admin-Routen redirecten` | Playwright; `async ({page}) => Promise<void>` | Prüft Redirect von `/admin` auf Login. | Protected Layout. | Async HTTP/Session-Read; keine beabsichtigte DB-Mutation; Auth-Guard-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-116 | `tests/e2e/security.spec.ts:30-36` | Test `robots.txt erlaubt Startseite, sperrt Admin` | Playwright; `async ({request}) => Promise<void>` | Liest Robots und prüft Allow/Disallow. | Next `robots()` Route. | Async HTTP-Read; keine DB/OS-Mutation; advisory Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-117 | `tests/e2e/security.spec.ts:38-44` | Test `Security-Header werden gesetzt` | Playwright; `async ({request}) => Promise<void>` | Prüft Frame-, MIME-, HSTS-Header und fehlenden öffentlichen noindex. | Next Headers/Middleware. | Async HTTP-Read; prüft nur Header-Teilmenge; Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-118 | `tests/e2e/security.spec.ts:46-49` | Test `Admin-Bereich sendet noindex` | Playwright; `async ({request}) => Promise<void>` | Prüft `X-Robots-Tag` auf Loginroute. | `nextConfig.headers`. | Async HTTP-Read; keine DB/OS-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-119 | `tests/e2e/security.spec.ts:51-60` | Test `CSP-Nonce pro Request neu` | Playwright; `async ({request}) => Promise<void>` | Sendet zwei parallele Requests und vergleicht Nonces. | Middleware/CSP. | Async parallele HTTP-Reads; XSS-Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-120 | `tests/e2e/security.spec.ts:62-82` | Test `Login-Fehler nach Lockout` | Playwright; `async ({page}) => Promise<void>` | Löscht Attempts, sperrt Admin und prüft blockiertes korrektes Passwort. | Auth/DB-Helfer. | **DB-DESTRUKTIV**; globales Attempt-Delete, Lockout-Upserts/-Updates; Security-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-121 | `tests/e2e/security.spec.ts:84-93` | Test `Client-Error akzeptiert digest/pathname` | Playwright; `async ({request}) => Promise<void>` | Sendet gültigen Body und erwartet 204. | Client-Error-POST. | Async RateLimit-Upsert/Pino-Warnlog; API-/Privacy-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-122 | `tests/e2e/security.spec.ts:95-105` | Test `Client-Error lehnt kaputtes JSON ab` | Playwright; `async ({request}) => Promise<void>` | Sendet unvollständiges JSON und prüft 400. | Client-Error-POST; EXT-111. | Async RateLimit-Mutation vor Parsing; Validationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-123 | `tests/e2e/security.spec.ts:107-117` | Test `Client-Error lehnt falsche Typen ab` | Playwright; `async ({request}) => Promise<void>` | Sendet Array/Object statt Strings und prüft 400. | Client-Error-Zod; EXT-111. | Async RateLimit-Mutation; Validationstest. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-124 | `tests/e2e/security.spec.ts:119-131` | Test `Client-Error lehnt Extrafelder ab` | Playwright; `async ({request}) => Promise<void>` | Sendet zusätzlich message/stack und prüft strikte Ablehnung. | Client-Error-Zod; EXT-111. | Async RateLimit-Mutation; Privacy-/Injection-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-125 | `tests/e2e/security.spec.ts:133-156` | Test `Client-Error rate-limited` | Playwright; `async ({request}) => Promise<void>` | Sendet zehn erlaubte und einen blockierten Request. | Client-Error-Route/RateLimit. | Async elf RateLimit-Mutationen/zehn Warnlogs; Abuse-Control-Test. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-126 | `tests/e2e/helpers/db-cleanup.ts:28-34` | Funktion `cleanupTestContactRequests` | Export; `async () => Promise<void>` | Startet Transaktion zum Löschen von Kontakten mit `E2E-Test`-Vornamen. | Statisch durch vier Specs; EXT-127. | **DB-DESTRUKTIV**; async Prefix-Delete; fremde gleichnamige Daten möglich. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-127 | `tests/e2e/helpers/db-cleanup.ts:29-33` | Transaction `cleanup contacts` | Closure; `async (tx) => Promise<void>` | Führt `contactRequest.deleteMany(startsWith)` aus. | Statisch durch Prisma-Transaktion in EXT-126. | **DB-DESTRUKTIV**; transaktionales DeleteMany. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-128 | `tests/e2e/helpers/db-cleanup.ts:36-55` | Funktion `createTestContactRequest` | Export; `async (data={}) => Promise<TestContactRequest>` | Erzeugt Defaults/Unique-Suffix und startet Insert-Transaktion. | Statisch durch Admin-/Contact-Tests; EXT-129. | Async DB-Insert; Testdaten ähneln Patientendaten. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-129 | `tests/e2e/helpers/db-cleanup.ts:41-54` | Transaction `create contact` | Closure; `async (tx) => Promise<ContactRequest>` | Persistiert Testanfrage und optionales `createdAt`. | Statisch durch Prisma-Transaktion in EXT-128. | Async transaktionaler DB-Insert. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-130 | `tests/e2e/helpers/db-cleanup.ts:57-61` | Funktion `getContactRequestById` | Export; `async (id: string) => Promise<object\|null>` | Liest Request über Primärschlüssel. | Statisch durch Admin-Tests/Polls; Prisma. | Async DB-Read; keine Mutation; Testhelper. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-131 | `tests/e2e/helpers/db-cleanup.ts:63-70` | Funktion `getContactRequestReadState` | Export; `async (id: string) => Promise<boolean\|null>` | Liest ausschließlich `read`. | Statisch durch Admin-Tests/Polls; Prisma. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-132 | `tests/e2e/helpers/db-cleanup.ts:75-79` | Funktion `cleanupLoginAttempts` | Export; `async () => Promise<void>` | Startet Transaktion zum Löschen sämtlicher LoginAttempts. | Statisch durch fünf Specs; EXT-133. | **DB-DESTRUKTIV**; globales Auth-/Lockout-State-Delete. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-133 | `tests/e2e/helpers/db-cleanup.ts:76-78` | Transaction `delete all login attempts` | Closure; `async (tx) => Promise<void>` | Führt unbedingtes `loginAttempt.deleteMany({})` aus. | Statisch durch Prisma-Transaktion in EXT-132. | **DB-DESTRUKTIV**; async globales Delete. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-134 | `tests/e2e/helpers/db-cleanup.ts:81-89` | Funktion `countActiveLoginLocks` | Export; `async () => Promise<number>` | Zählt `lockedUntil > now`. | Statisch durch Parallel-Lockout-Test. | Async DB-Read; zeitabhängiger Security-Testhelper. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-135 | `tests/e2e/helpers/db-cleanup.ts:91-93` | Funktion `countLoginAttempts` | Export; `async () => Promise<number>` | Zählt alle LoginAttempts. | Statisch durch Stale-Cleanup-Test. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-136 | `tests/e2e/helpers/db-cleanup.ts:95-102` | Funktion `getLoginAttemptIdentifiers` | Export; `async () => Promise<string[]>` | Liest Identifier sortiert und mappt Strings. | Statisch durch PII-Identifier-Test; EXT-137. | Async DB-Read sicherheitsrelevanter Hashes. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-137 | `tests/e2e/helpers/db-cleanup.ts:101` | Map `attempt.identifier` | Closure; `(attempt) => string` | Extrahiert Identifier. | Statisch durch `attempts.map` in EXT-136. | Synchron; keine DB/OS-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-138 | `tests/e2e/helpers/db-cleanup.ts:104-112` | Funktion `ageNonLockedLoginAttempts` | Export; `async (updatedAt: Date) => Promise<void>` | Startet Raw-SQL-Update für alle ungesperrten Attempts. | Statisch durch Auth-Stale-Test; EXT-139. | **DB-DESTRUKTIV**; globales Timestamp-Update; Lockout-Semantik gefährdet. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-139 | `tests/e2e/helpers/db-cleanup.ts:105-111` | Transaction `age attempts` | Closure; `async (tx) => Promise<void>` | Führt parameterisiertes UPDATE für alle `locked_until IS NULL` aus. | Statisch durch Prisma-Transaktion in EXT-138. | **DB-DESTRUKTIV**; async globales Raw-SQL-Update. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-140 | `tests/e2e/helpers/db-cleanup.ts:117-121` | Funktion `cleanupRateLimits` | Export; `async () => Promise<void>` | Startet Transaktion zum Löschen aller RateLimits. | Statisch durch Contact-/Chaos-/Security-Specs; EXT-141. | **DB-DESTRUKTIV**; globaler Abuse-Control-State-Verlust. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-141 | `tests/e2e/helpers/db-cleanup.ts:118-120` | Transaction `delete all rate limits` | Closure; `async (tx) => Promise<void>` | Führt unbedingtes `rateLimit.deleteMany({})` aus. | Statisch durch Prisma-Transaktion in EXT-140. | **DB-DESTRUKTIV**; async globales Delete. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-142 | `tests/e2e/helpers/db-cleanup.ts:126-137` | Funktion `cleanupUsersByEmail` | Export; `async (emails: string[]) => Promise<void>` | Normalisiert Liste, beendet leer und löscht passende User. | Statisch durch Admin-/Auth-/Role-Hooks; EXT-143/144. | **DB-DESTRUKTIV**; async User-Delete; Eingrenzung hängt von Konstanten ab. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-143 | `tests/e2e/helpers/db-cleanup.ts:127` | Map `normalize cleanup email` | Closure; `(email: string) => string` | Trimmt und lowercaset E-Mail. | Statisch in EXT-142. | Synchron; keine DB/OS-Mutation; PII-Normalisierung. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-144 | `tests/e2e/helpers/db-cleanup.ts:132-136` | Transaction `delete users by email` | Closure; `async (tx) => Promise<void>` | Löscht User mit E-Mail in normalisierter Liste. | Statisch durch Prisma-Transaktion in EXT-142. | **DB-DESTRUKTIV**; async User-Delete. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-145 | `tests/e2e/helpers/db-cleanup.ts:142-167` | Funktion `ensureTestUser` | Export; `async (data) => Promise<User>` | Hasht Passwort, normalisiert E-Mail und startet Upsert. | Statisch durch Auth-/Admin-/Role-Tests; EXT-146. | **DB-DESTRUKTIV**; kann Credentials/Name/Rolle vorhandener User überschreiben. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-146 | `tests/e2e/helpers/db-cleanup.ts:151-166` | Transaction `upsert test user` | Closure; `async (tx) => Promise<User>` | Upsertet Passwort, Name und Rolle. | Statisch durch Prisma-Transaktion in EXT-145. | **DB-DESTRUKTIV**; kritische Identity-/Authorization-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-147 | `tests/e2e/helpers/db-cleanup.ts:169-174` | Funktion `findUserByEmail` | Lokal; `async (email: string) => Promise<User\|null>` | Normalisiert E-Mail und liest eindeutigen User. | Statisch nur durch EXT-148; Prisma. | Async DB-Read; verarbeitet PII; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-148 | `tests/e2e/helpers/db-cleanup.ts:176-179` | Funktion `userExistsByEmail` | Export; `async (email: string) => Promise<boolean>` | Wrapper um User-Lookup. | Statisch durch Admin-Validierungs-/Rollen-Polls; EXT-147. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-149 | `tests/e2e/helpers/db-cleanup.ts:181-190` | Funktion `updateUserRoleByEmail` | Export; `async (email: string, role: string) => Promise<User>` | Normalisiert E-Mail und startet Rollenupdate. | Statisch durch Stale-/Downgrade-Tests; EXT-150. | **DB-DESTRUKTIV**; direkte Authorization-Mutation ohne Rollenvalidierung. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-150 | `tests/e2e/helpers/db-cleanup.ts:184-189` | Transaction `update user role` | Closure; `async (tx) => Promise<User>` | Aktualisiert Rolle direkt. | Statisch durch Prisma-Transaktion in EXT-149. | **DB-DESTRUKTIV**; async Privilegienänderung. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-151 | `tests/e2e/helpers/db-cleanup.ts:195-198` | Funktion `contactRequestExists` | Export; `async (firstName: string) => Promise<boolean>` | Ruft Count-Helfer auf und prüft größer null. | Statisch durch Contact-/Chaos-Tests; EXT-152. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-152 | `tests/e2e/helpers/db-cleanup.ts:200-205` | Funktion `countContactRequestsByFirstName` | Export; `async (firstName: string) => Promise<number>` | Zählt Kontakte mit exaktem Vornamen. | Statisch durch EXT-151/Double-Click-Test. | Async DB-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-153 | `tests/e2e/helpers/db-cleanup.ts:207-212` | Funktion `findLatestContactRequestByFirstName` | Export; `async (firstName: string) => Promise<object\|null>` | Liest jüngsten passenden Kontakt. | Statisch durch erfolgreichen Contact-Test. | Async DB-Read potenziell personenbezogener Felder. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-154 | `tests/e2e/helpers/db-cleanup.ts:214-218` | Funktion `snapshotAuditLogs` | Export; `async () => Promise<AuditLog[]>` | Liest komplette Audit-Tabelle chronologisch. | Statisch durch Audit-UI-Test. | Async globaler Audit-Read; Privacy-/Speicherrisiko. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-155 | `tests/e2e/helpers/db-cleanup.ts:220-237` | Funktion `restoreAuditLogs` | Export; `async (snapshot) => Promise<void>` | Startet Transaktion zum vollständigen Ersetzen der Audit-Tabelle. | Statisch durch Audit-UI-Test; EXT-156/157. | **DB-DESTRUKTIV**; Concurrent-Logs können verloren gehen. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-156 | `tests/e2e/helpers/db-cleanup.ts:221-236` | Transaction `restore audit logs` | Closure; `async (tx) => Promise<void>` | Löscht alle Logs und legt Snapshot per `createMany` neu an. | Statisch durch Prisma-Transaktion in EXT-155. | **DB-DESTRUKTIV**; async globales Delete/Recreate; Audit-Integrität. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-157 | `tests/e2e/helpers/db-cleanup.ts:226-234` | Map `audit snapshot row` | Closure; `(log) => audit data` | Kopiert alle persistierbaren Snapshotfelder. | Statisch durch `snapshot.map` in EXT-156. | Synchron; keine eigene DB/OS-I/O; repliziert IDs/Zeitstempel. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-158 | `tests/e2e/helpers/db-cleanup.ts:239-250` | Funktion `createTestAuditLog` | Export; `async (data={}) => Promise<AuditLog>` | Startet Audit-Insert mit Defaults. | Statisch durch Audit-UI-Test; EXT-159. | Async privilegierter AuditLog-Insert. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-159 | `tests/e2e/helpers/db-cleanup.ts:240-249` | Transaction `create audit log` | Closure; `async (tx) => Promise<AuditLog>` | Persistiert AuditLog. | Statisch durch Prisma-Transaktion in EXT-158. | Async transaktionaler DB-Insert. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |
| EXT-160 | `tests/e2e/helpers/db-cleanup.ts:252-262` | Funktion `findLatestAuditLogByActionAndDetail` | Export; `async (action, detailFragment) => Promise<AuditLog\|null>` | Sucht jüngsten Audit nach Aktion und Detailfragment. | Statisch durch Delete-Tests; Prisma. | Async AuditLog-Read; keine Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-161 | `tests/e2e/helpers/db-cleanup.ts:267-269` | Funktion `disconnectPrisma` | Export; `async () => Promise<void>` | Trennt globalen Prisma-Client. | Statisch durch alle Spec-`afterAll`-Hooks. | Async DB-Verbindungs-/OS-Socket-Cleanup; kann Prozessmitnutzer betreffen. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-162 | `prisma/seed.ts:14-35` | Funktion `getSeedCredentials` | Lokal; `() => { email: string; password: string }` | Liest/normalisiert Env und erzwingt Präsenz, Länge, Komplexität sowie Nicht-Default. | Statisch durch EXT-163; `process.env`, Regex, Weak-Set. | Synchron; liest Secrets; wirft bei Fehler; keine DB/OS-Mutation; Seed-Security-Gate. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-163 | `prisma/seed.ts:37-58` | Funktion `main` | Lokal; `async () => Promise<void>` | Liest Credentials, bcrypt-hasht, upsertet Admin und loggt User-ID. | Statisch durch Top-Level `main()`; Prisma, bcrypt, Pino; EXT-162/164. | **DB-DESTRUKTIV**; async überschreibt Admin-Passwort/Rolle; externe DB/Logging. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-164 | `prisma/seed.ts:41-52` | Transaction `admin upsert` | Closure; `async (tx) => Promise<User>` | Upsertet Admin; Update ändert Passwort/Rolle, Create zusätzlich Name. | Statisch durch Prisma-Transaktion in EXT-163. | **DB-DESTRUKTIV**; async kritische Identity-Mutation in Transaktion. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: kritisch. |
| EXT-165 | `prisma/seed.ts:61-64` | Promise-Catch `seed failure` | Closure; `(error: unknown) => void` | Loggt Fehler strukturiert und setzt Exitcode 1. | Statisch in Top-Level-Promise-Kette; Pino. | Synchroner Callback nach Rejection; OS-Prozessstatus/Logging; Redaction loggerabhängig. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-166 | `prisma/seed.ts:65-68` | Promise-Finally `seed cleanup` | Closure; `async () => Promise<void>` | Trennt Prisma und beendet PG-Pool unabhängig vom Ergebnis. | Statisch in Top-Level-Promise-Kette. | Async DB-/OS-Socket-Cleanup; keine Datenmutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-167 | `scripts/run-local-env.mjs:11-13` | Funktion `writeLine` | Lokal; `(message) => void` | Schreibt Nachricht plus Zeilenumbruch nach stdout. | Statisch durch Top-Level-Statusausgabe; `process.stdout`. | Synchron; OS-Terminalausgabe; DB-Zielmetadaten vorher redigiert. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-168 | `scripts/run-local-env.mjs:15-17` | Funktion `writeError` | Lokal; `(message) => void` | Schreibt Nachricht nach stderr. | Statisch durch EXT-169/172; `process.stderr`. | Synchron; OS-Terminalausgabe; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: niedrig. |
| EXT-169 | `scripts/run-local-env.mjs:19-22` | Funktion `fail` | Lokal; `(message) => never` | Gibt Fehler aus und beendet Prozess mit Status 1. | Statisch durch alle Guard-Fehlerpfade; EXT-168. | Synchron; OS-Prozessabbruch; verhindert unsichere Toolausführung. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-170 | `scripts/run-local-env.mjs:24-36` | Funktion `redactTarget` | Lokal; `(databaseUrl) => metadata` | Parst URL und liefert Host/DB/Protokoll, redigierten User und Passwort-Präsenz. | Statisch durch Top-Level-DB-Guard; `URL`. | Synchron; keine Netzwerk/DB-I/O; kann werfen; schützt Credentials in Logs. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-171 | `scripts/run-local-env.mjs:61` | Filter `missing env` | Closure; `(key: string) => boolean` | Markiert erforderliche Variablen ohne truthy Prozesswert. | Statisch durch `requiredEnv.filter`; `process.env`. | Synchron; liest Env/Secrets ohne Ausgabe; keine DB/OS-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-172 | `scripts/run-local-env.mjs:136-143` | Event-Callback `child exit` | Closure; `(code, signal) => never` | Übersetzt Signal in Exit 1, sonst propagiert Child-Exitcode. | Framework-registriert durch `child.on("exit")`; Node ChildProcess. | Async Event; OS-Prozessende/stderr; kein `error`-Listener; keine DB-Mutation. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: mittel. |
| EXT-173 | `next.config.ts:7-51` | Config-Callback `nextConfig.headers` | Exportiertes Objektmethodenfeld; `async () => Promise<header rules>` | Baut globale Security-Header und Admin-`X-Robots-Tag`-Regel. | Framework-registriert durch Next-Konfigurationsloader. | Async ohne I/O; keine DB/OS-Mutation; beeinflusst globale Browser-Sicherheitsgrenzen. | **Implemented**; Runtime/Testausführung: **Unknown**; Risiko: hoch. |

**Kontrollsumme außerhalb von `src/`: 173/173**

### 30.3 Factory-, Befehls- und nicht ausführbare Symbolreferenz

Die 396 AST-Körper bestehen aus 223 `SRC-*`- und 173 `EXT-*`-Zeilen. Zusätzlich existieren ein factory-erzeugter NextAuth-Handler ohne projektgeschriebenen Funktionskörper und 16 npm-Kommandoregistrierungen. Damit sind **413 ausführbare Registrierungen** dokumentiert; nur **396** davon sind projektgeschriebene Funktions-/Methoden-/Callback-Körper. Die Kommandos besitzen jeweils eine eigene Zeile in Abschnitt 27.1.

| Symbol | Art/Position/Export | Vertrag und Verwendung | Status/Grenze |
|---|---|---|---|
| `handler`, `GET`, `POST` | Factorybindung, `src/app/api/auth/[...nextauth]/route.ts:3-6`, GET/POST exportiert | `NextAuth(authOptions)` erzeugt den gemeinsamen Catch-all-Handler; keine projektgeschriebene Body-Implementierung. | **Implemented**, Frameworkverhalten zur Laufzeit **Unknown** |
| Root-`metadata` | `Metadata`, `src/app/layout.tsx:15-26`, exportiert | Title, Description, OpenGraph-Text/URL/Locale; kein Bild. | **Implemented** |
| Legal-`metadata` | je `Metadata`, `impressum/page.tsx:5-7`, `datenschutz/page.tsx:5-7` | routenspezifischer Titel. | **Implemented** |
| `dynamic` | Stringkonstante, `admin/(protected)/page.tsx:6`, exportiert | erzwingt dynamisches Adminrendering. | **Implemented** |
| Middleware-`config` | Objekt, `src/middleware.ts:58-66`, exportiert | Matcher schließt Next-Assets, Favicon, Robots, Sitemap und Prefetch aus. | **Implemented**; Sitemap selbst fehlt |
| `authOptions` | `NextAuthOptions`, `src/lib/auth.ts:68-300`, exportiert | Credentials-Provider, JWT-Strategie mit acht Stunden `maxAge`, Seiten, Callbacks und Secret. | **Implemented**; zentraler Securityvertrag |
| `ERROR_MESSAGES` | readonly Objekt, `src/lib/schemas.ts:8-44`, exportiert | deutsche, clientgeeignete Action-/Validierungsfehler. | **Implemented**; zwei Einträge ungenutzt |
| `contactFormSchema` | Zod-Objekt, `schemas.ts:106-126`, exportiert | strikter öffentlicher Kontaktvertrag. | **Implemented** |
| `createUserSchema` | Zod-Objekt, `schemas.ts:128-138`, exportiert | Name/E-Mail/Passwort für Staffanlage. | **Partially implemented**; nicht `.strict()`, kein Passwortmaximum |
| `actionIdSchema` | Zod-Preprocess, `schemas.ts:144-147`, exportiert | bereinigte nichtleere ID bis 191. | **Implemented** |
| `actionCursorSchema` | optionales ID-Schema, `schemas.ts:149`, exportiert | Kontaktcursor. | **Implemented** |
| `contactRequestMutationSchema` | strict Zod-Objekt, `schemas.ts:151-170`, exportiert | 1–50 eindeutige IDs, drei Aktionen. | **Implemented** |
| `clientErrorLogSchema` | strict Zod-Objekt, `schemas.ts:172-177`, exportiert | optionaler Digest/Pfad. | **Partially implemented**; Digest bleibt clientkontrollierter Logtext |
| `EUROPEAN_COUNTRY_CODES` | readonly Tupelliste, `src/lib/country-codes.ts:1-47`, exportiert | 45 Vorwahllabels; Quelle für UI und Zod-Enum. | **Implemented** |
| `ContactRequestType`, `ContactReachability` | Uniontypen, `src/content/data.ts:1-2`, exportiert | vier Anliegen- und drei Erreichbarkeitswerte. | **Implemented** |
| `NavigationLink`, `ContactOption`, `PublicContent` | lokale Interfaces, `src/content/data.ts:4-122` | typisieren zentrale Inhaltsstruktur. | **Implemented** |
| `publicContent` | Objekt, `src/content/data.ts:124-257`, exportiert | Praxis-/Kontakt-/Navigations-/Metadata-/Rechtstexte und Actionlabels. | **Implemented**; einzelne Properties ungenutzt |
| `ContactRequest` | UI-Interface, `src/components/admin/types.ts:1-10`, exportiert | serialisiertes Kontakt-DTO ohne `gdprConsent`. | **Partially implemented**; Server liefert mehr Felder |
| `UserAccountRole` | Union, `src/components/admin/types.ts:12`, exportiert | `admin\|staff\|unknown`. | **Implemented** |
| `UserAccount` | UI-Interface, `admin/types.ts:14-20`, exportiert | passwortfreier Benutzertransport. | **Implemented** |
| `AuditLogEntry` | UI-Interface, `admin/types.ts:22-29`, exportiert | serialisiertes Auditlog. | **Implemented** |
| `DashboardTab` | Union, `src/components/admin/types.ts:31`, exportiert | `requests\|users\|logs`. | **Implemented** |
| `ACTION_LABELS` | Record, `admin/types.ts:33-38`, exportiert | deutsche Labels für vier Auditaktionen. | **Implemented**; DB kann weitere Strings enthalten |
| `ButtonProps`, `InputProps`, `TextareaProps` | Interfaces, `components/ui/*.tsx` | native Props plus Buttonvarianten/`asChild`. | **Implemented** |
| `buttonVariants` | CVA-Konfiguration, `button.tsx:6-35`, exportiert | sechs Varianten, fünf Größen, Defaults. | **Obsolete or unused** als öffentlicher Export; intern vom `Button` genutzt |
| NextAuth-Augmentierungen | `src/types/next-auth.d.ts:4-23` | `User.role?`, `Session.user.id/role`, `JWT.id/role`. | **Implemented**; Runtimevalidierung separat |
| `logger` | Pino-Instanz, `src/lib/logger.ts:11-44`, exportiert | Level, Redaction, Serializer, Zeitformat. | **Implemented** |
| `pool` | `pg.Pool`, `src/lib/prisma.ts:50-55`, exportiert | max fünf Connections, Timeouts, Singleton in Dev. | **Implemented**; reale Verbindung **Unknown** |
| `prisma` | `PrismaClient`, `src/lib/prisma.ts:74-79`, exportiert | zentraler ORM-Client. | **Implemented**; generierter Client fehlt aktuell |
| `TRUSTED_IP_ERROR_CODE` | Stringkonstante, `src/lib/client-ip.ts:3`, exportiert | Code der Fehlerklasse. | **Obsolete or unused** außerhalb der eigenen Klasse |
| `ContactRequestMutationNotFoundError` | lokale leere Fehlerklasse, `actions/contact.ts:22` | domänenspezifisches Count-Mismatch-Signal. | **Implemented**; geerbter Defaultkonstruktor, kein eigener Body |
| Prisma-Modelle | deklarative Modelle, `prisma/schema.prisma:13-80` | `ContactRequest`, `User`, `LoginAttempt`, `AuditLog`, `RateLimit`; alle Felder in Abschnitt 19. | **Implemented** als Schema; deployter Zustand **Unknown** |
| Root-Konfigurationsobjekte | `next.config.ts`, `playwright.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `prisma.config.ts`, `eslint.config.mjs`, `tsconfig.json` | Build-, Header-, Test-, CSS-, Prisma-, Lint- und Compilerverträge. | **Implemented** als Konfiguration; Laufzeitprüfung **Unknown** |
| 16 npm-Skripte | `package.json:5-21` | individuelle Befehle und Sicherheitsklassifikation in Abschnitt 27.1. | **Implemented** als Registrierungen; Ausführung **Unknown** |

## 31. Aufrufgraph, Abhängigkeitskarte und Änderungsfolgen

### 31.1 Statisch bestätigte Hauptpfade

```mermaid
flowchart TD
    Home["HomePage"] --> Public["Navbar / Hero / About / Schedule / Footer / CookieBanner"]
    Home --> CF["ContactForm"]
    CF --> SCF["submitContactForm"]
    SCF --> IP["getClientIp"]
    SCF --> RL["checkRateLimitDb"]
    SCF --> CS["contactFormSchema"]
    SCF --> DB1["ContactRequest"]

    Login["AdminLoginPage"] --> NA["NextAuth factory handler"]
    NA --> Auth["authOptions.authorize"]
    Auth --> IP
    Auth --> DB2["LoginAttempt / User / AuditLog"]
    Auth --> JWT["jwt / session callbacks"]
    JWT --> Session["getCachedSession"]

    Admin["ProtectedAdminLayout / AdminDashboardPage"] --> Session
    Admin --> Reads["getContactRequests / getUsers / getAuditLogs"]
    Reads --> Dashboard["AdminDashboardClient"]
    Dashboard --> Requests["RequestsTab → mutateContactRequests"]
    Dashboard --> Users["UsersTab → createUser / deleteUser"]
    Dashboard --> Logs["LogsTab"]

    GE["GlobalError"] --> CE["POST /api/log/client-error"]
    CE --> IP
    CE --> RL
    CE --> Logger["Pino logger"]
```

Pfeile im Diagramm sind statisch durch Importe/Aufrufe oder ausdrücklich durch Next-/React-/NextAuth-Registrierung bestätigt. Nicht determinierbar sind konkrete Runtime-Unterroute des NextAuth-Catch-all-Handlers, Hostingaufrufer, Logkonsumenten und externe DB-Trigger.

### 31.2 Framework-Registrierungen

| Registrierung | Eigentümer → Ziel | Beziehungsart |
|---|---|---|
| Next App Router | Dateipfade unter `src/app` → Seiten/Layouts/Route Handler | **Framework-registriert** |
| Next Middleware | `src/middleware.ts` + `config.matcher` → gematchte Requests | **Framework-registriert** |
| Server Actions | `"use server"`-Exporte → Next-Actiontransport | **Framework-registriert** |
| NextAuth | Factoryroute → `authOptions` → Provider/Callbacks | **Framework-registriert** |
| React | Komponenten → Effects/Eventhandler/Transitions/Timer-Cleanups | **Framework-registriert** |
| Prisma | Schema → generierter Client → Pooladapter | **Framework-registriert**, Client aktuell fehlend |
| npm | Skriptname → Shellkommando | Konfiguration-registriert |
| Playwright | `describe`/Hooks/Tests + Configprojekte | **Framework-registriert** |

### 31.3 Änderungsfolgenmatrix

| Änderungspunkt | Direkt betroffene Verbraucher | Sekundäre Folgen und erforderliche Prüfung | Risiko |
|---|---|---|---|
| `prisma/schema.prisma` | generierter Client, Prisma-Runtime, Actions, Auth, Seed, DB-Helper | Raw SQL in `rate-limit.ts`/Helper, `db push`, DTOs, Tests; keine Migration als Sicherheitsnetz | hoch |
| `User.role`/`normalizeRole` | Authorize, JWT, Session, Guards, Dashboard, Userdelete | DB-Freieinträge, Typaugmentation, Rollen-E2E | kritisch |
| Lockoutkonstanten/Bucketbildung | Authtransaktion, Loginfehler, Cleanup, Auth-/Securitytests | Abuse-Schutz, PII-Hashsemantik, parallele Transaktionen | kritisch |
| `getClientIp`/Proxyflags | Login, Kontakt, Clientfehlerroute | drei Schutzmechanismen können fail-open/closed oder global gebucketet werden | kritisch |
| `contactFormSchema` | Action, UI-Annahmen, Persistenznachricht, Tests | Contentoptions und Telefonnummernnormalisierung synchronisieren | hoch |
| `publicContent.contact.*Options` | UI-Selects und `buildContactMessage` | neue Werte müssen im Zod-Whitelistvertrag ergänzt werden | mittel |
| `getContactRequests`-DTO | Dashboardstate, RequestsTab, Pagination | Datenminimierung, Datumsserialisierung, Stats, mobile Tests | hoch |
| `contactRequestMutationSchema` | RequestsTab/Bulk, Transaktion, Audit | UI-Maximum, Countguard, stale-/atomare Tests | hoch |
| User-Action-Schemas | UsersTab, bcrypt, Audit | Seed-Policyabgleich, E-Mail-Normalisierung, Error-Mapping | hoch |
| `getAuditLogs`/Aktionscodes | LogsTab, `ACTION_LABELS`, Datenschutzretention | DB-Freieinträge, Pagination/Retentiontests | mittel |
| `checkRateLimitDb` | Kontakt und Clientfehlerroute | Raw SQL/Schema, Cleanupfenster, NAT-Verhalten, Testisolation | kritisch |
| `src/middleware.ts` CSP | alle gematchten Routen, Next Scripts/Styles/Fonts | Securityheader-E2E, Browserkonsole, dynamisches RootLayout | kritisch |
| `next.config.ts` Header | alle Routen/Admin-SEO | Proxyheader-Duplikate, HSTS/Framing/Permissions-Tests | hoch |
| `src/lib/logger.ts` | alle Serverfehler/Seed | PII-Redaction, Deployment-Sink, Error-Serialisierung | hoch |
| `run-local-env.mjs` | sechs `*:local`-Skripte | Test-/DB-Sicherheitsgrenze, plattformabhängige Toolpfade | kritisch |
| Playwright-DB-Helper | alle sieben Specs | reale Datenintegrität, parallele Prozesse, globale Securitytabellen | kritisch |
| Next-/React-/ESLint-Versionen | Build, Runtime, Actions, Tests, Lint | Major-Kompatibilität, interne Action-Interception, Typen | hoch |

## 32. TODOs, FIXMEs, Stubs, Dead Code und technische Schulden

### 32.1 Explizite Marker und geplante Elemente

Repository-weite Suche fand keine projekt-eigenen `TODO`, `FIXME`, `HACK` oder `XXX`-Marker in ausführbarem Quellcode. Zwei Kommentare beschreiben zukünftige Optionen:

- **Planned only:** potenzielle i18n-Migration für Fehlermeldungen (`src/lib/schemas.ts:4-6`); keine Locale-/Übersetzungsinfrastruktur.
- **Planned only:** Redis/Upstash bei >1000 Requests/min (`src/lib/rate-limit.ts:8-10`); keine Abhängigkeit oder Konfiguration.

### 32.2 Nachweislich ungenutzt oder verwaist

| Symbol/Konfiguration | Status | Evidenz und Konsequenz |
|---|---|---|
| `ERROR_MESSAGES.unauthorized`, `.adminOnly` | **Obsolete or unused** | nur Definition `schemas.ts:32-33`, keine Referenz |
| `publicContent.practice.city`, `address.postalCode` | **Obsolete or unused** | Definitionen `data.ts:19,27,129,137`, keine Propertynutzung |
| öffentlicher Export `buttonVariants` | **Obsolete or unused** außerhalb des Moduls | intern von `Button`, kein externer Import |
| Export `TRUSTED_IP_ERROR_CODE` | **Obsolete or unused** außerhalb `client-ip.ts` | wird nur zur Klasseninitialisierung verwendet |
| Tailwind `darkMode: ["class"]` | **Obsolete or unused** | keine `dark:`-Klasse/Themeumschaltung |
| Sitemap-Matcher/-Angabe | **Partially implemented** | Middleware/Robots referenzieren Sitemap, Route fehlt |
| Logger-Trace-ID-Kommentar | **Planned only** | keine ID-Erzeugung, Propagation oder Bindings |

### 32.3 Unfertige und gekoppelte Bereiche

- Retention ist requestgetrieben statt zeitgesteuert; der per-Key-Rate-Cleanup ist auf dem Erfolgsweg logisch wirkungslos.
- Login-Bucket-Kommentar/Architektur suggeriert Accountschutz, Code bindet an User-Agent/IP.
- Das Contact-DTO ist impliziter Prisma-Spread statt explizitem `select`/Mappervertrag.
- `createUserSchema`, Seed und UI pflegen unterschiedliche Passwort-/Strictnessregeln.
- Dashboard verschluckt Teilfehler in Leerlisten und nennt seitenlokale Zahlen wie Gesamtwerte.
- UI-Inhalte sind nur teilweise zentralisiert; About-, Hero-, Schedule- und Footertexte können gegen `publicContent` driften.
- Keine Migrationen, Typecheck-/Unit-/Coverage-Skripte, CI, Healthchecks oder automatisierte Ops-Artefakte.
- Mehrere Kommentare sind entgegen `AGENTS.md` englisch oder gemischtsprachig; Codeidentifier sind korrekt Englisch.
- Testhelper und unguarded Befehle bilden eine gefährliche, unfertige Testumgebungsgrenze.
- `.gitignore` ignoriert `playwright-report/` und `test-results/` nicht (`.gitignore:1-39`), obwohl beide generierten Verzeichnisse vorhanden und nur in `eslint.config.mjs:11-12` ausgeschlossen sind.

## 33. Sicherheits-, Betriebs-, Zuverlässigkeits- und Wartungsrisiken

Die Priorität ist eine statische Risikoeinschätzung, keine Aussage über bereits erfolgte Ausnutzung. Vorgeschlagene Kontrollen sind Dokumentation, nicht umgesetzt.

| Prio | Risiko | Beleg | Mögliche Wirkung | Erforderliche zukünftige Kontrolle |
|---|---|---|---|---|
| kritisch | E2E kann externe/produktive Daten verändern | `package.json:19-21`, `playwright.config.ts:1,33-37`, globale Helperlöschungen | Verlust von Lockouts, Rate-Limits, Audits oder Benutzerzustand | zwingende disposable DB-ID, serverseitiger Testmode, kein fremder Server-Reuse, namespaced Fixtures |
| hoch | Account-Lockout durch User-Agent-Rotation umgehbar | `auth.ts:96-102` | Brute Force erhält neue beide Buckets | accountglobaler stabiler Bucket plus getrenntes IP-/Gerätebudget |
| hoch | Unguardete `prisma:push`/`prisma:seed`-Befehle | `package.json:14,17` | Schema-/Adminmutation auf ambient Ziel | prod-sichere Zielbestätigung, getrennte Credentials/Runbooks |
| hoch | Authinputs ohne Längencaps | `auth.ts:76-101,143-145` | CPU-/Memory-/DB-Ressourcenmissbrauch vor bcrypt/Hash/Query | harte Byte-/Zeichenlimits vor jeder teuren Operation |
| hoch | bcrypt innerhalb offener Transaktion/Poolgröße fünf | `src/lib/auth.ts:103-145`, `src/lib/prisma.ts:50-55` | Connection-Starvation/DoS unter Loginlast | Transaktionsdesign und Lasttest prüfen |
| hoch | Kontakt-PII ohne technische Retention | `ContactRequest`, einzige Löschung `mutateContactRequests` | unbegrenzte Speicherung sensibler Anliegen | fachliche Frist, Scheduler, Lösch-/Legal-Hold-Prozess |
| hoch | Clientdigest wird frei geloggt | `schemas.ts:172-177`, `client-error/route.ts:69-75` | PII/Log-Injection-Inhalt im externen Logsystem | servergenerierte Codes oder enge Form/Hash statt Freitext |
| hoch | Kontaktread serialisiert unnötiges Consentfeld | `actions/contact.ts:105-114`, `admin/types.ts:1-10` | Datenminimierungsverstoß/DTO-Drift | explizites `select` und getesteter DTO-Vertrag |
| hoch | Keine versionierten Migrationen/Driftkontrolle | `.gitignore:38`, fehlendes `prisma/migrations` | nicht reproduzierbare Deployments/Rollbacks | akzeptierte Schemahistorie oder automatisierter Driftcheck |
| hoch | Proxyfehlkonfiguration betrifft drei Schutzpfade | `client-ip.ts:29-58` | Spoofing, globales Blocking oder Fail-closed-Ausfall | deployspezifische Header-/Proxytests und IP-Validierung |
| hoch | Rohe IP in `RateLimit` und schwache Retention | `rate-limit.ts:31-85` | Datenschutz-/Korrelationsexposition | keyed Hash/Minimierung und garantierter Cleanup |
| hoch | Rollen/Auditaktionen ohne DB-Constraint | `schema.prisma:35,61` | ungültige/privilegienrelevante externe Werte | DB-Check/Enum oder kontrollierter Schreibzugang plus Driftmonitor |
| hoch | Seed überschreibt Adminrolle/-passwort ohne Audit | `prisma/seed.ts:41-52` | unerwartete Zugangsdrehung/Privilegienänderung | idempotenter Bootstrap mit expliziter Rotation/Audit |
| mittel | Rate-Budget vor Honeypot/Validierung | `actions/contact.ts:47-65`, Route `:36-64` | Bots/Invalidinput erschöpfen NAT-Budget | Validierungsreihenfolge und separate Missbrauchsbudgets prüfen |
| mittel | Rate per-Key-Cleanup normal wirkungslos | `rate-limit.ts:36-67` | Sicherheitsmetadaten bleiben länger | Cleanup nach altem State korrekt modellieren oder Scheduler |
| mittel | Audit-Retention nur bei Adminread | `actions/logs.ts:11-27` | Logs verbleiben unbegrenzt/alte Zeilen einmal sichtbar | periodischer verifizierter Retentionjob |
| mittel | Login-Cleanup fire-and-forget | `auth.ts:225-246` | Serverless-Abbruch lässt stale Buckets | `after()`/Queue/Scheduler mit Monitoring |
| mittel | Dashboard-Teilfehler erscheinen leer | `admin/(protected)/page.tsx:26-44` | Bediener trifft Entscheidungen auf unvollständigen Daten | expliziter Partial-error-State/Retry |
| mittel | Statistiken sind nur seitenlokal | `getContactRequests take:50`, Dashboard/Requests-Filter | irreführende Betriebszahlen | separate Aggregation oder eindeutige Bezeichnung |
| mittel | Telefon-Normalisierung ist DE-zentriert | `contact-form.tsx:55-70,264-290` | falsche internationale Rückrufnummern | länderspezifische Normalisierung/Testmatrix |
| mittel | Fehlertext-/Limitdrift 2000 vs 1900 | `schemas.ts:17,71,120-123` | falsche Nutzererwartung/Wartungsfehler | eine gemeinsame Konstante/Meldungsableitung |
| mittel | TLS nicht erzwungen | `src/lib/prisma.ts:22-36` | unverschlüsselte/zu schwach validierte DB-Verbindung möglich | Produktion `verify-full` hart prüfen |
| mittel | Logger-Redaction nicht vollständig beweisbar | `logger.ts:14-38`, Pino-Error-Serializer | PII in Errorstack/Message | strukturierte Fehlerklassifikation, Logtests, Sinkkontrollen |
| mittel | Kein Web-Graceful-Shutdown/Healthcheck | `prisma.ts`, nur Seed `:65-68` | unklare Drain-/Poolzustände und Orchestratorerkennung | Signalhandler/Frameworkhook und Readinessprobe |
| mittel | Next 15 versus ESLint-Config 16 | `package.json:36,58`, Lockfile | Lint-/Regeldrift oder Installationsfehler | kompatible Versionsmatrix und CI-Lint |
| mittel | Keine CI/Build-/Typecheck-Evidenz | fehlende CI, `node_modules`, Client | Regressionen unentdeckt | reproduzierbare Pipeline auf isolierter Umgebung |
| niedrig | Navbar/Passwort/Animation-A11y-Lücken | `navbar.tsx`, Login/Users, Motion-Dateien | erschwerte Tastatur-/Screenreader-/Motion-Nutzung | A11y-Audit und Reduced-Motion-Pfad |
| niedrig | Playwright-Ausgaben nicht in `.gitignore` | `.gitignore:1-39`, vorhandene Outputverzeichnisse | versehentlich versionierte stale/umfangreiche Artefakte | Outputverzeichnisse bewusst ignorieren oder Artefaktpolicy festlegen |

## 34. Widersprüche zwischen Code, Konfiguration und Dokumentation

| Behauptung/Quelle | Tatsächlicher Codebefund | Bewertung |
|---|---|---|
| `ARCHITECTURE.md:367`: keine clientkontrollierten Freitexte im Logging | `digest` ist ein beliebiger bereinigter String bis 255 und wird direkt geloggt (`schemas.ts:172-177`, Route `:69-75`). | Architektur überzeichnet Schutz. |
| Architektur/Kommentare: E-Mail-/Account-Bucket | E-Mail-Identifier enthält zusätzlich IP und User-Agent (`auth.ts:96-102`). | Kein accountglobaler Bucket. |
| Architektur: strikte Boundary-Schemas | `createUserSchema` endet ohne `.strict()` (`schemas.ts:128-138`). | Zusatzfelder werden still entfernt. |
| `ARCHITECTURE.md:248`: per-Key-Cleanup entfernt abgelaufene Buckets | UPsert setzt `last_reset=NOW()` vor After-Ausführung (`rate-limit.ts:36-67`). | Normaler Erfolgsweg erfüllt Löschprädikat nicht. |
| `ARCHITECTURE.md:380`: Auditlogs automatisch nach sechs Monaten gelöscht | Cleanup wird nur durch Adminread und `after()` ausgelöst (`actions/logs.ts:8-32`). | Reaktiv, keine harte Automatik. |
| Datenschutz-/Minimierungsabsicht | Kontaktread spreadet alle Modellfelder einschließlich `gdprConsent` (`actions/contact.ts:105-114`). | unnötige Serialisierung. |
| Fehlermeldung: maximal 2000 Zeichen | Schema/UI begrenzen Details auf 1900 (`schemas.ts:17,71,120-123`, ContactForm). | Nutzertext falsch. |
| `playwright.config.ts:27-29`: 3 Requests/Minute | Defaultcode ist drei pro Stunde (`rate-limit.ts:13-14`). | Kommentar falsch. |
| `rate-limit.ts:47`: `cuid()`-Fallback | ID ist `Math.random()` plus `Date.now()` (`:48`). | Kommentar falsch, kein Prisma-CUID. |
| `schema.prisma:70-71`: RateLimit fürs Kontaktformular | gleiche Tabelle schützt auch `/api/log/client-error`. | Schema-Kommentar unvollständig. |
| `logger.ts:8-9`: non-blocking und Trace-ID-Unterstützung | keine Transport-/Trace-ID-Erzeugung oder -Propagation. | nicht durch Projektcode belegt. |
| `src/lib/prisma.ts:57`: Warmup in `ARCHITECTURE.md §4` dokumentiert | entsprechender Architekturabschnitt beschreibt den konkreten Warmup nicht. | Verweis veraltet/unpräzise. |
| `.env.example:11`: `ADMIN_*` nur für Seeding | fünf Specs lesen dieselben Variablen; Role-Spec überschreibt bezeichneten User. | Kommentar zu eng. |
| Wrappertext: „lokale Testdatenbank“ | geprüft werden Loopbackhost, vorhandener Name/User/Passwort, nicht Test-/Disposable-Semantik (`run-local-env.mjs:38-97`). | Schutzbehauptung stärker als Guard. |
| README: DSGVO-konform | technische und organisatorische Deployment-/Retentionfakten sind teilweise **Unknown**; konkrete Lücken in Abschnitt 21. | absolute Rechtsbehauptung nicht beweisbar. |
| README-Nginx: `public/`, `SAMEORIGIN` | `public/` fehlt; aktive Next-Header setzen `DENY` (`next.config.ts:13`). | Betriebsbeispiel driftet. |
| README: Ubuntu-Betrieb | Playwright startet `npm.cmd run dev` (`playwright.config.ts:34`). | E2E-Konfiguration ist Windows-spezifisch. |
| Robots/Middleware erwähnen Sitemap | keine `sitemap.ts`/XML-Datei vorhanden. | **Partially implemented**. |
| Testoutput meldet bestanden | Report hat sechs Specs/30 expected, aktueller Code sieben Specs/44 Fälle/71 Projektausführungen. | Artefakt ist stale und kein aktueller Erfolgsbeleg. |

## 35. Glossar

| Begriff | Projektspezifische Bedeutung |
|---|---|
| Action/Server Action | mit `"use server"` exportierte Next-Funktion; sieben fachliche Operationen in `src/lib/actions`. |
| Admin | normalisierte Rolle mit Kontakt-, Benutzer- und Auditberechtigung. |
| Staff/Mitarbeiter | normalisierte Rolle mit Kontakt-Dashboard, ohne Benutzer-/Auditverwaltung. |
| Bucket | persistenter LoginAttempt- oder RateLimit-Zähler für einen gehashten beziehungsweise namespaced Kontext. |
| CSP | Content Security Policy aus `src/middleware.ts`, je Request mit Nonce. |
| CUID | Prisma-ID-Default; die Runtime-RateLimit-ID mit Präfix `cuid_` ist kein echter Prisma-CUID. |
| DTO | an Clientkomponenten serialisierte Datenform in `src/components/admin/types.ts`. |
| Fail-closed | fehlende/verfälschte Voraussetzung führt zu Ablehnung, etwa ungültige Rolle, DB-Sessionfehler oder fehlende Produktions-IP. |
| Honeypot | verborgenes Kontaktfeld; nichtleer führt zu vorgetäuschtem Erfolg ohne Kontaktanlage. |
| Lockout | 15-minütige Login-Sperre nach Schwellwert im `LoginAttempt`-Modell. |
| Nonce | einmaliger CSP-Scriptwert aus UUID/Base64 pro Middleware-Request. |
| PII | personenbezogene Informationen wie Name, E-Mail, Telefon, IP und Anliegen. |
| Pseudonym | ersetzender Hash/Identifier, der mit Zusatzwissen korrelierbar bleibt; Loginidentifier sind nicht anonym. |
| RSC | React Server Component; servergerenderte Next-Komponente ohne `"use client"`. |
| Retention | Aufbewahrungs-/Löschverhalten; hier teils manuell oder requestgetrieben. |
| Route Group | Next-Verzeichnis in Klammern, hier `(protected)`, beeinflusst Layoutkomposition, nicht URL. |
| Stale State | UI-/DB-Zustand, der durch parallele Änderung nicht mehr aktuell ist; Countguards erzwingen Rollback. |
| Trust Proxy | explizite Freigabe, Proxy-IP-Header als vertrauenswürdig zu behandeln. |
| Working Tree | Git-Zustand relativ zu Commit; in diesem Ordner mangels `.git/` **Unknown**. |

## 36. Coverage-Ledger und finaler Vollständigkeitsbericht

### 36.1 Kanonischer Datei-Coverage-Ledger

Die Statuswerte entsprechen den geforderten Kategorien: **Vollständig analysiert und dokumentiert** sowie **Als Konfiguration/Referenz analysiert und erfasst**. Keine relevante Projektdatei ist absichtlich ausgeschlossen oder unlesbar. Jede der 80 relevanten Dateien erscheint in dieser Tabelle genau einmal; erzeugte Dritt-/Outputdateien stehen getrennt in 36.2.

| Nr. | Datei | Einziger Coverage-Status |
|---:|---|---|
| 1 | `.agents/skills/commit.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 2 | `.agents/skills/diff-aware-review.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 3 | `.agents/skills/plan.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 4 | `.agents/skills/review-dirty.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 5 | `.agents/skills/review-plus-fix.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 6 | `.agents/skills/risk-level.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 7 | `.agents/skills/take-over.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 8 | `.env.example` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 9 | `.gitignore` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 10 | `AGENTS.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 11 | `ARCHITECTURE.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 12 | `eslint.config.mjs` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 13 | `next.config.ts` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 14 | `package.json` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 15 | `package-lock.json` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 16 | `playwright.config.ts` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 17 | `postcss.config.js` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 18 | `prisma.config.ts` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 19 | `prisma/schema.prisma` | **Vollständig analysiert und dokumentiert** |
| 20 | `prisma/seed.ts` | **Vollständig analysiert und dokumentiert** |
| 21 | `README.md` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 22 | `scripts/run-local-env.mjs` | **Vollständig analysiert und dokumentiert** |
| 23 | `src/app/admin/(protected)/dashboard-client.tsx` | **Vollständig analysiert und dokumentiert** |
| 24 | `src/app/admin/(protected)/error.tsx` | **Vollständig analysiert und dokumentiert** |
| 25 | `src/app/admin/(protected)/layout.tsx` | **Vollständig analysiert und dokumentiert** |
| 26 | `src/app/admin/(protected)/loading.tsx` | **Vollständig analysiert und dokumentiert** |
| 27 | `src/app/admin/(protected)/page.tsx` | **Vollständig analysiert und dokumentiert** |
| 28 | `src/app/admin/layout.tsx` | **Vollständig analysiert und dokumentiert** |
| 29 | `src/app/admin/login/page.tsx` | **Vollständig analysiert und dokumentiert** |
| 30 | `src/app/api/auth/[...nextauth]/route.ts` | **Vollständig analysiert und dokumentiert** |
| 31 | `src/app/api/log/client-error/route.ts` | **Vollständig analysiert und dokumentiert** |
| 32 | `src/app/datenschutz/page.tsx` | **Vollständig analysiert und dokumentiert** |
| 33 | `src/app/global-error.tsx` | **Vollständig analysiert und dokumentiert** |
| 34 | `src/app/impressum/page.tsx` | **Vollständig analysiert und dokumentiert** |
| 35 | `src/app/layout.tsx` | **Vollständig analysiert und dokumentiert** |
| 36 | `src/app/page.tsx` | **Vollständig analysiert und dokumentiert** |
| 37 | `src/app/robots.ts` | **Vollständig analysiert und dokumentiert** |
| 38 | `src/components/about.tsx` | **Vollständig analysiert und dokumentiert** |
| 39 | `src/components/admin/logs-tab.tsx` | **Vollständig analysiert und dokumentiert** |
| 40 | `src/components/admin/requests-tab.tsx` | **Vollständig analysiert und dokumentiert** |
| 41 | `src/components/admin/types.ts` | **Vollständig analysiert und dokumentiert** |
| 42 | `src/components/admin/users-tab.tsx` | **Vollständig analysiert und dokumentiert** |
| 43 | `src/components/contact-form.tsx` | **Vollständig analysiert und dokumentiert** |
| 44 | `src/components/cookie-banner.tsx` | **Vollständig analysiert und dokumentiert** |
| 45 | `src/components/footer.tsx` | **Vollständig analysiert und dokumentiert** |
| 46 | `src/components/hero.tsx` | **Vollständig analysiert und dokumentiert** |
| 47 | `src/components/navbar.tsx` | **Vollständig analysiert und dokumentiert** |
| 48 | `src/components/schedule.tsx` | **Vollständig analysiert und dokumentiert** |
| 49 | `src/components/ui/button.tsx` | **Vollständig analysiert und dokumentiert** |
| 50 | `src/components/ui/input.tsx` | **Vollständig analysiert und dokumentiert** |
| 51 | `src/components/ui/textarea.tsx` | **Vollständig analysiert und dokumentiert** |
| 52 | `src/content/data.ts` | **Vollständig analysiert und dokumentiert** |
| 53 | `src/lib/actions.ts` | **Vollständig analysiert und dokumentiert** |
| 54 | `src/lib/actions/auth-helpers.ts` | **Vollständig analysiert und dokumentiert** |
| 55 | `src/lib/actions/contact.ts` | **Vollständig analysiert und dokumentiert** |
| 56 | `src/lib/actions/logs.ts` | **Vollständig analysiert und dokumentiert** |
| 57 | `src/lib/actions/users.ts` | **Vollständig analysiert und dokumentiert** |
| 58 | `src/lib/auth.ts` | **Vollständig analysiert und dokumentiert** |
| 59 | `src/lib/client-ip.ts` | **Vollständig analysiert und dokumentiert** |
| 60 | `src/lib/country-codes.ts` | **Vollständig analysiert und dokumentiert** |
| 61 | `src/lib/logger.ts` | **Vollständig analysiert und dokumentiert** |
| 62 | `src/lib/prisma.ts` | **Vollständig analysiert und dokumentiert** |
| 63 | `src/lib/rate-limit.ts` | **Vollständig analysiert und dokumentiert** |
| 64 | `src/lib/schemas.ts` | **Vollständig analysiert und dokumentiert** |
| 65 | `src/lib/session.ts` | **Vollständig analysiert und dokumentiert** |
| 66 | `src/lib/utils.ts` | **Vollständig analysiert und dokumentiert** |
| 67 | `src/middleware.ts` | **Vollständig analysiert und dokumentiert** |
| 68 | `src/styles/globals.css` | **Vollständig analysiert und dokumentiert** |
| 69 | `src/types/next-auth.d.ts` | **Vollständig analysiert und dokumentiert** |
| 70 | `tailwind.config.ts` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 71 | `tests/e2e/admin-dashboard.spec.ts` | **Vollständig analysiert und dokumentiert** |
| 72 | `tests/e2e/admin-logic.spec.ts` | **Vollständig analysiert und dokumentiert** |
| 73 | `tests/e2e/auth.spec.ts` | **Vollständig analysiert und dokumentiert** |
| 74 | `tests/e2e/chaos.spec.ts` | **Vollständig analysiert und dokumentiert** |
| 75 | `tests/e2e/contact.spec.ts` | **Vollständig analysiert und dokumentiert** |
| 76 | `tests/e2e/helpers/db-cleanup.ts` | **Vollständig analysiert und dokumentiert** |
| 77 | `tests/e2e/role-visibility.spec.ts` | **Vollständig analysiert und dokumentiert** |
| 78 | `tests/e2e/security.spec.ts` | **Vollständig analysiert und dokumentiert** |
| 79 | `tsconfig.json` | **Als Konfiguration/Referenz analysiert und erfasst** |
| 80 | `docs/TECHNISCHE_PROJEKTDOKUMENTATION.md` | **Als Konfiguration/Referenz analysiert und erfasst** |

### 36.2 Ausgeschlossene und fehlende Kategorien

| Kategorie | Anzahl/Zustand | Grund, Generator und autoritative Quelle |
|---|---|---|
| relevante absichtlich ausgeschlossene Dateien | 0 | keine |
| unlesbare/nicht analysierbare relevante Dateien | 0 | keine |
| `playwright-report/` | 1 vorhandene generierte Datei | Playwright-HTML-Reporter; autoritativ sind Config/Tests, Artefaktstatus Abschnitt 28.4 |
| `test-results/` | 1 vorhandene generierte Datei | Playwright-Laufstatus; autoritativ sind Config/Tests |
| `.git/` | fehlt | VCS-Metadaten; würde durch Git bereitgestellt |
| `node_modules/` | fehlt | npm-Drittanbieter; Quellen `package.json`/Lockfile |
| `src/generated/prisma/` | fehlt | Prisma-Generator; Quelle `schema.prisma` |
| `.next/`, `out/`, `build/`, `.vercel/` | fehlen | Next-/Hostingoutput; Quellen `src/`/Konfiguration |
| `coverage/` | fehlt | Testoutput; kein Coverage-Skript vorhanden |
| `prisma/migrations/` | fehlt | keine Migrationshistorie; Schema-Sync über `db push` |
| `.env`, `.env*.local` | fehlen/nicht gelesen | Secret-Konfiguration; Namen aus `.env.example`/Code |
| `public/` | fehlt | tatsächlicher projekt-eigener Assetbestand null |
| CI/IaC/Container/Prozessmanagerdateien | fehlen | keine Implementierung; README nur Referenz |

### 36.3 Quantitativer Vollständigkeitsstand

| Messgröße | Gefunden | Dokumentiert/Status |
|---|---:|---|
| relevante Projektdateien | 80 | 80: 58 vollständig, 22 Konfiguration/Referenz, 0 relevant ausgeschlossen, 0 unlesbar |
| vorhandene generierte Outputdateien | 2 | 2 statusgeprüft und begründet ausgeschlossen |
| projektgeschriebene Funktions-/Methoden-/Callback-Körper | 396 | 396 eigene Ledgerzeilen: SRC 223 + EXT 173 |
| zusätzliche Factory-/CLI-Registrierungen | 17 | 1 NextAuth-Handlerbindung + 16 npm-Skripte |
| ausführbare Registrierungen gesamt | 413 | 413 dokumentiert |
| routbare Benutzeransichten | 5 | 5 dokumentiert |
| UI-Render-Einheiten | 31 | 31 dokumentiert |
| explizite HTTP-Methodenoperationen | 3 | GET/POST Auth + POST Clientfehler |
| Server Actions | 7 | 7 dokumentiert |
| API-Operationen gesamt | 10 | 10 dokumentiert |
| Prisma-Modelle/-Felder | 5 / 30 | 5 / 30 dokumentiert |
| direkte npm-Abhängigkeiten | 32 | 18 Runtime + 14 Entwicklung, alle dokumentiert |
| Lockfile-Paketdatensätze | 619 | Provenienz/Versionen analysiert, Drittquellcode ausgeschlossen |
| E2E-Suites/Testfälle | 7 / 44 | 7 / 44 statisch dokumentiert; 71 projektbezogene Ausführungen konfiguriert |

### 36.4 Verbleibende nicht abschließend analysierbare Elemente

Vier konkrete Kategorien bleiben **Unknown**:

1. Git-Branch, Commit, Tracking und ursprünglicher Working Tree, weil `.git/` fehlt.
2. Aktueller Installations-, Typecheck-, Lint-, Build-, Runtime- und E2E-Erfolg, weil Dependencies/Generated Client fehlen und E2E keine beweisbar sichere Datenbankgrenze hat. Auflösung: reproduzierbare Installation und Pipeline auf isoliertem Ziel.
3. Tatsächliches deploytes PostgreSQL-Schema, Drift, Trigger, Privilegien, Version und Datenzustand sowie der genaue generierte Client-Dateisatz. Auflösung: sichere Read-only-Introspektion/Generate in einer kontrollierten Umgebung.
4. Deploymenttopologie, Proxy/TLS, Secretrotation, Logsink/-retention, Backups/Restore und rechtliche/organisatorische Prozesswahrheit. Auflösung: Betriebsartefakte und kontrollierte Infrastruktur-/Complianceprüfung.

Diese Grenzen verhindern bewusst eine Behauptung von 100-prozentiger Laufzeit- oder Deploymentabdeckung. Die statische Coverage des gefundenen relevanten Dateibestands und der 396 projektgeschriebenen Körper ist dagegen inventarbasiert vollständig.

### 36.5 Einmaliges adversariales Vollständigkeits-Audit

Nach dem ersten vollständigen Entwurf wurde am 2026-08-16 **genau ein** adversariales Audit durchgeführt. Es verglich unabhängig:

- 80 physisch relevante Dateien gegen 80 eindeutige Ledgerpfade: keine Differenz;
- einen erneuten TypeScript-AST-Lauf gegen die Funktionsreferenz: `src` 223, Tests 161, Seed 5, Wrapper 6, Next-Konfiguration 1, gesamt 396; IDs `SRC-001..223` und `EXT-001..173` lückenlos/eindeutig;
- 107 statisch exportierte Symbole gegen Dokumentnennungen: keine fehlende Exportreferenz;
- fünf Seitenrouten und 31 Render-Einheiten gegen UI-/Featurekatalog;
- drei HTTP-Methoden und sieben fachliche Server Actions gegen die API-Tabelle;
- fünf Prisma-Modelle, sechs exportierte Zod-Schemas und fehlende Migrationen gegen Abschnitt 18/19;
- 13 Umgebungsvariablen, 16 npm-Skripte und 32 direkte Dependencies gegen Konfigurations-/Betriebs-/Dependencytabellen;
- sieben Specs/44 Fälle/14 Hooks gegen Test- und Funktionsledger;
- 619 Lockfile-Paketdatensätze und null projekt-eigene Medien gegen Inventar/Stack;
- 549 vollqualifizierte Pfad-/Zeilenbelege, Tabellenstruktur, 36 Hauptüberschriften, interne Inhaltslinks und verbotene Platzhalter.

Das Audit fand und korrigierte folgende Lücken im Entwurf: zwei verkürzte UI-Symbolnamen (`AdminLoginPage`, `ProtectedAdminLayout`), die Vorwahlzahl 46→45, drei zu lange `auth.ts`-Quellbereiche, einen zu langen `data.ts`-Bereich, die übersehene achtstündige Sessiondauer, sechs unmaskierte Tabellenpipes sowie die fehlende Feststellung, dass Playwright-Ausgaben nicht in `.gitignore` stehen. Es wurden keine weiteren inhaltlichen Reviewzyklen gestartet.

### 36.6 Begrenzte Abschlussprüfung und Übergabe

Die folgenden mechanischen Prüfungen dienten ausschließlich der Abschlussvalidierung; sie sind kein zweites adversariales Inhaltsaudit.

| Prüfschritt | Ergebnis | Beleg und Grenze |
|---|---|---|
| `review-dirty`-Scopeprüfung | **Bestanden** | SHA-256-Vergleich: 79 von 79 vorbestehenden relevanten Dateien unverändert; keine fehlende, zusätzliche oder abweichende Ausgangsdatei. Einzige Zieländerung ist dieses Dokument. |
| `diff-aware-review` | **Bestanden** | Die Änderung ist auf die angeforderte technische Dokumentation begrenzt; Quellcode, Tests, Konfiguration, generierte Ausgaben und Architekturvorgaben wurden nicht verändert. |
| Markdown-/Strukturprüfung | **Bestanden** | Gültiges UTF-8 ohne Ersatzzeichen; 36 eindeutige Hauptabschnitte; 80 Datei-Ledgerzeilen; `SRC-001..223` und `EXT-001..173` lückenlos und eindeutig; Codezäune ausgeglichen; keine strukturell abweichende Tabellenzeile, kein fehlendes internes Linkziel, kein nachlaufender Whitespace und kein erkannter Platzhalter. |
| Pfad-/Zeilenreferenzen | **Bestanden** | Alle bei der Abschlussprüfung erkannten vollqualifizierten Datei-/Zeilenbereiche liegen innerhalb der vorhandenen Dateien; drei verkürzte `prisma.ts`-Verweise wurden auf `src/lib/prisma.ts` präzisiert. |
| Git-Status und Diffprüfung | **Unknown** | `git status --short` und `git diff --check` enden mit „not a git repository“, weil `.git/` fehlt. Der Hashvergleich ersetzt hier nur die Scope-, nicht die Historienprüfung. |
| Installation, Lint, Typecheck und Build | **Unknown** | Nicht ausgeführt: `node_modules/`, der generierte Prisma-Client, Laufzeitvariablen und ein kontrolliertes Datenbankziel fehlen. Ein Erfolg wäre aus diesem Bestand nicht reproduzierbar nachweisbar. |
| Playwright-E2E | **Bewusst nicht ausgeführt / Unknown** | Die in Abschnitt 3.3 belegten global destruktiven Helper, die Umgebungsübernahme und mögliche Serverwiederverwendung schließen einen sicheren Lauf nicht nachweisbar aus. Der vorhandene Bericht ist veraltet und beweist den aktuellen Stand nicht. |
| Datenbank-, Seed-, Schema- und Deploymentoperationen | **Bewusst nicht ausgeführt / Unknown** | Keine Verbindung und keine Mutation externer Systeme; Live-Schema, Daten, Infrastruktur und Deployment bleiben deshalb wie ausgewiesen **Unknown**. |

`review-plus-fix` wurde in genau einer begrenzten Abschlussiteration auf die gefundenen Struktur- und Referenzfehler angewandt. Der `take-over`-Schritt bestätigte die kritischen Authentifizierungs-, Autorisierungs-, Rate-Limit-, Server-Action- und Datenmutationspfade statisch; eine Laufzeitfreigabe oder Produktionsreife wird daraus ausdrücklich nicht abgeleitet. Ein Commit wurde weder erzeugt noch simuliert, weil Git-Metadaten fehlen und die Aufgabe ausschließlich dieses Dokument autorisierte.
