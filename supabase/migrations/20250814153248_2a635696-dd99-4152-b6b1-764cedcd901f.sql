-- Populate database with realistic fake data for testing

-- First, let's add some fake profiles
INSERT INTO public.profiles (id, name, username, bio, mood, job_title, relationship_status, interests, avatar_url, instagram_username) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sofia Rossi', 'sofia_rossi', 'Appassionata di musica dal vivo e arte contemporanea. Sempre in cerca di nuove esperienze culturali a Milano.', 'Energica', 'Graphic Designer', 'Single', ARRAY['live', 'arte', 'aperitivo', 'jazz'], 'https://picsum.photos/300/300?random=1', 'sofia_rossi'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Marco Bianchi', 'marco_music', 'Musicista e produttore. Amo organizzare eventi e scoprire nuovi talenti.', 'Creativo', 'Music Producer', 'In coppia', ARRAY['musica', 'concerti', 'rock', 'elettronica'], 'https://picsum.photos/300/300?random=2', 'marco_music'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Giulia Ferrari', 'giulia_f', 'Fotografa freelance che documenta la vita notturna milanese. Sempre con la macchina fotografica al collo.', 'Ispirata', 'Photographer', 'Single', ARRAY['fotografia', 'concerti', 'nightlife', 'street art'], 'https://picsum.photos/300/300?random=3', 'giulia_photo'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Andrea Conti', 'dj_andrea', 'DJ e organizzatore eventi. Specialist in musica elettronica e house underground.', 'Elettrico', 'DJ & Event Organizer', 'Single', ARRAY['dj set', 'house', 'techno', 'party'], 'https://picsum.photos/300/300?random=4', 'dj_andrea'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Valentina Lombardi', 'vale_live', 'Student life! Università Bocconi di giorno, concerti e aperitivi di sera.', 'Gioviale', 'Student', 'Single', ARRAY['università', 'aperitivo', 'indie', 'concerti'], 'https://picsum.photos/300/300?random=5', 'vale_live'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Luca Romano', 'luca_jazz', 'Saxofonista professionista. Suono nei club jazz più esclusivi di Milano.', 'Sofisticato', 'Musician', 'In coppia', ARRAY['jazz', 'blues', 'live', 'sax'], 'https://picsum.photos/300/300?random=6', 'luca_jazz'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Chiara Esposito', 'chiara_art', 'Curatrice d arte e event planner. Organizzo mostre e eventi culturali a Milano.', 'Raffinata', 'Art Curator', 'Single', ARRAY['arte', 'mostre', 'cultura', 'wine tasting'], 'https://picsum.photos/300/300?random=7', 'chiara_art'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Matteo Ricci', 'matteo_rock', 'Batterista di una band emergente. Cerco sempre nuovi posti dove suonare.', 'Determinato', 'Musician', 'Single', ARRAY['rock', 'metal', 'live', 'underground'], 'https://picsum.photos/300/300?random=8', 'matteo_rock'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Elena Marchetti', 'elena_social', 'Social media manager nel settore musicale. Amo documentare eventi e concerti.', 'Social', 'Social Media Manager', 'In coppia', ARRAY['social media', 'eventi', 'networking', 'aperitivo'], 'https://picsum.photos/300/300?random=9', 'elena_social'),
  ('550e8400-e29b-41d4-a716-446655440010', 'Federico Costa', 'fede_indie', 'Appassionato di musica indie e concerti intimi. Sempre alla ricerca di nuove band.', 'Melanconico', 'Content Creator', 'Single', ARRAY['indie', 'alternative', 'concerti', 'vinili'], 'https://picsum.photos/300/300?random=10', 'fede_indie');

