-- Add promo code and discount columns to customer_logs table
ALTER TABLE public.customer_logs ADD COLUMN IF NOT EXISTS promo_code_used VARCHAR(50);
ALTER TABLE public.customer_logs ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10,2) DEFAULT 0;

-- Update the RLS policies to include the new columns
-- These should already be included if you recreate the table with the updated schema