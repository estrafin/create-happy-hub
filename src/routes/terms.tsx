import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — NestFam" },
      {
        name: "description",
        content:
          "The rules for using NestFam: eligibility, verification, matching, escrow-only payments, professional responsibilities, conduct and account suspension.",
      },
      { property: "og:title", content: "Terms & Conditions — NestFam" },
      {
        property: "og:description",
        content:
          "Your agreement with NestFam covering verification, matching, escrow payments, conduct and liability.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://create-happy-hub.lovable.app/terms" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://create-happy-hub.lovable.app/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalLayout title="Terms &amp; conditions" subtitle="Last updated: 14 August 2026">
      <p>
        By creating a NestFam account you agree to these terms. If you do not agree, please do not use
        the platform.
      </p>

      <h2>1. What NestFam is</h2>
      <p>
        NestFam is a coordination platform. We verify participants, suggest matches, track milestones,
        host case documents and operate an escrow facility. We are not a fertility clinic, a law firm,
        a hospital or a counseling practice, and we do not provide medical or legal advice. All
        clinical and legal decisions rest with the qualified professionals on your case.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and provide accurate information. Clinics, lawyers and
        counselors must hold valid licences and provide proof on request. Accounts may not be shared,
        and one person may not hold multiple accounts to bypass screening.
      </p>

      <h2>3. Verification and screening</h2>
      <p>
        Access to matching depends on completing identity verification and, where relevant, medical and
        psychological screening. We may decline, pause or revoke verification at our discretion where
        information is incomplete, inconsistent or raises a safeguarding concern.
      </p>

      <h2>4. Matching</h2>
      <p>
        Compatibility scores are advisory only. A match requires agreement from both the intended
        parent and the surrogate, and a case opens only after that agreement. Nothing on NestFam
        obliges anyone to proceed, and either side may withdraw before a contract is signed.
      </p>

      <h2>5. Contracts</h2>
      <p>
        Surrogacy agreements are prepared by the lawyer on your case and are between the parties, not
        with NestFam. Electronic signatures recorded on the platform are logged with the signer and
        timestamp, and signature records cannot be altered afterwards.
      </p>

      <h2>6. Escrow-only payments</h2>
      <ul>
        <li>Direct payments between intended parents and surrogates are strictly prohibited.</li>
        <li>Funds must be deposited into escrow and allocated to milestones, medical expenses or bills.</li>
        <li>Releases happen only after the relevant approval, and every release produces a receipt.</li>
        <li>Platform and professional fees are disclosed before you commit to them.</li>
        <li>
          Refunds of unreleased escrow balances follow the terms of your signed agreement and any
          administrator review of the case.
        </li>
      </ul>

      <h2>7. Your responsibilities</h2>
      <ul>
        <li>Keep your information, availability and clinical details current.</li>
        <li>Use case messaging respectfully; harassment, coercion or discrimination is not tolerated.</li>
        <li>
          Do not attempt to take a match off-platform to avoid screening, contracts or escrow.
        </li>
        <li>
          Do not upload content you have no right to share, and do not disclose another member's
          medical or personal information outside the case.
        </li>
      </ul>

      <h2>8. Suspension and termination</h2>
      <p>
        We may suspend or close an account for false information, prohibited payments, unsafe conduct,
        licence problems or legal requirement. Where a case is active, we will act to protect the
        wellbeing of the surrogate and any pregnancy first, and escrow funds will be held pending
        review.
      </p>

      <h2>9. Feedback and ratings</h2>
      <p>
        Intended parents may rate clinics, lawyers and counselors. Parents and surrogates are never
        publicly rated by one another; that feedback is handled privately by our administrators.
      </p>

      <h2>10. Liability</h2>
      <p>
        We provide the platform with reasonable care but cannot guarantee a successful match,
        pregnancy or outcome. To the extent permitted by law, NestFam is not liable for the acts or
        omissions of clinics, lawyers, counselors, parents or surrogates, nor for indirect or
        consequential losses. Nothing in these terms limits liability that cannot lawfully be limited.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria. We will attempt to
        resolve disputes with you directly before either party pursues formal proceedings.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these terms; material changes will be notified in the app or by email before they
        take effect. Continued use after that means you accept the updated terms.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or{" "}
        {CONTACT_PHONE_DISPLAY}.
      </p>
    </LegalLayout>
  );
}
