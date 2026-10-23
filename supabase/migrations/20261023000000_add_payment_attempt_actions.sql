ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_resume_token TEXT,
  ADD COLUMN IF NOT EXISTS payment_resume_token_expires_at TIMESTAMPTZ;

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
      NEW.payment_resume_token := NULL;
      NEW.payment_resume_token_expires_at := NULL;
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
      OR NEW.payment_resume_token IS DISTINCT FROM OLD.payment_resume_token
      OR NEW.payment_resume_token_expires_at IS DISTINCT FROM OLD.payment_resume_token_expires_at
      OR NEW.inventory_reserved IS DISTINCT FROM OLD.inventory_reserved
      OR NEW.coupon_use_reserved IS DISTINCT FROM OLD.coupon_use_reserved) THEN
    RAISE EXCEPTION 'Payment details can only be changed through the payment verification flow.';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.resume_pending_upi_order(p_order_id UUID, p_resume_token TEXT)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  amount NUMERIC,
  customer_email TEXT,
  customer_name TEXT,
  created_at TIMESTAMPTZ,
  payment_expires_at TIMESTAMPTZ
)
LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.order_number, o.total_amount,
    COALESCE(o.guest_email, profile.email),
    COALESCE(o.guest_name, profile.full_name),
    o.created_at, o.payment_expires_at
  FROM public.orders o
  LEFT JOIN public.profiles profile ON profile.id = o.user_id
  WHERE o.id = p_order_id
    AND o.payment_method = 'upi'
    AND o.payment_status = 'pending_payment'
    AND o.payment_expires_at > NOW()
    AND o.payment_resume_token = p_resume_token
    AND o.payment_resume_token_expires_at > NOW();
