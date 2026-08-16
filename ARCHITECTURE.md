# Projektdokumentation - Zahnarztpraxis Dr. Peter Neumann

> Single Source of Truth fuer Architektur, Datenfluss, Security, Datenschutz und Betrieb.
> Bei Abweichungen zwischen Dokumentation und Code gilt immer der Code.

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [Projektstruktur und Konventionen](#2-projektstruktur-und-konventionen)
3. [Datenbank und Prisma](#3-datenbank-und-prisma)
4. [Datenfluss und Server Actions](#4-datenfluss-und-server-actions)
5. [Authentifizierung und Autorisierung](#5-authentifizierung-und-autorisierung)
6. [Security, Logging und Datenschutz](#6-security-logging-und-datenschutz)
7. [E2E-Testing](#7-e2e-testing)
8. [Operations und Deployment](#8-operations-und-deployment)
9. [Developer Runbook](#9-developer-runbook)

---

## 1. Executive Summary

### Was ist dieses Projekt?

Eine DSGVO-orientierte Marketing-Website mit rollenbasiertem Admin-Bereich fuer die Zahnarztpraxis Dr. Peter Neumann.

Es gibt zwei Hauptflaechen:

1. Oeffentliche Website (`/`) mit Praxisinformationen, Oeffnungszeiten und Kontaktformular
2. Geschuetztes Admin-Dashboard (`/admin`) fuer Kontaktanfragen, Benutzerverwaltung und Audit-Logs

### Tech-Stack

| Schicht | Technologie | Zweck |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | SSR, Server Actions, Middleware, `after()` |
| UI | React 19 | Server/Client Split |
| Sprache | TypeScript | Typsicherheit |
| Styling | Tailwind CSS | Utility-First Styling |
| ORM | Prisma 7 + `@prisma/adapter-pg` | PostgreSQL-Zugriff ohne Rust-Preview-Flag |
| Datenbank | PostgreSQL | Primäre und einzige produktive Datenbank |
| Auth | NextAuth.js v4 | Credentials Login mit JWT-Session |
| Validierung | Zod | Strikte Servergrenzen fuer Inputs |
| Logging | Pino | Strukturierte JSON-Logs mit Redaction |
| Tests | Playwright | End-to-End Regressionen |

### Rendering-Strategie

Das Root Layout liest Header fuer die CSP-Nonce aus der Middleware. Dadurch rendert die App dynamisch. Static Export ist nicht vorgesehen.

### Aktueller Architekturstatus

- Kein manueller Audit-Log-Clear mehr
- Kontaktformular wird serverseitig validiert
- Client-Error-Ingestion ist strikt, rate-limitiert und sanitisiert
- Trusted-IP-Ableitung ist in Produktion fail-closed
- Rate-Limits haengen von korrekter Trusted-IP-Konfiguration ab
- Keine Banner-Persistenz in `localStorage`

---

## 2. Projektstruktur und Konventionen

### Relevante Struktur

```text
src/
├── app/
│   ├── page.tsx
│   ├── impressum/page.tsx
│   ├── datenschutz/page.tsx
│   ├── global-error.tsx
│   ├── api/
│   │   └── log/client-error/route.ts
│   └── admin/
│       ├── login/page.tsx
│       └── (protected)/
│           ├── layout.tsx
│           ├── page.tsx
│           └── dashboard-client.tsx
├── components/
│   ├── contact-form.tsx
│   ├── cookie-banner.tsx
│   └── admin/
├── content/
│   └── data.ts
└── lib/
    ├── actions.ts
    ├── actions/
    │   ├── auth-helpers.ts
    │   ├── contact.ts
    │   ├── logs.ts
    │   └── users.ts
    ├── auth.ts
    ├── client-ip.ts
    ├── logger.ts
    ├── prisma.ts
    ├── rate-limit.ts
    ├── schemas.ts
    └── session.ts
```

### Konventionen

- Code auf Englisch; UI-Texte und knappe Kommentare auf Deutsch
- `src/lib/actions.ts` ist nur der stabile Barrel-Export
- Die eigentlichen Server Actions liegen fachlich getrennt in `src/lib/actions/*.ts`
- Alle Datenmutationen laufen ueber `prisma.$transaction(...)`
- Keine `console.log` oder `console.error`; nur Pino
- UI-Komponenten werden manuell gepflegt; keine UI-CLI-Generatoren

---

## 3. Datenbank und Prisma

### Prisma-Konfiguration

Es gibt drei relevante Prisma-Dateien:

| Datei | Zweck |
| --- | --- |
| `prisma/schema.prisma` | Schema und Generator-Output nach `src/generated/prisma` |
| `prisma.config.ts` | Liefert `DATABASE_URL` fuer `prisma validate`, `db push` und `generate` |
| `src/lib/prisma.ts` | Runtime-Singleton fuer `pg` Pool + Prisma Client |

### Wichtige Prisma-Regeln

- Datenbankprovider ist PostgreSQL
- Keine deprecated `previewFeatures` im Schema
- Keine Prisma-Migrationsdateien; Schema-Sync erfolgt ueber `prisma db push`
- `npm run build` fuehrt `prisma generate` vor dem Next-Build aus

### Datenmodelle

| Modell | Zweck |
| --- | --- |
| `ContactRequest` | Kontaktanfragen aus dem oeffentlichen Formular |
| `User` | Admin- und Staff-Benutzer |
| `LoginAttempt` | DB-basierter Lockout-Status fuer Admin-Login |
| `AuditLog` | Nachvollziehbarkeit von Admin-Aktionen |
| `RateLimit` | DB-basiertes Abuse-Protection-Budget fuer oeffentliche Pfade |
| `AppointmentSettings` | Singleton fuer 15-Minuten-Raster, Mindestvorlauf, Horizont und `Europe/Berlin` |
| `AppointmentType` | Aktivierbare Terminart mit Dauer, Online-Freigabe und AUTO/MANUAL-Policy |
| `AppointmentWeeklyAvailability` | Wiederkehrende lokale Wochenfenster fuer die Buchungs-Engine |
| `AppointmentAvailabilityException` | Datumsbezogene `OPEN`-/`BLOCK`-Intervalle; `BLOCK` hat Vorrang |
| `Appointment` | Termin mit Typ-/Dauer-/Policy-Snapshots, Patientendaten, Status, Quelle und Revision |
| `AppointmentSlot` | Globale, per UTC-Startzeit eindeutige 15-Minuten-Kapazitaetseinheit |
| `AppointmentAccessSession` | Kurzlebige, gehashte Patientensession; maximal eine je Termin |

### Datenmodell-Details

- `ContactRequest.message` speichert den serverseitig gebauten Freitext aus validierten strukturierten Formularfeldern
- `LoginAttempt.identifier` ist ein SHA-256-Hash aus vertrauenswuerdiger IP, User-Agent-Kontext und Bucket-Typ
- `AuditLog.action` enthaelt aktuell produktive Aktionen wie `LOGIN`, `CREATE_USER`, `DELETE_USER`, `DELETE_REQUEST`
- `RateLimit.ip` speichert den Bucket-Key, also z.B. `contact:<ip>` oder `client-error:<ip>`
- Terminstatus ist `PENDING | CONFIRMED | REJECTED | CANCELLED`; Quelle ist `ONLINE | ADMIN`
- Aktive `PENDING`- und `CONFIRMED`-Termine besitzen `durationMinutes / 15` Slots. Ablehnung oder Stornierung loescht nur die Slots, nicht den Termin.
- `managementCodeHash` und `AppointmentAccessSession.tokenHash` speichern ausschliesslich SHA-256-Hashes; Klartext-Codes und Session-Tokens werden nicht persistiert.
- `revision` bildet die Optimistic-Concurrency-Grenze fuer Admin-Mutationen und Verschiebungen.
- Patientenmutationen erfassen die erwartete Revision vor dem retry-faehigen Schreibvorgang; ein Serializable-Retry darf eine parallele Aenderung nicht auf eine neuere Revision rebasen.

---

## 4. Datenfluss und Server Actions

### Server-Action-Aufteilung

| Modul | Verantwortlich fuer |
| --- | --- |
| `actions/contact.ts` | Oeffentliches Kontaktformular und Request-Verwaltung |
| `actions/users.ts` | Benutzeranlage, Benutzerloeschung, Benutzerliste |
| `actions/logs.ts` | Audit-Log-Lesen und Retention-Cleanup |
| `actions/appointments-public.ts` | Oeffentliche Typen, Verfuegbarkeit und Buchung |
| `actions/appointments-patient.ts` | Code-Austausch, Session, Patienten-Verschiebung und -Stornierung |
| `actions/appointments-admin.ts` | Operatives Terminmanagement und Admin-Konfiguration |
| `actions.ts` | Barrel-Export fuer Komponentenimporte |

### Serverseitige Validierung

`src/lib/schemas.ts` validiert die bisherigen Kontakt-/Admin-Flows; `src/lib/appointments/schemas.ts` ist die fachliche Validierungsquelle fuer alle Termin-Actions.

Wichtige Schemas:

- `contactFormSchema`
  - `firstName`, `lastName`
  - `countryCode`
  - `phone` nur Ziffern
  - `requestType` als Enum-Whitelist
  - `reachability` optional als Enum-Whitelist
  - `details` optional und sanitisiert
  - `gdprConsent` muss `true` sein
  - `honeypot` begrenzt und optional
- `createUserSchema`
- `actionIdSchema`
- `contactRequestMutationSchema`
  - `ids` als nicht-leeres, eindeutiges Array von Action-IDs
  - maximal 50 IDs pro Mutation
  - `action` als Enum-Whitelist: `markRead | markUnread | delete`
- `clientErrorLogSchema`

### Kontaktformular-Lifecycle

1. Client sendet strukturierte Felder an `submitContactForm()`
2. Server leitet eine vertrauenswuerdige Client-IP ab
3. `checkRateLimitDb("contact:<ip>")` prueft Abuse-Budget
4. Honeypot wird vor der normalen Validierung ausgewertet
5. `contactFormSchema.safeParse(...)` erzwingt serverseitige Grenzen
6. Der persistierte Freitext wird serverseitig aus validierten Feldern zusammengesetzt
7. `ContactRequest` wird transaktional gespeichert
8. `after()` triggert die globale Bereinigung abgelaufener Rate-Limit-Buckets

### Termin-Engine und Reservierungsfluss

1. Oeffentliche Terminarten enthalten nur `active && onlineBookable`; die interne Telefonbuchung darf alle aktiven Typen verwenden.
2. Verfuegbarkeit wird ausschliesslich serverseitig aus Typdauer, festen 15-Minuten-Slots, Wochenfenstern, `OPEN`-/`BLOCK`-Ausnahmen, Mindestvorlauf, Buchungshorizont und belegten `AppointmentSlot`-Zeilen berechnet.
3. Lokale Regeln werden in `Europe/Berlin` ausgewertet. Nicht existente oder mehrdeutige DST-Zeiten werden nicht angeboten und fail-closed abgelehnt.
4. Beim Abschluss werden Typstatus, Online-Freigabe, Zeitfenster, BLOCK, Vorlauf, Horizont und Belegung innerhalb einer serialisierbaren Transaktion erneut geprueft. Angezeigte Slots sind keine Vorreservierung.
5. Die Transaktion schreibt `Appointment` und alle benoetigten `AppointmentSlot`-Zeilen gemeinsam. Die globale Unique-Constraint auf `slotStartAt` laesst bei Konkurrenz exakt einen Gewinner zu; Retry-/Conflict-Pfade erzeugen keine Teilreservierung.
6. `AUTO` erzeugt `CONFIRMED`, `MANUAL` erzeugt `PENDING`. Beide Status blockieren Kapazitaet, bis eine Ablehnung oder Stornierung die Slots transaktional freigibt.
7. Typname, Dauer und Bestaetigungsmodus werden im Termin gesnapshottet. Auch eine spaetere Verschiebung verwendet diese Snapshots; aktuelle Aktiv-/Online-Freigaben bleiben zusaetzliche serverseitige Gates, schreiben die Historie aber nicht um.

### Patientenverwaltung ohne Konto

- Nach Online-Buchung wird der hochentropische Management-Code genau einmal im Browser angezeigt und nie in URL, Log oder Datenbank-Klartext geschrieben.
- `verifyAppointmentManagementCode()` akzeptiert nur den Klartext-Code per POST, hasht ihn und tauscht ihn gegen ein zufaelliges, `HttpOnly`, `SameSite=Lax`, auf `/termin` begrenztes Session-Cookie.
- Die DB speichert nur den Session-Token-Hash mit 20 Minuten Ablaufzeit. Ein erneuter Code-Austausch ersetzt die vorherige Session desselben Termins.
- Lesen, Verfuegbarkeit, Verschieben und Stornieren werden aus der Session abgeleitet; Termin-ID, Typ-ID, Status, Dauer und Policy kommen nicht vertrauensvoll vom Client.
- Verschieben ersetzt alte und neue Slots in einer Transaktion. Bei Kollision oder veralteter Revision bleibt der alte Termin vollstaendig erhalten. MANUAL-Termine werden nach Verschiebung erneut `PENDING`; AUTO-Termine werden `CONFIRMED`.
- Sobald die gespeicherte Startzeit erreicht ist, bleiben Statusdaten lesbar, aber Patienten-Verschiebung und -Stornierung werden in DTO und Mutation fail-closed deaktiviert.
- Beim expliziten Sitzungsende wird zuerst der serverseitige Token-Hash geloescht und erst danach das Browser-Cookie entfernt, damit ein DB-Fehler einen erneuten Logout-Versuch nicht verhindert.

### Admin-Termin-Datenfluss

- `page.tsx` laedt Kontaktanfragen und operatives Termin-Dashboard fuer `staff` und `admin`; die Terminkonfiguration wird nur fuer `admin` geladen. Getrennte `Promise.allSettled(...)`-Ergebnisse liefern unterscheidbare Fehler.
- Der Termine-Tab bietet Heute/Woche/Offen, Pending-Badge, chronologische responsive Liste, PII-Details sowie Telefonbuchung aus derselben Engine.
- Operative Aktionen fuer `staff` und `admin`: Telefonbuchung (`source=ADMIN`), Bestaetigen, Ablehnen, Stornieren und Verschieben. Mutationserfolg und anschliessender Read-Refresh werden getrennt behandelt, damit ein Reload-Fehler keine erfolgreiche Schreiboperation als fehlgeschlagen darstellt.
- Das sichtbarkeitsabhaengige 30-Sekunden-Polling aktualisiert den aktuell gewaehlten Wochen-Cursor direkt und setzt die Navigation nicht auf die aktuelle Woche zurueck.
- Nur `admin`: Terminarten erstellen/aktualisieren (kein Delete), Wochenfenster erstellen/loeschen, `OPEN`-/`BLOCK`-Ausnahmen erstellen/loeschen und Vorlauf/Horizont aktualisieren. Raster und Zeitzone bleiben in V1 fest.
- Jede Action autorisiert bei jedem Aufruf neu: operative Actions beginnen mit `requireAuth()`, Konfigurations-Actions mit `requireAdmin()`. Sichtbarkeit im Client ist kein Berechtigungsersatz.
- Audit-Aktionen sind `CREATE_APPOINTMENT`, `CONFIRM_APPOINTMENT`, `REJECT_APPOINTMENT`, `CANCEL_APPOINTMENT`, `RESCHEDULE_APPOINTMENT`, `CREATE_APPOINTMENT_TYPE`, `UPDATE_APPOINTMENT_TYPE`, `CREATE_WEEKLY_AVAILABILITY`, `DELETE_WEEKLY_AVAILABILITY`, `CREATE_AVAILABILITY_EXCEPTION`, `DELETE_AVAILABILITY_EXCEPTION`, `UPDATE_BOOKING_SETTINGS`. Details enthalten interne IDs/Status, keine Patienten-PII, Codes oder Tokens.

### Admin-Dashboard-Datenfluss

- `(protected)/layout.tsx` sichert die Route ueber `getServerSession()`
- `(protected)/page.tsx` laedt Daten serverseitig
- Kontaktanfragen sind fuer `admin` und `staff` sichtbar
- Benutzer und Audit-Logs sind nur fuer `admin` sichtbar
- Teilabfragen werden mit `Promise.allSettled(...)` geladen, damit ein Teilfehler nicht das gesamte Dashboard unnoetig blockiert
- `dashboard-client.tsx` haelt die aktuelle Request-Liste als gemeinsame Client-Quelle fuer Tab-Badge, Zaehlerkarten und Requests-Tab
- Kontaktanfragen werden in 50er-Seiten geladen; aeltere Anfragen bleiben ueber Cursor-Pagination im Requests-Tab erreichbar
- Einzel- und Sammelaktionen fuer Kontaktanfragen laufen ueber denselben Client/Server-Mutationspfad
- Request-Liste und Request-Zaehler werden erst nach bestaetigtem Mutationserfolg aktualisiert; fehlgeschlagene Aktionen refreshen zurueck auf Server-Wahrheit

### Request-Management-Verhalten

- `mutateContactRequests()` ist der einzige Mutationseinstieg fuer einzelne und mehrere Kontaktanfragen
- Derselbe Mechanismus deckt einzelnes Lesen/Ungelesen, einzelnes Loeschen sowie Bulk-Lesen, Bulk-Ungelesen und Bulk-Loeschen ab
- Betroffene Requests zeigen waehrend laufender Mutationen einen Ladezustand; geloeschte Zeilen bleiben bis zum erfolgreichen Abschluss sichtbar und verschwinden erst danach
- Bulk-Mutationen sind atomar: ist eine ausgewaehlte Anfrage stale oder fehlt, wird nichts teilweise aktualisiert oder geloescht
- Erfolgreiche Delete-Mutationen schreiben pro geloeschter Anfrage einen `DELETE_REQUEST`-Audit-Log-Eintrag innerhalb derselben Transaktion

### Aktuelle Server Actions

#### Oeffentlich

| Funktion | Input | Output | Bemerkung |
| --- | --- | --- | --- |
| `submitContactForm()` | strukturierte Formdaten | `{ success, error? }` | serverseitig validiert, rate-limitiert, transaktional |
| `getPublicAppointmentTypes()` | - | `PublicAppointmentTypeDto[]` | nur aktive, online buchbare Typen |
| `getPublicAppointmentAvailability()` | Typ-ID, optionaler Cursor | `AppointmentResult<AppointmentAvailabilityDto>` | serverberechnete, paginierte freie Slots |
| `bookPublicAppointment()` | Typ, Zeitpunkt, Telefon-/Namensdaten, Consent, Honeypot | `AppointmentResult<PublicAppointmentBookingDto>` | rate-limitiert, vollstaendige transaktionale Revalidation, einmaliger Management-Code |
| `verifyAppointmentManagementCode()` | `{ code }` | `AppointmentResult<ManagedAppointmentDto>` | Code-Hash-Vergleich und Session-Cookie-Austausch |
| `getManagedAppointment()` | Session-Cookie | `AppointmentResult<ManagedAppointmentDto>` | keine ID-basierte Autorisierung |
| `getManagedAppointmentAvailability()` | optionaler Cursor + Session | `AppointmentResult<AppointmentAvailabilityDto>` | schliesst eigene Belegung aus |
| `rescheduleManagedAppointment()` | `{ startAt }` + Session | `AppointmentResult<ManagedAppointmentDto>` | atomare Slot-Verschiebung mit erneuter Policy-Pruefung |
| `cancelManagedAppointment()` | Session | `AppointmentResult<ManagedAppointmentDto>` | erhaelt Datensatz, gibt Slots frei |
| `endAppointmentManagementSession()` | Session | `AppointmentResult<null>` | loescht DB-Session und Cookie |

#### Geschuetzt (`requireAuth()`)

| Funktion | Input | Output | Bemerkung |
| --- | --- | --- | --- |
| `getContactRequests()` | optionaler Cursor | `ContactRequest[]` | 50er-Seiten, sortiert nach `createdAt desc`, `id desc` |
| `mutateContactRequests()` | `{ ids, action }` | `{ success, error? }` | einheitliche transaktionale Mutation fuer Einzel- und Sammelaktionen; aktualisiert oder loescht atomar, schreibt Delete-Audit-Logs pro Request und revalidiert `/admin` nach Erfolg |
| `getAdminAppointmentDashboard()` | optional `{ weekStart }` | `AdminAppointmentDashboardDto` | Heute/Woche/Pending plus aktive interne Terminarten |
| `getAdminAppointmentAvailability()` | Typ-ID, optional Cursor/Termin-ID | `AppointmentResult<AppointmentAvailabilityDto>` | interne Typen; eigene Slots bei Verschiebung ausgeschlossen |
| `createAdminAppointment()` | Typ, Zeitpunkt, Patientendaten, Consent | `AppointmentResult<AdminAppointmentDto>` | gleiche Engine/Status-Policy, `source=ADMIN`, Audit |
| `mutateAdminAppointment()` | Termin-ID, Revision, `CONFIRM|REJECT|CANCEL` | `AppointmentResult<AdminAppointmentDto>` | Status-/Revision-CAS, Release und Audit in derselben Transaktion |
| `rescheduleAdminAppointment()` | Termin-ID, Revision, Zeitpunkt | `AppointmentResult<AdminAppointmentDto>` | atomare Verschiebung und Audit |

#### Admin-only (`requireAdmin()`)

| Funktion | Input | Output | Bemerkung |
| --- | --- | --- | --- |
| `createUser()` | `{ name, email, password }` | `{ success, error? }` | transaktional mit Audit-Log |
| `deleteUser()` | `id` | `{ success, error? }` | blockiert Self-Delete und Admin-Loeschung |
| `getUsers()` | - | `UserAccount[]` | Dashboard-Rollenmodell `admin | staff | unknown` |
| `getAuditLogs()` | - | `AuditLog[]` | letzte 100 Eintraege + Retention-Cleanup |
| `getAppointmentConfiguration()` | - | `AppointmentConfigurationDto` | Settings, Typen, Wochenfenster und kommende Ausnahmen |
| `createAppointmentType()` / `updateAppointmentType()` | validierte Typdaten | `AppointmentResult<AdminAppointmentTypeDto>` | kein Terminart-Delete; Deaktivierung erhaelt Historie |
| `createWeeklyAvailability()` / `deleteWeeklyAvailability()` | Intervall bzw. ID | `AppointmentResult<...>` | transaktional mit Audit |
| `createAvailabilityException()` / `deleteAvailabilityException()` | lokales `OPEN|BLOCK`-Intervall bzw. ID | `AppointmentResult<...>` | transaktional mit Audit |
| `updateBookingSettings()` | Vorlauf und Horizont | `AppointmentResult<AppointmentSettingsDto>` | erzwingt 15 Minuten und `Europe/Berlin` |

### `after()`-Jobs

| Aufrufort | Hintergrundjob | Zweck |
| --- | --- | --- |
| `submitContactForm()` | `cleanupExpiredRateLimits()` | globale Rate-Limit-Bereinigung |
| `getAuditLogs()` | `auditLog.deleteMany(...)` | Retention-Cleanup nach 6 Monaten |
| `checkRateLimitDb()` | bucketbezogene `rateLimit.deleteMany(...)` | abgelaufene Budget-Leichen bereinigen |

---

## 5. Authentifizierung und Autorisierung

### Route-Schutz

Der Admin-Bereich hat zwei Ebenen:

1. Route-Group-Layout in `src/app/admin/(protected)/layout.tsx`
2. Server-Action-Gates ueber `requireAuth()` und `requireAdmin()`

Es gibt bewusst keinen Auth-Guard in der Middleware; die Middleware ist nur fuer CSP und Header zustaendig.

### Login-Modell

- Credentials Login ueber NextAuth.js
- JWT-Session mit serverseitiger Session-Revalidierung ueber DB-Lookup
- Fehlgeschlagene Logins werden ueber zwei Buckets begrenzt:
  - konto-spezifischer Bucket
  - IP/User-Agent-Hash-Bucket
- Abgelaufene Lockouts werden transaktional aufgeraeumt
- Wenn in Produktion keine vertrauenswuerdige Client-IP ableitbar ist, wird der Login nicht abgeschwaecht, sondern fail-closed blockiert

### Rollenmodell

Persistierte Rollen:

- `admin`
- `staff`

Dashboard-spezifische Darstellung:

- `unknown` ist nur ein neutraler UI-Zustand fuer fehlerhafte DB-Rollen in der Benutzerliste

### Berechtigungen

| Rolle | Anfragen | Termine operativ | Terminkonfiguration | Benutzer | Audit-Logs |
| --- | --- | --- | --- | --- | --- |
| `admin` | ja | ja | ja | ja | ja |
| `staff` | ja | ja | nein | nein | nein |

Wenn ein eingeloggter Nutzer waehrend der Laufzeit Admin-Rechte verliert, springt das Dashboard auf den Requests-Tab zurueck und blendet privilegierte Tabs aus.

---

## 6. Security, Logging und Datenschutz

### CSP und Security-Header

Die Middleware generiert fuer jeden Request eine CSP-Nonce. Das Root Layout liest diese Nonce ueber `headers()` aus und Next.js propagiert sie an Skripte. Zusaetzliche Security-Header werden in `next.config.ts` gesetzt.

Wichtige Ziele:

- XSS-Haertung ueber nonce-basierte CSP
- kein Clickjacking
- keine externen Script- oder Tracking-Abhaengigkeiten

### Trusted Client IP

`src/lib/client-ip.ts` ist die einzige Quelle fuer sicherheitsrelevante Client-IP-Ableitung.

Reihenfolge:

1. `x-vercel-forwarded-for` auf Vercel
2. `x-real-ip` oder `x-forwarded-for`, aber nur wenn `TRUST_PROXY=true`
3. Loopback-Fallback nur in Dev/Test
4. In Produktion sonst `TrustedClientIpError` und fail-closed

Wichtige Folge:

- Ohne korrekte Proxy-Konfiguration werden sicherheitssensitive Flows nicht stillschweigend geschwaecht
- Reverse-Proxy-Deployments muessen `TRUST_PROXY=true` setzen und echte Proxy-Header liefern

### Rate Limiting und Abuse Protection

`src/lib/rate-limit.ts` nutzt eine einzelne `rate_limits` Tabelle mit namespaced Keys.

Aktuelle Schutzmechanismen:

| Schutz | Budget | Key |
| --- | --- | --- |
| Kontaktformular | 3 Requests pro Stunde | `contact:<ip>` |
| Client-Error-Ingestion | 10 Requests pro 10 Minuten | `client-error:<ip>` |
| Termin-Verfuegbarkeit (oeffentlich/Patient) | 60 Requests pro 10 Minuten | `appointment-availability:<ip>` |
| Oeffentliche Terminbuchung | 5 Requests pro Stunde | `appointment-book:<ip>` |
| Management-Code | 5 Versuche pro 15 Minuten | `appointment-access:<ip>` |
| Patienten-Mutationen | 10 Requests pro Stunde | `appointment-book:<ip>` |

Eigenschaften:

- kein globaler `"unknown"` Bucket mehr
- atomarer UPSERT ueber SQL
- Bereinigung alter Buckets via `after()`
- Schutzqualitaet haengt direkt von korrekter Trusted-IP-Ableitung ab

### Logging

`src/lib/logger.ts` verwendet Pino mit:

- `pino.stdSerializers.err`
- Redaction fuer sensible Felder
- JSON-Ausgabe fuer Vercel und PM2

Logging-Regeln:

- keine `console.*` Aufrufe
- keine PII in Logs
- kein Logging kompletter User-Agent-Strings
- kein Logging von Kontaktformularinhalten in Fehlerpfade

### Client-Error-Ingestion

`src/app/global-error.tsx` sendet nur:

- `digest`
- `pathname`

`/api/log/client-error`:

- prueft Trusted-IP und Rate-Limit
- akzeptiert ausschliesslich das strikte `clientErrorLogSchema`
- loggt keine clientkontrollierten Stacktraces oder Freitexte
- loggt keinen vollen User-Agent

### Datenschutz und DSGVO

Aktueller Datenschutzstatus:

- kein Tracking
- keine externen Analyse- oder Marketingdienste
- Cookie-Banner ist rein informativ und speichert keine Entscheidung in Cookie oder `localStorage`
- Kontaktformulardaten werden nur fuer die Bearbeitung gespeichert
- Audit-Logs enthalten keine Klar-IP und keine Kontaktinhalte
- Termin-Audit-Logs enthalten nur Actor, Aktion, interne Termin-/Konfigurations-ID und Status; keine Patientennamen, Telefonnummern, Codes oder Tokens
- Management-Code und Session-Token werden nur gehasht persistiert; das Cookie ist `HttpOnly`, `SameSite=Lax`, auf `/termin` begrenzt und in Produktion `Secure`
- Audit-Logs koennen nicht manuell ueber das UI geloescht werden
- Retention fuer Audit-Logs: automatische Loeschung nach 6 Monaten in `getAuditLogs()`

### Serverseitige Sanitization

`sanitize()` in `schemas.ts` entfernt Null-Bytes und HTML-Tags iterativ. React escaped beim Rendern zusaetzlich automatisch. Die Sanitization ist Defense-in-Depth und kein Ersatz fuer die strikte Schema-Validierung.

---

## 7. E2E-Testing

### Setup

| Eigenschaft | Wert |
| --- | --- |
| Framework | Playwright |
| WebServer | startet `npm run dev` |
| Parallelisierung | seriell bzw. nicht voll parallel, um Rate-Limit-/State-Flakes zu vermeiden |
| DB-Helfer | `tests/e2e/helpers/db-cleanup.ts` |
| Server-Isolation | `reuseExistingServer: false`; ein bereits laufender Server wird nie uebernommen |
| Fail-closed Guard | Marker `E2E_DISPOSABLE_DB_CONFIRMED=1`, Loopback-Host und DB-Name mit `_test`, `-test`, `_e2e` oder `-e2e` sind gemeinsam erforderlich |

`scripts/run-local-env.mjs` laedt ausschliesslich `.env.test.local`, validiert PostgreSQL-Protokoll, Loopback, expliziten Testnamen, Credentials, NextAuth-Secret und `TRUST_PROXY=false` und setzt erst danach den Marker fuer Kindprozesse. `playwright.config.ts` wiederholt Host-/Namens-/Markerpruefung beim Laden. Jeder schreibende DB-Helfer prueft dieselben Grenzen vor dem ersten Prisma-Aufruf. Der terminbezogene Reset loescht ausschliesslich Terminmodelle und `appointment-*`-Rate-Limit-Buckets; Kontakt-, Benutzer- und Auditdaten werden nicht global mitgeloescht.

`playwright-report/` und `test-results/` sind ignorierte lokale Artefakte, weil HTML-Reports, Traces oder Screenshots Formularwerte und Testzugangsdaten enthalten koennen.

### Aktuelle Specs

- `auth.spec.ts`
- `contact.spec.ts`
- `security.spec.ts`
- `admin-dashboard.spec.ts`
- `admin-logic.spec.ts`
- `role-visibility.spec.ts`
- `chaos.spec.ts`
- `appointment-booking.spec.ts`
- `appointment-management.spec.ts`
- `appointment-admin.spec.ts`

### Abgedeckte Kernfaelle

- Login, Lockout und Fehlerszenarien
- Kontaktformular inkl. Honeypot und serverseitiger Validierung
- Admin-Dashboard, Benutzerverwaltung und Rollen-Sichtbarkeit
- Request-Management mit completion-coupled Einzel-/Bulk-Aktionen, sichtbaren Pending-Zustaenden, UI-Refresh bei Fehlschlag und atomarem Bulk-Failure-Verhalten
- Security-Haertung des Client-Error-Endpunkts
- UI-Rollback nach fehlgeschlagenen Server Actions
- AUTO/MANUAL-Buchung, Dauer-/Snapshot-/Slot-Konsistenz und interne versus online buchbare Typen
- Revalidation nach Slotwahl fuer geschlossenes Fenster, `BLOCK`, Mindestvorlauf, Horizont, Deaktivierung und entfernte Online-Freigabe
- Globale Ueberschneidungen und echte Zwei-Client-Konkurrenz mit exakt einem Gewinner sowie ohne Teilzustand
- DST-Fail-Closed fuer nicht existente/mehrdeutige Berliner 02:xx-Zeiten
- Klartext-Code versus DB-ID/gespeicherter Hash, HttpOnly-Session, Token-Isolation und Invalidierung alter Sessions
- Exaktes 256-Bit-Codeformat, 20-Minuten-Cookie/DB-Ablauf, abgelaufene Mutationssession und Access-Rate-Limit
- Idempotente Stornierung, gesperrte historische Termine, unveraenderliche Typ-Snapshots, MANUAL-Policy bei Verschiebung, atomare Slot-Umlagerung und Collision-Rollback
- Revision-CAS durch Replay einer bereits verbrauchten Admin-Mutation
- Staff-Terminbetrieb, Admin-Konfiguration, anonymes Action-Replay, Staff-Replay einer Admin-Action und Audit-Aktionen
- `PENDING` blockiert Kapazitaet bis zur Admin-Ablehnung; Ablehnung erhaelt den Termin und gibt alle Slots frei

### Testbefehle

```bash
npm run test:e2e:local
npm run test:e2e:local -- --reporter=list
```

Direktes `npm run test:e2e` ist absichtlich fail-closed, solange Marker und sichere Zielpruefung nicht nachweislich gesetzt sind. In dieser Implementierungsrunde bestanden Prisma-Generate/-Validate, ESLint, TypeScript und der Produktions-Build. Der finale Build verwendete eine lokale Dummy-URL auf einem unbenutzten Loopback-Port; die bestehende Prisma-Warmup-Logik konnte daher keine DB-Verbindung, Abfrage oder Mutation ausfuehren. `db push`, Seed und E2E blieben mangels nachgewiesener Wegwerf-Datenbank **blocked / not run**; die neuen Specs werden nicht als bestanden dokumentiert.

---

## 8. Operations und Deployment

### Aktuelle Betriebsmodelle

- Vercel: `x-vercel-forwarded-for` wird direkt vertraut
- Self-hosted mit Nginx/PM2: `TRUST_PROXY=true` plus korrekt gesetzte Proxy-Header erforderlich

### Nginx-Anforderungen

Self-hosted Reverse-Proxy-Deployments muessen mindestens weiterreichen:

- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`

Ohne diese Kombination plus `TRUST_PROXY=true` fail-closed:

- Login/Lockout
- Kontaktformular
- `/api/log/client-error`

### Umgebungsvariablen

| Variable | Pflicht | Zweck |
| --- | --- | --- |
| `DATABASE_URL` | ja | PostgreSQL-Verbindung |
| `NEXTAUTH_URL` | ja | Basis-URL fuer NextAuth |
| `NEXTAUTH_SECRET` | ja | JWT-Signing |
| `ADMIN_EMAIL` | nur Seed | Initialer Admin |
| `ADMIN_PASSWORD` | nur Seed | Initiales Admin-Passwort |
| `TRUST_PROXY` | self-hosted reverse proxy | vertraute Proxy-Header aktivieren |
| `LOG_LEVEL` | optional | Pino-Level |
| `E2E_DISPOSABLE_DB_CONFIRMED` | nur vom geprueften Local-Wrapper gesetzt | zweiter Fail-closed Marker fuer Playwright und schreibende Testhelfer |

Lokale E2E-/Prisma-Kommandos verwenden `.env.test.local` mit denselben Variablennamen plus einer `DATABASE_URL`, deren Host Loopback und deren Datenbankname explizit als Test/E2E gekennzeichnet ist. Reale Werte werden nicht dokumentiert oder committet.

### npm-Skripte

| Script | Zweck |
| --- | --- |
| `npm run dev` | lokaler Dev-Server |
| `npm run build` | `prisma generate` + Next-Build |
| `npm run start` | Produktionsserver |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Prisma Client generieren |
| `npm run prisma:push` | Schema in DB spiegeln |
| `npm run prisma:seed` | Admin-Seed |
| `npm run test:e2e` | Playwright |
| `npm run test:e2e:local` | gepruefter `.env.test.local`-Wrapper + Playwright |

---

## 9. Developer Runbook

### Erstes Setup

```bash
npm install
npx prisma validate
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
npm run dev
```

### Haeufige Aufgaben

**Praxisdaten aendern**

- `src/content/data.ts`

**Neues Kontaktformularfeld**

1. `prisma/schema.prisma` anpassen
2. `npx prisma db push`
3. `npx prisma generate`
4. `contactFormSchema` in `src/lib/schemas.ts` erweitern
5. Client-Komponente anpassen
6. `submitContactForm()` in `src/lib/actions/contact.ts` aktualisieren
7. Admin-Darstellung bei Bedarf anpassen

**Neue Admin- oder Staff-Logik**

- Session-/Auth-Grenzen in `src/lib/auth.ts`
- Action-Gates in `src/lib/actions/auth-helpers.ts`
- Admin-UI in `src/components/admin/*`

### Wichtige Nicht-Ziele

- Keine Laufzeit-SQL-Migrationen
- Kein Redis/Upstash fuer das aktuelle Rate-Limit-Modell
- Keine manuelle Audit-Log-Loeschung
- Kein clientseitiges Umgehen serverseitiger Validierung

---

## Letzte Aktualisierung

Dieses Dokument spiegelt den Stand nach Einfuehrung der transaktionalen Online-/Admin-Terminbuchung, codebasierter Patientenverwaltung, rollengetrennter Terminkonfiguration, fail-closed E2E-Isolation sowie der zugehoerigen Security-/Privacy-Haertung wider. Die neue E2E-Suite ist statisch implementiert, aber mangels verifizierter Wegwerf-Datenbank in dieser Runde nicht ausgefuehrt.
