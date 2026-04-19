import { prisma, pool } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const PW_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
const WEAK_PASSWORDS = new Set([
  "Admin123!",
  "Password1!",
  "Passwort1!",
  "Changeme1!",
]);

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "\u274c ADMIN_EMAIL und ADMIN_PASSWORD m\u00fcssen als Umgebungsvariablen in .env gesetzt sein.\n" +
        "   Beispiel: ADMIN_EMAIL=admin@praxis.de ADMIN_PASSWORD=MeinSicheresPasswort123",
    );
    process.exit(1);
  }

  if (password.length < 12 || !PW_COMPLEXITY.test(password) || WEAK_PASSWORDS.has(password)) {
    console.error(
      "\u274c ADMIN_PASSWORD ist zu schwach. Anforderungen:\n" +
        "   • min. 12 Zeichen\n" +
        "   • 1 Groß-, 1 Kleinbuchstabe, 1 Ziffer, 1 Sonderzeichen\n" +
        "   • kein bekanntes Default-Passwort",
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: "admin" },
    create: {
      email,
      password: hashedPassword,
      name: "Dr. Peter Neumann",
      role: "admin",
    },
  });

  console.log(`✅ Admin-Benutzer erstellt/aktualisiert: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding fehlgeschlagen:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
