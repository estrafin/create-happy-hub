import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CaseSelect, EmptyCase } from "@/components/CaseSelect";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import { formatDateTime } from "@/lib/nestfam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CHANNELS = ["general", "medical", "legal", "finance"] as const;

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Case messages — NestFam" },
      {
        name: "description",
        content:
          "Channelled case messaging between parents, surrogates, clinics, lawyers and counselors — all kept on the record.",
      },
      { property: "og:title", content: "Case messages — NestFam" },
      {
        property: "og:description",
        content: "General, medical, legal and finance channels for every surrogacy case.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: cases = [] } = useCases();
  const [caseId, setCaseId] = useState<string | undefined>(undefined);
  const [channel, setChannel] = useState<string>("general");
  const [body, setBody] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const active = cases.find((c) => c.id === caseId) ?? cases[0];

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", active?.id, channel],
    enabled: Boolean(active),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("case_id", active!.id)
        .eq("channel", channel)
        .order("created_at", { ascending: true })
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!active) return;
    const sub = supabase
      .channel(`messages-${active.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `case_id=eq.${active.id}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(sub);
    };
  }, [active, queryClient]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("messages").insert({
        case_id: active!.id,
        sender_id: user!.id,
        channel,
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="Messages" subtitle="Every conversation stays attached to the case record.">
      {!active ? (
        <EmptyCase what="Case messaging" />
      ) : (
        <Card className="flex h-[70vh] flex-col">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b border-border">
            <CardTitle className="text-base">Case {active.reference}</CardTitle>
            <div className="flex items-center gap-3">
              <Tabs value={channel} onValueChange={setChannel}>
                <TabsList>
                  {CHANNELS.map((c) => (
                    <TabsTrigger key={c} value={c} className="capitalize">
                      {c}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <CaseSelect cases={cases} value={active.id} onChange={setCaseId} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 overflow-y-auto py-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages in the {channel} channel yet.
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        mine ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1 text-[11px] opacity-70">{formatDateTime(m.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottom} />
          </CardContent>
          <div className="flex gap-2 border-t border-border p-4">
            <Input
              placeholder={`Message the ${channel} channel`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && body.trim()) send.mutate();
              }}
            />
            <Button
              className="gap-2"
              disabled={!body.trim() || send.isPending}
              onClick={() => send.mutate()}
            >
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
