import pino from "pino";

/**
 * Zentraler Logger für die Zahnarztpraxis Dr. Peter Neumann.
 * 
 * DESIGN-ENTSCHEIDUNGEN:
 * 1. DSGVO-Sicherheit: Automatische Redaktion von PII (Namen, E-Mail, Telefon etc.)
 * 2. Performance: Pino nutzt non-blocking I/O und JSON für Vercel/PM2.
 * 3. Traceability: Unterstützung von Trace-IDs für request-übergreifendes Logging.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Standard-Serializer für native Error-Objekte
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  // DSGVO-Schutz: Redaktion sensibler Pfade in Log-Objekten.
  // WICHTIG: Nur qualifizierte Pfade (data.*, user.*, payload.*) — NIEMALS
  // Top-Level `name`/`email` etc., da Pino dann auch `error.name` und
  // `action: "createUser"` (Feld `name` via Child-Logger) redactet.
  redact: {
    paths: [
      // Kontaktformular-Payload
      "data.email", "data.password", "data.firstName", "data.lastName",
      "data.phone", "data.message", "data.name",
      // User-Payload
      "user.email", "user.password", "user.firstName", "user.lastName",
      "user.phone", "user.name",
      // Generischer Payload-Container
      "payload.email", "payload.password", "payload.phone",
      "payload.firstName", "payload.lastName", "payload.name", "payload.message",
      // Direct Top-Level PII (konservativ — NIEMALS für Struktur-Felder nutzen)
      "password",
    ],
    censor: "[REDACTED]",
  },
  // Formatiert Log-Level als Strings (z.B. "INFO" statt 30)
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
