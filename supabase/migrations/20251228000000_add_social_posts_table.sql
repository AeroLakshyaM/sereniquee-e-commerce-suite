-- Create social_posts table for managing social media posts manually
-- This replaces the need for Instagram API tokens
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL DEFAULT 'instagram', -- instagram, facebook, twitter, etc.
  image_url TEXT NOT NULL,
  post_url TEXT, -- Link to the actual post on social media
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Policies (public read, admin write)
CREATE POLICY "Anyone can view active social posts"
  ON public.social_posts FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can insert social posts"
  ON public.social_posts FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social posts"
  ON public.social_posts FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete social posts"
  ON public.social_posts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER handle_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample posts (you can replace these with your actual posts)
INSERT INTO public.social_posts (platform, image_url, post_url, caption, display_order, is_active) VALUES
  ('instagram', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80', 'https://www.instagram.com/sereniquee.candles.co', '✨ New arrivals! Handcrafted with love', 1, TRUE),
  ('instagram', 'https://images.unsplash.com/photo-1602874801006-e25666c7b12f?w=600&q=80', 'https://www.instagram.com/sereniquee.candles.co', '🕯️ Behind the scenes of our candle making process', 2, TRUE),
  ('instagram', 'https://images.unsplash.com/photo-1564053489984-317bbd824340?w=600&q=80', 'https://www.instagram.com/sereniquee.candles.co', '🌿 Natural soy wax, premium fragrances', 3, TRUE),
  ('instagram', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', 'https://www.instagram.com/sereniquee.candles.co', '💝 Perfect gift sets for your loved ones', 4, TRUE),
  ('instagram', 'https://images.unsplash.com/photo-1602524206684-f86b25c0797c?w=600&q=80', 'https://www.instagram.com/sereniquee.candles.co', '🏠 Transform your space into a sanctuary', 5, TRUE),
  ('instagram', 'https://images.unsplash.com/photo-1587149185383-033623e07d44?w=600&q=80', 'https://www.instagram.com/sereniquee.candles.co', '✨ Customer favorite: Lavender Dreams', 6, TRUE)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.social_posts IS 'Manually managed social media posts to display on the website';
