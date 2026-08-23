import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { publicContent } from "@/content/data";
import "@/styles/globals.css";

// DSGVO: next/font/google lädt Fonts beim BUILD und self-hostet sie.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: publicContent.metadata.root.title,
  description: publicContent.metadata.root.description,
  keywords: [...publicContent.metadata.root.keywords],
  openGraph: {
    title: publicContent.metadata.root.openGraphTitle,
    description: publicContent.metadata.root.openGraphDescription,
    type: "website",
    locale: "de_DE",
    url: publicContent.metadata.root.openGraphUrl,
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
    <html lang="de" className={inter.variable} data-scroll-behavior="smooth">
      <body className="font-sans">{children}</body>
    </html>
  );
}
