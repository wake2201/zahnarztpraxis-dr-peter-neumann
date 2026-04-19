"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Clock,
  Phone,
  MapPin,
  AlertCircle,
  Accessibility,
} from "lucide-react";

const hours = [
  { day: "Montag", time: "08:00 – 13:00 & 14:00 – 18:00 Uhr" },
  { day: "Dienstag", time: "08:00 – 13:00 & 14:00 – 18:00 Uhr" },
  { day: "Mittwoch", time: "08:00 – 13:00 & 14:00 – 18:00 Uhr" },
  { day: "Donnerstag", time: "08:00 – 12:00 Uhr" },
  { day: "Freitag", time: "08:00 – 12:00 Uhr" },
];

export function Schedule() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="sprechzeiten"
      className="py-20 md:py-32 bg-slate-50"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Sprechzeiten & Kontakt
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            So erreichen Sie uns
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sprechzeiten Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-card border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Sprechzeiten
              </h3>
            </div>
            <div className="space-y-3">
              {hours.map((item) => (
                <div
                  key={item.day}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-100 last:border-0 gap-0.5 sm:gap-0"
                >
                  <span className="font-medium text-slate-700">
                    {item.day}
                  </span>
                  <span className="text-slate-600 text-sm">{item.time}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-700">
                  Weitere Termine
                </span>
                <span className="text-primary font-medium text-sm">
                  nach Vereinbarung
                </span>
              </div>
            </div>
          </motion.div>

          {/* Telefon Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-primary rounded-2xl p-8 text-white shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Telefon</h3>
            </div>
            <a
              href="tel:03441223786"
              className="text-2xl font-bold hover:underline transition-all"
            >
              03441 223786
            </a>
            <p className="mt-3 text-white/80 text-sm">
              Rufen Sie uns an oder nutzen Sie unser Kontaktformular weiter
              unten.
            </p>
          </motion.div>

          {/* Adresse Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-card border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Anfahrt</h3>
            </div>
            <address className="not-italic text-slate-600 leading-relaxed">
              <strong className="text-slate-800">
                Zahnarztpraxis Dr. Peter Neumann
              </strong>
              <br />
              Platz der Deutschen Einheit 5<br />
              06712 Zeitz
            </address>
          </motion.div>

          {/* Barrierefreiheit Hinweis — hervorgehoben */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2 bg-primary-50 rounded-2xl p-8 border-2 border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Accessibility className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-slate-800">
                    Wichtiger Hinweis
                  </h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Unsere Praxis verfügt über einen eigenen, barrierefreien
                  Eingang — diesen erreichen Sie am besten von der{" "}
                  <strong className="text-slate-800">
                    Dietrich-Bonhoeffer-Str.
                  </strong>{" "}
                  aus.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
