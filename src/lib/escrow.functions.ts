import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const depositToEscrow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        caseId: z.string().uuid(),
        amount: z.number().positive(),
        description: z.string().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadCase, isAdmin, caseMembers, notify, ensureEscrow, recalcEscrow } = await import(
      "./escrow.server"
    );
    const row = await loadCase(data.caseId);
    if (row.parent_id !== context.userId && !(await isAdmin(context.userId))) {
      throw new Error("Only the intended parent or an administrator can fund escrow");
    }
    await ensureEscrow(data.caseId);
    const { error } = await supabaseAdmin.from("escrow_transactions").insert({
      case_id: data.caseId,
      kind: "deposit",
      status: "held",
      amount: data.amount,
      description: data.description ?? "Escrow deposit",
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    const totals = await recalcEscrow(data.caseId);
    await notify(
      caseMembers(row),
      "Escrow funded",
      `A deposit was added to the escrow wallet. Held balance is now ${totals.balance}.`,
      "payment",
      "/payments",
    );
    return totals;
  });

export const requestPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        caseId: z.string().uuid(),
        kind: z.enum(["milestone_payment", "medical_expense", "hospital_payment", "surrogate_payment"]),
        amount: z.number().positive(),
        description: z.string().max(200),
        milestoneId: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadCase, isAdmin, caseMembers, notify } = await import("./escrow.server");
    const row = await loadCase(data.caseId);
    const admin = await isAdmin(context.userId);
    const allowed = admin || [row.parent_id, row.clinic_id, row.lawyer_id].includes(context.userId);
    if (!allowed) throw new Error("You cannot raise payout requests on this case");

    const { error } = await supabaseAdmin.from("escrow_transactions").insert({
      case_id: data.caseId,
      kind: data.kind,
      status: "pending",
      amount: data.amount,
      description: data.description,
      milestone_id: data.milestoneId ?? null,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await notify(
      caseMembers(row),
      "Payout awaiting approval",
      `${data.description} — awaiting administrator release.`,
      "payment",
      "/payments",
    );
    return { ok: true };
  });

export const releasePayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ transactionId: z.string().uuid(), approve: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadCase, isAdmin, caseMembers, notify, recalcEscrow } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) {
      throw new Error("Only administrators can release escrow funds");
    }
    const { data: tx, error: txError } = await supabaseAdmin
      .from("escrow_transactions")
      .select("id, case_id, amount, description, status")
      .eq("id", data.transactionId)
      .maybeSingle();
    if (txError) throw new Error(txError.message);
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") throw new Error("Transaction is not pending");

    const { error } = await supabaseAdmin
      .from("escrow_transactions")
      .update(
        data.approve
          ? { status: "released", released_at: new Date().toISOString() }
          : { status: "failed" },
      )
      .eq("id", tx.id);
    if (error) throw new Error(error.message);

    const row = await loadCase(tx.case_id);
    const totals = await recalcEscrow(tx.case_id);
    await notify(
      caseMembers(row),
      data.approve ? "Payment released" : "Payment declined",
      `${tx.description ?? "Escrow payment"} — ${data.approve ? "released from escrow" : "declined by the platform"}.`,
      "payment",
      "/payments",
    );
    return totals;
  });

export const setupCaseFinance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ caseId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { loadCase, isAdmin, ensureEscrow } = await import("./escrow.server");
    const row = await loadCase(data.caseId);
    if (row.parent_id !== context.userId && !(await isAdmin(context.userId))) {
      throw new Error("Not permitted");
    }
    return ensureEscrow(data.caseId);
  });

export const notifyMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        caseId: z.string().uuid(),
        title: z.string().max(120),
        body: z.string().max(400),
        kind: z.string().max(40).default("general"),
        link: z.string().max(120).nullable().default(null),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { loadCase, caseMembers, notify } = await import("./escrow.server");
    const row = await loadCase(data.caseId);
    const members = caseMembers(row);
    if (!members.includes(context.userId)) throw new Error("Not a member of this case");
    await notify(
      members.filter((m) => m !== context.userId),
      data.title,
      data.body,
      data.kind,
      data.link,
    );
    return { ok: true };
  });
