import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Bootstrap: promotes the caller to administrator ONLY while no administrator
 * exists yet. After the first admin is created this always refuses.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An administrator already exists for this platform");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");

    const count = async (table: string, apply?: (q: any) => any) => {
      let q: any = supabaseAdmin.from(table as never).select("id", { count: "exact", head: true });
      if (apply) q = apply(q);
      const { count: c } = await q;
      return c ?? 0;
    };

    const [
      parents,
      surrogates,
      verifiedUsers,
      pendingVerifications,
      activePregnancies,
      births,
      disputes,
      pendingContracts,
    ] = await Promise.all([
      count("user_roles", (q) => q.eq("role", "intended_parent")),
      count("user_roles", (q) => q.eq("role", "surrogate")),
      count("profiles", (q) => q.eq("kyc_status", "verified")),
      count("verifications", (q) => q.eq("status", "pending")),
      count("cases", (q) => q.eq("status", "pregnant")),
      count("cases", (q) => q.eq("status", "delivered")),
      count("cases", (q) => q.eq("status", "disputed")),
      count("documents", (q) => q.eq("requires_signature", true).is("signed_at", null)),
    ]);

    const { data: txs } = await supabaseAdmin.from("escrow_transactions").select("status, amount, kind");
    let inEscrow = 0;
    let revenue = 0;
    for (const t of txs ?? []) {
      if (t.status === "held") inEscrow += Number(t.amount);
      if (t.status === "released" && t.kind === "platform_fee") revenue += Number(t.amount);
    }

    return {
      parents,
      surrogates,
      verifiedUsers,
      pendingVerifications,
      activePregnancies,
      births,
      disputes,
      pendingContracts,
      inEscrow,
      revenue,
    };
  });

export const adminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, city, kyc_status, suspended, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }
    return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
  });

export const setUserSuspended = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ userId: z.string().uuid(), suspended: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin, notify } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ suspended: data.suspended })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    await notify(
      [data.userId],
      data.suspended ? "Account suspended" : "Account reinstated",
      data.suspended
        ? "Your account has been suspended pending review by the NestFam team."
        : "Your account has been reinstated.",
      "account",
    );
    return { ok: true };
  });

export const reviewVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        verificationId: z.string().uuid(),
        approve: z.boolean(),
        notes: z.string().max(300).nullable().default(null),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin, notify } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");

    const { data: ver } = await supabaseAdmin
      .from("verifications")
      .select("id, user_id, kind")
      .eq("id", data.verificationId)
      .maybeSingle();
    if (!ver) throw new Error("Verification not found");

    await supabaseAdmin
      .from("verifications")
      .update({ status: data.approve ? "verified" : "rejected", reviewer_notes: data.notes })
      .eq("id", ver.id);

    if (data.approve) {
      const patch: Record<string, boolean | string> = {};
      if (ver.kind === "government_id") patch['id_verified'] = true;
      if (ver.kind === "selfie") patch['selfie_verified'] = true;
      if (ver.kind === "phone") patch['phone_verified'] = true;
      const { data: all } = await supabaseAdmin
        .from("verifications")
        .select("status")
        .eq("user_id", ver.user_id);
      const allVerified =
        (all ?? []).length > 0 && (all ?? []).every((v) => v.status === "verified");
      if (allVerified) patch['kyc_status'] = "verified";
      if (Object.keys(patch).length) {
        await supabaseAdmin
          .from("profiles")
          .update(patch as never)
          .eq("id", ver.user_id);
      }
      if (ver.kind === "nin" || ver.kind === "age") {
        await supabaseAdmin
          .from("surrogate_profiles")
          .update(ver.kind === "nin" ? { nin_verified: true } : { age_verified: true })
          .eq("user_id", ver.user_id);
      }
    } else {
      await supabaseAdmin.from("profiles").update({ kyc_status: "rejected" }).eq("id", ver.user_id);
    }

    await notify(
      [ver.user_id],
      data.approve ? "Verification approved" : "Verification needs attention",
      `${ver.kind.replace(/_/g, " ")}: ${data.approve ? "approved" : data.notes ?? "please re-submit"}`,
      "verification",
      "/verification",
    );
    return { ok: true };
  });

export const pendingVerifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");
    const { data } = await supabaseAdmin
      .from("verifications")
      .select("id, user_id, kind, reference, file_url, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(100);
    const ids = [...new Set((data ?? []).map((v) => v.user_id))];
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] };
    const map = new Map((profiles ?? []).map((p) => [p.id, p]));
    return (data ?? []).map((v) => ({
      ...v,
      person: map.get(v.user_id)?.full_name ?? "Unknown",
      email: map.get(v.user_id)?.email ?? "",
    }));
  });

export const adminCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");
    const { data } = await supabaseAdmin
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const { data: txs } = await supabaseAdmin
      .from("escrow_transactions")
      .select("id, case_id, kind, status, amount, description, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    return { cases: data ?? [], pendingTx: txs ?? [] };
  });

export const assignProfessional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        caseId: z.string().uuid(),
        field: z.enum(["clinic_id", "lawyer_id", "counselor_id"]),
        userId: z.string().uuid().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin, notify } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");
    const { error } = await supabaseAdmin
      .from("cases")
      .update({ [data.field]: data.userId } as never)
      .eq("id", data.caseId);
    if (error) throw new Error(error.message);
    if (data.userId) {
      await notify(
        [data.userId],
        "You were assigned to a case",
        "A NestFam case has been assigned to you. Open your dashboard to review it.",
        "assignment",
        "/dashboard",
      );
    }
    return { ok: true };
  });

export const professionalDirectory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isAdmin } = await import("./escrow.server");
    if (!(await isAdmin(context.userId))) throw new Error("Administrators only");
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["clinic", "lawyer", "counselor"]);
    const ids = [...new Set((roles ?? []).map((r) => r.user_id))];
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, full_name, organisation").in("id", ids)
      : { data: [] };
    const nameMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    return (roles ?? []).map((r) => ({
      id: r.user_id,
      role: r.role,
      name: nameMap.get(r.user_id)?.full_name || nameMap.get(r.user_id)?.organisation || "Unnamed",
    }));
  });
