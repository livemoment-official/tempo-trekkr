-- Fix foreign key relationship for moments table
ALTER TABLE moments 
ADD CONSTRAINT moments_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix foreign key relationship for events table  
ALTER TABLE events
ADD CONSTRAINT events_host_id_fkey
FOREIGN KEY (host_id) REFERENCES profiles(id) ON DELETE CASCADE;