-- Add SEO fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- Add SEO fields to blogs table
ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- Add SEO fields to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- Create global SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'Sereniquee Candles',
  site_description TEXT,
  default_og_image TEXT,
  canonical_base_url TEXT DEFAULT 'https://sereniquee.com',
  instagram_handle TEXT,
  facebook_url TEXT,
  twitter_handle TEXT,
  google_analytics_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default SEO settings
INSERT INTO seo_settings (
  site_name,
  site_description,
  default_og_image,
  canonical_base_url
) VALUES (
  'Sereniquee Candles',
  'Luxury handmade soy candles crafted with love. Discover our collection of aromatic, eco-friendly candles that transform your home into a sanctuary of warmth and relaxation.',
  '/og-default.png',
  'https://sereniquee.com'
) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read SEO settings
CREATE POLICY "Allow public to read SEO settings"
  ON seo_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow admins to update SEO settings
CREATE POLICY "Allow admins to update SEO settings"
  ON seo_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_seo_keywords ON products USING gin(to_tsvector('english', seo_keywords));
CREATE INDEX IF NOT EXISTS idx_blogs_seo_keywords ON blogs USING gin(to_tsvector('english', seo_keywords));
CREATE INDEX IF NOT EXISTS idx_categories_seo_keywords ON categories USING gin(to_tsvector('english', seo_keywords));
