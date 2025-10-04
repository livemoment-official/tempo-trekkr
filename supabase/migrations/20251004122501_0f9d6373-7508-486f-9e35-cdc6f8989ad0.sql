-- Add phone_hash field to profiles for secure contact matching
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_hash text;

-- Create index for fast phone hash lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_hash 
ON public.profiles(phone_hash) 
WHERE phone_hash IS NOT NULL;

-- Add phone_discoverable field for privacy control
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_discoverable boolean DEFAULT true;

-- Update RLS policies to protect phone_hash
CREATE POLICY "Phone hash is private" 
ON public.profiles 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() = id THEN true  -- User can see their own
    ELSE phone_hash IS NULL  -- Others cannot see phone_hash
  END
);