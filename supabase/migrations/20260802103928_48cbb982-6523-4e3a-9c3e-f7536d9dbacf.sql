-- ENUMS
CREATE TYPE public.app_role AS ENUM ('intended_parent','surrogate','clinic','lawyer','counselor','admin');
CREATE TYPE public.kyc_status AS ENUM ('unstarted','pending','verified','rejected');
CREATE TYPE public.match_status AS ENUM ('suggested','requested','accepted','declined','withdrawn');
CREATE TYPE public.case_status AS ENUM ('matching','legal','medical','pregnant','delivered','closed','disputed');
CREATE TYPE public.milestone_status AS ENUM ('pending','in_progress','complete','blocked');
CREATE TYPE public.tx_type AS ENUM ('deposit','milestone_payment','medical_expense','hospital_payment','surrogate_payment','refund','platform_fee');
CREATE TYPE public.tx_status AS ENUM ('pending','held','released','failed','refunded');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  country text DEFAULT 'Nigeria',
  city text,
  language text DEFAULT 'English',
  avatar_url text,
  organisation text,
  bio text,
  kyc_status public.kyc_status NOT NULL DEFAULT 'unstarted',
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  id_verified boolean NOT NULL DEFAULT false,
  selfie_verified boolean NOT NULL DEFAULT false,
  suspended boolean NOT NULL DEFAULT false,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "own roles insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role <> 'admin');

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- new user handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, email_verified)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email, NEW.email_confirmed_at IS NOT NULL)
  ON CONFLICT (id) DO NOTHING;
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL AND NEW.raw_user_meta_data->>'role' <> 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SURROGATE PROFILES
CREATE TABLE public.surrogate_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  age int,
  location text,
  living_children int DEFAULT 0,
  previous_pregnancies int DEFAULT 0,
  previous_surrogate boolean DEFAULT false,
  blood_group text,
  genotype text,
  bmi numeric,
  height_cm int,
  weight_kg int,
  smoker boolean DEFAULT false,
  alcohol boolean DEFAULT false,
  travel_willing boolean DEFAULT false,
  languages text[] DEFAULT '{}',
  religion text,
  compensation_expectation numeric,
  availability text DEFAULT 'available',
  medical_notes text,
  hiv_screened boolean DEFAULT false,
  hepatitis_screened boolean DEFAULT false,
  medical_clearance boolean NOT NULL DEFAULT false,
  psychological_clearance boolean NOT NULL DEFAULT false,
  age_verified boolean NOT NULL DEFAULT false,
  nin_verified boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.surrogate_profiles TO authenticated;
GRANT ALL ON public.surrogate_profiles TO service_role;
ALTER TABLE public.surrogate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surrogate manages own" ON public.surrogate_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "parents and pros browse visible surrogates" ON public.surrogate_profiles FOR SELECT TO authenticated
  USING (visible AND (public.has_role(auth.uid(),'intended_parent') OR public.has_role(auth.uid(),'clinic') OR public.has_role(auth.uid(),'counselor') OR public.has_role(auth.uid(),'lawyer')));
CREATE TRIGGER sp_updated BEFORE UPDATE ON public.surrogate_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PARENT PROFILES
CREATE TABLE public.parent_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  reason_for_surrogacy text,
  medical_condition text,
  marital_status text,
  emergency_contact text,
  address text,
  clinic_name text,
  preferred_location text,
  preferred_age_min int DEFAULT 21,
  preferred_age_max int DEFAULT 40,
  preferred_blood_group text,
  preferred_language text,
  preferred_religion text,
  budget numeric,
  embryos_ready boolean DEFAULT false,
  timeline text,
  non_smoker_required boolean DEFAULT true,
  travel_required boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.parent_profiles TO authenticated;
GRANT ALL ON public.parent_profiles TO service_role;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent manages own" ON public.parent_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE TRIGGER pp_updated BEFORE UPDATE ON public.parent_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VERIFICATIONS (KYC submissions)
CREATE TABLE public.verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind text NOT NULL,
  reference text,
  file_url text,
  status public.kyc_status NOT NULL DEFAULT 'pending',
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.verifications TO authenticated;
GRANT ALL ON public.verifications TO service_role;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own verifications" ON public.verifications FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE TRIGGER ver_updated BEFORE UPDATE ON public.verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MATCHES
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  surrogate_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  rationale text,
  status public.match_status NOT NULL DEFAULT 'suggested',
  initiated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, surrogate_id)
);
GRANT SELECT, INSERT, UPDATE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "match participants read" ON public.matches FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR surrogate_id = auth.uid() OR public.is_admin());
CREATE POLICY "parent creates match request" ON public.matches FOR INSERT TO authenticated
  WITH CHECK (parent_id = auth.uid() OR public.is_admin());
CREATE POLICY "participants update match" ON public.matches FOR UPDATE TO authenticated
  USING (parent_id = auth.uid() OR surrogate_id = auth.uid() OR public.is_admin());
