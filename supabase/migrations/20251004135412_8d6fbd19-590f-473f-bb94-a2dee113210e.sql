-- Fix moment_reactions RLS policy to check moment access
DROP POLICY IF EXISTS "Users can create their own reactions" ON moment_reactions;

-- Create new policy that verifies user has access to the moment
CREATE POLICY "Users can create reactions on accessible moments"
ON moment_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM moments 
    WHERE moments.id = moment_id 
    AND moments.deleted_at IS NULL
    AND (
      moments.is_public = true 
      OR moments.host_id = auth.uid() 
      OR auth.uid() = ANY(moments.participants)
    )
  )
);