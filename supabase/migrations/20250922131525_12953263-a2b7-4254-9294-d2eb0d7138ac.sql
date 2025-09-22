-- Add venue relationships for the sample events
WITH events_data AS (
  SELECT 
    id,
    title,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.events 
  WHERE title IN ('Jazz Night al Tramonto', 'Arte e Musica Elettronica')
  ORDER BY created_at
)
-- Insert event-venue relationships
INSERT INTO public.event_venues (event_id, venue_id, status, contact_message)
SELECT 
  e.id,
  v.venue_id,
  v.status,
  v.contact_message
FROM events_data e
CROSS JOIN (
  VALUES 
    (1, 'e44f3777-5515-4e3b-b0e2-39094b4f68a4'::uuid, 'confirmed', 'La vostra location è perfetta per la nostra serata jazz!'),
    (2, '4bf89d3e-9cf3-4c40-bb5a-9ca69d6db360'::uuid, 'interested', 'Siamo interessati al vostro spazio per il nostro festival'),
    (2, '2329d6f5-f1f1-4af3-a3d1-8e487a944ff5'::uuid, 'contacted', 'Valutiamo la possibilità di utilizzare il vostro spazio per eventi serali')
) AS v(event_num, venue_id, status, contact_message)
WHERE e.rn = v.event_num;