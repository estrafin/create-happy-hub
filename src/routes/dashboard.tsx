import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useCaseMembers, useCases, useMilestones } from "@/hooks/useCases";
import { formatDate, formatDateTime, formatMoney, ROLE_LABELS } from "@/lib/nestfam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — NestFam" },
      {
        name: "description",
        content:
          "See your active surrogacy case, verification status, next milestone, upcoming appointments and escrow balance.",
      },
      { property: "og:title", content: "Your dashboard — NestFam" },
      {
        property: "og:description",
        content: "A single view of your case progress, appointments and escrow position.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, role } = useAuth();
  const { data: cases = [], isLoading } = useCases();
  const active = cases[0];
  const { data: milestones = [] } = useMilestones(active?.id);
  const { data: members } = useCaseMembers(active);

  const { data: appointments = [] } = useQuery({
    queryKey: ["upcoming-appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .gte("scheduled_for", new Date().toISOString())
        .order("scheduled_for")
        .limit(4);
      return data ?? [];
    },
  });

  const { data: escrow } = useQuery({
    queryKey: ["escrow-summary", active?.id],
    enabled: Boolean(active),
    queryFn: async () => {
      const { data } = await supabase
        .from("escrow_accounts")
        .select("*")
        .eq("case_id", active!.id)
        .maybeSingle();
      return data;
    },
  });

  const done = milestones.filter((m) => m.status === "completed").length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  const next = milestones.find((m) => m.status !== "completed");

  const kycDone = profile?.kyc_status === "verified";

  return (
    <AppShell
      title={`Hello${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
      subtitle={role ? `Signed in as ${ROLE_LABELS[role]}` : undefined}
    >
      <div className="space-y-6">
        {!kycDone ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Verification incomplete</p>
                <p className="text-xs text-muted-foreground">
                  Matching, contracts and escrow payments unlock after your identity and screening
                  documents are approved.
                </p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link to="/verification">
                Complete verification <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Case status" value={active ? active.status.replace(/_/g, " ") : "No case yet"} />
          <Stat label="Journey progress" value={`${pct}%`} />
          <Stat
            label="Pregnancy week"
            value={active?.pregnancy_week ? `Week ${active.pregnancy_week}` : "—"}
          />
          <Stat
            label="Held in escrow"
            value={escrow ? formatMoney(escrow.balance, escrow.currency) : "—"}
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your case…</p>
        ) : !active ? (
          <div className="surface-card p-8 text-center">
            <h2 className="font-display text-2xl">No case open yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {role === "intended_parent"
                ? "Browse screened surrogate candidates and send a match request. A case opens as soon as a match is accepted."
                : role === "surrogate"
                  ? "Complete your profile and screening. Intended parents will be able to send you match requests."
                  : "You will see cases here once an administrator assigns you to one."}
            </p>
            {role === "intended_parent" || role === "surrogate" ? (
              <Button className="mt-5" asChild>
                <Link to="/matches">Go to matches</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <section className="surface-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl">Case {active.reference}</h2>
                  <p className="text-sm text-muted-foreground">
                    Opened {formatDate(active.created_at)}
                    {active.due_date ? ` · due ${formatDate(active.due_date)}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">{active.status.replace(/_/g, " ")}</Badge>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {done} of {milestones.length} milestones complete
                  </span>
                  <span>{pct}%</span>
                </div>
                <Progress value={pct} />
              </div>

              {next ? (
                <div className="mt-5 rounded-xl border border-border bg-secondary/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Next milestone
                  </p>
                  <p className="mt-1 text-sm font-medium">{next.label}</p>
                  {next.detail ? (
                    <p className="mt-1 text-xs text-muted-foreground">{next.detail}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link to="/journey">Open journey</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/messages">Messages</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/payments">Escrow</Link>
                </Button>
              </div>
            </section>

            <div className="space-y-4">
              <section className="surface-card p-6">
                <h3 className="text-sm font-medium">Your care team</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <Member label="Intended parent" name={members?.get(active.parent_id)?.full_name} />
                  <Member
                    label="Surrogate"
                    name={active.surrogate_id ? members?.get(active.surrogate_id)?.full_name : null}
                  />
                  <Member
                    label="Fertility clinic"
                    name={
                      active.clinic_id
                        ? members?.get(active.clinic_id)?.organisation ||
                          members?.get(active.clinic_id)?.full_name
                        : null
                    }
                  />
                  <Member
                    label="Lawyer"
                    name={active.lawyer_id ? members?.get(active.lawyer_id)?.full_name : null}
                  />
                  <Member
                    label="Counselor"
                    name={active.counselor_id ? members?.get(active.counselor_id)?.full_name : null}
                  />
                </ul>
              </section>

              <section className="surface-card p-6">
                <h3 className="text-sm font-medium">Upcoming appointments</h3>
                {appointments.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {appointments.map((a) => (
                      <li key={a.id} className="flex items-start gap-3 text-sm">
                        <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{a.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(a.scheduled_for)}
                            {a.location ? ` · ${a.location}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-xl capitalize">{value}</p>
    </div>
  );
}

function Member({ label, name }: { label: string; name?: string | null }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-right">
        {name ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : null}
        {name ?? "Not assigned"}
      </span>
    </li>
  );
}
