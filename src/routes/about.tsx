import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NestFam — Coordinated, Protected Surrogacy" },
      {
        name: "description",
        content:
          "NestFam coordinates surrogacy journeys in Nigeria — screened surrogates, licensed clinics, lawyers and counselors, escrow-only payments and milestone tracking.",
      },
      { property: "og:title", content: "About NestFam" },
      {
        property: "og:description",
        content:
          "Who we are, how NestFam protects intended parents, surrogates and professionals throughout the journey.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://create-happy-hub.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://create-happy-hub.lovable.app/about" }],
  }),
  component: About,
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Screening before matching",
    body: "Identity, medical and psychological screening are recorded and reviewed before any match can move forward.",
  },
  {
    icon: Landmark,
    title: "Escrow-only money",
    body: "Funds sit in escrow, are allocated to milestones and medical bills, and are released only after approval — with a receipt each time.",
  },
  {
    icon: Users,
    title: "Professionals in the loop",
    body: "Licensed clinics, lawyers and counselors carry their own workspaces so clinical and legal decisions stay with qualified people.",
  },
  {
    icon: HeartHandshake,
    title: "Dignity for everyone",
    body: "Surrogates are partners, not products. Parents and surrogates are never publicly rated; concerns are handled privately.",
  },
];

function About() {
  return (
    <LegalLayout title="About NestFam" subtitle="Why we built a coordinated surrogacy platform.">
      <p>
        NestFam exists because surrogacy journeys too often fall apart in the gaps — an unverified
        introduction, a contract nobody has a copy of, a payment made directly and disputed later, a
        clinical update that never reaches the intended parents. We built one coordinated place where
        those gaps close.
      </p>
      <p>
        The platform safely connects intended parents with thoroughly screened surrogate candidates
        and licensed fertility professionals, then keeps every part of the journey — matching,
        contracts, clinical milestones, appointments, documents and payments — tracked, permissioned
        and auditable.
      </p>

      <h2>What we stand for</h2>
      <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <article key={v.title} className="surface-card p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
              <v.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg">{v.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
          </article>
        ))}
      </div>

      <h2>How a journey runs</h2>
      <ol>
        <li>Create an account and complete identity verification for your role.</li>
        <li>Intended parents set preferences; surrogates complete medical and psychological screening.</li>
        <li>Compatibility scoring suggests matches; both sides must agree before a case opens.</li>
        <li>Lawyers prepare and collect signatures on the surrogacy agreement.</li>
        <li>The clinic publishes clinical progress against pregnancy milestones.</li>
        <li>Escrow releases compensation and medical costs milestone by milestone.</li>
      </ol>

      <h2>Important note</h2>
      <p>
        NestFam coordinates a journey; it does not provide medical or legal advice, and it does not
        replace the judgement of your clinic, lawyer or counselor. Sensitive information is
        access-controlled, and sharing beyond your case requires explicit consent.
      </p>

      <div className="not-prose mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/auth" search={{ mode: "signup" }}>
            Create your account
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/contact">Talk to our team</Link>
        </Button>
      </div>
    </LegalLayout>
  );
}
