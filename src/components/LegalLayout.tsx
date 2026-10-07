import { Link } from "@tanstack/react-router";
import { HeartHandshake, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";

export const CONTACT_PHONE = "+2347033459289";
export const CONTACT_PHONE_DISPLAY = "+234 703 345 9289";
export const CONTACT_EMAIL = "support@nestfam.com.ng";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HeartHandshake className="h-4 w-4" />
            </span>
            <span className="font-display text-lg">NestFam</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The trusted infrastructure for family building. Private coordination for agencies,
            families and qualified professionals across Africa.
          </p>
        </div>
        <nav className="text-sm">
          <p className="font-medium">Platform</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
            <li><Link to="/for-agencies" className="hover:text-foreground">For agencies</Link></li>
            <li><Link to="/for-intended-parents" className="hover:text-foreground">For intended parents</Link></li>
            <li><Link to="/for-carriers" className="hover:text-foreground">For carriers</Link></li>
            <li><Link to="/for-professionals" className="hover:text-foreground">For professionals</Link></li>
            <li><Link to="/resources" className="hover:text-foreground">Resources</Link></li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact us
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="text-sm">
          <p className="font-medium">Legal</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link to="/safety-trust" className="hover:text-foreground">Safety & trust</Link></li>
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-foreground">
                Terms &amp; conditions
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-medium">Reach us</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              <a href={`tel:${CONTACT_PHONE}`} className="hover:text-foreground">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-10 text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} NestFam. NestFam coordinates family-building journeys; it does not
          provide medical or legal advice. Clinical and legal decisions always remain with qualified
          professionals.
        </p>
      </div>
    </footer>
  );
}

export function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <span className="font-display text-xl">NestFam</span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back home
        </Link>
      </header>

      <section className="grain-hero border-y border-border">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <h1 className="font-display text-4xl leading-tight">{title}</h1>
          {subtitle ? <p className="mt-3 text-muted-foreground">{subtitle}</p> : null}
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-normal prose-h2:mt-10 prose-h2:text-2xl prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-accent">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
