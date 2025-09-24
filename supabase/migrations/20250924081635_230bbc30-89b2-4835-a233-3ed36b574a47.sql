-- Create a security definer function to check if the current user owns a moment
CREATE OR REPLACE FUNCTION public.is_moment_owner(moment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.moments 
    WHERE id = moment_id AND host_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Update the moment update policy to use the security definer function
DROP POLICY IF EXISTS "Host can update moments" ON public.moments;
CREATE POLICY "Host can update moments" ON public.moments
FOR UPDATE USING (public.is_moment_owner(id));

-- Ensure the soft delete works properly by adding explicit logging
CREATE OR REPLACE FUNCTION public.log_moment_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when a moment is soft deleted
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    RAISE NOTICE 'Moment % soft deleted by user %', NEW.id, auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for logging deletions
DROP TRIGGER IF EXISTS log_moment_deletion_trigger ON public.moments;
CREATE TRIGGER log_moment_deletion_trigger
  BEFORE UPDATE ON public.moments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_moment_deletion();