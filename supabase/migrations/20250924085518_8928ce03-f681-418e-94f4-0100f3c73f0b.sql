-- Fix RLS for updating moments (needed for soft delete via deleted_at)
DROP POLICY IF EXISTS "Host can update moments" ON public.moments;

CREATE POLICY "Host can update moments"
ON public.moments
FOR UPDATE
USING (public.is_moment_owner(id))
WITH CHECK (public.is_moment_owner(id));