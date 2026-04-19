"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Stethoscope, Users, Award } from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Umfassende Diagnostik",
    description:
      "Modernste Behandlungsmethoden für Ihre bestmögliche zahnmedizinische Versorgung.",
  },
  {
    icon: Shield,
    title: "Vertrauensvolle Beratung",
    description:
      "Wir nehmen uns Zeit für eine ausführliche Beratung, damit Sie sich gut aufgehoben fühlen.",
  },
  {
    icon: Users,
    title: "Persönliche Betreuung",
    description:
      "Jeder Patient ist einzigartig — wir erstellen individuelle Behandlungspläne.",
  },
  {
    icon: Award,
    title: "Langjährige Erfahrung",
    description:
      "Profitieren Sie von der umfangreichen Expertise unseres erfahrenen Teams.",
  },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="ueber-uns" className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Über uns
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
            Willkommen in unserer Praxis
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Liebe Patientinnen, liebe Patienten, wir freuen uns sehr Sie auf
            unserer Webseite und in unserer Praxis begrüßen zu dürfen! Ihr
            Wohlbefinden und Ihre Gesundheit liegen uns am Herzen. Rund um Ihre
            Zahngesundheit unterstützen wir unsere Patienten durch ausführliche,
            vertrauensvolle Beratung und individuelle Leistungen. Sollten Sie
            noch Fragen haben, beantworten wir Ihnen diese gern persönlich.
          </p>
        </motion.div>

        {/* Bento-Grid Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-card hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
