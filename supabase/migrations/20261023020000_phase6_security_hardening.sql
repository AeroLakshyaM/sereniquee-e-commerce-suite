-- The browser uses narrowly scoped SECURITY DEFINER checkout/payment RPCs.
-- Do not let customers write order totals, status, line items, or payment data directly.
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Guest users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Guest users can create order items" ON public.order_items;
-- Guest order reads must use the email/token-checked SECURITY DEFINER RPCs;
-- an arbitrary x-order-id request header is not an authorization credential.
DROP POLICY IF EXISTS "Guests can view their own order" ON public.orders;
DROP POLICY IF EXISTS "Guests can view their own order items" ON public.order_items;

-- The order audit history contains internal order lifecycle information.
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_status_history FROM anon;
GRANT SELECT ON public.order_status_history TO authenticated;
DROP POLICY IF EXISTS "Admins can view order status history" ON public.order_status_history;
CREATE POLICY "Admins can view order status history"
  ON public.order_status_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public forms are submitted through rate-limited server endpoints. Keep admin access only.
DROP POLICY IF EXISTS "Allow anonymous inserts for custom_orders" ON public.custom_order_inquiries;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
REVOKE INSERT ON public.custom_order_inquiries FROM anon, authenticated;
GRANT INSERT ON public.custom_order_inquiries TO service_role;
REVOKE INSERT ON public.newsletter_subscribers FROM anon, authenticated;
GRANT INSERT, UPDATE ON public.newsletter_subscribers TO service_role;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  scope TEXT NOT NULL,
  key_hash TEXT NOT NULL CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  PRIMARY KEY (scope, key_hash)
);
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.api_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_api_rate_limit(
  p_scope TEXT, p_key_hash TEXT, p_limit INTEGER, p_window_seconds INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count INTEGER;
BEGIN
  IF p_scope IS NULL OR length(p_scope) > 80 OR p_key_hash !~ '^[0-9a-f]{64}$'
    OR p_limit < 1 OR p_limit > 1000 OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate limit request.';
  END IF;

  INSERT INTO public.api_rate_limits AS limits (scope, key_hash, window_started_at, request_count)
  VALUES (p_scope, p_key_hash, clock_timestamp(), 1)
  ON CONFLICT (scope, key_hash) DO UPDATE SET
    request_count = CASE
      WHEN limits.window_started_at <= clock_timestamp() - make_interval(secs => p_window_seconds) THEN 1
      ELSE limits.request_count + 1
    END,
    window_started_at = CASE
      WHEN limits.window_started_at <= clock_timestamp() - make_interval(secs => p_window_seconds) THEN clock_timestamp()
      ELSE limits.window_started_at
    END
  RETURNING request_count INTO v_count;

  IF random() < 0.01 THEN
    DELETE FROM public.api_rate_limits WHERE window_started_at < clock_timestamp() - INTERVAL '2 days';
  END IF;
  RETURN v_count <= p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_api_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_api_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

COMMENT ON TABLE public.api_rate_limits IS 'Server-only request counters for public form and AI abuse controls; keys are SHA-256 hashes.';
