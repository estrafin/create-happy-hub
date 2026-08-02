import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type CaseRow = {
  id: string;
  parent_id: string;
  surrogate_id: string | null;
  clinic_id: string | null;
  lawyer_id: string | null;
  counselor_id: string | null;
};

export async function loadCase(caseId: string): Promise<CaseRow> {
  const { data, error } = await supabaseAdmin
    .from("cases")
    .select("id, parent_id, surrogate_id, clinic_id, lawyer_id, counselor_id")
    .eq("id", caseId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Case not found");
  return data as CaseRow;
}

export async function isAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}

export function caseMembers(row: CaseRow) {
  return [row.parent_id, row.surrogate_id, row.clinic_id, row.lawyer_id, row.counselor_id].filter(
    Boolean,
  ) as string[];
}

export async function notify(
  userIds: string[],
  title: string,
  body: string,
  kind = "general",
  link: string | null = null,
) {
  const rows = [...new Set(userIds)].map((user_id) => ({ user_id, title, body, kind, link }));
  if (!rows.length) return;
  await supabaseAdmin.from("notifications").insert(rows);
}

export async function ensureEscrow(caseId: string) {
  const { data } = await supabaseAdmin
    .from("escrow_accounts")
    .select("*")
    .eq("case_id", caseId)
    .maybeSingle();
  if (data) return data;
  const { data: created, error } = await supabaseAdmin
    .from("escrow_accounts")
    .insert({ case_id: caseId })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return created;
}

export async function recalcEscrow(caseId: string) {
  const { data: txs } = await supabaseAdmin
    .from("escrow_transactions")
    .select("kind, status, amount")
    .eq("case_id", caseId);

  let held = 0;
  let released = 0;
  for (const t of txs ?? []) {
    const amount = Number(t.amount);
    if (t.status === "held") held += t.kind === "deposit" ? amount : -amount;
    if (t.status === "released") released += amount;
  }
  const balance = Math.max(held, 0);
  await supabaseAdmin
    .from("escrow_accounts")
    .update({ held: balance, released, balance, updated_at: new Date().toISOString() })
    .eq("case_id", caseId);
  return { balance, released };
}
