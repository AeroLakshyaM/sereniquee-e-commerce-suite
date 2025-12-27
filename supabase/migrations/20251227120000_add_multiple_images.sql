-- Add image_urls column to products table for multiple images
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing products to move image_url to image_urls array
UPDATE public.products 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Keep image_url for backward compatibility but make it reference first image
-- This will be handled in the application layer
