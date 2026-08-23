import Link from "next/link";
import { ArrowRight, CalendarCheck, KeyRound, MessageSquareText } from "lucide-react";
import { publicContent } from "@/content/data";

export function ContactPathChoice() {
  const { contact } = publicContent;

  return (
    <div className="mb-12 rounded-[2rem] border border-primary/15 bg-primary-50/60 p-6 shadow-card sm:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
          {contact.eyebrow}
        </span>
        <h2 id="contact-choice-heading" className="mt-4 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          {contact.choiceTitle}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          {contact.choiceDescription}
        </p>
      </div>

      <div aria-labelledby="contact-choice-heading" className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/termin/buchen"
          scroll
          className="group rounded-2xl border-2 border-primary bg-white p-6 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <CalendarCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="mt-5 block text-xl font-bold text-slate-800">{contact.bookingChoiceTitle}</span>
          <span className="mt-2 block text-sm leading-6 text-slate-600">{contact.bookingChoiceDescription}</span>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            {contact.bookingChoiceAction}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>

        <a
          href="#kontaktformular"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-primary/40 hover:bg-primary-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareText className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="mt-5 block text-xl font-bold text-slate-800">{contact.requestChoiceTitle}</span>
          <span className="mt-2 block text-sm leading-6 text-slate-600">{contact.requestChoiceDescription}</span>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            {contact.requestChoiceAction}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </a>
      </div>

      <p className="mt-6 text-center">
        <Link
          href="/termin"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          {contact.manageAppointmentLabel}
        </Link>
      </p>
    </div>
  );
}
