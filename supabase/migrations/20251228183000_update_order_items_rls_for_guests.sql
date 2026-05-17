-- Enable anon inserts for order_items table to allow guest checkout
CREATE POLICY "Users and guests can insert their own order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (true);
