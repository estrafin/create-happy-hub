-- 1. DOCUMENTS: prevent signature tampering -------------------------------
DROP POLICY IF EXISTS "documents update" ON public.documents;

CREATE POLICY "documents owner update metadata"
ON public.documents FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR public.is_admin())
WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.guard_document_signatures()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(current_setting('app.document_signing', true), '') <> 'on' THEN
    IF NEW.signed_by IS DISTINCT FROM OLD.signed_by
       OR NEW.signed_at IS DISTINCT FROM OLD.signed_at THEN
      RAISE EXCEPTION 'Signature fields can only be changed through sign_document()';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS documents_guard_signatures ON public.documents;
CREATE TRIGGER documents_guard_signatures
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.guard_document_signatures();

CREATE OR REPLACE FUNCTION public.sign_document(_document_id uuid)
RETURNS public.documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc public.documents;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO doc FROM public.documents WHERE id = _document_id;
  IF doc.id IS NULL THEN
    RAISE EXCEPTION 'Document not found';
  END IF;
  IF NOT (doc.owner_id = uid OR (doc.case_id IS NOT NULL AND public.is_case_member(doc.case_id))) THEN
    RAISE EXCEPTION 'Not permitted to sign this document';
  END IF;
  IF NOT doc.requires_signature THEN
    RAISE EXCEPTION 'This document does not require signatures';
  END IF;

  PERFORM set_config('app.document_signing', 'on', true);
  UPDATE public.documents
     SET signed_by = (SELECT array_agg(DISTINCT s)
                      FROM unnest(coalesce(signed_by, '{}'::uuid[]) || uid) AS s),
         signed_at = now()
   WHERE id = _document_id
  RETURNING * INTO doc;
  PERFORM set_config('app.document_signing', 'off', true);

  RETURN doc;
END;
$$;

REVOKE ALL ON FUNCTION public.sign_document(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sign_document(uuid) TO authenticated;

-- 2. ESCROW: explicitly deny all client-side writes ------------------------
REVOKE INSERT, UPDATE, DELETE ON public.escrow_accounts FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.escrow_transactions FROM authenticated, anon;

CREATE POLICY "escrow accounts no client insert"
ON public.escrow_accounts FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "escrow accounts no client update"
ON public.escrow_accounts FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "escrow accounts no client delete"
ON public.escrow_accounts FOR DELETE TO authenticated USING (false);

CREATE POLICY "escrow tx no client insert"
ON public.escrow_transactions FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "escrow tx no client update"
ON public.escrow_transactions FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "escrow tx no client delete"
ON public.escrow_transactions FOR DELETE TO authenticated USING (false);

-- 3. MESSAGES: sender/admin deletion, still immutable ----------------------
GRANT DELETE ON public.messages TO authenticated;

CREATE POLICY "messages sender or admin delete"
ON public.messages FOR DELETE TO authenticated
USING ((sender_id = auth.uid() AND public.is_case_member(case_id)) OR public.is_admin());

CREATE POLICY "messages immutable"
ON public.messages FOR UPDATE TO authenticated
USING (false) WITH CHECK (false);

-- 4. Remove authenticated access to the arbitrary-user role helper ---------
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.current_user_has_role(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO authenticated;

DROP POLICY IF EXISTS "clinic writes pregnancy" ON public.pregnancy_updates;
CREATE POLICY "clinic writes pregnancy"
ON public.pregnancy_updates FOR INSERT TO authenticated
WITH CHECK (
  public.is_case_member(case_id)
  AND author_id = auth.uid()
  AND (public.current_user_has_role('clinic') OR public.is_admin())
);

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, anon, PUBLIC;