-- Create the custom order inquiries table
CREATE TABLE IF NOT EXISTS custom_order_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('custom', 'bulk', 'wholesale', 'other')),
    description TEXT NOT NULL,
    quantity_estimate INTEGER,
    budget_range TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'ordered')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Turn on Row Level Security
ALTER TABLE custom_order_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (so customers can submit forms)
CREATE POLICY "Allow anonymous inserts for custom_orders" 
ON custom_order_inquiries FOR INSERT 
TO public
WITH CHECK (true);

-- Allow admins full access 
CREATE POLICY "Allow admin full access for custom_orders" 
ON custom_order_inquiries FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);
