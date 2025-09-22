-- Populate sample events with realistic data and artist/venue relationships
INSERT INTO public.events (id, title, description, when_at, place, max_participants, tags, photos, discovery_on, host_id) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
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
);

-- Insert event-artist relationships
INSERT INTO public.event_artists (event_id, artist_id, status, invitation_message) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '8e49ef43-db31-4cec-93e6-3dc0c06d1b6d', -- Francesco Melodia (Jazz)
  'accepted',
  'Siamo entusiasti di averti per la nostra serata jazz!'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'e06c6a67-5ca0-41ff-8699-285ed94e31c0', -- Giulia Armonia (Violinista)
  'invited',
  'Ti invitiamo a partecipare alla nostra magica serata jazz'
),
(
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  '1b334649-549e-40b0-a490-84f2cf8527f9', -- DJ Mark (Electronic)
  'confirmed',
  'Confermiamo la tua partecipazione al festival!'
),
(
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  '18e83c7a-bcb6-4dd5-8dd2-d25100b57213', -- Val Colors (Artista Visivo)
  'accepted',
  'La tua arte sarà perfetta per questo evento!'
);

-- Insert event-venue relationships
INSERT INTO public.event_venues (event_id, venue_id, status, contact_message) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'e44f3777-5515-4e3b-b0e2-39094b4f68a4', -- Villa Harmony
  'confirmed',
  'La vostra location è perfetta per la nostra serata jazz!'
),
(
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  '4bf89d3e-9cf3-4c40-bb5a-9ca69d6db360', -- Spazio Arte Moderna
  'interested',
  'Siamo interessati al vostro spazio per il nostro festival'
),
(
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  '2329d6f5-f1f1-4af3-a3d1-8e487a944ff5', -- Jazz Corner Club
  'contacted',
  'Valutiamo la possibilità di utilizzare il vostro spazio per eventi serali'
);