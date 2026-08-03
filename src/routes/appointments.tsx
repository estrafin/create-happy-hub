import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CaseSelect, EmptyCase } from "@/components/CaseSelect";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import { formatDateTime } from "@/lib/nestfam";
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

const KINDS = ["clinic visit", "scan", "legal signing", "counseling", "delivery"] as const;

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — NestFam" },
      {
        name: "description",
        content:
          "Schedule clinic visits, scans, legal signings and counseling sessions with everyone on the case notified.",
      },
      { property: "og:title", content: "Appointments — NestFam" },
      {
        property: "og:description",
        content: "One shared schedule for clinics, lawyers, counselors, parents and surrogates.",
      },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: cases = [] } = useCases();
  const [caseId, setCaseId] = useState<string | undefined>(undefined);
  const active = cases.find((c) => c.id === caseId) ?? cases[0];

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<string>("clinic visit");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", active?.id],
    enabled: Boolean(active),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("case_id", active!.id)
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("appointments").insert({
        case_id: active!.id,
        created_by: user!.id,
        title: title.trim(),
        kind,
        scheduled_for: new Date(when).toISOString(),
        location: location || null,
        notes: notes || null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Appointment scheduled");
      setTitle("");
      setWhen("");
      setLocation("");
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async (input: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const now = Date.now();
  const upcoming = appointments.filter((a) => new Date(a.scheduled_for).getTime() >= now);
  const past = appointments.filter((a) => new Date(a.scheduled_for).getTime() < now);

  return (
    <AppShell title="Appointments" subtitle="Clinic, legal and counseling schedule for your case.">
      {!active ? (
        <EmptyCase what="Appointment scheduling" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-3">
                <CardTitle>Upcoming</CardTitle>
                <CaseSelect cases={cases} value={active.id} onChange={setCaseId} />
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
                ) : (
                  upcoming.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(a.scheduled_for)} · {a.kind}
                          {a.location ? ` · ${a.location}` : ""}
                        </p>
                        {a.notes ? <p className="mt-1 text-xs">{a.notes}</p> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{a.status}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus.mutate({ id: a.id, status: "cancelled" })}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {past.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No past appointments.</p>
                ) : (
                  past.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                      <span>{a.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(a.scheduled_for)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarPlus className="h-4 w-4" /> Schedule an appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Title, e.g. 12-week scan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k} value={k} className="capitalize">
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
              <Input
                placeholder="Location or clinic"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Textarea
                placeholder="Notes for the case team"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button
                className="w-full"
                disabled={!title.trim() || !when || create.isPending}
                onClick={() => create.mutate()}
              >
                Add to schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
