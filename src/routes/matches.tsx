import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import { formatMoney, JOURNEY_TEMPLATE, scoreMatch } from "@/lib/nestfam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/integrations/supabase/types";

type SurrogateRow = Database["public"]["Tables"]["surrogate_profiles"]["Row"];
type ParentRow = Database["public"]["Tables"]["parent_profiles"]["Row"];
type MatchRow = Database["public"]["Tables"]["matches"]["Row"];

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matching — NestFam" },
      {
        name: "description",
        content:
          "Compatibility-scored surrogate matching on medical clearance, location, age, blood group, lifestyle and budget.",
      },
      { property: "og:title", content: "Matching — NestFam" },
      {
        property: "og:description",
        content: "Advisory compatibility scores with clear reasons and gaps for every candidate.",
      },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { roles } = useAuth();
  const isParent = roles.includes("intended_parent");
  const isSurrogate = roles.includes("surrogate");

  return (
    <AppShell
      title="Matching"
      subtitle="Scores are advisory. Clinics and lawyers make the final calls."
    >
      <Tabs defaultValue={isSurrogate && !isParent ? "requests" : "browse"}>
        <TabsList>
          {isParent ? <TabsTrigger value="browse">Browse surrogates</TabsTrigger> : null}
          <TabsTrigger value="requests">Match requests</TabsTrigger>
        </TabsList>
        {isParent ? (
          <TabsContent value="browse" className="mt-5">
            <BrowseSurrogates />
          </TabsContent>
        ) : null}
        <TabsContent value="requests" className="mt-5">
          <MatchRequests />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function BrowseSurrogates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: parentProfile } = useQuery({
    queryKey: ["parent-profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data ?? null) as ParentRow | null;
    },
  });

  const { data: surrogates = [], isLoading } = useQuery({
    queryKey: ["visible-surrogates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surrogate_profiles")
        .select("*")
        .eq("visible", true);
      if (error) throw error;
      return (data ?? []) as SurrogateRow[];
    },
  });

  const { data: myMatches = [] } = useQuery({
    queryKey: ["my-matches", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("matches").select("*");
      return (data ?? []) as MatchRow[];
    },
  });

  const request = useMutation({
    mutationFn: async (input: { surrogateId: string; score: number; rationale: string }) => {
      const { error } = await supabase.from("matches").insert({
        parent_id: user!.id,
        surrogate_id: input.surrogateId,
        score: input.score,
        rationale: input.rationale,
        status: "requested",
        initiated_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Match request sent");
      void queryClient.invalidateQueries({ queryKey: ["my-matches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scored = surrogates
    .map((s) => ({ s, ...scoreMatch(parentProfile ?? null, s) }))
    .sort((a, b) => b.score - a.score);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading candidates…</p>;

  if (scored.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="font-display text-lg">No visible surrogates yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Candidates appear here once they complete screening and make their profile visible.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {scored.map(({ s, score, reasons, gaps }) => {
        const existing = myMatches.find((m) => m.surrogate_id === s.user_id);
        return (
          <Card key={s.user_id}>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">
                  Candidate {s.user_id.slice(0, 6).toUpperCase()}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {s.location ?? "Location undisclosed"} · Age {s.age ?? "—"}
                </p>
              </div>
              <Badge className="gap-1">
                <Sparkles className="h-3 w-3" /> {score}%
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Blood group: {s.blood_group ?? "—"}</span>
                <span>BMI: {s.bmi ?? "—"}</span>
                <span>Previous pregnancies: {s.previous_pregnancies ?? 0}</span>
                <span>Children: {s.living_children ?? 0}</span>
                <span>Expectation: {formatMoney(s.compensation_expectation)}</span>
                <span>Availability: {s.availability ?? "—"}</span>
              </div>
              <ul className="space-y-1 text-xs">
                {reasons.slice(0, 3).map((r) => (
                  <li key={r} className="text-primary">
                    ✓ {r}
                  </li>
                ))}
                {gaps.slice(0, 2).map((g) => (
                  <li key={g} className="text-muted-foreground">
                    · {g}
                  </li>
                ))}
              </ul>
              {existing ? (
                <Badge variant="secondary" className="w-full justify-center py-1">
                  Request {existing.status}
                </Badge>
              ) : (
                <Button
                  className="w-full gap-2"
                  disabled={request.isPending}
                  onClick={() =>
                    request.mutate({
                      surrogateId: s.user_id,
                      score,
                      rationale: reasons.slice(0, 4).join("; "),
                    })
                  }
                >
                  <Heart className="h-4 w-4" /> Request match
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MatchRequests() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const { data: cases = [] } = useCases();

  const { data: matches = [] } = useQuery({
    queryKey: ["matches", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MatchRow[];
    },
  });

  const respond = useMutation({
    mutationFn: async (input: { id: string; status: "accepted" | "declined" | "withdrawn" }) => {
      const { error } = await supabase
        .from("matches")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Match updated");
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCase = useMutation({
    mutationFn: async (match: MatchRow) => {
      const reference = `NF-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from("cases")
        .insert({
          reference,
          parent_id: match.parent_id,
          surrogate_id: match.surrogate_id,
          status: "legal",
        })
        .select("id")
        .single();
      if (error) throw error;
      const rows = JOURNEY_TEMPLATE.map((label, i) => ({
        case_id: data.id,
        label,
        position: i,
        status: i < 4 ? ("complete" as const) : ("pending" as const),
      }));
      const { error: msError } = await supabase.from("milestones").insert(rows);
      if (msError) throw msError;
    },
    onSuccess: () => {
      toast.success("Case opened with a full milestone timeline");
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No match requests yet. Parents send requests from the browse tab.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => {
        const iAmSurrogate = m.surrogate_id === user?.id;
        const hasCase = cases.some(
          (c) => c.parent_id === m.parent_id && c.surrogate_id === m.surrogate_id,
        );
        return (
          <Card key={m.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {iAmSurrogate ? "Request from an intended parent" : "Your request to a surrogate"}
                  <Badge variant="secondary" className="ml-2">
                    {m.status}
                  </Badge>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Compatibility {m.score}% · {m.rationale || "No rationale recorded"}
                </p>
              </div>
              <div className="flex gap-2">
                {iAmSurrogate && m.status === "requested" ? (
                  <>
                    <Button size="sm" onClick={() => respond.mutate({ id: m.id, status: "accepted" })}>
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respond.mutate({ id: m.id, status: "declined" })}
                    >
                      Decline
                    </Button>
                  </>
                ) : null}
                {!iAmSurrogate && m.status === "requested" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respond.mutate({ id: m.id, status: "withdrawn" })}
                  >
                    Withdraw
                  </Button>
                ) : null}
                {m.status === "accepted" && !hasCase && roles.includes("intended_parent") ? (
                  <Button size="sm" disabled={openCase.isPending} onClick={() => openCase.mutate(m)}>
                    Open case
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
