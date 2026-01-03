-- Add full_description column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS full_description TEXT;

-- Add comment to document the purpose of this field
COMMENT ON COLUMN public.products.full_description IS 'Detailed product description including technical specifications, scent profile, care instructions, etc. Supports markdown formatting.';
