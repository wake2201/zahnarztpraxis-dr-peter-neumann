"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Send, CheckCircle, Loader2, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/actions";
import { EUROPEAN_COUNTRY_CODES } from "@/lib/country-codes";

type FormState = "idle" | "loading" | "success" | "error";

interface FormValues {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  message: string;
  gdprConsent: boolean;
  honeypot: string;
}

const INITIAL_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  countryCode: "+49",
  phone: "",
  message: "",
  gdprConsent: false,
  honeypot: "",
};

export function ContactForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "loading") return;
    setFormState("loading");
    setErrorMessage("");

    try {
      const result = await submitContactForm(values);

      if (result.success) {
        setFormState("success");
        setValues(INITIAL_VALUES);
      } else {
        setFormState("error");
        setErrorMessage(result.error || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setFormState("error");
      setErrorMessage("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
  }

  return (
    <section id="kontakt" className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Kontakt
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
              Termin anfragen
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Nutzen Sie unser Kontaktformular, um schnell und unkompliziert
              eine Anfrage zu stellen. Wir melden uns zeitnah bei Ihnen zurück.
            </p>

            <div className="space-y-4">
              <InfoCard icon={<Phone className="w-5 h-5 text-primary" />} label="Telefon">
                <a
                  href="tel:03441223786"
                  className="font-semibold text-slate-800 hover:text-primary transition-colors"
                >
                  03441 223786
                </a>
              </InfoCard>
              <InfoCard icon={<MapPin className="w-5 h-5 text-primary" />} label="Adresse">
                <p className="font-semibold text-slate-800">
                  Platz der Deutschen Einheit 5, 06712 Zeitz
                </p>
              </InfoCard>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {formState === "success" ? (
              <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Vielen Dank für Ihre Anfrage!
                </h3>
                <p className="text-green-600">
                  Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich
                  bei Ihnen melden.
                </p>
                <Button onClick={() => setFormState("idle")} variant="outline" className="mt-6">
                  Neue Anfrage senden
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 relative">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Vorname *
                    </label>
                    <Input
                      id="firstName"
                      required
                      value={values.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="Ihr Vorname"
                      maxLength={50}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nachname *
                    </label>
                    <Input
                      id="lastName"
                      required
                      value={values.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Ihr Nachname"
                      maxLength={50}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Telefonnummer *
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="countryCode"
                      name="countryCode"
                      autoComplete="tel-country-code"
                      value={values.countryCode}
                      onChange={(e) => updateField("countryCode", e.target.value)}
                      className="h-11 rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-200 w-[110px] sm:w-[140px] flex-shrink-0"
                      aria-label="Ländervorwahl"
                    >
                      {EUROPEAN_COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.country} {c.code}
                        </option>
                      ))}
                    </select>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={values.phone}
                      onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                      placeholder="123456789"
                      maxLength={20}
                      className="bg-white flex-1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Ihr Anliegen *
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={values.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="Beschreiben Sie kurz Ihr Anliegen..."
                    maxLength={2000}
                    className="bg-white"
                  />
                </div>

                {/* Honeypot-Feld (Spamschutz, unsichtbar für User) */}
                <div className="absolute opacity-0 top-0 left-0 h-0 w-0 -z-10" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.honeypot}
                    onChange={(e) => updateField("honeypot", e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={values.gdprConsent}
                      onChange={(e) => updateField("gdprConsent", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary flex-shrink-0"
                    />
                    <span className="text-sm text-slate-600 leading-relaxed">
                      Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und
                      Terminvereinbarung gespeichert werden. Weitere Informationen
                      finden Sie in unserer{" "}
                      <a href="/datenschutz" className="text-primary hover:underline font-medium">
                        Datenschutzerklärung
                      </a>
                      . *
                    </span>
                  </label>
                </div>

                {formState === "error" && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {errorMessage}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full text-base" disabled={formState === "loading"}>
                  {formState === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Anfrage absenden
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {children}
      </div>
    </div>
  );
}
