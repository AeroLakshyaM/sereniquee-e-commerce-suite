ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS checkout_idempotency_key UUID;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_name TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_checkout_idempotency_key
  ON public.orders(checkout_idempotency_key);

CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_idempotency_key UUID,
  p_items JSONB,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address TEXT,
  p_special_requirements TEXT DEFAULT NULL,
  p_coupon_code TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'upi'
)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  total_amount NUMERIC,
  subtotal_amount NUMERIC,
  shipping_amount NUMERIC,
  gst_amount NUMERIC,
  payment_status TEXT,
  payment_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing public.orders%ROWTYPE;
  v_order_id UUID;
  v_order_number TEXT;
  v_resume_token TEXT;
  v_customer_name TEXT := trim(COALESCE(p_customer_name, ''));
  v_customer_email TEXT := lower(trim(COALESCE(p_customer_email, '')));
  v_customer_phone TEXT := NULLIF(trim(COALESCE(p_customer_phone, '')), '');
  v_coupon_code TEXT := NULLIF(upper(trim(COALESCE(p_coupon_code, ''))), '');
  v_coupon public.discount_codes%ROWTYPE;
  v_coupon_discount NUMERIC(10,2) := 0;
  v_shipping_amount NUMERIC(10,2) := 0;
  v_gst_amount NUMERIC(10,2) := 0;
  v_subtotal NUMERIC(10,2) := 0;
  v_discounted_subtotal NUMERIC(10,2) := 0;
  v_total_amount NUMERIC(10,2) := 0;
  v_payment_status TEXT;
  v_payment_expires_at TIMESTAMPTZ;
  v_line JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_quantity INTEGER;
  v_unit_price NUMERIC(10,2);
  v_product public.products%ROWTYPE;
  v_variant public.product_variants%ROWTYPE;
