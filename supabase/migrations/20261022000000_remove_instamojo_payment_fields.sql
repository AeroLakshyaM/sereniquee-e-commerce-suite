-- Remove Instamojo payment handling while retaining discount-code order data.
DROP FUNCTION IF EXISTS public.confirm_instamojo_payment(UUID, TEXT, TEXT);
DROP INDEX IF EXISTS public.idx_orders_payment_request_id;

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS payment_provider,
  DROP COLUMN IF EXISTS payment_request_id,
  DROP COLUMN IF EXISTS payment_id,
  DROP COLUMN IF EXISTS payment_url,
  DROP COLUMN IF EXISTS payment_confirmation_email_sent;
