-- Add support for guest checkout by making user_id nullable
-- and adding guest order information fields

-- Add guest_email field to orders table for guest checkouts
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Add guest_name field to orders table for guest checkouts
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_name TEXT;

-- Add guest_phone field to orders table for guest checkouts
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Make user_id nullable to allow guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Update orders policies to allow guest checkout
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Recreate policies with guest support
-- Users can view their own orders (logged in)
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can create their own orders
CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Guest users (anon) can create orders without user_id
CREATE POLICY "Guest users can create orders"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL 
    AND guest_email IS NOT NULL 
    AND guest_name IS NOT NULL
  );

-- Update order_items policies for guest orders
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Guest users can create order items" ON public.order_items;

-- Recreate order_items policies with guest support
-- Authenticated users can view their own order items
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Authenticated users can create order items for their orders
CREATE POLICY "Authenticated users can create order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Guest users can create order items
CREATE POLICY "Guest users can create order items"
  ON public.order_items FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
    )
  );

-- Admins can view all order items (already exists, keeping for reference)
-- CREATE POLICY "Admins can view all order items"
--   ON public.order_items FOR SELECT
--   TO authenticated
--   USING (public.has_role(auth.uid(), 'admin'));

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON public.orders(guest_email) WHERE guest_email IS NOT NULL;

-- Add check constraint to ensure either user_id or guest info is present
ALTER TABLE public.orders ADD CONSTRAINT orders_user_or_guest_check
  CHECK (
    (user_id IS NOT NULL) OR 
    (user_id IS NULL AND guest_email IS NOT NULL AND guest_name IS NOT NULL)
  );
