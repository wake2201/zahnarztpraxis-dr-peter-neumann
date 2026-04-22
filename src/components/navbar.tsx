"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { publicContent } from "@/content/data";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navigation, practice } = publicContent;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {practice.doctorName}
              </p>
              <p className="text-xs text-slate-500">{practice.locationLabel}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary rounded-lg hover:bg-primary-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={practice.phone.href}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              {practice.phone.display}
            </a>
            <Button asChild size="sm">
              <a href="#kontakt">{navigation.contactButtonLabel}</a>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 min-w-[44px] min-h-[44px] rounded-lg text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
            aria-label={navigation.mobileMenuLabel}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-primary rounded-xl hover:bg-primary-50 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={practice.phone.href}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:text-primary border border-slate-200 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {practice.phone.display}
                </a>
                <Button asChild className="w-full">
                  <a href="#kontakt" onClick={() => setMobileOpen(false)}>
                    {navigation.contactButtonLabel}
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