CREATE TRIGGER match_updated BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CASES
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL DEFAULT concat('NF-', upper(substr(md5(random()::text),1,6))),
  parent_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  surrogate_id uuid REFERENCES auth.users ON DELETE SET NULL,
  clinic_id uuid REFERENCES auth.users ON DELETE SET NULL,
  lawyer_id uuid REFERENCES auth.users ON DELETE SET NULL,
  counselor_id uuid REFERENCES auth.users ON DELETE SET NULL,
  status public.case_status NOT NULL DEFAULT 'matching',
  pregnancy_week int,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_case_member(_case_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = _case_id AND auth.uid() IN (c.parent_id, c.surrogate_id, c.clinic_id, c.lawyer_id, c.counselor_id)
  ) OR public.has_role(auth.uid(),'admin')
$$;

CREATE POLICY "case members read" ON public.cases FOR SELECT TO authenticated USING (public.is_case_member(id));
CREATE POLICY "parent creates case" ON public.cases FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid() OR public.is_admin());
CREATE POLICY "case members update" ON public.cases FOR UPDATE TO authenticated USING (public.is_case_member(id));
CREATE TRIGGER case_updated BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MILESTONES
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases ON DELETE CASCADE,
  label text NOT NULL,
  position int NOT NULL DEFAULT 0,
  status public.milestone_status NOT NULL DEFAULT 'pending',
  detail text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones members" ON public.milestones FOR ALL TO authenticated
  USING (public.is_case_member(case_id)) WITH CHECK (public.is_case_member(case_id));
CREATE TRIGGER ms_updated BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'clinic',
  scheduled_for timestamptz NOT NULL,
  location text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments members" ON public.appointments FOR ALL TO authenticated
  USING (public.is_case_member(case_id)) WITH CHECK (public.is_case_member(case_id));

-- PREGNANCY UPDATES
CREATE TABLE public.pregnancy_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  week int,
  stage text NOT NULL,
  summary text,
  doctor_notes text,
  ultrasound_url text,
  lab_results_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pregnancy_updates TO authenticated;
GRANT ALL ON public.pregnancy_updates TO service_role;
ALTER TABLE public.pregnancy_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pregnancy members read" ON public.pregnancy_updates FOR SELECT TO authenticated USING (public.is_case_member(case_id));
CREATE POLICY "clinic writes pregnancy" ON public.pregnancy_updates FOR INSERT TO authenticated
  WITH CHECK (public.is_case_member(case_id) AND author_id = auth.uid() AND (public.has_role(auth.uid(),'clinic') OR public.is_admin()));

-- DOCUMENTS
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'medical',
  name text NOT NULL,
  file_url text,
  requires_signature boolean NOT NULL DEFAULT false,
  signed_by uuid[] DEFAULT '{}',
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents members read" ON public.documents FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR (case_id IS NOT NULL AND public.is_case_member(case_id)));
CREATE POLICY "documents insert" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND (case_id IS NULL OR public.is_case_member(case_id)));
CREATE POLICY "documents update" ON public.documents FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR (case_id IS NOT NULL AND public.is_case_member(case_id)));
CREATE TRIGGER doc_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'general',
  body text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages members read" ON public.messages FOR SELECT TO authenticated USING (public.is_case_member(case_id));
CREATE POLICY "messages members send" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_case_member(case_id));
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ESCROW
CREATE TABLE public.escrow_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.cases ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'NGN',
  balance numeric NOT NULL DEFAULT 0,
  held numeric NOT NULL DEFAULT 0,
  released numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.escrow_accounts TO authenticated;
GRANT ALL ON public.escrow_accounts TO service_role;
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "escrow members read" ON public.escrow_accounts FOR SELECT TO authenticated USING (public.is_case_member(case_id));

CREATE TABLE public.escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases ON DELETE CASCADE,
  kind public.tx_type NOT NULL,
  status public.tx_status NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  description text,
  milestone_id uuid REFERENCES public.milestones ON DELETE SET NULL,
  receipt_number text NOT NULL DEFAULT concat('RCP-', upper(substr(md5(random()::text),1,8))),
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.escrow_transactions TO authenticated;
GRANT ALL ON public.escrow_transactions TO service_role;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx members read" ON public.escrow_transactions FOR SELECT TO authenticated USING (public.is_case_member(case_id));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'general',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- RATINGS (professionals only, private)
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases ON DELETE SET NULL,
  stars int NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (author_id, subject_id, case_id)
);
GRANT SELECT, INSERT ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings author read" ON public.ratings FOR SELECT TO authenticated USING (author_id = auth.uid() OR public.is_admin());
CREATE POLICY "ratings author insert" ON public.ratings FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid()
    AND NOT public.has_role(subject_id,'surrogate')
    AND NOT public.has_role(subject_id,'intended_parent'));

CREATE INDEX idx_messages_case ON public.messages(case_id, created_at);
CREATE INDEX idx_milestones_case ON public.milestones(case_id, position);
CREATE INDEX idx_tx_case ON public.escrow_transactions(case_id, created_at);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);