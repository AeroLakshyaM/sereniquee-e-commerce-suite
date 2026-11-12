-- Step 1: Scalability indexes and pg_trgm search acceleration
-- Covers hot storefront listings, ILIKE wildcard search, cron expiry scans,
-- foreign-key joins, and admin operational filters.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SET LOCAL search_path = public, extensions;

-- ============================================
-- 1. PRODUCTS LISTING, FILTERING & SEARCH
-- ============================================

-- Default storefront & admin pagination order: ORDER BY created_at DESC, id DESC
CREATE INDEX IF NOT EXISTS idx_products_created_at_id_desc
  ON public.products (created_at DESC, id DESC);

-- Category-filtered shop listing + pagination
CREATE INDEX IF NOT EXISTS idx_products_category_created_at_id_desc
  ON public.products (category, created_at DESC, id DESC)
  WHERE category IS NOT NULL;

-- Partial index for featured products query
CREATE INDEX IF NOT EXISTS idx_products_featured_created_at_desc
  ON public.products (created_at DESC)
  WHERE featured = TRUE;

-- Inventory sorting by name and partial index for low/out-of-stock alerts
CREATE INDEX IF NOT EXISTS idx_products_name
  ON public.products (name);

CREATE INDEX IF NOT EXISTS idx_products_low_stock
  ON public.products (stock_quantity)
  WHERE stock_quantity <= 5;

-- GIN trigram indexes so PostgREST .ilike.%term% searches avoid full-table scans
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_description_trgm
  ON public.products USING gin (description gin_trgm_ops)
  WHERE description IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_trgm
  ON public.products USING gin (category gin_trgm_ops)
  WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_sku_trgm
  ON public.products USING gin (sku gin_trgm_ops)
  WHERE sku IS NOT NULL;

-- Active variants sorted for product detail pages
CREATE INDEX IF NOT EXISTS idx_product_variants_active_sort
  ON public.product_variants (product_id, sort_order ASC)
  WHERE is_active = TRUE;

-- ============================================
-- 2. ORDERS, ORDER ITEMS & EXPIRY CRON
-- ============================================

-- Customer profile / order history lookup
CREATE INDEX IF NOT EXISTS idx_orders_user_created_at_desc
  ON public.orders (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Partial index for the every-minute expire_stale_upi_orders() pg_cron job
CREATE INDEX IF NOT EXISTS idx_orders_pending_upi_expiry
  ON public.orders (payment_expires_at)
  WHERE payment_method = 'upi' AND payment_status = 'pending_payment';

-- Admin payment verification & quote queues
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_created_at_desc
  ON public.orders (payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_shipping_quote_status_created_at_desc
  ON public.orders (shipping_quote_status, created_at DESC)
  WHERE order_source = 'online';

CREATE INDEX IF NOT EXISTS idx_orders_order_number
  ON public.orders (order_number)
  WHERE order_number IS NOT NULL;

-- GIN trigram indexes for admin order search across customer/order fields
CREATE INDEX IF NOT EXISTS idx_orders_order_number_trgm
  ON public.orders USING gin (order_number gin_trgm_ops)
  WHERE order_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_guest_name_trgm
  ON public.orders USING gin (guest_name gin_trgm_ops)
  WHERE guest_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_guest_email_trgm
  ON public.orders USING gin (guest_email gin_trgm_ops)
  WHERE guest_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_guest_phone_trgm
  ON public.orders USING gin (guest_phone gin_trgm_ops)
  WHERE guest_phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_trgm
  ON public.orders USING gin (shipping_address gin_trgm_ops)
  WHERE shipping_address IS NOT NULL;

-- Missing FK index on order_items(order_id) & variant_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id
  ON public.order_items (variant_id)
  WHERE variant_id IS NOT NULL;

-- ============================================
-- 3. SUPPORTING STOREFRONT & ADMIN TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_categories_active_display_order
  ON public.categories (display_order ASC)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_blogs_published_created_at_desc
  ON public.blogs (created_at DESC)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_blogs_tags_gin
  ON public.blogs USING gin (tags);

CREATE INDEX IF NOT EXISTS idx_social_posts_active_display_order
  ON public.social_posts (display_order ASC)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_gift_options_active_sort_order
  ON public.gift_options (sort_order ASC)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active
  ON public.newsletter_subscribers (email)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_custom_order_inquiries_status_created_at_desc
  ON public.custom_order_inquiries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles (created_at);
