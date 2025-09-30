-- Add payment split fields to event_artists table
ALTER TABLE public.event_artists 
ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'none' CHECK (payment_type IN ('none', 'percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS payment_percentage decimal(5,2) DEFAULT 0 CHECK (payment_percentage >= 0 AND payment_percentage <= 100),
ADD COLUMN IF NOT EXISTS payment_fixed_amount integer DEFAULT 0 CHECK (payment_fixed_amount >= 0);

COMMENT ON COLUMN public.event_artists.payment_type IS 'Type of payment split: none, percentage of revenue, or fixed amount per ticket';
COMMENT ON COLUMN public.event_artists.payment_percentage IS 'Percentage of revenue (0-100) if payment_type is percentage';
COMMENT ON COLUMN public.event_artists.payment_fixed_amount IS 'Fixed amount in cents per ticket if payment_type is fixed';