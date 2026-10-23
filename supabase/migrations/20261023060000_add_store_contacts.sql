CREATE TABLE IF NOT EXISTS public.store_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text CHECK (email IS NULL OR char_length(email) <= 254),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 40),
  interest_type text NOT NULL DEFAULT 'stay_in_touch' CHECK (interest_type IN ('stay_in_touch', 'product_question', 'gift_idea', 'other')),
  message text CHECK (message IS NULL OR char_length(message) <= 1000),
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  source text NOT NULL DEFAULT 'mobile_store',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'complete')),
  internal_note text CHECK (internal_note IS NULL OR char_length(internal_note) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_contacts_require_contact CHECK (email IS NOT NULL OR phone IS NOT NULL),
  CONSTRAINT store_contacts_consent_timestamp CHECK ((marketing_consent AND marketing_consent_at IS NOT NULL) OR (NOT marketing_consent AND marketing_consent_at IS NULL))
);

CREATE INDEX IF NOT EXISTS store_contacts_created_at_idx ON public.store_contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS store_contacts_email_idx ON public.store_contacts (lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS store_contacts_phone_idx ON public.store_contacts (phone) WHERE phone IS NOT NULL;

ALTER TABLE public.store_contacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.store_contacts FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.store_contacts TO authenticated;
GRANT ALL ON public.store_contacts TO service_role;

CREATE POLICY "Admins can view store contacts" ON public.store_contacts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update store contacts" ON public.store_contacts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
