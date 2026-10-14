ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
