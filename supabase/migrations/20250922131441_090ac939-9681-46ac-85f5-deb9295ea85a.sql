-- Populate sample events with realistic data and artist/venue relationships
-- First insert events
WITH new_events AS (
  INSERT INTO public.events (title, description, when_at, place, max_participants, tags, photos, discovery_on, host_id) VALUES
  (
    'Jazz Night al Tramonto',
    'Una serata magica di jazz con artisti professionisti in una location esclusiva. Vieni a vivere un''esperienza musicale indimenticabile con cocktail e atmosfera unica.',
    '2025-10-15 20:30:00+02',
    '{
      "name": "Villa Harmony Terrace",
      "address": "Via Roma 123, Milano",
      "lat": 45.4642,
      "lng": 9.1900,
      "coordinates": {"lat": 45.4642, "lng": 9.1900}
    }',
    80,
    ARRAY['jazz', 'musica', 'serata', 'aperitivo'],
    ARRAY['/livemoment-mascot.png'],
    true,
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    'Arte e Musica Elettronica',
    'Festival di arte contemporanea con performance di artisti visivi e DJ internazionali. Un evento che unisce creatività visiva e sonora.',
    '2025-10-22 18:00:00+02',
    '{
      "name": "Spazio Arte Moderna",
      "address": "Via Milano 45, Roma",
      "lat": 41.9028,
      "lng": 12.4964,
      "coordinates": {"lat": 41.9028, "lng": 12.4964}
    }',
    150,
    ARRAY['arte', 'musica', 'elettronica', 'festival'],
    ARRAY['/livemoment-mascot.png'],
    true,
    (SELECT id FROM profiles LIMIT 1)
  )
  RETURNING id, title
),
-- Get the inserted event IDs  
event_ids AS (
  SELECT 
    id,
    title,
    ROW_NUMBER() OVER (ORDER BY title) as rn
  FROM new_events
)
-- Insert event-artist relationships
INSERT INTO public.event_artists (event_id, artist_id, status, invitation_message)
SELECT 
  e.id,
  a.artist_id,
  a.status,
  a.invitation_message
FROM event_ids e
CROSS JOIN (
  VALUES 
    (1, '8e49ef43-db31-4cec-93e6-3dc0c06d1b6d'::uuid, 'accepted', 'Siamo entusiasti di averti per la nostra serata jazz!'),
    (1, 'e06c6a67-5ca0-41ff-8699-285ed94e31c0'::uuid, 'invited', 'Ti invitiamo a partecipare alla nostra magica serata jazz'),
    (2, '1b334649-549e-40b0-a490-84f2cf8527f9'::uuid, 'confirmed', 'Confermiamo la tua partecipazione al festival!'),
    (2, '18e83c7a-bcb6-4dd5-8dd2-d25100b57213'::uuid, 'accepted', 'La tua arte sarà perfetta per questo evento!')
) AS a(event_num, artist_id, status, invitation_message)
WHERE e.rn = a.event_num;