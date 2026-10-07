import { Link } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { ArrowRight, HeartHandshake, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PUBLIC_NAV } from '@/lib/site';
import { SiteFooter } from '@/components/LegalLayout';

export function Brand() {
  return <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="NestFam home"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake className="h-5 w-5" /></span><span className="font-display text-2xl">NestFam<span className="text-accent">.</span></span></Link>;
}

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return <header className="relative z-20 border-b border-border bg-background"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 lg:px-8"><Brand /><nav className="hidden items-center gap-6 text-sm xl:flex"><Link to="/how-it-works" className="hover:text-primary">How it works</Link><Link to="/for-agencies" className="hover:text-primary">For agencies</Link><div className="group relative"><Link to="/for-intended-parents" className="hover:text-primary">For families & professionals</Link><div className="absolute left-0 hidden w-56 border border-border bg-popover p-3 shadow-soft group-hover:grid group-focus-within:grid">{PUBLIC_NAV.slice(2,5).map(n=><Link key={n.to} to={n.to} className="py-2 text-popover-foreground">{n.label}</Link>)}</div></div><Link to="/safety-trust" className="hover:text-primary">Safety & trust</Link><Link to="/resources" className="hover:text-primary">Resources</Link></nav><div className="flex items-center gap-2"><Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><Link to="/auth">Login</Link></Button><Button asChild size="sm"><Link to="/auth" search={{mode:'signup'}}>Get started <ArrowRight className="h-3.5 w-3.5" /></Link></Button><Button variant="ghost" size="icon" aria-label={open?'Close menu':'Open menu'} onClick={()=>setOpen(!open)} className="xl:hidden">{open?<X/>:<Menu/>}</Button></div></div>{open && <nav aria-label="Main navigation" className="grid border-t border-border px-5 py-4 sm:grid-cols-2 xl:hidden">{PUBLIC_NAV.map(n=><Link key={n.to} to={n.to} onClick={()=>setOpen(false)} className="py-2.5 text-sm">{n.label}</Link>)}<Link to="/auth" className="py-2.5 text-sm">Login</Link></nav>}</header>;
}

export function PublicPage({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:ReactNode}) {
  return <div className="min-h-screen bg-background"><PublicHeader/><section className="border-b border-border bg-secondary/40"><div className="mx-auto max-w-6xl px-5 py-16 lg:py-20"><p className="mb-5 text-sm font-medium text-accent">{eyebrow}</p><h1 className="max-w-4xl font-display text-4xl leading-tight sm:text-5xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p></div></section><main className="mx-auto max-w-6xl px-5 py-14">{children}</main><SiteFooter/></div>;
}

export function JourneyCTA({label='Start your journey'}:{label?:string}) { return <Button asChild size="lg"><Link to="/auth" search={{mode:'signup'}}>{label}<ArrowRight className="h-4 w-4"/></Link></Button>; }