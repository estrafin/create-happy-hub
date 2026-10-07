export const PUBLIC_NAV = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/for-agencies', label: 'For agencies' },
  { to: '/for-intended-parents', label: 'Intended parents' },
  { to: '/for-carriers', label: 'Carriers' },
  { to: '/for-professionals', label: 'Professionals' },
  { to: '/safety-trust', label: 'Safety & trust' },
  { to: '/resources', label: 'Resources' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const;

export const AGENCY_PLANS = [
  { key: 'starter', name: 'Starter', amount: 75000, cases: 'Up to 5 active cases' },
  { key: 'professional', name: 'Professional', amount: 150000, cases: 'Up to 15 active cases' },
  { key: 'growth', name: 'Growth', amount: 300000, cases: 'Up to 40 active cases' },
  { key: 'enterprise', name: 'Enterprise', amount: 500000, cases: '75+ cases · tailored support' },
] as const;

export const JOURNEY_FEES = [
  { label: 'Onboarding / case setup', amount: 150000 },
  { label: 'Assessment / matching coordination', amount: 200000 },
  { label: 'Treatment / clinical coordination', amount: 200000 },
  { label: 'Pregnancy / completion coordination', amount: 200000 },
] as const;

export function pageHead(title: string, description: string) {
  return { meta: [
    { title: `${title} — NestFam` },
    { name: 'description', content: description },
    { property: 'og:title', content: `${title} — NestFam` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] };
}