-- Track checkout payments separately from the order fulfillment status.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_request_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT,
  ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_confirmation_email_sent BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_request_id
  ON public.orders(payment_request_id)
  WHERE payment_request_id IS NOT NULL;

-- Only a verified payment webhook can call this service-role-only function.
-- Locking the order and changing payment_status in the same transaction makes
-- repeated webhook deliveries safe and prevents duplicate inventory deductions.
CREATE OR REPLACE FUNCTION public.confirm_instamojo_payment(
  p_order_id UUID,
  p_payment_request_id TEXT,
  p_payment_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
  v_stock INTEGER;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND OR v_order.payment_request_id IS DISTINCT FROM p_payment_request_id THEN
    RETURN FALSE;
  END IF;

  IF v_order.payment_status = 'paid' THEN
    RETURN TRUE;
  END IF;

  -- Check and lock every product first. If inventory changed during payment,
  -- still record the customer's successful payment and leave the order pending
  -- for an admin to resolve rather than losing the payment notification.
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
    ORDER BY product_id
  LOOP
    SELECT COALESCE(stock_quantity, 0) INTO v_stock
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND OR v_stock < v_item.quantity THEN
      UPDATE public.orders
      SET payment_status = 'paid', payment_provider = 'instamojo',
          payment_id = p_payment_id, status = 'pending', updated_at = NOW()
      WHERE id = p_order_id;
      RETURN TRUE;
    END IF;
  END LOOP;

  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
    ORDER BY product_id
  LOOP
    UPDATE public.products
    SET stock_quantity = stock_quantity - v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  UPDATE public.orders
  SET payment_status = 'paid',
      payment_provider = 'instamojo',
      payment_id = p_payment_id,
      status = 'processing',
      updated_at = NOW()
  WHERE id = p_order_id;

  IF v_order.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes
    SET uses_count = COALESCE(uses_count, 0) + 1
    WHERE id = v_order.discount_code_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_instamojo_payment(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
