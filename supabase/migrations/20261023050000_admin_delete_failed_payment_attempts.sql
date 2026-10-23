CREATE OR REPLACE FUNCTION public.admin_delete_pending_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_method <> 'upi'
    OR v_order.payment_status NOT IN ('pending_payment', 'submitted_for_verification', 'failed') THEN
    RETURN FALSE;
  END IF;

  IF v_order.inventory_reserved THEN
    PERFORM public.adjust_order_inventory(p_order_id, 1);
  END IF;
  IF v_order.coupon_use_reserved AND v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes
    SET uses_count = GREATEST(COALESCE(uses_count, 0) - 1, 0)
    WHERE id = v_order.discount_code_id;
  END IF;

  DELETE FROM public.orders WHERE id = p_order_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_pending_order(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_pending_order(UUID) TO authenticated;
