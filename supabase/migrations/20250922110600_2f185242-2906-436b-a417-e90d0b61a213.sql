-- Populate invites table with real data for testing (corrected status values)
DO $$ 
DECLARE
    gabriele_pangallo_id uuid := '3ae32a90-2b0d-4932-9a00-5ee48f1e59c1';
    gabriele_id uuid := 'e5de1a1b-342e-4f61-98ad-9ae52eb4d52b';
    marco_id uuid := '077bb5de-c429-45e6-b7f4-0f9122bba242';
BEGIN
    -- Insert realistic invites between existing users
    
    -- Invite 1: Gabriele Pangallo invites others for aperitivo
    INSERT INTO public.invites (
        title,
        description,
        host_id,
        participants,
        when_at,
        place,
        status,
        invite_count,
        can_be_public,
        location_radius
    ) VALUES (
        'Aperitivo al tramonto',
        'Chi ha voglia di un aperitivo con vista? Sto organizzando un piccolo ritrovo al bar panoramico!',
        gabriele_pangallo_id,
        ARRAY[gabriele_id, marco_id],
        NOW() + INTERVAL '2 hours',
        '{"name": "Bar Panoramico", "coordinates": [12.4964, 41.9028], "address": "Via del Panorama, Roma"}'::jsonb,
        'pending',
        2,
        false,
        5000
    );

    -- Invite 2: Marco invites others for calcetto
    INSERT INTO public.invites (
        title,
        description,
        host_id,
        participants,
        when_at,
        place,
        status,
        invite_count,
        can_be_public,
        location_radius
    ) VALUES (
        'Calcetto domenicale',
        'Partita di calcetto domenica mattina! Mancano ancora 3 persone per completare la squadra.',
        marco_id,
        ARRAY[gabriele_pangallo_id, gabriele_id],
        NOW() + INTERVAL '3 days',
        '{"name": "Campo Sportivo Centrale", "coordinates": [12.4964, 41.9028], "address": "Via dello Sport, Roma"}'::jsonb,
        'pending',
        2,
        false,
        10000
    );

    -- Invite 3: Gabriele invites for cinema
    INSERT INTO public.invites (
        title,
        description,
        host_id,
        participants,
        when_at,
        place,
        status,
        invite_count,
        can_be_public,
        location_radius
    ) VALUES (
        'Cinema stasera?',
        'C''è un film interessante al cinema. Chi si unisce per una serata al cinema?',
        gabriele_id,
        ARRAY[gabriele_pangallo_id],
        NOW() + INTERVAL '4 hours',
        '{"name": "Cinema Multiplex", "coordinates": [12.4964, 41.9028], "address": "Piazza del Cinema, Roma"}'::jsonb,
        'pending',
        1,
        false,
        3000
    );

    -- Invite 4: Already accepted invite for dinner
    INSERT INTO public.invites (
        title,
        description,
        host_id,
        participants,
        when_at,
        place,
        status,
        invite_count,
        can_be_public,
        location_radius,
        response_message
    ) VALUES (
        'Cena tra amici',
        'Cena casalinga da me. Cucino io, voi portate il vino!',
        gabriele_pangallo_id,
        ARRAY[marco_id],
        NOW() + INTERVAL '1 day',
        '{"name": "Casa di Gabriele", "coordinates": [12.4964, 41.9028], "address": "Via dei Sapori, Roma"}'::jsonb,
        'accepted',
        1,
        true,
        2000,
        'Perfetto! Porto il Chianti.'
    );

END $$;