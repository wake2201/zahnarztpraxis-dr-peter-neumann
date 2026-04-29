export type ContactRequestType = "appointment" | "callback" | "prescription" | "other";
export type ContactReachability = "morning" | "afternoon" | "flexible";

interface NavigationLink {
  href: string;
  label: string;
}

interface ContactOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface PublicContent {
  practice: {
    fullName: string;
    doctorName: string;
    locationLabel: string;
    city: string;
    phone: {
      display: string;
      href: string;
      availabilityLabel: string;
    };
    address: {
      street: string;
      postalCode: string;
      city: string;
      lineTwo: string;
      singleLine: string;
    };
    website: {
      href: string;
      label: string;
    };
  };
  navigation: {
    links: readonly NavigationLink[];
    contactButtonLabel: string;
    mobileMenuLabel: string;
  };
  hero: {
    eyebrow: string;
    callButtonLabel: string;
    profileRoleLabel: string;
  };
  schedule: {
    eyebrow: string;
    title: string;
    phoneHeading: string;
    phoneDescription: string;
    addressHeading: string;
    accessibilityTitle: string;
    accessibilityLead: string;
    accessibilityStreet: string;
    accessibilityTail: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    phoneLabel: string;
    addressLabel: string;
    successTitle: string;
    successDescription: string;
    successActionLabel: string;
    firstNameLabel: string;
    firstNamePlaceholder: string;
    lastNameLabel: string;
    lastNamePlaceholder: string;
    phoneFieldLabel: string;
    phonePlaceholder: string;
    requestTypeLabel: string;
    requestTypePlaceholder: string;
    requestTypeOptions: readonly ContactOption<ContactRequestType>[];
    reachabilityLegend: string;
    optionalLabel: string;
    reachabilityOptions: readonly ContactOption<ContactReachability>[];
    detailsLabel: string;
    detailsPlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    benefits: readonly string[];
    responseTimeNotice: string;
    gdprConsentPrefix: string;
    gdprConsentLinkLabel: string;
    gdprConsentSuffix: string;
    defaultError: string;
    unexpectedError: string;
  };
  footer: {
    contactHeading: string;
    legalHeading: string;
    rightsReservedLabel: string;
  };
  legal: {
    backToHomeLabel: string;
    impressumHeading: string;
    privacyHeading: string;
    contactHeading: string;
  };
  admin: {
    loginSubtitle: string;
    errorPhoneCtaLabel: string;
  };
  metadata: {
    root: {
      title: string;
      description: string;
      keywords: readonly string[];
      openGraphTitle: string;
      openGraphDescription: string;
      openGraphUrl: string;
    };
    impressum: {
      title: string;
    };
    privacy: {
      title: string;
    };
  };
}

