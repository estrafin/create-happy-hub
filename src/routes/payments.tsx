import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BanknoteArrowDown, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { CaseSelect, EmptyCase } from "@/components/CaseSelect";
import { useAuth } from "@/hooks/useAuth";
import { useCases } from "@/hooks/useCases";
import { formatDateTime, formatMoney } from "@/lib/nestfam";
import {
  depositToEscrow,
  releasePayout,
  requestPayout,
  setupCaseFinance,
} from "@/lib/escrow.functions";
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

const PAYOUT_KINDS = [
  "milestone_payment",
  "medical_expense",
  "hospital_payment",
  "surrogate_payment",
] as const;

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Escrow & payments — NestFam" },
      {
        name: "description",
        content:
          "Fund escrow, request milestone payouts and track every release with receipts across the surrogacy journey.",
      },
      { property: "og:title", content: "Escrow & payments — NestFam" },
      {
        property: "og:description",
        content: "Money is held in escrow and released only against verified milestones.",
      },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  const { data: cases = [] } = useCases();
  const [caseId, setCaseId] = useState<string | undefined>(undefined);
  const active = cases.find((c) => c.id === caseId) ?? cases[0];
  const isParent = roles.includes("intended_parent");
  const isAdmin = roles.includes("admin");

  const deposit = useServerFn(depositToEscrow);
  const payout = useServerFn(requestPayout);
  const release = useServerFn(releasePayout);
  const setup = useServerFn(setupCaseFinance);

  const [amount, setAmount] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutKind, setPayoutKind] = useState<string>("milestone_payment");
  const [payoutNote, setPayoutNote] = useState("");

  const { data: account } = useQuery({
    queryKey: ["escrow-account", active?.id],
    enabled: Boolean(active),
    queryFn: async () => {
      const { data } = await supabase
        .from("escrow_accounts")
        .select("*")
        .eq("case_id", active!.id)
        .maybeSingle();
      return data ?? null;
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["escrow-transactions", active?.id],
    enabled: Boolean(active),
    queryFn: async () => {
      const { data } = await supabase
        .from("escrow_transactions")
        .select("*")
        .eq("case_id", active!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["escrow-account"] });
    void queryClient.invalidateQueries({ queryKey: ["escrow-transactions"] });
  };

  const fund = useMutation({
    mutationFn: async () => {
      await setup({ data: { caseId: active!.id } });
      await deposit({ data: { caseId: active!.id, amount: Number(amount) } });
    },
    onSuccess: () => {
      toast.success("Escrow funded");
      setAmount("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const raise = useMutation({
    mutationFn: async () =>
      payout({
        data: {
          caseId: active!.id,
          kind: payoutKind as (typeof PAYOUT_KINDS)[number],
          amount: Number(payoutAmount),
          description: payoutNote.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Payout request submitted for approval");
      setPayoutAmount("");
      setPayoutNote("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decide = useMutation({
    mutationFn: async (input: { transactionId: string; approve: boolean }) =>
      release({ data: input }),
    onSuccess: () => {
      toast.success("Transaction updated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="Escrow" subtitle="Funds are held by NestFam and released against milestones.">
      {!active ? (
        <EmptyCase what="The escrow wallet" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid flex-1 gap-4 sm:grid-cols-3">
              <StatCard icon={Wallet} label="Held in escrow" value={formatMoney(account?.balance)} />
              <StatCard
                icon={ShieldCheck}
                label="Released to date"
                value={formatMoney(account?.released)}
              />
              <StatCard
                icon={BanknoteArrowDown}
                label="Pending approvals"
                value={String(transactions.filter((t) => t.status === "pending").length)}
              />
            </div>
            <CaseSelect cases={cases} value={active.id} onChange={setCaseId} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Transaction ledger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No escrow activity yet.</p>
                ) : (
                  transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {t.description || t.kind.replaceAll("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receipt {t.receipt_number} · {formatDateTime(t.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatMoney(t.amount)}</span>
                        <Badge variant={t.status === "released" ? "default" : "secondary"}>
                          {t.status}
                        </Badge>
                        {isAdmin && t.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                decide.mutate({ transactionId: t.id, approve: true })
                              }
                            >
                              Release
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                decide.mutate({ transactionId: t.id, approve: false })
                              }
                            >
                              Decline
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {isParent || isAdmin ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Fund escrow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Amount"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      disabled={!Number(amount) || fund.isPending}
                      onClick={() => fund.mutate()}
                    >
                      Deposit into escrow
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Request a payout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={payoutKind} onValueChange={setPayoutKind}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYOUT_KINDS.map((k) => (
                        <SelectItem key={k} value={k} className="capitalize">
                          {k.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Amount"
                    inputMode="numeric"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                  />
                  <Input
                    placeholder="What is this for?"
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    disabled={!Number(payoutAmount) || !payoutNote.trim() || raise.isPending}
                    onClick={() => raise.mutate()}
                  >
                    Submit for approval
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Administrators review every payout before funds leave escrow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-lg">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
