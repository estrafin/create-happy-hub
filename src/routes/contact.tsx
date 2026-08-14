import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, Phone, ShieldAlert } from "lucide-react";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  LegalLayout,
} from "@/components/LegalLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NestFam — Support for Parents & Surrogates" },
      {
        name: "description",
        content:
          "Reach the NestFam team by phone on +234 703 345 9289 or email support@nestfam.com.ng for matching, escrow, verification and case support.",
      },
      { property: "og:title", content: "Contact NestFam" },
      {
        property: "og:description",
        content: "Phone, email and support hours for intended parents, surrogates and professionals.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://create-happy-hub.lovable.app/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://create-happy-hub.lovable.app/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "NestFam",
          url: "https://create-happy-hub.lovable.app",
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: CONTACT_PHONE,
              email: CONTACT_EMAIL,
              contactType: "customer support",
              areaServed: "NG",
              availableLanguage: "English",
            },
          ],
        }),
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <LegalLayout
      title="Contact us"
      subtitle="Questions about matching, verification, escrow or your case — we're here."
    >
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <a href={`tel:${CONTACT_PHONE}`} className="surface-card block p-5 transition hover:shadow-[var(--shadow-lift)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
            <Phone className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-lg">Call or WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">{CONTACT_PHONE_DISPLAY}</p>
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="surface-card block p-5 transition hover:shadow-[var(--shadow-lift)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-lg">Email support</h2>
          <p className="mt-1 text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
        </a>
        <div className="surface-card p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
            <Clock className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-lg">Support hours</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monday to Friday, 9:00–18:00 WAT. Saturday, 10:00–14:00 WAT. Emails are answered within
            one business day.
          </p>
        </div>
        <div className="surface-card p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-lg">Urgent medical issues</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            For a medical emergency, contact your clinic or the nearest hospital first, then notify us
            so the case record and escrow can be updated.
          </p>
        </div>
      </div>

      <h2>What to include</h2>
      <p>
        To help us respond quickly, tell us your role (intended parent, surrogate, clinic, lawyer or
        counselor), the email on your NestFam account, and the case reference if your journey has
        already started. Please don't send medical records or ID documents by email — upload them in
        the verification or documents section of your account, where access is restricted to your
        case.
      </p>

      <h2>Escrow, disputes and complaints</h2>
      <p>
        Payment questions, milestone release requests and disputes are handled by our administrators.
        Email us with the subject line "Escrow" or "Dispute" and we will open a review. Direct
        payments between intended parents and surrogates are never permitted on NestFam, so please
        report any request for one immediately.
      </p>

      <h2>Privacy and legal requests</h2>
      <p>
        Data access, correction or deletion requests, and legal notices can be sent to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See our privacy policy for how we
        handle your information.
      </p>
    </LegalLayout>
  );
}
