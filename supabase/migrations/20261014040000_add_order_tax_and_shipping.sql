ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;

UPDATE public.orders
SET subtotal_amount = total_amount
WHERE subtotal_amount IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN subtotal_amount SET DEFAULT 0;
