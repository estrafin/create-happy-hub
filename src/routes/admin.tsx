import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatMoney, ROLE_LABELS } from "@/lib/nestfam";
import {
  adminCases,
  adminMetrics,
  adminUsers,
  assignProfessional,
  claimFirstAdmin,
  pendingVerifications,
  professionalDirectory,
  reviewVerification,
  setUserSuspended,
} from "@/lib/admin.functions";
import { releasePayout } from "@/lib/escrow.functions";
import type { AppRole } from "@/lib/nestfam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Platform administration — NestFam" },
      {
        name: "description",
        content:
          "Approve verifications, oversee cases, assign professionals and release escrow payments across the platform.",
      },
      { property: "og:title", content: "Platform administration — NestFam" },
      {
        property: "og:description",
        content: "Trust, safety and finance oversight for the NestFam surrogacy platform.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { roles, refresh } = useAuth();
  const isAdmin = roles.includes("admin");
  const claim = useServerFn(claimFirstAdmin);

  const claimAdmin = useMutation({
    mutationFn: async () => claim({}),
    onSuccess: async () => {
      toast.success("You are now the platform administrator");
      await refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <AppShell title="Administration" subtitle="Restricted area">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Administrators only</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This console is limited to the NestFam trust and safety team. If this is a brand-new
              deployment with no administrator yet, you can claim the first administrator seat.
            </p>
            <Button disabled={claimAdmin.isPending} onClick={() => claimAdmin.mutate()}>
              Claim first administrator seat
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Administration" subtitle="Verification, cases, users and escrow oversight.">
      <div className="space-y-6">
        <Metrics />
        <Tabs defaultValue="verifications">
          <TabsList>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="cases">Cases & escrow</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="verifications" className="mt-5">
            <Verifications />
          </TabsContent>
          <TabsContent value="cases" className="mt-5">
            <Cases />
          </TabsContent>
          <TabsContent value="users" className="mt-5">
            <Users />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Metrics() {
  const fetchMetrics = useServerFn(adminMetrics);
  const { data } = useQuery({ queryKey: ["admin-metrics"], queryFn: () => fetchMetrics({}) });
  const items = [
    { label: "Intended parents", value: data?.parents ?? 0 },
    { label: "Surrogates", value: data?.surrogates ?? 0 },
    { label: "Verified users", value: data?.verifiedUsers ?? 0 },
    { label: "Pending KYC", value: data?.pendingVerifications ?? 0 },
    { label: "Active pregnancies", value: data?.activePregnancies ?? 0 },
    { label: "Births recorded", value: data?.births ?? 0 },
    { label: "Open disputes", value: data?.disputes ?? 0 },
    { label: "Unsigned contracts", value: data?.pendingContracts ?? 0 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <Card key={i.label}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">{i.label}</p>
              <p className="font-display text-2xl">{i.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Held in escrow</p>
            <p className="font-display text-2xl">{formatMoney(data?.inEscrow)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Platform fee revenue</p>
            <p className="font-display text-2xl">{formatMoney(data?.revenue)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Verifications() {
  const queryClient = useQueryClient();
  const list = useServerFn(pendingVerifications);
  const review = useServerFn(reviewVerification);
  const { data = [] } = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: () => list({}),
  });

  const decide = useMutation({
    mutationFn: async (input: { verificationId: string; approve: boolean }) =>
      review({ data: { ...input, notes: null } }),
    onSuccess: () => {
      toast.success("Decision recorded");
      void queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No verifications awaiting review.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((v) => (
        <Card key={v.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm font-medium">
                {v.person} · {v.kind.replaceAll("_", " ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {v.email} · reference {v.reference ?? "—"} · {formatDate(v.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              {v.file_url ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={v.file_url} target="_blank" rel="noreferrer">
                    View file
                  </a>
                </Button>
              ) : null}
              <Button
                size="sm"
                onClick={() => decide.mutate({ verificationId: v.id, approve: true })}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => decide.mutate({ verificationId: v.id, approve: false })}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Cases() {
  const queryClient = useQueryClient();
  const list = useServerFn(adminCases);
  const directory = useServerFn(professionalDirectory);
  const assign = useServerFn(assignProfessional);
  const release = useServerFn(releasePayout);

  const { data } = useQuery({ queryKey: ["admin-cases"], queryFn: () => list({}) });
  const { data: pros = [] } = useQuery({
    queryKey: ["admin-directory"],
    queryFn: () => directory({}),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
  };

  const setPro = useMutation({
    mutationFn: async (input: {
      caseId: string;
      field: "clinic_id" | "lawyer_id" | "counselor_id";
      userId: string | null;
    }) => assign({ data: input }),
    onSuccess: () => {
      toast.success("Professional assigned");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decide = useMutation({
    mutationFn: async (input: { transactionId: string; approve: boolean }) =>
      release({ data: input }),
    onSuccess: () => {
      toast.success("Escrow updated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fields = [
    { field: "clinic_id" as const, role: "clinic", label: "Clinic" },
    { field: "lawyer_id" as const, role: "lawyer", label: "Lawyer" },
    { field: "counselor_id" as const, role: "counselor", label: "Counselor" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payouts awaiting release</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.pendingTx ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing pending.</p>
          ) : (
            (data?.pendingTx ?? []).map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{t.description || t.kind}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(t.amount)} · {formatDate(t.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => decide.mutate({ transactionId: t.id, approve: true })}
                  >
                    Release
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decide.mutate({ transactionId: t.id, approve: false })}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.cases ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No cases yet.</p>
          ) : (
            (data?.cases ?? []).map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.reference}</p>
                  <Badge variant="secondary">{c.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {fields.map((f) => (
                    <Select
                      key={f.field}
                      value={(c[f.field] as string | null) ?? ""}
                      onValueChange={(v) =>
                        setPro.mutate({ caseId: c.id, field: f.field, userId: v || null })
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder={`Assign ${f.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {pros
                          .filter((p) => p.role === f.role)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Users() {
  const queryClient = useQueryClient();
  const list = useServerFn(adminUsers);
  const suspend = useServerFn(setUserSuspended);
  const { data = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => list({}) });

  const toggle = useMutation({
    mutationFn: async (input: { userId: string; suspended: boolean }) => suspend({ data: input }),
    onSuccess: () => {
      toast.success("Account updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-2">
      {data.map((u) => (
        <Card key={u.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium">{u.full_name || "Unnamed"}</p>
              <p className="text-xs text-muted-foreground">
                {u.email} · {u.city ?? "—"} · joined {formatDate(u.created_at)}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {u.roles.map((r) => (
                  <Badge key={r} variant="secondary" className="text-[11px]">
                    {ROLE_LABELS[r as AppRole] ?? r}
                  </Badge>
                ))}
                <Badge variant="secondary" className="text-[11px]">
                  KYC {u.kyc_status}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant={u.suspended ? "default" : "outline"}
              onClick={() => toggle.mutate({ userId: u.id, suspended: !u.suspended })}
            >
              {u.suspended ? "Reinstate" : "Suspend"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
