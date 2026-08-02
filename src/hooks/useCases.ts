import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type ProfileLite = { id: string; full_name: string; organisation: string | null };

export function useCases() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cases", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CaseRow[];
    },
  });
}

/** People on a case, resolved to display names via the profiles table (RLS-guarded). */
export function useCaseMembers(row: CaseRow | null | undefined) {
  const ids = row
    ? [row.parent_id, row.surrogate_id, row.clinic_id, row.lawyer_id, row.counselor_id].filter(
        (v): v is string => Boolean(v),
      )
    : [];
  return useQuery({
    queryKey: ["case-members", row?.id, ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, organisation")
        .in("id", ids);
      const map = new Map<string, ProfileLite>();
      for (const p of (data ?? []) as ProfileLite[]) map.set(p.id, p);
      return map;
    },
  });
}

export function useMilestones(caseId: string | undefined) {
  return useQuery({
    queryKey: ["milestones", caseId],
    enabled: Boolean(caseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("case_id", caseId!)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });
}
