ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS upi_submission_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS upi_received_email_sent BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('upi-payment-proofs', 'upi-payment-proofs', FALSE, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = FALSE, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

CREATE OR REPLACE FUNCTION public.can_upload_upi_payment_proof(p_order_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = p_order_id AND o.payment_status = 'pending_payment'
      AND ((o.user_id IS NOT NULL AND o.user_id = auth.uid()) OR (o.user_id IS NULL AND auth.uid() IS NULL))
  );
$$;
REVOKE ALL ON FUNCTION public.can_upload_upi_payment_proof(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_upload_upi_payment_proof(UUID) TO anon, authenticated;

DROP POLICY IF EXISTS "Customers upload UPI payment proofs" ON storage.objects;
CREATE POLICY "Customers upload UPI payment proofs" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'upi-payment-proofs'
  AND public.can_upload_upi_payment_proof(((storage.foldername(name))[1])::UUID)
);
DROP POLICY IF EXISTS "Admins view UPI payment proofs" ON storage.objects;
CREATE POLICY "Admins view UPI payment proofs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'upi-payment-proofs' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete UPI payment proofs" ON storage.objects;
CREATE POLICY "Admins delete UPI payment proofs" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'upi-payment-proofs' AND public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.protect_manual_upi_payment_fields()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
      NEW.payment_status := 'pending_payment'; NEW.utr_number := NULL; NEW.payment_proof_path := NULL;
    END IF;
  ELSIF current_user = session_user
    AND (auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'))
    AND (NEW.payment_status IS DISTINCT FROM OLD.payment_status OR NEW.utr_number IS DISTINCT FROM OLD.utr_number OR NEW.payment_proof_path IS DISTINCT FROM OLD.payment_proof_path) THEN
    RAISE EXCEPTION 'Payment details can only be changed through the payment verification flow.';
  END IF;
  RETURN NEW;
END; $$;

DROP FUNCTION IF EXISTS public.submit_upi_payment_utr(UUID, TEXT, TEXT);
CREATE FUNCTION public.submit_upi_payment_utr(p_order_id UUID, p_utr TEXT, p_guest_email TEXT DEFAULT NULL, p_proof_path TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE;
BEGIN
  IF length(trim(COALESCE(p_utr, ''))) < 6 OR length(trim(p_utr)) > 64 THEN RAISE EXCEPTION 'Enter a valid UPI transaction reference.'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_order.user_id IS NOT NULL THEN
    IF auth.uid() IS NULL OR auth.uid() <> v_order.user_id THEN RAISE EXCEPTION 'You are not allowed to submit payment details for this order.'; END IF;
  ELSIF p_guest_email IS NULL OR lower(trim(p_guest_email)) <> lower(trim(v_order.guest_email)) THEN RAISE EXCEPTION 'Guest order details could not be verified.';
  END IF;
  IF v_order.payment_status <> 'pending_payment' THEN RETURN FALSE; END IF;
  IF p_proof_path IS NOT NULL AND (split_part(p_proof_path, '/', 1) <> p_order_id::text OR p_proof_path LIKE '%..%' OR NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'upi-payment-proofs' AND name = p_proof_path)) THEN
    RAISE EXCEPTION 'The payment proof image could not be verified.';
  END IF;
  UPDATE public.orders SET utr_number = trim(p_utr), payment_proof_path = p_proof_path, payment_status = 'submitted_for_verification', updated_at = NOW() WHERE id = p_order_id;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.submit_upi_payment_utr(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_upi_payment_utr(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.mark_manual_upi_payment_received(UUID);
CREATE FUNCTION public.mark_manual_upi_payment_received(p_order_id UUID, p_bank_utr TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Administrator access required.'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_status <> 'submitted_for_verification' THEN RETURN FALSE; END IF;
  IF upper(trim(COALESCE(v_order.utr_number,''))) <> upper(trim(COALESCE(p_bank_utr,''))) THEN RAISE EXCEPTION 'The bank UTR does not match the customer-submitted UTR.'; END IF;
  UPDATE public.orders SET payment_status = 'paid', status = 'processing', updated_at = NOW() WHERE id = p_order_id;
  RETURN TRUE;
END; $$;
REVOKE ALL ON FUNCTION public.mark_manual_upi_payment_received(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_manual_upi_payment_received(UUID, TEXT) TO authenticated;