export const publicContent = {
  practice: {
    fullName: "Zahnarztpraxis Dr. Peter Neumann",
    doctorName: "Dr. Peter Neumann",
    locationLabel: "Zahnarztpraxis Zeitz",
    city: "Zeitz",
    phone: {
      display: "03441 223786",
      href: "tel:03441223786",
      availabilityLabel: "Während der Sprechzeiten erreichbar",
    },
    address: {
      street: "Platz der Deutschen Einheit 5",
      postalCode: "06712",
      city: "Zeitz",
      lineTwo: "06712 Zeitz",
      singleLine: "Platz der Deutschen Einheit 5, 06712 Zeitz",
    },
    website: {
      href: "https://zahnarzt-neumann.vercel.app",
      label: "zahnarzt-neumann.vercel.app",
    },
  },
  navigation: {
    links: [
      { href: "#start", label: "Start" },
      { href: "#ueber-uns", label: "Über uns" },
      { href: "#sprechzeiten", label: "Sprechzeiten" },
      { href: "#kontakt", label: "Kontakt" },
    ],
    contactButtonLabel: "Termin anfragen",
    mobileMenuLabel: "Menü öffnen",
  },
  hero: {
    eyebrow: "Zahnarztpraxis in Zeitz",
    callButtonLabel: "03441 223786 anrufen",
    profileRoleLabel: "Zahnarzt • Zeitz",
  },
  schedule: {
    eyebrow: "Sprechzeiten & Kontakt",
    title: "So erreichen Sie uns",
    phoneHeading: "Telefon",
    phoneDescription: "Rufen Sie uns an oder nutzen Sie unser Kontaktformular weiter unten.",
    addressHeading: "Anfahrt",
    accessibilityTitle: "Wichtiger Hinweis",
    accessibilityLead: "Unsere Praxis verfügt über einen eigenen, barrierefreien Eingang — diesen erreichen Sie am besten von der ",
    accessibilityStreet: "Dietrich-Bonhoeffer-Str.",
    accessibilityTail: " aus.",
  },
  contact: {
    eyebrow: "Kontakt",
    title: "Termine online anfragen",
    description: "Kein langes Warten am Telefon – senden Sie uns Ihre Anfrage bequem online. Wir melden uns schnellstmöglich bei Ihnen zurück.",
    phoneLabel: "Telefon",
    addressLabel: "Adresse",
    successTitle: "Vielen Dank für Ihre Anfrage!",
    successDescription: "Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb von 24 Stunden bei Ihnen zurück.",
    successActionLabel: "Neue Anfrage senden",
    firstNameLabel: "Vorname",
    firstNamePlaceholder: "Ihr Vorname",
    lastNameLabel: "Nachname",
    lastNamePlaceholder: "Ihr Nachname",
    phoneFieldLabel: "Telefonnummer",
    phonePlaceholder: "03441 223786",
    requestTypeLabel: "Anliegen",
    requestTypePlaceholder: "Bitte auswählen",
    requestTypeOptions: [
      { value: "appointment", label: "Termin vereinbaren" },
      { value: "callback", label: "Rückruf gewünscht" },
      { value: "prescription", label: "Rezept / Überweisung" },
      { value: "other", label: "Sonstiges" },
    ],
    reachabilityLegend: "Wann sind Sie erreichbar?",
    optionalLabel: "(optional)",
    reachabilityOptions: [
      { value: "morning", label: "vormittags" },
      { value: "afternoon", label: "nachmittags" },
      { value: "flexible", label: "jederzeit" },
    ],
    detailsLabel: "Zusätzliche Informationen",
    detailsPlaceholder: "Beschreiben Sie kurz Ihr Anliegen…",
    submitLabel: "Anfrage absenden",
    submittingLabel: "Wird gesendet...",
    benefits: [
      "Unverbindlich",
      "Schnelle Rückmeldung",
      "Kein Konto erforderlich",
    ],
    responseTimeNotice: "Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.",
    gdprConsentPrefix: "Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert werden. Weitere Informationen in der ",
    gdprConsentLinkLabel: "Datenschutzerklärung",
    gdprConsentSuffix: ".",
    defaultError: "Ein Fehler ist aufgetreten.",
    unexpectedError: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
  },
  footer: {
    contactHeading: "Kontakt",
    legalHeading: "Rechtliches",
    rightsReservedLabel: "Alle Rechte vorbehalten.",
  },
  legal: {
    backToHomeLabel: "Zurück zur Startseite",
    impressumHeading: "Impressum",
    privacyHeading: "Datenschutzerklärung",
    contactHeading: "Kontakt",
  },
  admin: {
    loginSubtitle: "Zahnarztpraxis Dr. Peter Neumann",
    errorPhoneCtaLabel: "03441 223786",
  },
  metadata: {
    root: {
      title: "Zahnarztpraxis Dr. Peter Neumann | Zeitz",
      description: "Ihre Zahngesundheit in besten Händen. Zahnarztpraxis Dr. Peter Neumann in Zeitz — vertrauensvolle Beratung und individuelle Leistungen für Ihr strahlendes Lächeln.",
      keywords: [
        "Zahnarzt",
        "Zeitz",
        "Dr. Peter Neumann",
        "Zahnarztpraxis",
        "Zahngesundheit",
        "Sachsen-Anhalt",
      ],
      openGraphTitle: "Zahnarztpraxis Dr. Peter Neumann | Zeitz",
      openGraphDescription: "Vertrauensvolle Beratung und individuelle Leistungen für Ihr strahlendes Lächeln.",
      openGraphUrl: "https://zahnarzt-neumann.vercel.app",
    },
    impressum: {
      title: "Impressum | Zahnarztpraxis Dr. Peter Neumann",
    },
    privacy: {
      title: "Datenschutzerklärung | Zahnarztpraxis Dr. Peter Neumann",
    },
  },
} as const satisfies PublicContent;
