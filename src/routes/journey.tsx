import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, CircleDot, OctagonAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CaseSelect, EmptyCase } from "@/components/CaseSelect";
import { useCases, useMilestones } from "@/hooks/useCases";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, PREGNANCY_STAGES } from "@/lib/nestfam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey timeline — NestFam" },
      {
        name: "description",
        content:
          "Track every stage of the surrogacy journey: verification, matching, contracts, IVF, pregnancy weeks and delivery.",
      },
      { property: "og:title", content: "Journey timeline — NestFam" },
      {
        property: "og:description",
        content: "A shared milestone timeline for parents, surrogates, clinics and lawyers.",
      },
    ],
  }),
  component: JourneyPage,
});

const STATUS_ICON = {
  complete: CheckCircle2,
  in_progress: CircleDot,
  pending: Circle,
  blocked: OctagonAlert,
} as const;

function JourneyPage() {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  const { data: cases = [] } = useCases();
  const [caseId, setCaseId] = useState<string | undefined>(undefined);
  const active = cases.find((c) => c.id === caseId) ?? cases[0];
  const { data: milestones = [] } = useMilestones(active?.id);
  const isClinic = roles.includes("clinic") || roles.includes("admin");

  const { data: updates = [] } = useQuery({
    queryKey: ["pregnancy-updates", active?.id],
    enabled: Boolean(active),
    queryFn: async () => {
      const { data } = await supabase
        .from("pregnancy_updates")
        .select("*")
        .eq("case_id", active!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async (input: { id: string; status: "pending" | "in_progress" | "complete" | "blocked" }) => {
      const { error } = await supabase
        .from("milestones")
        .update({
          status: input.status,
          completed_at: input.status === "complete" ? new Date().toISOString() : null,
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Milestone updated");
      void queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="Journey" subtitle={active ? `Case ${active.reference}` : "No case yet"}>
      {!active ? (
        <EmptyCase what="The milestone timeline" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle>Milestones</CardTitle>
              <CaseSelect cases={cases} value={active.id} onChange={setCaseId} />
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-border pl-6">
                {milestones.map((m) => {
                  const Icon = STATUS_ICON[m.status];
                  return (
                    <li key={m.id} className="relative">
                      <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full bg-card">
                        <Icon
                          className={`h-4 w-4 ${
                            m.status === "complete"
                              ? "text-primary"
                              : m.status === "blocked"
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        />
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{m.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.detail || (m.completed_at ? formatDate(m.completed_at) : "Not started")}
                          </p>
                        </div>
                        <Select
                          value={m.status}
                          onValueChange={(v) =>
                            setStatus.mutate({
                              id: m.id,
                              status: v as "pending" | "in_progress" | "complete" | "blocked",
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </li>
                  );
                })}
                {milestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No milestones on this case yet.</p>
                ) : null}
              </ol>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {isClinic ? <PregnancyForm caseId={active.id} /> : null}
            <Card>
              <CardHeader>
                <CardTitle>Medical progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {updates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Your clinic publishes ultrasound and lab summaries here.
                  </p>
                ) : (
                  updates.map((u) => (
                    <div key={u.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{u.stage}</p>
                        <Badge variant="secondary">{u.week ? `Week ${u.week}` : "—"}</Badge>
                      </div>
                      {u.summary ? <p className="mt-1 text-sm">{u.summary}</p> : null}
                      {u.doctor_notes ? (
                        <p className="mt-1 text-xs text-muted-foreground">{u.doctor_notes}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function PregnancyForm({ caseId }: { caseId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [stage, setStage] = useState(PREGNANCY_STAGES[0] ?? "Embryo Transfer");
  const [week, setWeek] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pregnancy_updates").insert({
        case_id: caseId,
        author_id: user!.id,
        stage,
        week: week ? Number(week) : null,
        summary: summary || null,
        doctor_notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Update published to the case");
      setSummary("");
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["pregnancy-updates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish a medical update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PREGNANCY_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Gestational week"
          value={week}
          inputMode="numeric"
          onChange={(e) => setWeek(e.target.value)}
        />
        <Textarea
          placeholder="Summary shared with the whole case"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <Textarea
          placeholder="Clinical notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button
          className="w-full"
          disabled={create.isPending}
          onClick={() => create.mutate()}
        >
          Publish update
        </Button>
      </CardContent>
    </Card>
  );
}