-- Add some availability data
INSERT INTO public.availability (user_id, start_at, end_at, shareable, is_on) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', true, true),
  ('550e8400-e29b-41d4-a716-446655440003', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '5 hours', true, true),
  ('550e8400-e29b-41d4-a716-446655440005', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '8 hours', true, true),
  ('550e8400-e29b-41d4-a716-446655440007', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '7 hours', true, true),
  ('550e8400-e29b-41d4-a716-446655440010', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', true, true);

-- Add some public moments
INSERT INTO public.moments (host_id, title, description, when_at, place, capacity, is_public, tags) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Aperitivo Jazz al Blue Note', 'Serata jazz rilassante con aperitivo al Blue Note. Ottimi cocktail e musica dal vivo di qualità.', NOW() + INTERVAL '1 day', '{"name": "Blue Note Milano", "address": "Via Borsieri 37, Milano", "city": "Milano"}', 25, true, ARRAY['jazz', 'aperitivo', 'live', 'cocktail']),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jam Session Elettronica', 'Serata di improvvisazione elettronica aperta a tutti i musicisti. Porta i tuoi synth!', NOW() + INTERVAL '2 days', '{"name": "Spazio Pergola", "address": "Via Pergolesi 5, Milano", "city": "Milano"}', 15, true, ARRAY['elettronica', 'jam session', 'synth', 'sperimentale']),
  ('550e8400-e29b-41d4-a716-446655440004', 'Underground House Party', 'Party esclusivo in location segreta. Musica house underground e atmosfera intima.', NOW() + INTERVAL '3 days', '{"name": "Location Segreta", "address": "Zona Isola, Milano", "city": "Milano"}', 50, true, ARRAY['house', 'underground', 'party', 'elettronica']),
  ('550e8400-e29b-41d4-a716-446655440007', 'Mostra + Aperitivo Artistico', 'Inaugurazione mostra d arte contemporanea seguita da aperitivo con gli artisti.', NOW() + INTERVAL '5 days', '{"name": "Galleria Carla Sozzani", "address": "Corso di Porta Ticinese 14, Milano", "city": "Milano"}', 40, true, ARRAY['arte', 'mostra', 'aperitivo', 'cultura']),
  ('550e8400-e29b-41d4-a716-446655440008', 'Concerto Rock Emergente', 'Serata dedicata alle band rock emergenti milanesi. Tre band sul palco!', NOW() + INTERVAL '4 days', '{"name": "Circolo Magnolia", "address": "Via Circonvallazione Idroscalo, Segrate", "city": "Milano"}', 200, true, ARRAY['rock', 'live', 'band emergenti', 'underground']);

-- Add some events  
INSERT INTO public.events (host_id, title, description, when_at, place, capacity, discovery_on, tags, ticketing) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Festival Indie Milano 2024', 'Il più grande festival di musica indie della città. Line-up incredibile con artisti nazionali e internazionali.', NOW() + INTERVAL '10 days', '{"name": "Parco Lambro", "address": "Via Feltre, Milano", "city": "Milano"}', 5000, true, ARRAY['festival', 'indie', 'live', 'outdoor'], '{"price": 45, "currency": "EUR", "early_bird": 35}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Notte Bianca Elettronica', 'Maratona di musica elettronica dalle 22 alle 6. Quattro stage con artisti internazionali.', NOW() + INTERVAL '7 days', '{"name": "Fabbrica del Vapore", "address": "Via Giulio Cesare Procaccini 4, Milano", "city": "Milano"}', 2000, true, ARRAY['elettronica', 'techno', 'house', 'notte bianca'], '{"price": 25, "currency": "EUR", "presale": 20}'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Jazz & Wine Experience', 'Degustazione vini abbinata a concerti jazz di alta qualità. Serata esclusiva e raffinata.', NOW() + INTERVAL '12 days', '{"name": "Villa San Martino", "address": "Via San Martino 8, Milano", "city": "Milano"}', 80, true, ARRAY['jazz', 'wine', 'degustazione', 'esclusivo'], '{"price": 65, "currency": "EUR", "includes": "wine tasting + concert"}');

-- Add some friendship requests to test the system
INSERT INTO public.friendships (user_id, friend_user_id, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'accepted'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'pending'),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'pending'),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'accepted'),
  ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'pending');