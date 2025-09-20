-- Add gender field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender text;

-- Add comment to explain the field
COMMENT ON COLUMN public.profiles.gender IS 'User gender preference: Uomo, Donna, Non binario, Preferisco non definirlo';