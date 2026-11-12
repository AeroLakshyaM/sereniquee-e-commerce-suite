-- Step 2: Move admin analytics, conversion/revenue metrics, order stats, and paginated user stats
-- from client-side full-table downloads into admin-authorized Postgres RPCs.

-- ============================================
-- 1. ADMIN ANALYTICS SUMMARY RPC
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_analytics_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_revenue NUMERIC(12,2) := 0;
  v_total_orders INTEGER := 0;
  v_total_users INTEGER := 0;
  v_total_products INTEGER := 0;
  v_revenue_by_month JSONB;
  v_orders_by_status JSONB;
  v_top_products JSONB;
  v_user_growth JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required.';
  END IF;

  SELECT ROUND(COALESCE(SUM(total_amount), 0)::NUMERIC, 2), COUNT(*)::INTEGER
  INTO v_total_revenue, v_total_orders
  FROM public.orders;

  SELECT COUNT(*)::INTEGER INTO v_total_users FROM public.profiles;
  SELECT COUNT(*)::INTEGER INTO v_total_products FROM public.products;

  WITH months AS (
    SELECT generate_series(
      date_trunc('month', NOW()) - INTERVAL '5 months',
      date_trunc('month', NOW()),
      INTERVAL '1 month'
    ) AS month_start
  ),
  monthly_orders AS (
    SELECT
      date_trunc('month', created_at) AS month_start,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM public.orders
    WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
    GROUP BY 1
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'month', to_char(m.month_start, 'Mon YYYY'),
        'revenue', ROUND(COALESCE(mo.revenue, 0)::NUMERIC, 2)
      )
      ORDER BY m.month_start ASC
    ),
    '[]'::JSONB
  )
  INTO v_revenue_by_month
  FROM months m
  LEFT JOIN monthly_orders mo ON mo.month_start = m.month_start;

  WITH statuses(key, label, sort_order) AS (
    VALUES
      ('pending', 'Pending', 1),
      ('processing', 'Processing', 2),
      ('shipped', 'Shipped', 3),
      ('delivered', 'Delivered', 4),
      ('cancelled', 'Cancelled', 5)
  ),
  counts AS (
    SELECT status, COUNT(*)::INTEGER AS cnt
    FROM public.orders
    GROUP BY status
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('status', s.label, 'count', COALESCE(c.cnt, 0))
      ORDER BY s.sort_order
    ),
    '[]'::JSONB
  )
  INTO v_orders_by_status
  FROM statuses s
  LEFT JOIN counts c ON c.status = s.key;

  WITH ranked AS (
    SELECT
      COALESCE(p.name, 'Unknown Product') AS name,
      COALESCE(SUM(oi.quantity), 0)::INTEGER AS sales,
      ROUND(COALESCE(SUM(oi.quantity * oi.price_at_time), 0)::NUMERIC, 2) AS revenue
    FROM public.order_items oi
    LEFT JOIN public.products p ON p.id = oi.product_id
    GROUP BY COALESCE(p.name, 'Unknown Product')
    ORDER BY revenue DESC
    LIMIT 5
  )
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object('name', name, 'sales', sales, 'revenue', revenue)),
    '[]'::JSONB
  )
  INTO v_top_products
  FROM ranked;

  WITH days AS (
    SELECT generate_series(
      (NOW()::DATE - 29),
      NOW()::DATE,
      INTERVAL '1 day'
    )::DATE AS day_date
  ),
  daily_counts AS (
    SELECT created_at::DATE AS day_date, COUNT(*)::INTEGER AS cnt
    FROM public.profiles
    WHERE created_at >= (NOW()::DATE - 29)
    GROUP BY 1
  ),
  cumulative AS (
    SELECT
      d.day_date,
      SUM(COALESCE(dc.cnt, 0)) OVER (ORDER BY d.day_date ASC)::INTEGER AS running_count
    FROM days d
    LEFT JOIN daily_counts dc ON dc.day_date = d.day_date
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'date', to_char(day_date, 'Mon FMDD'),
        'count', running_count
      )
      ORDER BY day_date ASC
    ),
    '[]'::JSONB
  )
  INTO v_user_growth
  FROM cumulative;

  RETURN jsonb_build_object(
    'totalRevenue', v_total_revenue,
    'totalOrders', v_total_orders,
    'totalUsers', v_total_users,
    'totalProducts', v_total_products,
    'revenueByMonth', v_revenue_by_month,
    'ordersByStatus', v_orders_by_status,
    'topProducts', v_top_products,
    'userGrowth', v_user_growth
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_admin_analytics_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics_summary() TO authenticated;

-- ============================================
-- 2. ADMIN ORDER SUMMARY STATS RPC
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_order_stats(p_tz_offset_minutes INTEGER DEFAULT 0)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INTEGER := GREATEST(-840, LEAST(COALESCE(p_tz_offset_minutes, 0), 840));
  v_local_today DATE := (NOW() - make_interval(mins => v_offset))::DATE;
  v_orders_today INTEGER := 0;
  v_revenue_today NUMERIC(12,2) := 0;
  v_total_orders INTEGER := 0;
  v_average_order NUMERIC(12,2) := 0;
  v_payment_attempts INTEGER := 0;
  v_invoices_count INTEGER := 0;
  v_pending INTEGER := 0;
  v_processing INTEGER := 0;
  v_shipped INTEGER := 0;
  v_delivered INTEGER := 0;
  v_cancelled INTEGER := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required.';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE (created_at - make_interval(mins => v_offset))::DATE = v_local_today)::INTEGER,
    ROUND(COALESCE(SUM(total_amount) FILTER (WHERE (created_at - make_interval(mins => v_offset))::DATE = v_local_today), 0)::NUMERIC, 2),
    COUNT(*)::INTEGER,
    ROUND(COALESCE(AVG(total_amount), 0)::NUMERIC, 2),
    COUNT(*) FILTER (WHERE payment_method = 'upi' AND payment_status IN ('pending_payment', 'failed'))::INTEGER,
    COUNT(*) FILTER (WHERE NOT (payment_method = 'upi' AND payment_status IN ('pending_payment', 'failed')))::INTEGER,
    COUNT(*) FILTER (WHERE status = 'pending' AND NOT (payment_method = 'upi' AND payment_status IN ('pending_payment', 'failed')))::INTEGER,
    COUNT(*) FILTER (WHERE status = 'processing' AND NOT (payment_method = 'upi' AND payment_status IN ('pending_payment', 'failed')))::INTEGER,
    COUNT(*) FILTER (WHERE status = 'shipped' AND NOT (payment_method = 'upi' AND payment_status IN ('pending_payment', 'failed')))::INTEGER,
    COUNT(*) FILTER (WHERE status = 'delivered' AND NOT (payment_method = 'upi' AND payment_status IN ('pending_payment', 'failed')))::INTEGER,
    COUNT(*) FILTER (WHERE status = 'cancelled' AND NOT (payment_method = 'upi' AND payment_status IN ('pending_payment', 'failed')))::INTEGER
  INTO
    v_orders_today,
    v_revenue_today,
    v_total_orders,
    v_average_order,
    v_payment_attempts,
    v_invoices_count,
    v_pending,
    v_processing,
    v_shipped,
    v_delivered,
    v_cancelled
  FROM public.orders;

  RETURN jsonb_build_object(
    'ordersToday', v_orders_today,
    'revenueToday', v_revenue_today,
    'totalOrders', v_total_orders,
    'averageOrderValue', v_average_order,
    'paymentAttemptsCount', v_payment_attempts,
    'invoicesCount', v_invoices_count,
    'statusCounts', jsonb_build_object(
      'pending', v_pending,
      'processing', v_processing,
      'shipped', v_shipped,
      'delivered', v_delivered,
      'cancelled', v_cancelled
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_admin_order_stats(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_order_stats(INTEGER) TO authenticated;

-- ============================================
-- 3. CONVERSION & REVENUE METRICS RPCs
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_conversion_metrics(p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := GREATEST(1, LEAST(COALESCE(p_days, 30), 3650));
  v_start_date TIMESTAMPTZ := NOW() - make_interval(days => v_days);
  v_completed_orders INTEGER := 0;
  v_total_sessions INTEGER := 0;
  v_abandoned_carts INTEGER := 0;
  v_total_carts INTEGER := 0;
  v_total_revenue NUMERIC(12,2) := 0;
  v_cart_abandonment_rate NUMERIC(10,2) := 0;
  v_conversion_rate NUMERIC(10,2) := 0;
  v_avg_order_value NUMERIC(10,2) := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required.';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE status <> 'cancelled')::INTEGER,
    COUNT(DISTINCT COALESCE(user_id::TEXT, NULLIF(lower(trim(guest_email)), ''), id::TEXT)) FILTER (WHERE status <> 'cancelled')::INTEGER,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER,
    COUNT(*)::INTEGER,
    COALESCE(SUM(total_amount) FILTER (WHERE status <> 'cancelled'), 0)
  INTO
    v_completed_orders,
    v_total_sessions,
    v_abandoned_carts,
    v_total_carts,
    v_total_revenue
  FROM public.orders
  WHERE created_at >= v_start_date;

  IF v_total_carts > 0 THEN
    v_cart_abandonment_rate := ROUND((v_abandoned_carts::NUMERIC / v_total_carts) * 100, 2);
  END IF;

  IF v_total_sessions > 0 THEN
    v_conversion_rate := ROUND((v_completed_orders::NUMERIC / v_total_sessions) * 100, 2);
  END IF;

  IF v_completed_orders > 0 THEN
    v_avg_order_value := ROUND(v_total_revenue / v_completed_orders, 2);
  END IF;

  RETURN jsonb_build_object(
    'cartAbandonmentRate', v_cart_abandonment_rate,
    'conversionRate', v_conversion_rate,
    'avgOrderValue', v_avg_order_value,
    'totalSessions', v_total_sessions,
    'completedOrders', v_completed_orders,
    'abandonedCarts', v_abandoned_carts
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_admin_conversion_metrics(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_conversion_metrics(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_revenue_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_this_month_start TIMESTAMPTZ := date_trunc('month', NOW());
  v_last_month_start TIMESTAMPTZ := date_trunc('month', NOW()) - INTERVAL '1 month';
  v_total_revenue NUMERIC(12,2) := 0;
  v_monthly_revenue NUMERIC(12,2) := 0;
  v_last_month_revenue NUMERIC(12,2) := 0;
  v_growth_rate NUMERIC(10,2) := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required.';
  END IF;

  SELECT
    ROUND(COALESCE(SUM(total_amount), 0)::NUMERIC, 2),
    ROUND(COALESCE(SUM(total_amount) FILTER (WHERE created_at >= v_this_month_start), 0)::NUMERIC, 2),
    ROUND(COALESCE(SUM(total_amount) FILTER (WHERE created_at >= v_last_month_start AND created_at < v_this_month_start), 0)::NUMERIC, 2)
  INTO v_total_revenue, v_monthly_revenue, v_last_month_revenue
  FROM public.orders
  WHERE status <> 'cancelled';

  IF v_last_month_revenue > 0 THEN
    v_growth_rate := ROUND(((v_monthly_revenue - v_last_month_revenue) / v_last_month_revenue) * 100, 2);
  END IF;

  RETURN jsonb_build_object(
    'totalRevenue', v_total_revenue,
    'monthlyRevenue', v_monthly_revenue,
    'lastMonthRevenue', v_last_month_revenue,
    'growthRate', v_growth_rate
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_admin_revenue_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_revenue_metrics() TO authenticated;

-- ============================================
-- 4. PAGINATED ADMIN USERS RPC
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_users_paginated(
  p_search TEXT DEFAULT '',
  p_page INTEGER DEFAULT 0,
  p_page_size INTEGER DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  role TEXT,
  order_count INTEGER,
  total_spent NUMERIC,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_search TEXT := NULLIF(trim(COALESCE(p_search, '')), '');
  v_search_pattern TEXT := CASE
    WHEN v_search IS NULL THEN NULL
    ELSE '%' || replace(replace(replace(v_search, '\', '\\'), '%', '\%'), '_', '\_') || '%'
  END;
  v_page INTEGER := GREATEST(0, COALESCE(p_page, 0));
  v_page_size INTEGER := GREATEST(1, LEAST(COALESCE(p_page_size, 24), 100));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH paged_users AS (
    SELECT
      au.id,
      au.email::VARCHAR AS email,
      p.full_name,
      p.phone,
      p.address,
      p.city,
      p.postal_code,
      p.country,
      au.created_at,
      au.last_sign_in_at,
      COUNT(*) OVER() AS total_count
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE v_search_pattern IS NULL
      OR au.email ILIKE v_search_pattern ESCAPE '\'
      OR COALESCE(p.full_name, '') ILIKE v_search_pattern ESCAPE '\'
      OR COALESCE(p.phone, '') ILIKE v_search_pattern ESCAPE '\'
    ORDER BY au.created_at DESC
    LIMIT v_page_size
    OFFSET v_page * v_page_size
  )
  SELECT
    pu.id,
    pu.email,
    pu.full_name,
    pu.phone,
    pu.address,
    pu.city,
    pu.postal_code,
    pu.country,
    pu.created_at,
    pu.last_sign_in_at,
    CASE WHEN COALESCE(ur.is_admin, FALSE) THEN 'admin' ELSE 'user' END AS role,
    COALESCE(os.order_count, 0) AS order_count,
    ROUND(COALESCE(os.total_spent, 0)::NUMERIC, 2) AS total_spent,
    pu.total_count
  FROM paged_users pu
  LEFT JOIN LATERAL (
    SELECT BOOL_OR(r.role = 'admin') AS is_admin
    FROM public.user_roles r
    WHERE r.user_id = pu.id
  ) ur ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)::INTEGER AS order_count,
      COALESCE(SUM(o.total_amount), 0) AS total_spent
    FROM public.orders o
    WHERE o.user_id = pu.id
  ) os ON TRUE
  ORDER BY pu.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.get_admin_users_paginated(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users_paginated(TEXT, INTEGER, INTEGER) TO authenticated;
