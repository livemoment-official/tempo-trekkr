-- Phase 1: Unify participant system - Use moment_participants as single source of truth

-- Step 1: Create function to sync moments.participants array based on moment_participants table
CREATE OR REPLACE FUNCTION sync_moment_participants_array()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the participants array in moments table based on moment_participants
  UPDATE public.moments 
  SET participants = (
    SELECT COALESCE(array_agg(mp.user_id), '{}')
    FROM moment_participants mp 
    WHERE mp.moment_id = COALESCE(NEW.moment_id, OLD.moment_id)
    AND mp.status = 'confirmed'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.moment_id, OLD.moment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 2: Create triggers to automatically sync the array when moment_participants changes
DROP TRIGGER IF EXISTS sync_participants_on_insert ON moment_participants;
CREATE TRIGGER sync_participants_on_insert
  AFTER INSERT ON moment_participants
  FOR EACH ROW
  EXECUTE FUNCTION sync_moment_participants_array();

DROP TRIGGER IF EXISTS sync_participants_on_update ON moment_participants;
CREATE TRIGGER sync_participants_on_update
  AFTER UPDATE ON moment_participants
  FOR EACH ROW
  EXECUTE FUNCTION sync_moment_participants_array();

DROP TRIGGER IF EXISTS sync_participants_on_delete ON moment_participants;
CREATE TRIGGER sync_participants_on_delete
  AFTER DELETE ON moment_participants
  FOR EACH ROW
  EXECUTE FUNCTION sync_moment_participants_array();

-- Step 3: Migration function to align existing data
CREATE OR REPLACE FUNCTION migrate_existing_moment_participants()
RETURNS void AS $$
DECLARE
  moment_record RECORD;
  participant_id UUID;
BEGIN
  -- For each moment, ensure moment_participants table has entries for all participants in the array
  FOR moment_record IN 
    SELECT id, host_id, participants 
    FROM moments 
    WHERE participants IS NOT NULL AND array_length(participants, 1) > 0
  LOOP
    -- Add host if not already a participant
    INSERT INTO moment_participants (moment_id, user_id, status, payment_status)
    SELECT moment_record.id, moment_record.host_id, 'confirmed', 'free'
    WHERE NOT EXISTS (
      SELECT 1 FROM moment_participants 
      WHERE moment_id = moment_record.id AND user_id = moment_record.host_id
    );
    
    -- Add each participant from the array if not already in moment_participants
    FOREACH participant_id IN ARRAY moment_record.participants
    LOOP
      INSERT INTO moment_participants (moment_id, user_id, status, payment_status)
      SELECT moment_record.id, participant_id, 'confirmed', 'free'
      WHERE NOT EXISTS (
        SELECT 1 FROM moment_participants 
        WHERE moment_id = moment_record.id AND user_id = participant_id
      );
    END LOOP;
  END LOOP;
  
  -- Now sync all moments arrays based on the relational table
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 4: Execute the migration
SELECT migrate_existing_moment_participants();

-- Step 5: Add indexes for better performance on the queries we'll be using
CREATE INDEX IF NOT EXISTS idx_moment_participants_moment_status ON moment_participants(moment_id, status);
CREATE INDEX IF NOT EXISTS idx_moment_participants_user_status ON moment_participants(user_id, status);

-- Step 6: Add a function to get participant count efficiently
CREATE OR REPLACE FUNCTION get_moment_participant_count(moment_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM moment_participants
    WHERE moment_id = moment_id_param
    AND status = 'confirmed'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;