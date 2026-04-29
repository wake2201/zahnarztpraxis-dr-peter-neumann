# Zahnarztpraxis Dr. Peter Neumann - Website

Moderne, DSGVO-konforme Website fuer die Zahnarztpraxis Dr. Peter Neumann in Zeitz.

**Tech-Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma 7, NextAuth.js, Playwright

---

## Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Projekt auf den Server bringen](#2-projekt-auf-den-server-bringen)
3. [Umgebungsvariablen konfigurieren](#3-umgebungsvariablen-konfigurieren)
4. [PostgreSQL und Prisma einrichten](#4-postgresql-und-prisma-einrichten)
5. [Produktions-Build erstellen](#5-produktions-build-erstellen)
6. [Anwendung mit PM2 starten](#6-anwendung-mit-pm2-starten)
7. [Nginx als Reverse Proxy konfigurieren](#7-nginx-als-reverse-proxy-konfigurieren)
8. [SSL-Zertifikat mit Let's Encrypt](#8-ssl-zertifikat-mit-lets-encrypt)
9. [Firewall konfigurieren](#9-firewall-konfigurieren)
10. [Wartung und Betrieb](#10-wartung-und-betrieb)
11. [Projektstruktur](#11-projektstruktur)
12. [Fehlerbehebung](#12-fehlerbehebung)

---

## 1. Voraussetzungen

Auf dem Server (Ubuntu/Debian empfohlen) werden folgende Pakete benoetigt:

### Node.js >= 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node --version
npm --version
```

### PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### PM2

```bash
sudo npm install -g pm2
pm2 startup
```

### Git (optional)

```bash
sudo apt install -y git
```

---

## 2. Projekt auf den Server bringen

### Option A: Via Git

```bash
sudo mkdir -p /var/www/zahnarztpraxis
sudo chown $USER:$USER /var/www/zahnarztpraxis

cd /var/www
git clone <REPO-URL> zahnarztpraxis
cd zahnarztpraxis
```

### Option B: Via SCP

```bash
scp -r ./website/* benutzer@server-ip:/var/www/zahnarztpraxis/
```

### Abhaengigkeiten installieren

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

Beispiel:

```env
# PostgreSQL
DATABASE_URL="postgres://benutzer:passwort@localhost:5432/zahnarzt_db?sslmode=verify-full"

# NextAuth.js
NEXTAUTH_URL="https://ihre-domain.de"
NEXTAUTH_SECRET="HIER-EINEN-ECHTEN-ZUFALLSSTRING-EINFUEGEN"

# Admin-Benutzer fuer das Seeding
ADMIN_EMAIL="admin@zeitzer-zahnarzt.de"
ADMIN_PASSWORD="EinSicheresPasswort123!"

# Reverse Proxy
# Nur setzen, wenn die App hinter einem vertrauenswuerdigen Reverse Proxy
# (Nginx, Traefik o.ae.) laeuft, der x-real-ip / x-forwarded-for korrekt
# ueberschreibt.
TRUST_PROXY="true"
```

### NEXTAUTH_SECRET generieren

```bash
openssl rand -base64 32
```

### Wichtiger Hinweis zu `TRUST_PROXY`

- Auf Vercel **nicht** setzen; dort wird `x-vercel-forwarded-for` automatisch verwendet.
- Hinter Nginx/Traefik ist `TRUST_PROXY="true"` **erforderlich**, damit Login-Lockout, Kontaktformular-Rate-Limit und `/api/log/client-error` eine vertrauenswuerdige Client-IP ableiten koennen.
- Ohne korrekte Proxy-Header plus `TRUST_PROXY=true` schlagen diese sicherheitssensitiven Routen in Produktion bewusst **fail-closed** fehl.

---

## 4. PostgreSQL und Prisma einrichten

Die Anwendung ist ausschliesslich fuer PostgreSQL konfiguriert.

### Datenbank und Benutzer anlegen

```bash
sudo -u postgres psql
```

```sql
CREATE USER zahnarzt WITH PASSWORD 'sicheres-passwort';
CREATE DATABASE zahnarzt_db OWNER zahnarzt;
GRANT ALL PRIVILEGES ON DATABASE zahnarzt_db TO zahnarzt;
\q
```

### Prisma validieren und Schema ausrollen

```bash
cd /var/www/zahnarztpraxis

npx prisma validate
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

Wichtig:

- Es gibt keine Prisma-Migrationsdateien; Schema-Sync erfolgt bewusst nur ueber `prisma db push`.
- `prisma.config.ts` liefert die `DATABASE_URL` fuer Prisma-CLI-Befehle.

### Lokale Testdatenbank fuer Entwicklung und E2E

Lokale Validierung soll nicht gegen die produktive oder Vercel-Datenbank laufen. Lege dafuer eine lokale PostgreSQL-Datenbank und eine nicht versionierte `.env.test.local` im Projektverzeichnis an. Die Datei ist durch `.gitignore` abgedeckt und darf nicht committet werden.

```powershell
createdb -h localhost -p 5432 -U <LOCAL_POSTGRES_USER> zahnarzt_test
```

```env
DATABASE_URL="postgresql://<LOCAL_POSTGRES_USER>:<LOCAL_POSTGRES_PASSWORD>@localhost:5432/zahnarzt_test?sslmode=disable"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<GENERATED_32_PLUS_CHARACTER_LOCAL_SECRET>"
ADMIN_EMAIL="<LOCAL_ADMIN_EMAIL>"
ADMIN_PASSWORD="<LOCAL_STRONG_ADMIN_PASSWORD>"
TRUST_PROXY="false"
```

`NEXTAUTH_SECRET` muss mindestens 32 Zeichen lang sein:

```powershell
node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64'))"
```

Lokale Validierung nutzt explizit `.env.test.local` und bricht ab, wenn `DATABASE_URL` nicht auf localhost zeigt:

```powershell
npm run prisma:validate:local
npm run prisma:push:local
npm run prisma:generate:local
npm run prisma:seed:local
npm run test:e2e:local -- --reporter=list
```

---

## 5. Produktions-Build erstellen

```bash
cd /var/www/zahnarztpraxis
npm run build
```

Der Build fuehrt zuerst `prisma generate` aus und erstellt anschliessend den Next.js-Produktions-Build.

---

## 6. Anwendung mit PM2 starten

```bash
cd /var/www/zahnarztpraxis

pm2 start npm --name "zahnarztpraxis" -- start
pm2 status
```

Nuetzliche Befehle:

```bash
pm2 status
pm2 logs zahnarztpraxis
pm2 restart zahnarztpraxis
pm2 stop zahnarztpraxis
pm2 delete zahnarztpraxis
pm2 save
```

---

## 7. Nginx als Reverse Proxy konfigurieren

```bash
sudo nano /etc/nginx/sites-available/zahnarztpraxis
```

Beispielkonfiguration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ihre-domain.de www.ihre-domain.de;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ihre-domain.de www.ihre-domain.de;

    ssl_certificate     /etc/letsencrypt/live/ihre-domain.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ihre-domain.de/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 10M;

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

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Konfiguration aktivieren:

```bash
sudo ln -s /etc/nginx/sites-available/zahnarztpraxis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Wichtig:

- Hinter Nginx muss `.env` `TRUST_PROXY="true"` enthalten.
- `X-Real-IP`, `X-Forwarded-For` und `X-Forwarded-Proto` muessen korrekt weitergereicht werden.
- Fehlt diese Kombination, fail-closed die App Login-Lockout, Kontaktformular und `/api/log/client-error` in Produktion absichtlich.

---

## 8. SSL-Zertifikat mit Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ihre-domain.de -d www.ihre-domain.de
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

---

## 9. Firewall konfigurieren

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Port 3000 nicht oeffnen; Nginx leitet intern weiter.

---

## 10. Wartung und Betrieb

### Anwendung aktualisieren

```bash
cd /var/www/zahnarztpraxis

git pull origin main
npm install
npx prisma validate
npx prisma db push
npx prisma generate
npm run build
pm2 restart zahnarztpraxis
```

### PostgreSQL-Backup

```bash
pg_dump -U zahnarzt zahnarzt_db > /backup/zahnarzt_$(date +%Y%m%d).sql
```

Automatisches taegliches Backup:

```bash
crontab -e
0 3 * * * pg_dump -U zahnarzt zahnarzt_db > /backup/zahnarzt_$(date +\%Y\%m\%d).sql
```

### Logs pruefen

```bash
pm2 logs zahnarztpraxis
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 11. Projektstruktur

```text
zahnarztpraxis/
├── prisma/
│   ├── schema.prisma          # Datenbank-Schema
│   └── seed.ts                # Admin-Benutzer Seeding
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── datenschutz/
│   │   ├── impressum/
│   │   └── admin/
│   │       ├── login/
│   │       └── (protected)/
│   ├── components/
│   └── lib/
│       ├── actions.ts         # Stabiler Barrel-Export
│       ├── actions/           # contact.ts, users.ts, logs.ts
│       ├── auth.ts
│       ├── client-ip.ts
│       ├── logger.ts
│       ├── prisma.ts
│       ├── rate-limit.ts
│       ├── schemas.ts
│       └── session.ts
├── tests/
│   └── e2e/                   # auth, contact, security, admin, role visibility
├── .env.example
├── next.config.ts
├── package.json
└── prisma.config.ts
```

---

## 12. Fehlerbehebung

### "Can't reach database server"

- Pruefe, ob PostgreSQL laeuft: `sudo systemctl status postgresql`
- Pruefe `DATABASE_URL` in `.env`
- Teste Prisma-CLI separat: `npx prisma validate` und `npx prisma db push`

### Login oder Kontaktformular antworten in Produktion mit Fehler

- Pruefe bei Reverse-Proxy-Betrieb, ob `.env` `TRUST_PROXY="true"` enthaelt.
- Pruefe, ob Nginx `X-Real-IP`, `X-Forwarded-For` und `X-Forwarded-Proto` korrekt setzt.
- Ohne vertrauenswuerdige Proxy-Header plus `TRUST_PROXY=true` fail-closed Login-Lockout, Kontaktformular und `/api/log/client-error` absichtlich.

### "Ungueltige Anmeldedaten" im Admin-Panel

- Admin-User erneut seeden: `npx tsx prisma/seed.ts`
- `ADMIN_EMAIL` und `ADMIN_PASSWORD` in `.env` pruefen

### Build-Fehler

```bash
rm -rf .next
npm run build
```

### Nginx zeigt 502 Bad Gateway

- `pm2 status`
- `ss -tlnp | grep 3000`
- `pm2 logs zahnarztpraxis`

### Prisma Client veraltet

```bash
npx prisma generate
pm2 restart zahnarztpraxis
```
