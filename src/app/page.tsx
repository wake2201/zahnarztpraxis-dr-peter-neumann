import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Schedule } from "@/components/schedule";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Schedule />
        <ContactForm />
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
