-- Run the migration to sync existing moment participants
SELECT migrate_existing_moment_participants();

-- Also ensure all moments have their participant arrays updated based on the relational table
UPDATE moments 
SET participants = (
  SELECT COALESCE(array_agg(mp.user_id), '{}')
  FROM moment_participants mp 
  WHERE mp.moment_id = moments.id
  AND mp.status = 'confirmed'
),
updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM moment_participants 
  WHERE moment_id = moments.id
);