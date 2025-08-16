-- Add missing foreign key constraint between moments and profiles
ALTER TABLE public.moments 
ADD CONSTRAINT moments_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES public.profiles(id) ON DELETE CASCADE;