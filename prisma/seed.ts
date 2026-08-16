import bcrypt from "bcryptjs";
import { logger } from "../src/lib/logger";
import { pool, prisma } from "../src/lib/prisma";
import {
  APPOINTMENT_SETTINGS_ID,
  APPOINTMENT_SLOT_MINUTES,
  APPOINTMENT_TIME_ZONE,
  DEFAULT_BOOKING_HORIZON_DAYS,
  DEFAULT_MINIMUM_NOTICE_MINUTES,
} from "../src/lib/appointments/constants";

const PASSWORD_COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
const WEAK_PASSWORDS = new Set([
  "Admin123!",
  "Password1!",
  "Passwort1!",
  "Changeme1!",
]);

function getSeedCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL und ADMIN_PASSWORD muessen als Umgebungsvariablen in .env gesetzt sein.\n" +
        "Beispiel: ADMIN_EMAIL=admin@praxis.de ADMIN_PASSWORD=EinSicheresPasswort123!",
    );
  }

  if (password.length < 12 || !PASSWORD_COMPLEXITY.test(password) || WEAK_PASSWORDS.has(password)) {
    throw new Error(
      "ADMIN_PASSWORD ist zu schwach. Anforderungen:\n" +
        "- min. 12 Zeichen\n" +
        "- 1 Gross-, 1 Kleinbuchstabe, 1 Ziffer, 1 Sonderzeichen\n" +
        "- kein bekanntes Default-Passwort",
    );
  }

  return { email, password };
}

async function main() {
  const { email, password } = getSeedCredentials();
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.$transaction(async (tx) => {
    await tx.appointmentSettings.upsert({
      where: { id: APPOINTMENT_SETTINGS_ID },
      update: {},
      create: {
        id: APPOINTMENT_SETTINGS_ID,
        slotMinutes: APPOINTMENT_SLOT_MINUTES,
        minimumNoticeMinutes: DEFAULT_MINIMUM_NOTICE_MINUTES,
        bookingHorizonDays: DEFAULT_BOOKING_HORIZON_DAYS,
        timeZone: APPOINTMENT_TIME_ZONE,
      },
    });

    return tx.user.upsert({
      where: { email },
      update: { password: hashedPassword, role: "admin" },
      create: {
        email,
        password: hashedPassword,
        name: "Dr. Peter Neumann",
        role: "admin",
      },
    });
  });

  logger.info(
    { action: "seedAdmin", userId: admin.id },
    "[seedAdmin] Admin-Benutzer erstellt oder aktualisiert",
  );
}

main()
  .catch((error) => {
    logger.error({ err: error, action: "seedAdmin" }, "[seedAdmin] Seeding fehlgeschlagen");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
