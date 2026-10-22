-- Convert the former payment state into a gateway-neutral manual UPI workflow.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS utr_number TEXT,
  ALTER COLUMN payment_status SET DEFAULT 'pending_payment';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

UPDATE public.orders
SET payment_status = CASE payment_status
  WHEN 'paid' THEN 'paid'
  WHEN 'failed' THEN 'failed'
  ELSE 'pending_payment'
END;

ALTER TABLE public.orders
  ALTER COLUMN payment_status SET NOT NULL,
  ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending_payment', 'submitted_for_verification', 'paid', 'failed'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_utr_number
  ON public.orders(utr_number)
  WHERE utr_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_manual_upi_payment_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
      NEW.payment_status := 'pending_payment';
      NEW.utr_number := NULL;
    END IF;
  ELSIF current_user = session_user
    AND (auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'))
    AND (NEW.payment_status IS DISTINCT FROM OLD.payment_status OR NEW.utr_number IS DISTINCT FROM OLD.utr_number) THEN
    RAISE EXCEPTION 'Payment status and UTR can only be changed through the payment verification flow.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_manual_upi_payment_fields ON public.orders;
CREATE TRIGGER trigger_protect_manual_upi_payment_fields
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.protect_manual_upi_payment_fields();

CREATE OR REPLACE FUNCTION public.submit_upi_payment_utr(
  p_order_id UUID,
  p_utr TEXT,
  p_guest_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  IF length(trim(COALESCE(p_utr, ''))) < 6 OR length(trim(p_utr)) > 64 THEN
    RAISE EXCEPTION 'Enter a valid UPI transaction reference.';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_order.user_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR auth.uid() <> v_order.user_id THEN
      RAISE EXCEPTION 'You are not allowed to submit payment details for this order.';
    END IF;
  ELSIF p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email)) THEN
    RAISE EXCEPTION 'Guest order details could not be verified.';
  END IF;

  IF v_order.payment_status <> 'pending_payment' THEN
    RETURN FALSE;
  END IF;

  UPDATE public.orders
  SET utr_number = trim(p_utr), payment_status = 'submitted_for_verification', updated_at = NOW()
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_upi_payment_utr(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_upi_payment_utr(UUID, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_manual_upi_payment_received(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required.';
  END IF;

  UPDATE public.orders
  SET payment_status = 'paid', status = 'processing', updated_at = NOW()
  WHERE id = p_order_id AND payment_status = 'submitted_for_verification';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_manual_upi_payment_received(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_manual_upi_payment_received(UUID) TO authenticated;
