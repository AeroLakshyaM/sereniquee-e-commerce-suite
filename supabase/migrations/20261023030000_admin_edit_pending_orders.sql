CREATE OR REPLACE FUNCTION public.admin_update_pending_order(
  p_order_id UUID,
  p_guest_name TEXT,
  p_guest_email TEXT,
  p_guest_phone TEXT,
  p_shipping_address TEXT,
  p_special_requirements TEXT,
  p_shipping_amount NUMERIC,
  p_gst_amount NUMERIC,
  p_discount_amount NUMERIC,
  p_items JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_price NUMERIC(10,2);
  v_subtotal NUMERIC(10,2) := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required.';
  END IF;
  IF p_guest_name IS NULL OR length(trim(p_guest_name)) = 0 OR length(trim(p_guest_name)) > 200
    OR p_guest_email IS NULL OR length(trim(p_guest_email)) = 0 OR length(trim(p_guest_email)) > 320
    OR p_shipping_address IS NULL OR length(trim(p_shipping_address)) = 0
    OR p_shipping_amount < 0 OR p_gst_amount < 0 OR p_discount_amount < 0
    OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order details are invalid.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.payment_method <> 'upi' OR v_order.payment_status NOT IN ('pending_payment', 'submitted_for_verification') THEN
    RETURN FALSE;
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_price := (v_item->>'price_at_time')::NUMERIC(10,2);
    IF v_quantity < 1 OR v_quantity > 1000 OR v_price < 0 OR NOT EXISTS (SELECT 1 FROM public.products WHERE id = v_product_id) THEN
      RAISE EXCEPTION 'One or more products, quantities, or prices are invalid.';
    END IF;
    v_subtotal := v_subtotal + (v_quantity * v_price);
  END LOOP;
  IF p_discount_amount > v_subtotal THEN
    RAISE EXCEPTION 'Discount cannot exceed the items subtotal.';
  END IF;

  -- Return the old reservation before replacing lines, then reserve the edited quantities.
  IF v_order.inventory_reserved THEN
    PERFORM public.adjust_order_inventory(p_order_id, 1);
  END IF;
  DELETE FROM public.order_items WHERE order_id = p_order_id;
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_price := (v_item->>'price_at_time')::NUMERIC(10,2);
    IF v_order.inventory_reserved THEN
      UPDATE public.products SET stock_quantity = COALESCE(stock_quantity, 0) - v_quantity
      WHERE id = v_product_id AND COALESCE(stock_quantity, 0) >= v_quantity;
      IF NOT FOUND THEN RAISE EXCEPTION 'Not enough stock for one or more edited items.'; END IF;
    END IF;
    INSERT INTO public.order_items(order_id, product_id, quantity, price_at_time)
    VALUES (p_order_id, v_product_id, v_quantity, v_price);
  END LOOP;

  UPDATE public.orders SET
    guest_name = trim(p_guest_name), guest_email = lower(trim(p_guest_email)), guest_phone = NULLIF(trim(COALESCE(p_guest_phone, '')), ''),
    shipping_address = trim(p_shipping_address), special_requirements = NULLIF(trim(COALESCE(p_special_requirements, '')), ''),
    subtotal_amount = v_subtotal, shipping_amount = p_shipping_amount, gst_amount = p_gst_amount,
    total_amount = v_subtotal + p_shipping_amount + p_gst_amount - p_discount_amount,
    payment_status = CASE WHEN payment_status = 'submitted_for_verification' THEN 'pending_payment' ELSE payment_status END,
    utr_number = NULL, payment_proof_path = NULL, upi_submission_email_sent = FALSE,
    payment_expires_at = NOW() + INTERVAL '15 minutes', updated_at = NOW()
  WHERE id = p_order_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_pending_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_pending_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, JSONB) TO authenticated;

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
  IF NOT FOUND OR v_order.payment_method <> 'upi' OR v_order.payment_status NOT IN ('pending_payment', 'submitted_for_verification') THEN
    RETURN FALSE;
  END IF;
  IF v_order.inventory_reserved THEN
    PERFORM public.adjust_order_inventory(p_order_id, 1);
  END IF;
  IF v_order.coupon_use_reserved AND v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes SET uses_count = GREATEST(COALESCE(uses_count, 0) - 1, 0)
    WHERE id = v_order.discount_code_id;
  END IF;
  DELETE FROM public.orders WHERE id = p_order_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_pending_order(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_pending_order(UUID) TO authenticated;
