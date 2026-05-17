-- Grant guests access to view their own order after checkout.
-- This uses a custom request header to pass the order ID securely.

-- 1. Create a new policy for guest order selection
CREATE POLICY "Guests can view their own order"
  ON public.orders FOR SELECT
  TO anon
  USING (id::text = current_setting('request.header.x-order-id', true));

-- 2. Update existing order_items policy to allow guests to view items
-- for the order they have access to.
DROP POLICY IF EXISTS "Guests can view their own order items" ON public.order_items;

CREATE POLICY "Guests can view their own order items"
  ON public.order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      -- The guest will have access to the order via the policy above
    )
  );
