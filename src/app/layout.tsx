import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "@/styles/globals.css";

// DSGVO: next/font/google lädt Fonts beim BUILD und self-hostet sie.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Zahnarztpraxis Dr. Peter Neumann | Zeitz",
  description:
    "Ihre Zahngesundheit in besten Händen. Zahnarztpraxis Dr. Peter Neumann in Zeitz — vertrauensvolle Beratung und individuelle Leistungen für Ihr strahlendes Lächeln.",
  keywords: [
    "Zahnarzt",
    "Zeitz",
    "Dr. Peter Neumann",
    "Zahnarztpraxis",
    "Zahngesundheit",
    "Sachsen-Anhalt",
  ],
  openGraph: {
    title: "Zahnarztpraxis Dr. Peter Neumann | Zeitz",
    description:
      "Vertrauensvolle Beratung und individuelle Leistungen für Ihr strahlendes Lächeln.",
    type: "website",
    locale: "de_DE",
    url: "https://zahnarzt-neumann.vercel.app",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // headers()-Call erzwingt Dynamic Rendering, damit die Middleware pro Request
  // eine neue CSP-Nonce generieren und injizieren kann.
  await headers();

  return (
    <html lang="de" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
