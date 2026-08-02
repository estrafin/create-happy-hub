import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  intended_parent: "Intended Parent",
  surrogate: "Surrogate",
  clinic: "Fertility Clinic",
  lawyer: "Lawyer",
  counselor: "Counselor",
  admin: "Administrator",
};

export const ROLE_BLURBS: Record<AppRole, string> = {
  intended_parent: "Find a screened surrogate and coordinate your journey.",
  surrogate: "Offer to carry, complete screening, get paid through escrow.",
  clinic: "Verify health, approve transfers, publish medical progress.",
  lawyer: "Draft contracts, collect signatures, file parentage documents.",
  counselor: "Run assessments and clear psychological readiness.",
  admin: "Approve users, resolve disputes, release escrow funds.",
};

export const JOURNEY_TEMPLATE = [
  "Identity Verified",
  "Medical Review",
  "Lawyer Assigned",
  "Match Found",
  "Contract Signed",
  "IVF Started",
  "Embryo Transfer",
  "Pregnancy Week 8",
  "Week 12",
  "Week 20",
  "Week 28",
  "Week 36",
  "Delivery",
];

export const PREGNANCY_STAGES = [
  "Embryo Transfer",
  "Week 4",
  "Week 8",
  "Week 12",
  "Week 20",
  "Week 28",
  "Week 36",
  "Delivery",
];

export const DOCUMENT_CATEGORIES = [
  "medical",
  "legal contract",
  "consent form",
  "birth documentation",
  "insurance",
  "invoice",
  "receipt",
] as const;

export function formatMoney(amount: number | null | undefined, currency = "NGN") {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COMPATIBLE_BLOOD: Record<string, string[]> = {
  "O-": ["O-"],
  "O+": ["O+", "O-"],
  "A-": ["A-", "O-"],
  "A+": ["A+", "A-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
  "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
};

type SurrogateRow = Database["public"]["Tables"]["surrogate_profiles"]["Row"];
type ParentRow = Database["public"]["Tables"]["parent_profiles"]["Row"];

export type ScoredMatch = {
  score: number;
  reasons: string[];
  gaps: string[];
};

/**
 * Compatibility scoring across the factors in the NestFam spec.
 * Advisory only — clinical and legal decisions stay with professionals.
 */
export function scoreMatch(parent: ParentRow | null, s: SurrogateRow): ScoredMatch {
  const reasons: string[] = [];
  const gaps: string[] = [];
  let score = 0;
  let max = 0;

  const add = (weight: number, ok: boolean, yes: string, no: string) => {
    max += weight;
    if (ok) {
      score += weight;
      reasons.push(yes);
    } else {
      gaps.push(no);
    }
  };

  add(14, Boolean(s.medical_clearance), "Medical clearance issued", "Awaiting medical clearance");
  add(
    12,
    Boolean(s.psychological_clearance),
    "Psychological clearance issued",
    "Awaiting psychological clearance",
  );
  add(8, s.availability === "available", "Available now", "Not currently available");

  const loc = (parent?.preferred_location ?? "").trim().toLowerCase();
  add(
    12,
    !loc || (s.location ?? "").toLowerCase().includes(loc),
    loc ? `Located in ${s.location}` : "Location flexible",
    `Outside preferred location (${s.location ?? "unknown"})`,
  );

  const minAge = parent?.preferred_age_min ?? 21;
  const maxAge = parent?.preferred_age_max ?? 40;
  add(
    12,
    s.age != null && s.age >= minAge && s.age <= maxAge,
    `Age ${s.age} within ${minAge}–${maxAge}`,
    `Age ${s.age ?? "unknown"} outside ${minAge}–${maxAge}`,
  );

  add(
    10,
    (s.previous_pregnancies ?? 0) > 0,
    `${s.previous_pregnancies} previous pregnanc${(s.previous_pregnancies ?? 0) === 1 ? "y" : "ies"}`,
    "No previous pregnancy recorded",
  );

  const pref = parent?.preferred_blood_group;
  add(
    8,
    !pref || !s.blood_group || (COMPATIBLE_BLOOD[pref] ?? []).includes(s.blood_group),
    s.blood_group ? `Blood group ${s.blood_group} compatible` : "Blood group flexible",
    `Blood group ${s.blood_group ?? "unknown"} not compatible with ${pref}`,
  );

  const bmi = Number(s.bmi ?? 0);
  add(
    8,
    bmi >= 18.5 && bmi <= 30,
    `Healthy BMI ${bmi || "—"}`,
    `BMI ${bmi || "unknown"} outside 18.5–30`,
  );

  add(
    6,
    !parent?.non_smoker_required || !s.smoker,
    "Non-smoker",
    "Smoker — parent requires non-smoker",
  );
  add(4, !s.alcohol, "No alcohol use", "Reports alcohol use");
  add(
    4,
    !parent?.travel_required || Boolean(s.travel_willing),
    "Willing to travel",
    "Not willing to travel",
  );

  const lang = parent?.preferred_language;
  add(
    6,
    !lang || (s.languages ?? []).some((l) => l.toLowerCase() === lang.toLowerCase()),
    lang ? `Speaks ${lang}` : "Language flexible",
    `Does not speak ${lang}`,
  );

  const religion = parent?.preferred_religion;
  if (religion) {
    add(
      4,
      (s.religion ?? "").toLowerCase() === religion.toLowerCase(),
      `Shares ${religion} faith`,
      `Different faith background`,
    );
  }

  const budget = Number(parent?.budget ?? 0);
  const expect = Number(s.compensation_expectation ?? 0);
  if (budget && expect) {
    add(
      10,
      expect <= budget,
      "Compensation expectation within budget",
      "Compensation expectation above budget",
    );
  }

  return { score: Math.round((score / Math.max(max, 1)) * 100), reasons, gaps };
}
