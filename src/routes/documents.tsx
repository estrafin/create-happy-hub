import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, PenLine, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CaseSelect } from "@/components/CaseSelect";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import { DOCUMENT_CATEGORIES, formatDate } from "@/lib/nestfam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents & contracts — NestFam" },
      {
        name: "description",
        content:
          "Store medical records, surrogacy contracts, consent forms and birth documentation with signature tracking.",
      },
      { property: "og:title", content: "Documents & contracts — NestFam" },
      {
        property: "og:description",
        content: "Every contract, consent form and record in one auditable vault.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: cases = [] } = useCases();
  const [caseId, setCaseId] = useState<string | undefined>(undefined);
  const active = cases.find((c) => c.id === caseId) ?? cases[0];

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [url, setUrl] = useState("");
  const [needsSignature, setNeedsSignature] = useState(false);

  const { data: documents = [] } = useQuery({
    queryKey: ["documents", active?.id, user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const query = supabase.from("documents").select("*").order("created_at", { ascending: false });
      const { data, error } = active ? await query.eq("case_id", active.id) : await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("documents").insert({
        case_id: active?.id ?? null,
        owner_id: user!.id,
        category,
        name: name.trim(),
        file_url: url || null,
        requires_signature: needsSignature,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document added to the vault");
      setName("");
      setUrl("");
      setNeedsSignature(false);
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sign = useMutation({
    mutationFn: async (doc: { id: string; signed_by: string[] | null }) => {
      const signers = [...new Set([...(doc.signed_by ?? []), user!.id])];
      const { error } = await supabase
        .from("documents")
        .update({ signed_by: signers, signed_at: new Date().toISOString() })
        .eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Signature recorded");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="Documents" subtitle="Contracts, medical records and consent forms.">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>Vault</CardTitle>
            <CaseSelect cases={cases} value={active?.id} onChange={setCaseId} />
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing stored yet. Add contracts, clearances and consent forms on the right.
              </p>
            ) : (
              documents.map((d) => {
                const signed = (d.signed_by ?? []).includes(user?.id ?? "");
                return (
                  <div
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {d.category} · added {formatDate(d.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.requires_signature ? (
                        <Badge variant={signed ? "default" : "secondary"}>
                          {signed ? "Signed by you" : "Signature needed"}
                        </Badge>
                      ) : null}
                      {d.file_url ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={d.file_url} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        </Button>
                      ) : null}
                      {d.requires_signature && !signed ? (
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => sign.mutate({ id: d.id, signed_by: d.signed_by })}
                        >
                          <PenLine className="h-3 w-3" /> Sign
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" /> Add a document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Document name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Link to the file (https://…)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={needsSignature}
                onCheckedChange={(v) => setNeedsSignature(v === true)}
              />
              Requires signatures from the case team
            </label>
            <Button
              className="w-full"
              disabled={!name.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              Save to vault
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
