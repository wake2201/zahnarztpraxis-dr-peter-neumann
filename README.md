# Zahnarztpraxis Dr. Peter Neumann — Website

Moderne, DSGVO-konforme Website für die Zahnarztpraxis Dr. Peter Neumann in Zeitz.

**Tech-Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma ORM · NextAuth.js · Framer Motion

---

## Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Projekt auf den Server bringen](#2-projekt-auf-den-server-bringen)
3. [Umgebungsvariablen konfigurieren](#3-umgebungsvariablen-konfigurieren)
4. [Datenbank einrichten](#4-datenbank-einrichten)
5. [Produktions-Build erstellen](#5-produktions-build-erstellen)
6. [Anwendung mit PM2 starten](#6-anwendung-mit-pm2-starten)
7. [Nginx als Reverse Proxy konfigurieren](#7-nginx-als-reverse-proxy-konfigurieren)
8. [SSL-Zertifikat mit Let's Encrypt](#8-ssl-zertifikat-mit-lets-encrypt)
9. [Firewall konfigurieren](#9-firewall-konfigurieren)
10. [Wartung & Updates](#10-wartung--updates)
11. [Datenbankwechsel SQLite → PostgreSQL](#11-datenbankwechsel-sqlite--postgresql)
12. [Projektstruktur](#12-projektstruktur)
13. [Fehlerbehebung](#13-fehlerbehebung)

---

## 1. Voraussetzungen

Auf dem Server (Ubuntu/Debian empfohlen) müssen folgende Pakete installiert sein:

### Node.js ≥ 18

```bash
# Node.js 20 LTS installieren (empfohlen)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Version prüfen
node --version   # Sollte v20.x.x oder höher sein
npm --version
```

### Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Status prüfen
sudo systemctl status nginx
```

### PM2 (Process Manager)

```bash
sudo npm install -g pm2

# PM2 Auto-Start nach Server-Reboot aktivieren
pm2 startup
# → Den angezeigten Befehl kopieren und ausführen
```

### Git (optional, zum Klonen des Repos)

```bash
sudo apt install -y git
```

---

## 2. Projekt auf den Server bringen

### Option A: Via Git

```bash
# Projektverzeichnis erstellen
sudo mkdir -p /var/www/zahnarztpraxis
sudo chown $USER:$USER /var/www/zahnarztpraxis

# Repository klonen
cd /var/www
git clone <DEIN-REPO-URL> zahnarztpraxis
cd zahnarztpraxis
```

### Option B: Via SCP (vom lokalen Rechner)

```bash
# Vom lokalen Rechner aus (ohne node_modules und .next)
scp -r ./website/* benutzer@server-ip:/var/www/zahnarztpraxis/
```

### Abhängigkeiten installieren

```bash
cd /var/www/zahnarztpraxis
npm install
```

---

## 3. Umgebungsvariablen konfigurieren

Erstelle die `.env`-Datei im Projektverzeichnis:

```bash
cd /var/www/zahnarztpraxis
nano .env
```

Inhalt (Werte anpassen!):

```env
# Datenbank — SQLite (Standard, einfach)
DATABASE_URL="file:./prod.db"

# Für PostgreSQL stattdessen:
# DATABASE_URL="postgresql://benutzer:passwort@localhost:5432/zahnarzt_db?schema=public"

# NextAuth.js — WICHTIG: Eigene Domain eintragen!
NEXTAUTH_URL="https://www.zeitzer-zahnarzt.de"

# NextAuth Secret — MUSS ein zufälliger String sein!
# Generieren mit: openssl rand -base64 32
NEXTAUTH_SECRET="HIER-EINEN-ECHTEN-ZUFALLSSTRING-EINFUEGEN"

# Admin-Benutzer für den ersten Login (wird beim Seeding verwendet)
ADMIN_EMAIL="admin@zeitzer-zahnarzt.de"
ADMIN_PASSWORD="EinSicheresPasswort123!"
```

### NEXTAUTH_SECRET generieren

```bash
openssl rand -base64 32
```

Den ausgegebenen String als `NEXTAUTH_SECRET` in die `.env`-Datei eintragen.

> ⚠️ **WICHTIG:** Verwende in der Produktion NIEMALS das Standard-Passwort `Admin123!`. Wähle ein sicheres Passwort mit mindestens 12 Zeichen, Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen.

---

## 4. Datenbank einrichten

### SQLite (Standard — empfohlen für kleine Praxen)

```bash
cd /var/www/zahnarztpraxis

# Datenbank-Tabellen erstellen
npx prisma db push

# Admin-Benutzer anlegen
npx tsx prisma/seed.ts
```

Die SQLite-Datei `prod.db` wird automatisch im `prisma/`-Ordner erstellt.

### PostgreSQL (optional)

Siehe [Abschnitt 11: Datenbankwechsel](#11-datenbankwechsel-sqlite--postgresql) oder nutze das mitgelieferte Migrations-Skript:

```bash
node scripts/migrate-to-postgres.js
```

---

## 5. Produktions-Build erstellen

```bash
cd /var/www/zahnarztpraxis
npm run build
```

Erwartete Ausgabe:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

> Bei Fehlern: Siehe [Abschnitt 13: Fehlerbehebung](#13-fehlerbehebung).

---

## 6. Anwendung mit PM2 starten

### Starten

```bash
cd /var/www/zahnarztpraxis

# Anwendung starten
pm2 start npm --name "zahnarztpraxis" -- start

# Prüfen ob sie läuft
pm2 status
```

Die App läuft nun auf `http://localhost:3000`.

### Nützliche PM2-Befehle

```bash
# Status anzeigen
pm2 status

# Logs anzeigen (Live)
pm2 logs zahnarztpraxis

# Neustart (z.B. nach Update)
pm2 restart zahnarztpraxis

# Stoppen
pm2 stop zahnarztpraxis

# Löschen
pm2 delete zahnarztpraxis

# Konfiguration speichern (überlebt Server-Reboot)
pm2 save
```

### Automatischer Neustart nach Server-Reboot

```bash
pm2 startup
# → Den angezeigten Befehl als root/sudo ausführen
pm2 save
```

---

## 7. Nginx als Reverse Proxy konfigurieren

### Konfigurationsdatei erstellen

```bash
sudo nano /etc/nginx/sites-available/zahnarztpraxis
```

Folgenden Inhalt einfügen (Domain anpassen!):

```nginx
# HTTP → HTTPS Weiterleitung
server {
    listen 80;
    listen [::]:80;
    server_name www.zeitzer-zahnarzt.de zeitzer-zahnarzt.de;

    # Let's Encrypt Validierung
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Alles andere auf HTTPS umleiten
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS — Hauptkonfiguration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.zeitzer-zahnarzt.de zeitzer-zahnarzt.de;

    # SSL-Zertifikate (werden in Schritt 8 erstellt)
    ssl_certificate     /etc/letsencrypt/live/zeitzer-zahnarzt.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zeitzer-zahnarzt.de/privkey.pem;

    # SSL-Sicherheitseinstellungen
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Sicherheits-Header
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Maximale Upload-Größe (für Formulare)
    client_max_body_size 10M;

    # Statische Dateien direkt von Nginx ausliefern (Performance)
    location /_next/static/ {
        alias /var/www/zahnarztpraxis/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /var/www/zahnarztpraxis/public/;
        expires 30d;
        access_log off;
    }

    # Alles andere an Next.js weiterleiten
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket-Unterstützung
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Wichtige Header weiterleiten
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Konfiguration aktivieren

```bash
# Symlink erstellen
sudo ln -s /etc/nginx/sites-available/zahnarztpraxis /etc/nginx/sites-enabled/

# Standard-Seite deaktivieren (optional)
sudo rm /etc/nginx/sites-enabled/default

# Konfiguration prüfen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

> ⚠️ **Hinweis:** Die SSL-Zeilen funktionieren erst nach Schritt 8. Kommentiere sie vorher aus, wenn du Nginx vorab testen willst.

---

## 8. SSL-Zertifikat mit Let's Encrypt

### Certbot installieren

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Zertifikat erstellen

```bash
sudo certbot --nginx -d zeitzer-zahnarzt.de -d www.zeitzer-zahnarzt.de
```

Certbot wird:
1. Ein SSL-Zertifikat generieren
2. Die Nginx-Konfiguration automatisch aktualisieren
3. Automatische Erneuerung einrichten

### Automatische Erneuerung prüfen

```bash
# Testlauf
sudo certbot renew --dry-run

# Timer prüfen (sollte aktiv sein)
sudo systemctl status certbot.timer
```

Let's Encrypt Zertifikate sind **90 Tage** gültig und werden automatisch erneuert.

---

## 9. Firewall konfigurieren

```bash
# UFW installieren (falls nicht vorhanden)
sudo apt install -y ufw

# Regeln setzen
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Port 3000 NICHT öffnen — Nginx leitet intern weiter

# Firewall aktivieren
sudo ufw enable

# Status prüfen
sudo ufw status
```

---

## 10. Wartung & Updates

### Website aktualisieren

```bash
cd /var/www/zahnarztpraxis

# Neuesten Code holen (bei Git)
git pull origin main

# Abhängigkeiten aktualisieren
npm install

# Falls Prisma-Schema geändert wurde
npx prisma db push
npx prisma generate

# Neu bauen
npm run build

# Neustart
pm2 restart zahnarztpraxis
```

### Datenbank-Backup (SQLite)

```bash
# Einfaches Backup — SQLite ist nur eine Datei
cp /var/www/zahnarztpraxis/prisma/prod.db /backup/zahnarzt_$(date +%Y%m%d).db
```

Automatisches tägliches Backup mit Cron:

```bash
crontab -e
# Folgende Zeile hinzufügen:
0 3 * * * cp /var/www/zahnarztpraxis/prisma/prod.db /backup/zahnarzt_$(date +\%Y\%m\%d).db
```

### Datenbank-Backup (PostgreSQL)

```bash
pg_dump -U zahnarzt zahnarzt_db > /backup/zahnarzt_$(date +%Y%m%d).sql
```

### Logs prüfen

```bash
# Next.js Logs
pm2 logs zahnarztpraxis

# Nginx Access-Logs
sudo tail -f /var/log/nginx/access.log

# Nginx Error-Logs
sudo tail -f /var/log/nginx/error.log
```

---

## 11. Datenbankwechsel SQLite → PostgreSQL

Ein Migrations-Skript ist unter `scripts/migrate-to-postgres.js` vorhanden.

### Voraussetzungen

PostgreSQL muss auf dem Server installiert und konfiguriert sein:

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql

# Datenbank und Benutzer erstellen
sudo -u postgres psql
```

```sql
CREATE USER zahnarzt WITH PASSWORD 'sicheres-passwort';
CREATE DATABASE zahnarzt_db OWNER zahnarzt;
GRANT ALL PRIVILEGES ON DATABASE zahnarzt_db TO zahnarzt;
\q
```

### Migration ausführen

```bash
cd /var/www/zahnarztpraxis

# .env aktualisieren: DATABASE_URL auf PostgreSQL setzen
# DATABASE_URL="postgresql://zahnarzt:sicheres-passwort@localhost:5432/zahnarzt_db?schema=public"

# Migrations-Skript starten
node scripts/migrate-to-postgres.js
```

Das Skript:
1. Liest alle bestehenden Daten aus der SQLite-Datenbank
2. Ändert `prisma/schema.prisma` automatisch auf PostgreSQL
3. Führt `prisma db push` und `prisma generate` aus
4. Migriert alle bestehenden Daten (Benutzer + Kontaktanfragen) nach PostgreSQL
5. Erstellt ein Backup der SQLite-Datenbank

### Manueller Wechsel (ohne Skript)

1. In `prisma/schema.prisma`: `provider` von `"sqlite"` auf `"postgresql"` ändern
2. Zum `message`-Feld `@db.Text` hinzufügen
3. In `.env`: `DATABASE_URL` auf PostgreSQL-String setzen
4. `npx prisma db push` ausführen
5. `npx prisma generate` ausführen
6. `npx tsx prisma/seed.ts` für Admin-User

---

## 12. Projektstruktur

```
zahnarztpraxis/
├── prisma/
│   ├── schema.prisma          # Datenbank-Schema
│   ├── seed.ts                # Admin-Benutzer Seeding
│   └── dev.db / prod.db       # SQLite-Datenbank (lokal)
├── scripts/
│   └── migrate-to-postgres.js # SQLite → PostgreSQL Migration
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root-Layout (Schrift, Metadata)
│   │   ├── page.tsx           # Startseite
│   │   ├── impressum/         # Impressum
│   │   ├── datenschutz/       # Datenschutzerklärung
│   │   └── admin/
│   │       ├── login/         # Admin-Login
│   │       ├── page.tsx       # Dashboard (Server Component)
│   │       └── dashboard-client.tsx
│   ├── components/
│   │   ├── navbar.tsx         # Navigation
│   │   ├── hero.tsx           # Hero-Bereich
│   │   ├── about.tsx          # Über uns
│   │   ├── schedule.tsx       # Sprechzeiten & Kontakt
│   │   ├── contact-form.tsx   # Kontaktformular (DSGVO)
│   │   ├── footer.tsx         # Footer
│   │   ├── cookie-banner.tsx  # DSGVO Cookie-Hinweis
│   │   └── ui/               # Basis-UI-Komponenten
│   ├── lib/
│   │   ├── auth.ts            # NextAuth.js Konfiguration
│   │   ├── actions.ts         # Server Actions
│   │   ├── prisma.ts          # Prisma Client Singleton
│   │   └── utils.ts           # Hilfsfunktionen
│   └── styles/
│       └── globals.css        # Globale Styles
├── .env                       # Umgebungsvariablen (NICHT committen!)
├── .env.example               # Vorlage für .env
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 13. Fehlerbehebung

### "Can't reach database server"

- **SQLite:** Prüfe ob `DATABASE_URL` in `.env` korrekt ist: `file:./prod.db`
- **PostgreSQL:** Prüfe ob PostgreSQL läuft: `sudo systemctl status postgresql`
- Verbindung testen: `npx prisma db push`

### "Ungültige Anmeldedaten" im Admin-Panel

- Admin-User muss geseeded sein: `npx tsx prisma/seed.ts`
- Prüfe `ADMIN_EMAIL` und `ADMIN_PASSWORD` in `.env`
- Nach Änderung der `.env` erneut seeden

### Build-Fehler

```bash
# Cache leeren und neu bauen
rm -rf .next
npm run build
```

### Nginx zeigt 502 Bad Gateway

- Prüfe ob Next.js läuft: `pm2 status`
- Prüfe ob Port 3000 belegt ist: `ss -tlnp | grep 3000`
- Logs prüfen: `pm2 logs zahnarztpraxis`

### SSL-Zertifikat Probleme

```bash
# Zertifikat manuell erneuern
sudo certbot renew

# Nginx neu laden
sudo systemctl reload nginx
```

### Prisma Client veraltet

```bash
npx prisma generate
pm2 restart zahnarztpraxis
```

---

## Schnellstart (Zusammenfassung)

```bash
# 1. Auf den Server
cd /var/www/zahnarztpraxis

# 2. Abhängigkeiten
npm install

# 3. .env konfigurieren (siehe Abschnitt 3)
nano .env

# 4. Datenbank
npx prisma db push
npx tsx prisma/seed.ts

# 5. Build
npm run build

# 6. Starten
pm2 start npm --name "zahnarztpraxis" -- start
pm2 save

# 7. Nginx konfigurieren (siehe Abschnitt 7)
# 8. SSL einrichten (siehe Abschnitt 8)
```
