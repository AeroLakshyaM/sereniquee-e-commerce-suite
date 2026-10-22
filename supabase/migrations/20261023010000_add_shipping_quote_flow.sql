ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_quote_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS shipping_quote_status TEXT NOT NULL DEFAULT 'awaiting_quote',
  ADD COLUMN IF NOT EXISTS shipping_quote_token TEXT,
  ADD COLUMN IF NOT EXISTS shipping_utr TEXT;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_shipping_quote_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_shipping_quote_status_check
  CHECK (shipping_quote_status IN ('awaiting_quote','quoted','approved','submitted_for_verification','paid','declined'));
UPDATE public.seo_settings SET canonical_base_url='https://www.sereniqueecandles.com'
WHERE canonical_base_url IS NULL OR canonical_base_url='https://sereniquee.com';
-- Existing paid shipping amounts predate the quote workflow; don't block their fulfillment.
UPDATE public.orders SET shipping_quote_status='paid'
WHERE created_at < transaction_timestamp();

CREATE OR REPLACE FUNCTION public.protect_shipping_quote_fields()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF (auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin')) AND current_user = session_user
    AND (NEW.shipping_quote_amount IS DISTINCT FROM OLD.shipping_quote_amount
      OR NEW.shipping_quote_status IS DISTINCT FROM OLD.shipping_quote_status
      OR NEW.shipping_quote_token IS DISTINCT FROM OLD.shipping_quote_token
      OR NEW.shipping_utr IS DISTINCT FROM OLD.shipping_utr) THEN
    RAISE EXCEPTION 'Shipping quotes can only be changed through the secure quote flow.';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS protect_shipping_quote_fields_trigger ON public.orders;
CREATE TRIGGER protect_shipping_quote_fields_trigger BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.protect_shipping_quote_fields();

CREATE OR REPLACE FUNCTION public.submit_shipping_quote_payment(p_order_id UUID, p_token TEXT, p_utr TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE;
BEGIN
  IF length(trim(COALESCE(p_utr,''))) < 6 OR length(trim(p_utr)) > 64 THEN RAISE EXCEPTION 'Enter a valid UPI transaction reference.'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status = 'cancelled' OR v_order.shipping_quote_token IS DISTINCT FROM p_token OR v_order.shipping_quote_status <> 'approved'
    OR v_order.shipping_quote_amount IS NULL OR v_order.shipping_quote_amount <= 0 THEN RETURN FALSE; END IF;
  UPDATE public.orders SET shipping_utr=trim(p_utr), shipping_quote_status='submitted_for_verification', updated_at=NOW() WHERE id=p_order_id;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.submit_shipping_quote_payment(UUID,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_shipping_quote_payment(UUID,TEXT,TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.respond_shipping_quote(p_order_id UUID, p_token TEXT, p_approve BOOLEAN)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.orders SET shipping_quote_status=CASE WHEN p_approve THEN 'approved' ELSE 'declined' END, updated_at=NOW()
  WHERE id=p_order_id AND shipping_quote_token=p_token AND shipping_quote_status='quoted' AND shipping_quote_amount > 0;
  RETURN FOUND;
END; $$;
REVOKE ALL ON FUNCTION public.respond_shipping_quote(UUID,TEXT,BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_shipping_quote(UUID,TEXT,BOOLEAN) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_shipping_quote(p_order_id UUID, p_token TEXT)
RETURNS TABLE(order_number TEXT, shipping_quote_amount NUMERIC, shipping_quote_status TEXT, payment_method TEXT)
LANGUAGE SQL SECURITY DEFINER SET search_path=public AS $$
  SELECT o.order_number,o.shipping_quote_amount,o.shipping_quote_status,o.payment_method
  FROM public.orders o WHERE o.id=p_order_id AND o.shipping_quote_token=p_token
    AND o.status <> 'cancelled' AND o.shipping_quote_status IN ('quoted','approved','submitted_for_verification','paid');
$$;
REVOKE ALL ON FUNCTION public.get_shipping_quote(UUID,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shipping_quote(UUID,TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_mark_shipping_received(p_order_id UUID, p_bank_utr TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status = 'cancelled' OR v_order.shipping_quote_status <> 'submitted_for_verification'
    OR upper(trim(COALESCE(p_bank_utr,''))) <> upper(trim(COALESCE(v_order.shipping_utr,''))) THEN RETURN FALSE; END IF;
  UPDATE public.orders SET shipping_quote_status='paid', updated_at=NOW() WHERE id=p_order_id;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.admin_mark_shipping_received(UUID,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_mark_shipping_received(UUID,TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_shipping_before_dispatch()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.status IN ('shipped','delivered') AND NEW.order_source='online'
    AND NEW.shipping_quote_status <> 'paid' THEN
    RAISE EXCEPTION 'Shipping quote must be approved and paid before dispatch.';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS guard_shipping_before_dispatch_trigger ON public.orders;
CREATE TRIGGER guard_shipping_before_dispatch_trigger BEFORE UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.guard_shipping_before_dispatch();
