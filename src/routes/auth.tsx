import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_BLURBS, ROLE_LABELS, type AppRole } from "@/lib/nestfam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or register — NestFam" },
      {
        name: "description",
        content:
          "Create your NestFam account as an intended parent, surrogate, fertility clinic, lawyer or counselor, or sign in to your coordinated case.",
      },
      { property: "og:title", content: "Sign in or register — NestFam" },
      {
        property: "og:description",
        content: "Access your verified NestFam workspace and coordinated surrogacy case.",
      },
    ],
  }),
  component: AuthPage,
});

const SIGNUP_ROLES: AppRole[] = [
  "intended_parent",
  "surrogate",
  "clinic",
  "lawyer",
  "counselor",
];

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("intended_parent");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && session) void navigate({ to: "/dashboard" });
  }, [authLoading, session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        toast.success("Account created — continue with verification.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      void navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try email instead.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="grain-hero hidden flex-col justify-between border-r border-border p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <span className="font-display text-xl">NestFam</span>
        </Link>
        <div className="max-w-md">
          <h2 className="font-display text-3xl leading-tight">
            Screened profiles. Escrow-only payments. One coordinated journey.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Everyone on NestFam completes identity verification before they can be matched or take
            part in a case. Clinical and legal decisions stay with the qualified professionals
            assigned to you.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Your data is access-controlled and shared only with your explicit consent.
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex rounded-xl border border-border bg-card p-1">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t === "signin" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl">
            {tab === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {tab === "signin"
              ? "Pick up where your case left off."
              : "Choose the role that describes you. You can complete screening next."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {tab === "signup" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name / organisation</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Amaka Obi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>I am registering as</Label>
                  <div className="grid gap-2">
                    {SIGNUP_ROLES.map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                          role === r
                            ? "border-primary bg-secondary"
                            : "border-border bg-card hover:bg-secondary/50"
                        }`}
                      >
                        <span className="block text-sm font-medium">{ROLE_LABELS[r]}</span>
                        <span className="block text-xs text-muted-foreground">{ROLE_BLURBS[r]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {tab === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you consent to NestFam processing your information to coordinate your
            surrogacy journey.
          </p>
        </div>
      </main>
    </div>
  );
}
