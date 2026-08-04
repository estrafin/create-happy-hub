import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/nestfam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & preferences — NestFam" },
      {
        name: "description",
        content:
          "Update your NestFam contact details, matching preferences and role-specific screening information.",
      },
      { property: "og:title", content: "Profile & preferences — NestFam" },
      {
        property: "og:description",
        content: "Keep your NestFam details and matching preferences accurate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

type AnyRecord = Record<string, unknown>;

function num(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function ProfilePage() {
  const { user, profile, role, refresh } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "",
    city: "",
    language: "",
    organisation: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        country: profile.country ?? "",
        city: profile.city ?? "",
        language: profile.language ?? "",
        organisation: profile.organisation ?? "",
        bio: profile.bio ?? "",
      });
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          phone: form.phone || null,
          country: form.country || null,
          city: form.city || null,
          language: form.language || null,
          organisation: form.organisation || null,
          bio: form.bio || null,
          onboarding_complete: true,
        })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell
      title="Profile & preferences"
      subtitle={role ? `${ROLE_LABELS[role]} account` : "Your NestFam account"}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>
            {role && role !== "intended_parent" && role !== "surrogate" ? (
              <div className="space-y-1.5">
                <Label htmlFor="organisation">Organisation</Label>
                <Input
                  id="organisation"
                  value={form.organisation}
                  onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="bio">About you</Label>
              <Textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <Button
              onClick={() => saveProfile.mutate()}
              disabled={saveProfile.isPending || !form.full_name.trim()}
            >
              {saveProfile.isPending ? "Saving…" : "Save profile"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Email is fixed to {profile?.email ?? "your sign-in address"} and verification status is
              managed in the verification centre.
            </p>
          </CardContent>
        </Card>

        {role === "surrogate" ? <SurrogateForm userId={user?.id} /> : null}
        {role === "intended_parent" ? <ParentForm userId={user?.id} /> : null}
      </div>
      <div className="sr-only">{queryClient ? "" : ""}</div>
    </AppShell>
  );
}

function SurrogateForm({ userId }: { userId: string | undefined }) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["surrogate-profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data } = await supabase
        .from("surrogate_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      return data;
    },
  });

  const [f, setF] = useState({
    age: "",
    location: "",
    living_children: "",
    previous_pregnancies: "",
    blood_group: "",
    genotype: "",
    height_cm: "",
    weight_kg: "",
    religion: "",
    compensation_expectation: "",
    availability: "",
    medical_notes: "",
    smoker: false,
    alcohol: false,
    travel_willing: true,
    previous_surrogate: false,
    visible: true,
  });

  useEffect(() => {
    if (data) {
      setF({
        age: data.age?.toString() ?? "",
        location: data.location ?? "",
        living_children: data.living_children?.toString() ?? "",
        previous_pregnancies: data.previous_pregnancies?.toString() ?? "",
        blood_group: data.blood_group ?? "",
        genotype: data.genotype ?? "",
        height_cm: data.height_cm?.toString() ?? "",
        weight_kg: data.weight_kg?.toString() ?? "",
        religion: data.religion ?? "",
        compensation_expectation: data.compensation_expectation?.toString() ?? "",
        availability: data.availability ?? "",
        medical_notes: data.medical_notes ?? "",
        smoker: Boolean(data.smoker),
        alcohol: Boolean(data.alcohol),
        travel_willing: data.travel_willing ?? true,
        previous_surrogate: Boolean(data.previous_surrogate),
        visible: data.visible ?? true,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: AnyRecord = {
        user_id: userId,
        age: num(f.age),
        location: f.location || null,
        living_children: num(f.living_children),
        previous_pregnancies: num(f.previous_pregnancies),
        blood_group: f.blood_group || null,
        genotype: f.genotype || null,
        height_cm: num(f.height_cm),
        weight_kg: num(f.weight_kg),
        religion: f.religion || null,
        compensation_expectation: num(f.compensation_expectation),
        availability: f.availability || null,
        medical_notes: f.medical_notes || null,
        smoker: f.smoker,
        alcohol: f.alcohol,
        travel_willing: f.travel_willing,
        previous_surrogate: f.previous_surrogate,
        visible: f.visible,
      };
      const { error } = await supabase
        .from("surrogate_profiles")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(payload as any, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["surrogate-profile"] });
      toast.success("Surrogate profile saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Surrogate screening profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Age" value={f.age} onChange={(v) => setF({ ...f, age: v })} type="number" />
          <Field label="Location" value={f.location} onChange={(v) => setF({ ...f, location: v })} />
          <Field
            label="Living children"
            type="number"
            value={f.living_children}
            onChange={(v) => setF({ ...f, living_children: v })}
          />
          <Field
            label="Previous pregnancies"
            type="number"
            value={f.previous_pregnancies}
            onChange={(v) => setF({ ...f, previous_pregnancies: v })}
          />
          <Field
            label="Blood group"
            value={f.blood_group}
            onChange={(v) => setF({ ...f, blood_group: v })}
          />
          <Field label="Genotype" value={f.genotype} onChange={(v) => setF({ ...f, genotype: v })} />
          <Field
            label="Height (cm)"
            type="number"
            value={f.height_cm}
            onChange={(v) => setF({ ...f, height_cm: v })}
          />
          <Field
            label="Weight (kg)"
            type="number"
            value={f.weight_kg}
            onChange={(v) => setF({ ...f, weight_kg: v })}
          />
          <Field label="Religion" value={f.religion} onChange={(v) => setF({ ...f, religion: v })} />
          <Field
            label="Compensation expectation"
            type="number"
            value={f.compensation_expectation}
            onChange={(v) => setF({ ...f, compensation_expectation: v })}
          />
          <Field
            label="Availability"
            value={f.availability}
            onChange={(v) => setF({ ...f, availability: v })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="medical_notes">Medical notes for clinics</Label>
          <Textarea
            id="medical_notes"
            rows={3}
            value={f.medical_notes}
            onChange={(e) => setF({ ...f, medical_notes: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            label="Non-smoker"
            checked={!f.smoker}
            onChange={(v) => setF({ ...f, smoker: !v })}
          />
          <Toggle
            label="No alcohol"
            checked={!f.alcohol}
            onChange={(v) => setF({ ...f, alcohol: !v })}
          />
          <Toggle
            label="Willing to travel"
            checked={f.travel_willing}
            onChange={(v) => setF({ ...f, travel_willing: v })}
          />
          <Toggle
            label="Surrogate before"
            checked={f.previous_surrogate}
            onChange={(v) => setF({ ...f, previous_surrogate: v })}
          />
          <Toggle
            label="Visible to intended parents"
            checked={f.visible}
            onChange={(v) => setF({ ...f, visible: v })}
          />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save screening profile"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ParentForm({ userId }: { userId: string | undefined }) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["parent-profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      return data;
    },
  });

  const [f, setF] = useState({
    reason_for_surrogacy: "",
    medical_condition: "",
    marital_status: "",
    emergency_contact: "",
    address: "",
    clinic_name: "",
    preferred_location: "",
    preferred_age_min: "",
    preferred_age_max: "",
    preferred_blood_group: "",
    preferred_language: "",
    preferred_religion: "",
    budget: "",
    timeline: "",
    embryos_ready: false,
    non_smoker_required: true,
    travel_required: false,
  });

  useEffect(() => {
    if (data) {
      setF({
        reason_for_surrogacy: data.reason_for_surrogacy ?? "",
        medical_condition: data.medical_condition ?? "",
        marital_status: data.marital_status ?? "",
        emergency_contact: data.emergency_contact ?? "",
        address: data.address ?? "",
        clinic_name: data.clinic_name ?? "",
        preferred_location: data.preferred_location ?? "",
        preferred_age_min: data.preferred_age_min?.toString() ?? "",
        preferred_age_max: data.preferred_age_max?.toString() ?? "",
        preferred_blood_group: data.preferred_blood_group ?? "",
        preferred_language: data.preferred_language ?? "",
        preferred_religion: data.preferred_religion ?? "",
        budget: data.budget?.toString() ?? "",
        timeline: data.timeline ?? "",
        embryos_ready: Boolean(data.embryos_ready),
        non_smoker_required: data.non_smoker_required ?? true,
        travel_required: Boolean(data.travel_required),
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: AnyRecord = {
        user_id: userId,
        reason_for_surrogacy: f.reason_for_surrogacy || null,
        medical_condition: f.medical_condition || null,
        marital_status: f.marital_status || null,
        emergency_contact: f.emergency_contact || null,
        address: f.address || null,
        clinic_name: f.clinic_name || null,
        preferred_location: f.preferred_location || null,
        preferred_age_min: num(f.preferred_age_min),
        preferred_age_max: num(f.preferred_age_max),
        preferred_blood_group: f.preferred_blood_group || null,
        preferred_language: f.preferred_language || null,
        preferred_religion: f.preferred_religion || null,
        budget: num(f.budget),
        timeline: f.timeline || null,
        embryos_ready: f.embryos_ready,
        non_smoker_required: f.non_smoker_required,
        travel_required: f.travel_required,
      };
      const { error } = await supabase
        .from("parent_profiles")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(payload as any, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parent-profile"] });
      toast.success("Matching preferences saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey & matching preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Marital status"
            value={f.marital_status}
            onChange={(v) => setF({ ...f, marital_status: v })}
          />
          <Field
            label="Emergency contact"
            value={f.emergency_contact}
            onChange={(v) => setF({ ...f, emergency_contact: v })}
          />
          <Field
            label="Fertility clinic"
            value={f.clinic_name}
            onChange={(v) => setF({ ...f, clinic_name: v })}
          />
          <Field
            label="Preferred location"
            value={f.preferred_location}
            onChange={(v) => setF({ ...f, preferred_location: v })}
          />
          <Field
            label="Preferred age min"
            type="number"
            value={f.preferred_age_min}
            onChange={(v) => setF({ ...f, preferred_age_min: v })}
          />
          <Field
            label="Preferred age max"
            type="number"
            value={f.preferred_age_max}
            onChange={(v) => setF({ ...f, preferred_age_max: v })}
          />
          <Field
            label="Preferred blood group"
            value={f.preferred_blood_group}
            onChange={(v) => setF({ ...f, preferred_blood_group: v })}
          />
          <Field
            label="Preferred language"
            value={f.preferred_language}
            onChange={(v) => setF({ ...f, preferred_language: v })}
          />
          <Field
            label="Preferred religion"
            value={f.preferred_religion}
            onChange={(v) => setF({ ...f, preferred_religion: v })}
          />
          <Field
            label="Budget"
            type="number"
            value={f.budget}
            onChange={(v) => setF({ ...f, budget: v })}
          />
          <Field
            label="Timeline"
            value={f.timeline}
            onChange={(v) => setF({ ...f, timeline: v })}
          />
          <Field label="Address" value={f.address} onChange={(v) => setF({ ...f, address: v })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reason">Reason for surrogacy</Label>
          <Textarea
            id="reason"
            rows={3}
            value={f.reason_for_surrogacy}
            onChange={(e) => setF({ ...f, reason_for_surrogacy: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="condition">Relevant medical history</Label>
          <Textarea
            id="condition"
            rows={3}
            value={f.medical_condition}
            onChange={(e) => setF({ ...f, medical_condition: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            label="Embryos ready"
            checked={f.embryos_ready}
            onChange={(v) => setF({ ...f, embryos_ready: v })}
          />
          <Toggle
            label="Non-smoker required"
            checked={f.non_smoker_required}
            onChange={(v) => setF({ ...f, non_smoker_required: v })}
          />
          <Toggle
            label="Travel required"
            checked={f.travel_required}
            onChange={(v) => setF({ ...f, travel_required: v })}
          />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
