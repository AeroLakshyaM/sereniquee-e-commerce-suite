ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'fixed')) NOT NULL,
  value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage discount codes"
  ON public.discount_codes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active discount codes"
  ON public.discount_codes FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE OR REPLACE FUNCTION public.increment_coupon_uses(code_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.discount_codes
  SET uses_count = uses_count + 1
  WHERE id = code_id
    AND is_active = true
    AND (max_uses IS NULL OR uses_count < max_uses);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon is no longer available';
  END IF;
END;
$$;
