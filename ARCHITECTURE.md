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

### Datenmodell-Details

- `ContactRequest.message` speichert den serverseitig gebauten Freitext aus validierten strukturierten Formularfeldern
- `LoginAttempt.identifier` ist ein SHA-256-Hash aus vertrauenswuerdiger IP, User-Agent-Kontext und Bucket-Typ
- `AuditLog.action` enthaelt aktuell produktive Aktionen wie `LOGIN`, `CREATE_USER`, `DELETE_USER`, `DELETE_REQUEST`
- `RateLimit.ip` speichert den Bucket-Key, also z.B. `contact:<ip>` oder `client-error:<ip>`

---

## 4. Datenfluss und Server Actions

### Server-Action-Aufteilung

| Modul | Verantwortlich fuer |
| --- | --- |
| `actions/contact.ts` | Oeffentliches Kontaktformular und Request-Verwaltung |
| `actions/users.ts` | Benutzeranlage, Benutzerloeschung, Benutzerliste |
| `actions/logs.ts` | Audit-Log-Lesen und Retention-Cleanup |
| `actions.ts` | Barrel-Export fuer Komponentenimporte |

### Serverseitige Validierung

`src/lib/schemas.ts` ist die einzige Quelle fuer Eingabevalidierung.

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
- `toggleReadStatusSchema`
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

### Admin-Dashboard-Datenfluss

- `(protected)/layout.tsx` sichert die Route ueber `getServerSession()`
- `(protected)/page.tsx` laedt Daten serverseitig
- Kontaktanfragen sind fuer `admin` und `staff` sichtbar
- Benutzer und Audit-Logs sind nur fuer `admin` sichtbar
- Teilabfragen werden mit `Promise.allSettled(...)` geladen, damit ein Teilfehler nicht das gesamte Dashboard unnoetig blockiert

### Aktuelle Server Actions

#### Oeffentlich

| Funktion | Input | Output | Bemerkung |
| --- | --- | --- | --- |
| `submitContactForm()` | strukturierte Formdaten | `{ success, error? }` | serverseitig validiert, rate-limitiert, transaktional |

#### Geschuetzt (`requireAuth()`)

| Funktion | Input | Output | Bemerkung |
| --- | --- | --- | --- |
| `getContactRequests()` | optionaler Cursor | `ContactRequest[]` | sortiert nach `createdAt desc` |
| `toggleReadStatus()` | `id`, `newReadStatus` | `{ success, error? }` | direktes Setzen des Zielstatus |
| `deleteContactRequest()` | `id` | `{ success, error? }` | transaktional mit Audit-Log |

#### Admin-only (`requireAdmin()`)

| Funktion | Input | Output | Bemerkung |
| --- | --- | --- | --- |
| `createUser()` | `{ name, email, password }` | `{ success, error? }` | transaktional mit Audit-Log |
| `deleteUser()` | `id` | `{ success, error? }` | blockiert Self-Delete und Admin-Loeschung |
| `getUsers()` | - | `UserAccount[]` | Dashboard-Rollenmodell `admin | staff | unknown` |
| `getAuditLogs()` | - | `AuditLog[]` | letzte 100 Eintraege + Retention-Cleanup |

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

| Rolle | Anfragen | Benutzer | Audit-Logs |
| --- | --- | --- | --- |
| `admin` | ja | ja | ja |
| `staff` | ja | nein | nein |

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

### Aktuelle Specs

- `auth.spec.ts`
- `contact.spec.ts`
- `security.spec.ts`
- `admin-dashboard.spec.ts`
- `admin-logic.spec.ts`
- `role-visibility.spec.ts`
- `chaos.spec.ts`

### Abgedeckte Kernfaelle

- Login, Lockout und Fehlerszenarien
- Kontaktformular inkl. Honeypot und serverseitiger Validierung
- Admin-Dashboard, Benutzerverwaltung und Rollen-Sichtbarkeit
- Security-Haertung des Client-Error-Endpunkts
- UI-Rollback nach fehlgeschlagenen Server Actions

### Testbefehle

```bash
npm run test:e2e
npm run test:e2e -- --reporter=list
```

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

Dieses Dokument spiegelt den Stand nach Security/Privacy-Haertung, Logik- und Datenflusskorrekturen, Dead-Code-Cleanup sowie finaler Dokumentationsangleichung wider.