BEGIN
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'Checkout session expired. Please try again.';
  END IF;
  -- Serialize retries that share a key so the later request observes the committed order
  -- before it checks current inventory or coupon availability.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_idempotency_key::TEXT, 0));
  IF p_payment_method IS NULL OR p_payment_method NOT IN ('upi', 'cod') THEN
    RAISE EXCEPTION 'Choose a valid payment method.';
  END IF;
  IF v_customer_name = '' OR length(v_customer_name) > 200
    OR v_customer_email = '' OR length(v_customer_email) > 320 OR position('@' IN v_customer_email) < 2
    OR length(COALESCE(v_customer_phone, '')) > 40
    OR p_shipping_address IS NULL OR length(trim(p_shipping_address)) < 5 OR length(p_shipping_address) > 2000
    OR length(COALESCE(p_special_requirements, '')) > 2000 THEN
    RAISE EXCEPTION 'Enter a valid name, email, and delivery address.';
  END IF;
  IF v_user_id IS NULL AND (v_customer_email = '' OR position('@' IN v_customer_email) < 2) THEN
    RAISE EXCEPTION 'Guest checkout requires a valid email address.';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
    OR jsonb_array_length(p_items) < 1 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Your cart is empty or has too many different items.';
  END IF;

  -- A retry of the same checkout request returns its original order.
  SELECT * INTO v_existing FROM public.orders o
  WHERE o.checkout_idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF v_existing.user_id IS DISTINCT FROM v_user_id
      OR (v_user_id IS NULL AND lower(COALESCE(v_existing.guest_email, '')) <> v_customer_email) THEN
      RAISE EXCEPTION 'This checkout key is already in use. Refresh checkout and try again.';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.order_number, v_existing.total_amount,
      v_existing.subtotal_amount, v_existing.shipping_amount, v_existing.gst_amount,
      v_existing.payment_status, v_existing.payment_expires_at;
    RETURN;
  END IF;

  -- Validate every line before creating anything, and lock products in a stable order.
  FOR v_line IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF jsonb_typeof(v_line->'product_id') <> 'string'
      OR jsonb_typeof(v_line->'quantity') <> 'number'
      OR (v_line ? 'variant_id' AND v_line->'variant_id' <> 'null'::JSONB AND jsonb_typeof(v_line->'variant_id') <> 'string')
      OR (v_line->>'quantity')::NUMERIC <> trunc((v_line->>'quantity')::NUMERIC)
      OR (v_line->>'quantity')::INTEGER < 1 OR (v_line->>'quantity')::INTEGER > 100 THEN
      RAISE EXCEPTION 'One or more cart items are invalid.';
    END IF;
    v_product_id := (v_line->>'product_id')::UUID;
    v_variant_id := NULLIF(v_line->>'variant_id', '')::UUID;
    v_quantity := (v_line->>'quantity')::INTEGER;
  END LOOP;

  FOR v_line IN
    SELECT jsonb_build_object('product_id', grouped.product_id, 'variant_id', grouped.variant_id, 'quantity', grouped.quantity) AS value
    FROM (
      SELECT (item->>'product_id')::UUID AS product_id, NULLIF(item->>'variant_id', '')::UUID AS variant_id,
        SUM((item->>'quantity')::INTEGER)::INTEGER AS quantity
      FROM jsonb_array_elements(p_items) AS lines(item)
      GROUP BY (item->>'product_id')::UUID, NULLIF(item->>'variant_id', '')::UUID
      ORDER BY (item->>'product_id')::UUID, NULLIF(item->>'variant_id', '')::UUID NULLS FIRST
    ) grouped
  LOOP
    v_product_id := (v_line->>'product_id')::UUID;
    v_variant_id := NULLIF(v_line->>'variant_id', '')::UUID;
    v_quantity := (v_line->>'quantity')::INTEGER;
    IF v_quantity > 500 THEN RAISE EXCEPTION 'The quantity for an item is too large.'; END IF;
    SELECT * INTO v_product FROM public.products p WHERE p.id = v_product_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'One of the products in your cart is no longer available.'; END IF;
    IF v_variant_id IS NOT NULL THEN
      SELECT * INTO v_variant FROM public.product_variants pv
      WHERE pv.id = v_variant_id AND pv.product_id = v_product_id AND pv.is_active = TRUE FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'A selected product option is no longer available. Please review your cart.'; END IF;
      IF COALESCE(v_variant.stock_quantity, 0) < v_quantity THEN
        RAISE EXCEPTION 'Only % of % (% option) are currently available.', COALESCE(v_variant.stock_quantity, 0), v_product.name, v_variant.name;
      END IF;
      v_unit_price := v_variant.price;
    ELSE
      IF COALESCE(v_product.stock_quantity, 0) < v_quantity THEN
        RAISE EXCEPTION 'Only % of % are currently available.', COALESCE(v_product.stock_quantity, 0), v_product.name;
      END IF;
      v_unit_price := v_product.price;
    END IF;
    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  END LOOP;

  IF length(COALESCE(v_coupon_code, '')) > 100 THEN
    RAISE EXCEPTION 'Coupon code is too long.';
  END IF;
  IF v_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon FROM public.discount_codes d
    WHERE d.code = v_coupon_code
    FOR UPDATE;
    IF NOT FOUND OR NOT COALESCE(v_coupon.is_active, FALSE)
      OR (v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at <= NOW())
      OR (v_coupon.max_uses IS NOT NULL AND COALESCE(v_coupon.uses_count, 0) >= v_coupon.max_uses) THEN
      RAISE EXCEPTION 'That coupon is no longer available.';
    END IF;
    IF v_subtotal < COALESCE(v_coupon.min_order_amount, 0) THEN
      RAISE EXCEPTION 'Your cart does not meet this coupon’s minimum order amount.';
    END IF;
    IF v_coupon.type = 'percentage' THEN
      IF v_coupon.value <= 0 OR v_coupon.value > 100 THEN RAISE EXCEPTION 'This coupon has an invalid discount.'; END IF;
      v_coupon_discount := round(LEAST(v_subtotal, v_subtotal * v_coupon.value / 100), 2);
    ELSE
      IF v_coupon.value <= 0 THEN RAISE EXCEPTION 'This coupon has an invalid discount.'; END IF;
      v_coupon_discount := round(LEAST(v_subtotal, v_coupon.value), 2);
    END IF;
  END IF;

  v_discounted_subtotal := GREATEST(v_subtotal - v_coupon_discount, 0);
  v_gst_amount := round(v_discounted_subtotal * 0.05, 2);
  v_total_amount := v_discounted_subtotal + v_shipping_amount + v_gst_amount;
  v_payment_status := CASE WHEN p_payment_method = 'cod' THEN 'cod_pending' ELSE 'pending_payment' END;
  v_payment_expires_at := CASE WHEN p_payment_method = 'upi' THEN NOW() + INTERVAL '15 minutes' ELSE NULL END;
  v_order_id := gen_random_uuid();
  v_order_number := 'SC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || upper(left(replace(v_order_id::TEXT, '-', ''), 10));

  INSERT INTO public.orders (
    id, order_number, user_id, guest_name, guest_email, guest_phone,
    total_amount, subtotal_amount, shipping_amount, gst_amount,
    shipping_address, special_requirements, status, payment_status, payment_method,
    payment_expires_at, discount_code_id, checkout_idempotency_key
  ) VALUES (
    v_order_id, v_order_number, v_user_id, v_customer_name, v_customer_email, v_customer_phone,
    v_total_amount, v_discounted_subtotal, v_shipping_amount, v_gst_amount,
    trim(p_shipping_address), NULLIF(trim(COALESCE(p_special_requirements, '')), ''),
    'pending', v_payment_status, p_payment_method, v_payment_expires_at,
    CASE WHEN v_coupon_code IS NOT NULL THEN v_coupon.id ELSE NULL END, p_idempotency_key
  ) ON CONFLICT (checkout_idempotency_key) DO NOTHING;

  IF NOT FOUND THEN
    SELECT * INTO v_existing FROM public.orders o
    WHERE o.checkout_idempotency_key = p_idempotency_key FOR UPDATE;
    IF NOT FOUND OR v_existing.user_id IS DISTINCT FROM v_user_id
      OR (v_user_id IS NULL AND lower(COALESCE(v_existing.guest_email, '')) <> v_customer_email) THEN
      RAISE EXCEPTION 'This checkout key is already in use. Refresh checkout and try again.';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.order_number, v_existing.total_amount,
      v_existing.subtotal_amount, v_existing.shipping_amount, v_existing.gst_amount,
      v_existing.payment_status, v_existing.payment_expires_at;
    RETURN;
  END IF;

  FOR v_line IN
    SELECT jsonb_build_object('product_id', grouped.product_id, 'variant_id', grouped.variant_id, 'quantity', grouped.quantity) AS value
    FROM (
      SELECT (item->>'product_id')::UUID AS product_id, NULLIF(item->>'variant_id', '')::UUID AS variant_id,
        SUM((item->>'quantity')::INTEGER)::INTEGER AS quantity
      FROM jsonb_array_elements(p_items) AS lines(item)
      GROUP BY (item->>'product_id')::UUID, NULLIF(item->>'variant_id', '')::UUID
      ORDER BY (item->>'product_id')::UUID, NULLIF(item->>'variant_id', '')::UUID NULLS FIRST
    ) grouped
  LOOP
    v_product_id := (v_line->>'product_id')::UUID;
    v_variant_id := NULLIF(v_line->>'variant_id', '')::UUID;
    v_quantity := (v_line->>'quantity')::INTEGER;
    IF v_variant_id IS NOT NULL THEN
      UPDATE public.product_variants pv SET stock_quantity = pv.stock_quantity - v_quantity
      WHERE pv.id = v_variant_id AND pv.product_id = v_product_id AND pv.is_active = TRUE
        AND pv.stock_quantity >= v_quantity;
    ELSE
      UPDATE public.products p SET stock_quantity = COALESCE(p.stock_quantity, 0) - v_quantity
      WHERE p.id = v_product_id AND COALESCE(p.stock_quantity, 0) >= v_quantity;
    END IF;
    IF NOT FOUND THEN RAISE EXCEPTION 'Stock changed while checking out. Please review your cart and try again.'; END IF;
    IF v_variant_id IS NOT NULL THEN
      SELECT * INTO v_variant FROM public.product_variants pv WHERE pv.id = v_variant_id;
      INSERT INTO public.order_items(order_id, product_id, variant_id, variant_name, quantity, price_at_time)
      VALUES (v_order_id, v_product_id, v_variant_id, v_variant.name, v_quantity, v_variant.price);
    ELSE
      SELECT * INTO v_product FROM public.products p WHERE p.id = v_product_id;
      INSERT INTO public.order_items(order_id, product_id, quantity, price_at_time)
      VALUES (v_order_id, v_product_id, v_quantity, v_product.price);
    END IF;
  END LOOP;

  IF v_coupon_code IS NOT NULL THEN
    UPDATE public.discount_codes d SET uses_count = COALESCE(d.uses_count, 0) + 1
    WHERE d.id = v_coupon.id AND d.is_active
      AND (d.expires_at IS NULL OR d.expires_at > NOW())
      AND (d.max_uses IS NULL OR COALESCE(d.uses_count, 0) < d.max_uses);
    IF NOT FOUND THEN RAISE EXCEPTION 'That coupon has just reached its usage limit.'; END IF;
  END IF;

  v_resume_token := replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', '');
  UPDATE public.orders o SET
    inventory_reserved = TRUE,
    coupon_use_reserved = (v_coupon_code IS NOT NULL),
    payment_resume_token = CASE WHEN p_payment_method = 'upi' THEN v_resume_token ELSE NULL END,
    payment_resume_token_expires_at = v_payment_expires_at
  WHERE o.id = v_order_id;

  RETURN QUERY SELECT o.id, o.order_number, o.total_amount, o.subtotal_amount,
    o.shipping_amount, o.gst_amount, o.payment_status, o.payment_expires_at
  FROM public.orders o WHERE o.id = v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(UUID, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(UUID, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
