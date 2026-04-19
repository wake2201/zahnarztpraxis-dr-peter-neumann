"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";
import Link from "next/link";

/**
 * DSGVO DSGVO-Hinweis (Reines Info-Banner)
 * Da ausschließlich technisch notwendige Cookies verwendet werden, 
 * entfällt die Pflicht zum aktiven Opt-in (Consent). Ein reines Info-Banner reicht aus.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("cookie-info-dismissed");
    if (!isDismissed) {
      // Kurze Verzögerung für weicheres Einblenden nach dem Page-Load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("cookie-info-dismissed", "true");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] max-w-[360px]"
        >
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-4 relative overflow-hidden">
            {/* Dekorativer Rand */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            
            <div className="flex items-start gap-3 pl-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Datenschonende Website
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Wir verzichten komplett auf Tracking. Es kommen nur{" "}
                  <Link
                    href="/datenschutz"
                    className="text-primary hover:underline font-medium"
                  >
                    technisch notwendige
                  </Link>{" "}
                  Cookies zum Einsatz.
                </p>
                <button 
                  onClick={dismiss}
                  className="text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-md transition-colors"
                >
                  Alles klar
                </button>
              </div>

              <button
                onClick={dismiss}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
