import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — NestFam" },
      {
        name: "description",
        content:
          "How NestFam collects, protects and shares identity, medical and payment information across surrogacy cases, and the rights you have over your data.",
      },
      { property: "og:title", content: "Privacy Policy — NestFam" },
      {
        property: "og:description",
        content:
          "Data we collect, why we collect it, who can see it inside a case, retention periods and your data rights.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://create-happy-hub.lovable.app/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://create-happy-hub.lovable.app/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalLayout title="Privacy policy" subtitle="Last updated: 14 August 2026">
      <p>
        This policy explains what information NestFam collects, why we need it, who can see it, and
        the choices you have. It applies to intended parents, surrogates, fertility clinics, lawyers,
        counselors and administrators using the platform.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> name, email, phone number, role and password credentials
          managed by our authentication provider.
        </li>
        <li>
          <strong>Verification data:</strong> government ID, selfie, proof of address, and
          professional licence details used to confirm you are who you say you are.
        </li>
        <li>
          <strong>Health information:</strong> for surrogates and intended parents — medical history,
          screening results, clinical clearances, pregnancy updates, scans and lab reports uploaded by
          your clinic.
        </li>
        <li>
          <strong>Psychological assessments:</strong> counselor notes and clearance status.
        </li>
        <li>
          <strong>Case content:</strong> matches, milestones, appointments, messages and documents
          such as contracts, consent forms and birth documentation.
        </li>
        <li>
          <strong>Financial data:</strong> escrow deposits, allocations, payout requests and receipts.
          Card and bank credentials are handled by our payment partners, not stored by NestFam.
        </li>
        <li>
          <strong>Technical data:</strong> log records, device and browser information, and security
          events used to protect accounts.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To verify identity and eligibility before any match can proceed.</li>
        <li>To generate compatibility suggestions between intended parents and surrogates.</li>
        <li>To coordinate clinical milestones, appointments and document signing.</li>
        <li>To operate escrow: allocating funds to milestones and releasing them after approval.</li>
        <li>To keep an audit trail for disputes, safeguarding and legal obligations.</li>
        <li>To send service notifications about your case.</li>
      </ul>

      <h2>Who can see your information</h2>
      <p>
        Access is permissioned by case and by role. Members of your case see only what their role
        requires: clinics see clinical data, lawyers see legal documents, counselors see assessment
        material, and intended parents see the progress of their own journey. Surrogate profiles shown
        during matching are limited to screening-relevant information. Administrators may access
        records where necessary for verification, safeguarding, escrow release or dispute resolution.
      </p>
      <p>
        We never sell your data, never publish parent or surrogate ratings, and never share health
        information outside your case without your explicit consent, unless the law requires it.
      </p>

      <h2>Service providers</h2>
      <p>
        We rely on trusted processors for hosting, database and file storage, authentication, email
        delivery and payment processing. They act on our instructions under contract and may not use
        your data for their own purposes.
      </p>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit, stored with row-level access controls, and sensitive actions such
        as document signing and escrow release are recorded. Uploaded files are restricted to members
        of the relevant case. No system is perfect, so please use a strong, unique password and tell us
        immediately if you suspect unauthorised access.
      </p>

      <h2>Retention</h2>
      <p>
        Case records, contracts, medical documentation and financial receipts are retained for as long
        as required to support the journey and to meet legal, medical and accounting obligations —
        including after a case closes, because parentage and birth records may be needed years later.
        Verification media is kept only as long as needed to maintain your verified status.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to your data, correction of inaccurate details, a copy of what you
        submitted, withdrawal of a consent you previously gave, or deletion of information we are not
        legally required to keep. Contact{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond within 30 days.
        Deleting your account does not remove records we must retain for legal or medical reasons.
      </p>

      <h2>Children</h2>
      <p>
        NestFam is only for adults aged 18 and over. Records about a child born through a journey are
        held as part of the case file for the intended parents and relevant professionals.
      </p>

      <h2>Changes</h2>
      <p>
        If we make material changes to this policy we will notify you in the app or by email before
        they take effect.
      </p>

      <h2>Contact</h2>
      <p>
        Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call {CONTACT_PHONE_DISPLAY}{" "}
        with any privacy question or complaint.
      </p>
    </LegalLayout>
  );
}
