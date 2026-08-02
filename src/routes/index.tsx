import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  FileLock2,
  HeartHandshake,
  Landmark,
  MessagesSquare,
  Stethoscope,
  Scale,
  Brain,
  ShieldCheck,
  Baby,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { JOURNEY_TEMPLATE, ROLE_BLURBS, ROLE_LABELS } from "@/lib/nestfam";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NestFam — Safer, Coordinated Surrogacy Journeys" },
      {
        name: "description",
        content:
          "NestFam connects intended parents with licensed fertility clinics, lawyers, counselors and thoroughly screened surrogate candidates — with escrow payments and milestone tracking.",
      },
      { property: "og:title", content: "NestFam — Safer, Coordinated Surrogacy Journeys" },
      {
        property: "og:description",
        content:
          "Verified profiles, clinical clearance, legal contracts, escrow-only payments and week-by-week pregnancy tracking in one coordinated platform.",
      },
    ],
  }),
  component: Landing,
});

const ROLE_ICONS = {
  intended_parent: HeartHandshake,
  surrogate: Baby,
  clinic: Stethoscope,
  lawyer: Scale,
  counselor: Brain,
  admin: ShieldCheck,
} as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <span className="font-display text-xl">NestFam</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Create account
            </Link>
          </Button>
        </div>
      </header>

      <section className="grain-hero border-y border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" />
              Identity, medical and psychological screening on every profile
            </p>
            <h1 className="text-balance-tight font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Every surrogacy journey deserves a coordinated, protected path.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              NestFam safely connects intended parents with licensed fertility professionals and
              thoroughly screened surrogate candidates — then coordinates matching, contracts,
              clinical milestones and escrow-only payments in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start your journey <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
              <div>
                <dt className="text-muted-foreground">Payments</dt>
                <dd className="mt-1 font-display text-lg">Escrow only</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Milestones</dt>
                <dd className="mt-1 font-display text-lg">{JOURNEY_TEMPLATE.length} tracked</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Professionals</dt>
                <dd className="mt-1 font-display text-lg">Clinic · Legal · Counsel</dd>
              </div>
            </dl>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-lift)]">
            <img
              src={heroImage}
              alt="A surrogate and an intended parent holding a folded knitted baby blanket"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl">Built for six kinds of people</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each role gets its own workspace, permissions and responsibilities. Nobody sees more than
          their part of the journey.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>).map((key) => {
            const Icon = ROLE_ICONS[key];
            return (
              <article key={key} className="surface-card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg">{ROLE_LABELS[key]}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{ROLE_BLURBS[key]}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl">The journey, milestone by milestone</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every case moves through the same tracked path. Each milestone links to the documents,
            clinical updates and payments behind it.
          </p>
          <ol className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {JOURNEY_TEMPLATE.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureCard
            icon={Landmark}
            title="Escrow-only money"
            body="Direct payments between intended parents and surrogates are never allowed. Funds are deposited into escrow, allocated to milestones, medical expenses and hospital bills, and released only after approval — with a digital receipt every time."
          />
          <FeatureCard
            icon={MessagesSquare}
            title="Private, permissioned messaging"
            body="Separate channels for your surrogate, clinic, lawyer and counselor. Documents are shared inside the case, and access is restricted to the people assigned to it."
          />
          <FeatureCard
            icon={CalendarDays}
            title="Clinical progress you can trust"
            body="Clinics publish ultrasounds, lab results and doctor notes against pregnancy weeks. Appointments and reminders keep everyone on the same schedule."
          />
          <FeatureCard
            icon={FileLock2}
            title="Access-controlled document centre"
            body="Medical records, contracts, consent forms, birth documentation, insurance and receipts stored per case, visible only to case members."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Screening before matching"
            body="Government ID, selfie, phone, lawful identity verification, medical history, screenings, and psychological assessment are recorded before a match can proceed."
          />
          <FeatureCard
            icon={BadgeCheck}
            title="Private feedback, never public reviews"
            body="Intended parents rate clinics, lawyers and counselors. Parents and surrogates are never publicly rated by each other — that feedback is handled privately by the platform."
          />
        </div>
      </section>

      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl">Ready when you are.</h2>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              Create your account, complete verification, and we will coordinate the professionals
              around you.
            </p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Create your NestFam account
            </Link>
          </Button>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-xs text-muted-foreground">
        <p>
          NestFam coordinates a surrogacy journey; it does not provide medical or legal advice.
          Clinical and legal decisions always remain with qualified professionals. Sensitive data is
          access-controlled, and data sharing requires explicit consent.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <article className="surface-card p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}
