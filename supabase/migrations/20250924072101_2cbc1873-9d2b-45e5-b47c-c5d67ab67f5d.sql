-- Add end_at column to moments table
ALTER TABLE public.moments 
ADD COLUMN end_at timestamp with time zone;

-- Add end_at column to events table if not exists (checking first)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_at') THEN
    ALTER TABLE public.events ADD COLUMN end_at timestamp with time zone;
  END IF;
END $$;

-- Add end_at column to invites table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'end_at') THEN
    ALTER TABLE public.invites ADD COLUMN end_at timestamp with time zone;
  END IF;
END $$;