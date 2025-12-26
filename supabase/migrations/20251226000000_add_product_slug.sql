-- Add slug column to products table
ALTER TABLE public.products ADD COLUMN slug TEXT UNIQUE;

-- Create function to generate slug from product name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  slug TEXT;
  counter INT := 0;
  temp_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  slug := trim(both '-' from slug);
  
  temp_slug := slug;
  
  -- Ensure uniqueness by appending counter if needed
  WHILE EXISTS (SELECT 1 FROM products WHERE products.slug = temp_slug) LOOP
    counter := counter + 1;
    temp_slug := slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN temp_slug;
END;
$$;

-- Generate slugs for existing products
UPDATE public.products 
SET slug = generate_slug(name) 
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;

-- Create trigger to auto-generate slug for new products if not provided
CREATE OR REPLACE FUNCTION auto_generate_product_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_product_slug_on_insert
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_slug();

-- Create index on slug for faster lookups
CREATE INDEX idx_products_slug ON public.products(slug);
