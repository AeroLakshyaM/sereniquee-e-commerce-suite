-- Migration: Add Product Variants, Gift Features, Reviews, Wishlist, and Analytics
-- Created: 2025-12-27

-- ============================================
-- 1. PRODUCT VARIANTS
-- ============================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  
  -- Variant attributes
  size VARCHAR(50),
  scent VARCHAR(100),
  color VARCHAR(50),
  wick_type VARCHAR(50),
  weight VARCHAR(50),
  custom_engraving TEXT,
  
  image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- ============================================
-- 2. GIFT OPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS gift_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category VARCHAR(50), -- 'wrap', 'card', 'box', 'message'
  icon VARCHAR(50),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default gift options
INSERT INTO gift_options (name, description, price, category, icon) VALUES
('Gift Wrap', 'Beautiful wrapping paper with ribbon', 50.00, 'wrap', 'gift'),
('Premium Gift Box', 'Luxury gift box packaging', 100.00, 'box', 'package'),
('Greeting Card', 'Custom greeting card with your message', 30.00, 'card', 'mail'),
('Gift Bag', 'Elegant gift bag with tissue paper', 40.00, 'wrap', 'shopping-bag');

CREATE TABLE IF NOT EXISTS order_gift_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gift_wrap_option_id UUID REFERENCES gift_options(id),
  gift_message TEXT,
  gift_recipient_name VARCHAR(255),
  gift_recipient_email VARCHAR(255),
  gift_recipient_phone VARCHAR(20),
  hide_prices BOOLEAN DEFAULT false,
  selected_card_design VARCHAR(100),
  total_gift_cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_gift_details_order_id ON order_gift_details(order_id);

-- ============================================
-- 3. PRODUCT REVIEWS & RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_product_reviews_created_at ON product_reviews(created_at DESC);

-- Review votes tracking (to prevent multiple votes from same user)
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);

-- Function to update product average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update ratings
CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Add rating columns to products table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='average_rating') THEN
    ALTER TABLE products ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='review_count') THEN
    ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 4. WISHLIST / FAVORITES
-- ============================================

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  notes TEXT,
  notify_on_sale BOOLEAN DEFAULT false,
  notify_on_restock BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- ============================================
-- 5. ANALYTICS VIEWS
-- ============================================

-- Sales analytics view
CREATE OR REPLACE VIEW sales_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as order_count,
  SUM(total_amount) as revenue,
  AVG(total_amount) as average_order_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Product performance view
CREATE OR REPLACE VIEW product_performance AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.stock_quantity,
  p.average_rating,
  p.review_count,
  COALESCE(SUM(oi.quantity), 0) as total_sold,
  COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_revenue,
  COUNT(DISTINCT oi.order_id) as order_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.id, p.name, p.category, p.price, p.stock_quantity, p.average_rating, p.review_count;

-- Customer analytics view
CREATE OR REPLACE VIEW customer_analytics AS
SELECT 
  o.user_id,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as lifetime_value,
  AVG(o.total_amount) as average_order_value,
  MIN(o.created_at) as first_order_date,
  MAX(o.created_at) as last_order_date,
  COUNT(DISTINCT DATE_TRUNC('month', o.created_at)) as active_months
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY o.user_id;

-- Category performance view
CREATE OR REPLACE VIEW category_performance AS
SELECT 
  p.category,
  COUNT(DISTINCT p.id) as product_count,
  COALESCE(SUM(oi.quantity), 0) as total_units_sold,
  COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_revenue,
  COALESCE(AVG(p.average_rating), 0) as average_rating
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.category;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_gift_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Product Variants Policies
CREATE POLICY "Anyone can view active variants"
  ON product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage variants"
  ON product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Gift Options Policies
CREATE POLICY "Anyone can view active gift options"
  ON gift_options FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage gift options"
  ON gift_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Order Gift Details Policies
CREATE POLICY "Users can view their own order gift details"
  ON order_gift_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_gift_details.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create gift details for their orders"
  ON order_gift_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_gift_details.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all gift details"
  ON order_gift_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Product Reviews Policies
CREATE POLICY "Anyone can view approved reviews"
  ON product_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
  ON product_reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
  ON product_reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON product_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Review Votes Policies
CREATE POLICY "Anyone can view votes"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create votes"
  ON review_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own votes"
  ON review_votes FOR UPDATE
  USING (user_id = auth.uid());

-- Wishlist Policies
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own wishlist"
  ON wishlists FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 7. TRIGGERS & FUNCTIONS
-- ============================================

-- Update timestamp trigger function (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has purchased product (for verified purchase badge)
CREATE OR REPLACE FUNCTION has_purchased_product(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = p_user_id
      AND oi.product_id = p_product_id
      AND o.status = 'delivered'
  );
END;
$$ LANGUAGE plpgsql;

-- Automatically set verified purchase flag when review is created
CREATE OR REPLACE FUNCTION set_verified_purchase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified_purchase := has_purchased_product(NEW.user_id, NEW.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_verified_purchase
BEFORE INSERT ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION set_verified_purchase();

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved_rating 
  ON product_reviews(product_id, is_approved, rating DESC);
  
CREATE INDEX IF NOT EXISTS idx_wishlists_user_product 
  ON wishlists(user_id, product_id);

COMMENT ON TABLE product_variants IS 'Stores product variations (size, scent, color, etc.)';
COMMENT ON TABLE gift_options IS 'Available gift wrapping and packaging options';
COMMENT ON TABLE order_gift_details IS 'Gift-specific details for orders';
COMMENT ON TABLE product_reviews IS 'Customer reviews and ratings for products';
COMMENT ON TABLE review_votes IS 'Helpful/not helpful votes on reviews';
COMMENT ON TABLE wishlists IS 'User wishlist/favorites for products';
