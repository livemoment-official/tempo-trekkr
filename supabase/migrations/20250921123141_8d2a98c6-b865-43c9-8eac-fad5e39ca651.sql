-- Populate database with sample data for testing

-- Insert sample users into available_now view (first we need sample profiles)
INSERT INTO profiles (id, name, username, avatar_url, bio, job_title, interests, mood, privacy_level, onboarding_completed) VALUES
(gen_random_uuid(), 'Marco Rossi', 'marco_photographer', '/livemoment-mascot.png', 'Fotografo freelance appassionato di street photography e natura', 'Fotografo', ARRAY['fotografia', 'natura', 'viaggi', 'arte'], 'Creativo', 'public', true),
(gen_random_uuid(), 'Sofia Bianchi', 'sofia_designer', '/livemoment-mascot.png', 'UX/UI Designer presso startup tech. Amo il design minimalista e sostenibile', 'UX Designer', ARRAY['design', 'tecnologia', 'sostenibilità', 'yoga'], 'Zen', 'public', true),
(gen_random_uuid(), 'Luca Verdi', 'luca_chef', '/livemoment-mascot.png', 'Chef presso ristorante stellato. Cucina fusion asiatica-italiana', 'Chef', ARRAY['cucina', 'vino', 'cultura', 'musica'], 'Energico', 'public', true),
(gen_random_uuid(), 'Emma Neri', 'emma_artista', '/livemoment-mascot.png', 'Pittrice contemporanea. Espongo in gallerie europee', 'Artista', ARRAY['arte', 'pittura', 'mostre', 'cultura'], 'Ispirata', 'public', true),
(gen_random_uuid(), 'Antonio Blu', 'antonio_musicista', '/livemoment-mascot.png', 'Chitarrista jazz. Suono nei locali del centro storico', 'Musicista', ARRAY['musica', 'jazz', 'concerti', 'strumenti'], 'Rilassato', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Get the IDs of the profiles we just inserted
WITH sample_profiles AS (
  SELECT id, name FROM profiles 
  WHERE username IN ('marco_photographer', 'sofia_designer', 'luca_chef', 'emma_artista', 'antonio_musicista')
  LIMIT 5
)
-- Insert availability records for these users
INSERT INTO availability (user_id, start_at, end_at, is_on, shareable)
SELECT 
  id, 
  now() - INTERVAL '1 hour', 
  now() + INTERVAL '3 hours', 
  true, 
  true
FROM sample_profiles;

-- Insert sample events
INSERT INTO events (
  id,
  title, 
  description, 
  place, 
  when_at, 
  tags, 
  photos,
  discovery_on,
  capacity,
  registration_status
) VALUES
(gen_random_uuid(), 'Festival Jazz Milano 2024', 'Il più grande festival jazz del nord Italia con artisti internazionali', 
 '{"name": "Parco Sempione", "address": "Milano, MI", "lat": 45.4654, "lng": 9.1859}', 
 now() + INTERVAL '2 days', 
 ARRAY['musica', 'jazz', 'festival'], 
 ARRAY['/livemoment-mascot.png'], 
 true, 5000, 'open'),

(gen_random_uuid(), 'Mostra Arte Contemporanea', 'Esposizione di opere di artisti emergenti italiani', 
 '{"name": "Palazzo delle Esposizioni", "address": "Roma, RM", "lat": 41.9028, "lng": 12.4964}', 
 now() + INTERVAL '5 days', 
 ARRAY['arte', 'mostra', 'cultura'], 
 ARRAY['/livemoment-mascot.png'], 
 true, 300, 'open'),

(gen_random_uuid(), 'Workshop Cucina Fusion', 'Impara le tecniche della cucina fusion con chef stellati', 
 '{"name": "Cooking Academy", "address": "Torino, TO", "lat": 45.0703, "lng": 7.6869}', 
 now() + INTERVAL '1 week', 
 ARRAY['cucina', 'workshop', 'cibo'], 
 ARRAY['/livemoment-mascot.png'], 
 true, 20, 'open'),

(gen_random_uuid(), 'Aperitivo in Terrazza', 'Aperitivo con vista panoramica sulla città', 
 '{"name": "Sky Lounge", "address": "Milano, MI", "lat": 45.4642, "lng": 9.1900}', 
 now() + INTERVAL '1 day', 
 ARRAY['aperitivo', 'sociale', 'panorama'], 
 ARRAY['/livemoment-mascot.png'], 
 true, 50, 'open');

-- Insert sample artists
INSERT INTO artists (
  id,
  name,
  stage_name,
  bio,
  avatar_url,
  genres,
  artist_type,
  specialization,
  experience_years,
  province,
  verified,
  instruments,
  audience_size,
  performance_duration,
  exhibition_description
) VALUES
(gen_random_uuid(), 'Francesco Melodia', 'Franky Jazz', 
 'Sassofonista professionista con 15 anni di esperienza nei migliori jazz club europei', 
 '/livemoment-mascot.png', 
 ARRAY['jazz', 'blues', 'swing'], 
 'Musicista', 'Sassofono', 15, 'Milano', true,
 ARRAY['sassofono', 'clarinetto'], 
 'Medio (50-200 persone)', '60-90 minuti',
 'Performance coinvolgente con repertorio classico e moderno, perfetta per eventi eleganti'),

(gen_random_uuid(), 'Valentina Colore', 'Val Colors', 
 'Pittrice murales specializzata in arte urbana e decorazioni per eventi', 
 '/livemoment-mascot.png', 
 ARRAY['street art', 'murales', 'decorazione'], 
 'Artista Visivo', 'Pittura Murale', 8, 'Roma', true,
 ARRAY['spray', 'acrilici', 'digitale'], 
 'Tutti i pubblici', 'Variabile (2-8 ore)',
 'Creazione di opere dal vivo durante eventi, workshop di street art per principianti'),

(gen_random_uuid(), 'Marco Ritmo', 'DJ Mark', 
 'DJ e produttore elettronico, specializzato in musica house e techno', 
 '/livemoment-mascot.png', 
 ARRAY['house', 'techno', 'electronic'], 
 'DJ/Producer', 'Electronic Music', 12, 'Torino', true,
 ARRAY['deck', 'mixer', 'sintetizzatore'], 
 'Grande (200+ persone)', '2-6 ore',
 'Set energici per feste e club, con produzioni originali e remix esclusivi'),

(gen_random_uuid(), 'Giulia Armonia', 'Julia Strings', 
 'Violinista classica e crossover, disponibile per eventi privati e cerimonie', 
 '/livemoment-mascot.png', 
 ARRAY['classica', 'pop', 'crossover'], 
 'Musicista', 'Violino', 10, 'Firenze', true,
 ARRAY['violino', 'viola'], 
 'Piccolo-Medio (10-100 persone)', '30-120 minuti',
 'Repertorio versatile da Bach ai Beatles, perfetto per matrimoni e eventi eleganti');

-- Insert sample venues
INSERT INTO venues (
  id,
  name,
  description,
  venue_type,
  location,
  capacity,
  max_capacity_seated,
  max_capacity_standing,
  amenities,
  contact_person_name,
  contact_person_surname,
  contact_phone,
  contact_email,
  verified,
  services,
  preferred_event_types,
  music_genres,
  audio_setup
) VALUES
(gen_random_uuid(), 'Villa Harmony', 
 'Location esclusiva per eventi privati con giardino panoramico e sale eleganti', 
 'Villa Privata', 
 '{"name": "Villa Harmony", "address": "Via delle Rose 15, Milano", "lat": 45.4642, "lng": 9.1900}',
 150, 80, 150,
 ARRAY['parcheggio', 'giardino', 'cucina', 'wifi', 'climatizzazione'],
 'Maria', 'Rossi', '+39 02 1234567', 'info@villaharmony.it', true,
 ARRAY['catering', 'allestimenti', 'fotografia', 'wedding planning'],
 ARRAY['matrimoni', 'feste private', 'eventi aziendali'],
 ARRAY['acustica', 'jazz', 'classica', 'pop'],
 ARRAY['impianto audio professionale', 'microfoni wireless', 'mixer digitale']),

(gen_random_uuid(), 'Jazz Corner Club', 
 'Intimo jazz club nel cuore della città, perfetto per concerti acustici', 
 'Jazz Club', 
 '{"name": "Jazz Corner", "address": "Via Brera 22, Milano", "lat": 45.4719, "lng": 9.1881}',
 80, 60, 80,
 ARRAY['bar', 'palco', 'luci sceniche', 'guardaroba'],
 'Giuseppe', 'Verdi', '+39 02 9876543', 'booking@jazzcorner.it', true,
 ARRAY['sound engineering', 'registrazione live', 'streaming'],
 ARRAY['concerti jazz', 'jam session', 'eventi musicali'],
 ARRAY['jazz', 'blues', 'soul', 'acoustic'], 
 ARRAY['pianoforte a coda', 'batteria', 'contrabbasso', 'sistema PA']),

(gen_random_uuid(), 'Spazio Arte Moderna', 
 'Galleria e spazio eventi per mostre, workshop creativi e presentazioni', 
 'Galleria/Spazio Arte', 
 '{"name": "Spazio Arte", "address": "Corso Buenos Aires 45, Milano", "lat": 45.4797, "lng": 9.2075}',
 100, 50, 100,
 ARRAY['illuminazione professionale', 'pareti mobili', 'proiettore', 'wifi'],
 'Anna', 'Bianchi', '+39 02 5555555', 'eventi@spazioarte.it', true,
 ARRAY['allestimenti mostre', 'coordinamento eventi', 'catering leggero'],
 ARRAY['mostre arte', 'workshop creativi', 'presentazioni', 'vernissage'],
 ARRAY['ambient', 'classica', 'jazz', 'elettronica minimale'],
 ARRAY['sistema audio ambiente', 'microfoni da podio', 'impianto filodiffusione']);

-- Update some moments to have more realistic data
UPDATE moments 
SET 
  photos = ARRAY['/livemoment-mascot.png'],
  tags = CASE 
    WHEN title ILIKE '%pranzo%' THEN ARRAY['cibo', 'sociale', 'spontaneo']
    WHEN title ILIKE '%aperitivo%' THEN ARRAY['aperitivo', 'relax', 'sociale'] 
    WHEN title ILIKE '%sport%' THEN ARRAY['sport', 'energia', 'avventura']
    WHEN title ILIKE '%musica%' THEN ARRAY['musica', 'arte', 'cultura']
    ELSE ARRAY['sociale', 'spontaneo']
  END,
  mood_tag = CASE 
    WHEN title ILIKE '%pranzo%' THEN 'Golosone'
    WHEN title ILIKE '%aperitivo%' THEN 'Rilassato'
    WHEN title ILIKE '%sport%' THEN 'Energico'
    WHEN title ILIKE '%musica%' THEN 'Ispirato'
    ELSE 'Spontaneo'
  END
WHERE photos IS NULL OR array_length(photos, 1) IS NULL;