$$;
REVOKE ALL ON FUNCTION public.resume_pending_upi_order(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resume_pending_upi_order(UUID, TEXT) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.submit_upi_payment_utr(UUID, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.submit_upi_payment_utr(
  p_order_id UUID,
  p_utr TEXT,
  p_guest_email TEXT DEFAULT NULL,
  p_proof_path TEXT DEFAULT NULL,
  p_resume_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_resume_token_valid BOOLEAN := FALSE;
BEGIN
  IF length(trim(COALESCE(p_utr, ''))) < 6 OR length(trim(p_utr)) > 64 THEN
    RAISE EXCEPTION 'Enter a valid UPI transaction reference.';
  END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  v_resume_token_valid := p_resume_token IS NOT NULL
    AND v_order.payment_resume_token = p_resume_token
    AND v_order.payment_resume_token_expires_at > NOW();
  IF v_order.user_id IS NOT NULL THEN
    IF (auth.uid() IS NULL OR auth.uid() <> v_order.user_id) AND NOT v_resume_token_valid THEN
      RAISE EXCEPTION 'You are not allowed to submit payment details for this order.';
    END IF;
  ELSIF (p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email))) AND NOT v_resume_token_valid THEN
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
REVOKE ALL ON FUNCTION public.submit_upi_payment_utr(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_upi_payment_utr(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.cancel_pending_upi_order(p_order_id UUID, p_guest_email TEXT DEFAULT NULL, p_resume_token TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_resume_token_valid BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_method <> 'upi' OR v_order.payment_status <> 'pending_payment' THEN RETURN FALSE; END IF;
  v_resume_token_valid := p_resume_token IS NOT NULL
    AND v_order.payment_resume_token = p_resume_token
    AND v_order.payment_resume_token_expires_at > NOW();
  IF v_order.user_id IS NOT NULL THEN
    IF (auth.uid() IS NULL OR auth.uid() <> v_order.user_id) AND NOT v_resume_token_valid THEN
      RAISE EXCEPTION 'You are not allowed to cancel this payment attempt.';
    END IF;
  ELSIF (p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email))) AND NOT v_resume_token_valid THEN
    RAISE EXCEPTION 'Guest order details could not be verified.';
  END IF;
  UPDATE public.orders SET payment_status = 'failed', status = 'cancelled', payment_expires_at = NULL, inventory_reserved = FALSE,
    coupon_use_reserved = FALSE, updated_at = NOW() WHERE id = p_order_id;
  IF v_order.inventory_reserved THEN
    PERFORM public.adjust_order_inventory(p_order_id, 1);
  END IF;
  IF v_order.coupon_use_reserved AND v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes SET uses_count = GREATEST(COALESCE(uses_count, 0) - 1, 0)
    WHERE id = v_order.discount_code_id;
  END IF;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.cancel_pending_upi_order(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_pending_upi_order(UUID, TEXT, TEXT) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.expire_pending_upi_order(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.expire_pending_upi_order(p_order_id UUID, p_guest_email TEXT DEFAULT NULL, p_resume_token TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_resume_token_valid BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_method <> 'upi' OR v_order.payment_status <> 'pending_payment'
    OR v_order.payment_expires_at IS NULL OR v_order.payment_expires_at > NOW() THEN RETURN FALSE; END IF;
  v_resume_token_valid := p_resume_token IS NOT NULL
    AND v_order.payment_resume_token = p_resume_token
    AND v_order.payment_resume_token_expires_at > NOW();
  IF v_order.user_id IS NOT NULL THEN
    IF (auth.uid() IS NULL OR auth.uid() <> v_order.user_id) AND NOT v_resume_token_valid THEN
      RAISE EXCEPTION 'You are not allowed to close this payment attempt.';
    END IF;
  ELSIF (p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email))) AND NOT v_resume_token_valid THEN
    RAISE EXCEPTION 'Guest order details could not be verified.';
  END IF;
  UPDATE public.orders SET payment_status = 'failed', status = 'cancelled', inventory_reserved = FALSE, coupon_use_reserved = FALSE,
    updated_at = NOW() WHERE id = p_order_id;
  IF v_order.inventory_reserved THEN
    PERFORM public.adjust_order_inventory(p_order_id, 1);
  END IF;
  IF v_order.coupon_use_reserved AND v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes SET uses_count = GREATEST(COALESCE(uses_count, 0) - 1, 0)
    WHERE id = v_order.discount_code_id;
  END IF;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.expire_pending_upi_order(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_pending_upi_order(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_cancel_pending_upi_order(p_order_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_method <> 'upi' OR v_order.payment_status <> 'pending_payment' THEN RETURN FALSE; END IF;
  UPDATE public.orders SET payment_status = 'failed', status = 'cancelled', payment_expires_at = NULL, inventory_reserved = FALSE,
    coupon_use_reserved = FALSE, updated_at = NOW() WHERE id = p_order_id;
  IF v_order.inventory_reserved THEN
    PERFORM public.adjust_order_inventory(p_order_id, 1);
  END IF;
  IF v_order.coupon_use_reserved AND v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes SET uses_count = GREATEST(COALESCE(uses_count, 0) - 1, 0)
    WHERE id = v_order.discount_code_id;
  END IF;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.admin_cancel_pending_upi_order(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_cancel_pending_upi_order(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_pending_upi_order_state(
  p_order_id UUID,
  p_guest_email TEXT DEFAULT NULL,
  p_resume_token TEXT DEFAULT NULL
)
RETURNS TABLE (payment_status TEXT, payment_expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_order.user_id IS NOT NULL THEN
    IF auth.uid() IS DISTINCT FROM v_order.user_id AND NOT (
      p_resume_token IS NOT NULL AND v_order.payment_resume_token = p_resume_token
      AND (v_order.payment_status <> 'pending_payment' OR v_order.payment_resume_token_expires_at > NOW())
    ) THEN RETURN; END IF;
  ELSIF lower(trim(COALESCE(p_guest_email, ''))) <> lower(trim(COALESCE(v_order.guest_email, '')))
    AND NOT (p_resume_token IS NOT NULL AND v_order.payment_resume_token = p_resume_token
      AND (v_order.payment_status <> 'pending_payment' OR v_order.payment_resume_token_expires_at > NOW())) THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_order.payment_status, v_order.payment_expires_at;
END; $$;
REVOKE ALL ON FUNCTION public.get_pending_upi_order_state(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pending_upi_order_state(UUID, TEXT, TEXT) TO anon, authenticated;
