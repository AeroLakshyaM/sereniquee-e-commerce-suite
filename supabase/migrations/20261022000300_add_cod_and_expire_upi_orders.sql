ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'upi',
  ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inventory_reserved BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS coupon_use_reserved BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_name TEXT;

CREATE OR REPLACE FUNCTION public.adjust_order_inventory(p_order_id UUID, p_delta INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  IF p_delta = 0 OR p_delta IS NULL THEN RETURN; END IF;
  FOR v_item IN
    SELECT product_id, variant_id, SUM(quantity)::INTEGER AS quantity
    FROM public.order_items
    WHERE order_id = p_order_id
    GROUP BY product_id, variant_id
    ORDER BY product_id, variant_id NULLS FIRST
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity + (p_delta * v_item.quantity)
      WHERE id = v_item.variant_id
        AND (p_delta > 0 OR stock_quantity >= (-p_delta * v_item.quantity));
    ELSIF v_item.variant_name IS NOT NULL AND p_delta > 0 THEN
      RAISE EXCEPTION 'A selected product option was removed before its reserved stock could be restored. Contact support.';
    ELSE
      UPDATE public.products
      SET stock_quantity = COALESCE(stock_quantity, 0) + (p_delta * v_item.quantity)
      WHERE id = v_item.product_id
        AND (p_delta > 0 OR COALESCE(stock_quantity, 0) >= (-p_delta * v_item.quantity));
    END IF;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Inventory changed while updating this order. Please refresh and try again.';
    END IF;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.adjust_order_inventory(UUID, INTEGER) FROM PUBLIC, anon, authenticated;

UPDATE public.orders
SET payment_method = 'upi'
WHERE payment_method IS NULL OR payment_method NOT IN ('upi', 'cod');

UPDATE public.orders
SET payment_expires_at = created_at + INTERVAL '15 minutes'
WHERE payment_status = 'pending_payment' AND payment_expires_at IS NULL;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('upi', 'cod'));
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending_payment', 'submitted_for_verification', 'cod_pending', 'paid', 'failed'));

CREATE OR REPLACE FUNCTION public.can_upload_upi_payment_proof(p_order_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders o WHERE o.id = p_order_id
    AND o.payment_method = 'upi' AND o.payment_status = 'pending_payment'
    AND o.payment_expires_at > NOW()
    AND ((o.user_id IS NOT NULL AND o.user_id = auth.uid()) OR (o.user_id IS NULL AND auth.uid() IS NULL)));
$$;

