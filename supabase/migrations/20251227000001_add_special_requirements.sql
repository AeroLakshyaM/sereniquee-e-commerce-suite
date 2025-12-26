-- Add special_requirements column to orders table
-- Created: 2025-12-27

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS special_requirements TEXT;

COMMENT ON COLUMN orders.special_requirements IS 'Customer special instructions or requirements for the order';
