CREATE OR REPLACE FUNCTION public.decrement_stock(product_id UUID, qty INTEGER)
RETURNS void
AS $$
  UPDATE public.products
  SET stock_quantity = stock_quantity - qty
  WHERE id = product_id;
$$ LANGUAGE sql SECURITY DEFINER;
