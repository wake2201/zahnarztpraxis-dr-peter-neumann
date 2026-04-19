"use client";

import { motion } from "framer-motion";
import { Phone, CalendarCheck, Accessibility, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const badges = [
  { icon: Accessibility, label: "Barrierefreier Zugang" },
  { icon: Heart, label: "Individuelle Beratung" },
  { icon: CalendarCheck, label: "Flexible Termine" },
];

export function Hero() {
  return (
    <section
      id="start"
      className="relative min-h-screen flex items-center pt-20 md:pt-0 overflow-hidden"
    >
      {/* Hintergrund-Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Textbereich */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Zahnarztpraxis in Zeitz
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight tracking-tight">
              Ihre Zahngesundheit{" "}
              <span className="text-primary">in besten Händen</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Wir freuen uns, Sie in unserer modernen Zahnarztpraxis in Zeitz
              begrüßen zu dürfen. Vertrauensvolle Beratung und individuelle
              Leistungen für Ihr strahlendes Lächeln.
            </p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="w-full sm:min-w-[200px] h-12 text-base">
                <a href="#kontakt">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  Termin anfragen
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:min-w-[200px] h-12 text-base"
              >
                <a href="tel:03441223786">
                  <Phone className="w-4 h-4 mr-2" />
                  03441 223786 anrufen
                </a>
              </Button>
            </motion.div>

            {/* Vertrauens-Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-4 justify-center lg:justify-start"
            >
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-card text-sm text-slate-600 font-medium"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  {badge.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Bild-/Grafik-Bereich — Bento-Box Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Große Karte */}
              <div className="col-span-2 bg-white rounded-3xl shadow-card p-8 border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Dr. Peter Neumann
                    </h3>
                    <p className="text-sm text-slate-500">
                      Zahnarzt &bull; Zeitz
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Ihr Wohlbefinden und Ihre Gesundheit liegen uns am Herzen.
                  Rund um Ihre Zahngesundheit unterstützen wir Sie durch
                  ausführliche, vertrauensvolle Beratung.
                </p>
              </div>

              {/* Kleine Karten */}
              <div className="bg-primary rounded-2xl p-6 text-white shadow-lg">
                <div className="text-3xl font-bold">20+</div>
                <div className="text-sm text-white/80 mt-1">
                  Jahre Erfahrung
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-slate-500 mt-1">
                  Individuelle Betreuung
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
