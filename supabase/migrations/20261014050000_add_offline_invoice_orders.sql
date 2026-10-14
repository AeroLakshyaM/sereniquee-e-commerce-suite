ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_source TEXT NOT NULL DEFAULT 'online';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_order_source_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_order_source_check
  CHECK (order_source IN ('online', 'offline'));

CREATE INDEX IF NOT EXISTS idx_orders_order_source ON public.orders(order_source);

CREATE POLICY "Admins can create offline orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND user_id IS NULL
    AND guest_name IS NOT NULL
    AND order_source = 'offline'
  );

CREATE POLICY "Admins can create offline order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.order_source = 'offline'
    )
  );