CREATE OR REPLACE FUNCTION public.submit_upi_payment_utr(
  p_order_id UUID, p_utr TEXT, p_guest_email TEXT DEFAULT NULL, p_proof_path TEXT DEFAULT NULL
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE;
BEGIN
  IF length(trim(COALESCE(p_utr, ''))) < 6 OR length(trim(p_utr)) > 64 THEN
    RAISE EXCEPTION 'Enter a valid UPI transaction reference.';
  END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_order.user_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR auth.uid() <> v_order.user_id THEN RAISE EXCEPTION 'You are not allowed to submit payment details for this order.'; END IF;
  ELSIF p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email)) THEN
    RAISE EXCEPTION 'Guest order details could not be verified.';
  END IF;
  IF v_order.payment_method <> 'upi' OR v_order.payment_status <> 'pending_payment'
    OR v_order.payment_expires_at IS NULL OR v_order.payment_expires_at <= NOW() THEN RETURN FALSE; END IF;
  IF p_proof_path IS NOT NULL AND (split_part(p_proof_path, '/', 1) <> p_order_id::text OR p_proof_path LIKE '%..%'
    OR NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'upi-payment-proofs' AND name = p_proof_path)) THEN
    RAISE EXCEPTION 'The payment proof image could not be verified.';
  END IF;
  UPDATE public.orders SET utr_number = trim(p_utr), payment_proof_path = p_proof_path,
    payment_status = 'submitted_for_verification', updated_at = NOW() WHERE id = p_order_id;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.protect_manual_upi_payment_fields()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
      NEW.payment_method := CASE WHEN NEW.payment_method = 'cod' THEN 'cod' ELSE 'upi' END;
      NEW.payment_status := CASE WHEN NEW.payment_method = 'cod' THEN 'cod_pending' ELSE 'pending_payment' END;
      NEW.utr_number := NULL;
      NEW.payment_proof_path := NULL;
      NEW.payment_expires_at := CASE WHEN NEW.payment_method = 'upi' THEN NOW() + INTERVAL '15 minutes' ELSE NULL END;
      NEW.inventory_reserved := FALSE;
      NEW.coupon_use_reserved := FALSE;
    END IF;
  ELSIF current_user = session_user
    AND (auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'))
    AND (NEW.payment_status IS DISTINCT FROM OLD.payment_status
      OR NEW.utr_number IS DISTINCT FROM OLD.utr_number
      OR NEW.payment_proof_path IS DISTINCT FROM OLD.payment_proof_path
      OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
      OR NEW.payment_expires_at IS DISTINCT FROM OLD.payment_expires_at
      OR NEW.inventory_reserved IS DISTINCT FROM OLD.inventory_reserved
      OR NEW.coupon_use_reserved IS DISTINCT FROM OLD.coupon_use_reserved) THEN
    RAISE EXCEPTION 'Payment details can only be changed through the payment verification flow.';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.expire_pending_upi_order(p_order_id UUID, p_guest_email TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_method <> 'upi' OR v_order.payment_status <> 'pending_payment'
    OR v_order.payment_expires_at IS NULL OR v_order.payment_expires_at > NOW() THEN
    RETURN FALSE;
  END IF;

  IF v_order.user_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR auth.uid() <> v_order.user_id THEN
      RAISE EXCEPTION 'You are not allowed to close this payment attempt.';
    END IF;
  ELSIF p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email)) THEN
    RAISE EXCEPTION 'Guest order details could not be verified.';
  END IF;

  UPDATE public.orders SET payment_status = 'failed', status = 'cancelled', inventory_reserved = FALSE, coupon_use_reserved = FALSE, updated_at = NOW() WHERE id = p_order_id;
  IF v_order.inventory_reserved THEN
    PERFORM public.adjust_order_inventory(p_order_id, 1);
  END IF;
  IF v_order.coupon_use_reserved AND v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes SET uses_count = GREATEST(COALESCE(uses_count, 0) - 1, 0) WHERE id = v_order.discount_code_id;
  END IF;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.expire_pending_upi_order(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_pending_upi_order(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_cod_payment_received(p_order_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
  UPDATE public.orders SET payment_status = 'paid', status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END, updated_at = NOW()
  WHERE id = p_order_id AND payment_method = 'cod' AND payment_status = 'cod_pending';
  RETURN FOUND;
END; $$;
REVOKE ALL ON FUNCTION public.mark_cod_payment_received(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_cod_payment_received(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.expire_stale_upi_orders()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order RECORD;
  v_expired_count INTEGER := 0;
BEGIN
  FOR v_order IN
    SELECT id, discount_code_id, inventory_reserved, coupon_use_reserved FROM public.orders
    WHERE payment_method = 'upi' AND payment_status = 'pending_payment'
      AND payment_expires_at <= NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.orders SET payment_status = 'failed', status = 'cancelled', inventory_reserved = FALSE, coupon_use_reserved = FALSE, updated_at = NOW()
    WHERE id = v_order.id AND payment_status = 'pending_payment';
    IF FOUND THEN
      IF v_order.inventory_reserved THEN
        PERFORM public.adjust_order_inventory(v_order.id, 1);
      END IF;
      IF v_order.coupon_use_reserved AND v_order.discount_code_id IS NOT NULL THEN
        UPDATE public.discount_codes SET uses_count = GREATEST(COALESCE(uses_count, 0) - 1, 0)
        WHERE id = v_order.discount_code_id;
      END IF;
      v_expired_count := v_expired_count + 1;
    END IF;
  END LOOP;
  RETURN v_expired_count;
END; $$;
REVOKE ALL ON FUNCTION public.expire_stale_upi_orders() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.reserve_checkout_order(p_order_id UUID, p_guest_email TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.inventory_reserved OR v_order.payment_method NOT IN ('upi', 'cod')
    OR v_order.payment_status NOT IN ('pending_payment', 'cod_pending') THEN
    RAISE EXCEPTION 'This order cannot reserve stock.';
  END IF;
  IF v_order.user_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR auth.uid() <> v_order.user_id THEN RAISE EXCEPTION 'You are not allowed to place this order.'; END IF;
  ELSIF auth.uid() IS NOT NULL OR p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email)) THEN
    RAISE EXCEPTION 'Guest order details could not be verified.';
  END IF;

  PERFORM public.adjust_order_inventory(p_order_id, -1);

  IF v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes SET uses_count = COALESCE(uses_count, 0) + 1
    WHERE id = v_order.discount_code_id AND is_active
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (max_uses IS NULL OR COALESCE(uses_count, 0) < max_uses);
    IF NOT FOUND THEN RAISE EXCEPTION 'The discount code is no longer available.'; END IF;
  END IF;

  UPDATE public.orders SET inventory_reserved = TRUE,
    coupon_use_reserved = (v_order.discount_code_id IS NOT NULL), updated_at = NOW()
  WHERE id = p_order_id;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_checkout_order(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_checkout_order(UUID, TEXT) TO anon, authenticated;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expire-stale-upi-orders';
SELECT cron.schedule('expire-stale-upi-orders', '* * * * *', 'SELECT public.expire_stale_upi_orders()');
