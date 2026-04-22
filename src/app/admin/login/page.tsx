"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Heart, Eye, EyeOff } from "lucide-react";
import { publicContent } from "@/content/data";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { admin } = publicContent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // redirect:false erlaubt uns, strukturierte Fehler-Codes (LOCKOUT_*)
    // aus auth.ts zu parsen, bevor wir manuell zur Ziel-Route weiterleiten.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      try {
        const parsed = JSON.parse(result?.error ?? "{}");
        if (parsed.code === "LOCKOUT_ACTIVE" || parsed.code === "LOCKOUT_TRIGGERED") {
          const min = parsed.remainingMinutes || 15;
          setError(`Zu viele fehlgeschlagene Versuche. Gesperrt für noch ${min} Minute${min > 1 ? "n" : ""}.`);
        } else {
          setError("Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.");
        }
      } catch {
        setError("Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.");
      }
      setLoading(false);
      return;
    }

    // Full-Page-Navigation (kein router.push + refresh Race).
    // Erzwingt frischen Server-Side Session-Check im Protected-Layout.
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Admin-Bereich
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {admin.loginSubtitle}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-card border border-slate-100 p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-800">Anmeldung</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-Mail
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre-email@beispiel.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Passwort
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird angemeldet...
              </>
            ) : (
              "Anmelden"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
