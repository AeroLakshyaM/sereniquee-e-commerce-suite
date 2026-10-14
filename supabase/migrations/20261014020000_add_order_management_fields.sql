ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

UPDATE public.orders o
SET order_number = 'SC-' ||
  UPPER(LEFT(REGEXP_REPLACE(COALESCE(o.guest_name, p.full_name, p.email, 'CUSTOMER'), '[^a-zA-Z0-9]', '', 'g'), 6)) ||
  '-' || TO_CHAR(COALESCE(o.created_at, NOW()), 'YYYYMMDD') ||
  '-' || UPPER(LEFT(REPLACE(o.id::text, '-', ''), 6))
FROM public.profiles p
WHERE o.user_id = p.id
  AND o.order_number IS NULL;

UPDATE public.orders
SET order_number = 'SC-CUSTOMER-' ||
  TO_CHAR(COALESCE(created_at, NOW()), 'YYYYMMDD') ||
  '-' || UPPER(LEFT(REPLACE(id::text, '-', ''), 6))
WHERE order_number IS NULL;

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON public.order_status_history(order_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.record_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_record_order_status_change ON public.orders;
CREATE TRIGGER trigger_record_order_status_change
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.record_order_status_change();
