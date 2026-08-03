import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/nestfam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const KINDS = [
  { value: "government_id", label: "Government ID / NIN" },
  { value: "selfie", label: "Selfie verification" },
  { value: "medical_report", label: "Medical report" },
  { value: "psychological_report", label: "Psychological assessment" },
  { value: "professional_licence", label: "Professional licence" },
  { value: "proof_of_address", label: "Proof of address" },
] as const;

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Identity & health verification — NestFam" },
      {
        name: "description",
        content:
          "Submit government ID, medical reports and professional licences for NestFam review before matching begins.",
      },
      { property: "og:title", content: "Identity & health verification — NestFam" },
      {
        property: "og:description",
        content: "Nobody is matched on NestFam until identity and health checks are cleared.",
      },
    ],
  }),
  component: VerificationPage,
});

function VerificationPage() {
  const { user, profile, refresh } = useAuth();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<string>("government_id");
  const [reference, setReference] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const { data: submissions = [] } = useQuery({
    queryKey: ["verifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("verifications").insert({
        user_id: user!.id,
        kind,
        reference: reference || null,
        file_url: fileUrl || null,
        status: "pending",
      });
      if (error) throw error;
      await supabase.from("profiles").update({ kyc_status: "pending" }).eq("id", user!.id);
    },
    onSuccess: async () => {
      toast.success("Submitted for review");
      setReference("");
      setFileUrl("");
      void queryClient.invalidateQueries({ queryKey: ["verifications"] });
      await refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checks = [
    { label: "Email verified", ok: Boolean(profile?.email_verified) },
    { label: "Phone verified", ok: Boolean(profile?.phone_verified) },
    { label: "Government ID verified", ok: Boolean(profile?.id_verified) },
    { label: "Selfie verified", ok: Boolean(profile?.selfie_verified) },
  ];

  return (
    <AppShell
      title="Verification"
      subtitle="Trust and safety checks required before matching or payments."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>KYC status</CardTitle>
              <Badge variant={profile?.kyc_status === "verified" ? "default" : "secondary"}>
                {profile?.kyc_status ?? "unstarted"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  {c.ok ? (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
              ) : (
                submissions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {KINDS.find((k) => k.value === v.kind)?.label ?? v.kind}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDate(v.created_at)}
                        {v.reviewer_notes ? ` · ${v.reviewer_notes}` : ""}
                      </p>
                    </div>
                    <Badge variant={v.status === "verified" ? "default" : "secondary"}>
                      {v.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit a document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Reference number (ID number, licence number…)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <Input
              placeholder="Link to the scanned document (https://…)"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={submit.isPending || (!reference && !fileUrl)}
              onClick={() => submit.mutate()}
            >
              Submit for review
            </Button>
            <p className="text-xs text-muted-foreground">
              Our trust and safety team reviews submissions manually. You will be notified when a
              decision is made.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
