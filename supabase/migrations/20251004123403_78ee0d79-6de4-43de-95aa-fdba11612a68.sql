-- FASE 4: Sistema Notifiche per Messaggi Gruppi

-- Funzione per creare notifiche quando arriva un messaggio di gruppo
CREATE OR REPLACE FUNCTION public.create_group_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  group_data RECORD;
  participant_id UUID;
BEGIN
  -- Ottieni informazioni sul gruppo
  SELECT title, participants INTO group_data
  FROM groups
  WHERE id = NEW.group_id;
  
  -- Crea una notifica per ogni partecipante (tranne il mittente)
  FOREACH participant_id IN ARRAY group_data.participants
  LOOP
    IF participant_id != NEW.sender_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, data, read)
      VALUES (
        participant_id,
        'group_message',
        'Nuovo messaggio in ' || group_data.title,
        'Hai un nuovo messaggio nel gruppo',
        jsonb_build_object(
          'group_id', NEW.group_id,
          'message_id', NEW.id,
          'sender_id', NEW.sender_id
        ),
        false
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger per attivare le notifiche sui nuovi messaggi di gruppo
DROP TRIGGER IF EXISTS on_group_message_sent ON public.group_messages;
CREATE TRIGGER on_group_message_sent
  AFTER INSERT ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_group_message_notification();

-- Aggiungi politiche RLS per le notifiche di gruppo (se non esistono già)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'System can create group notifications'
  ) THEN
    CREATE POLICY "System can create group notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (type = 'group_message');
  END IF;
END $$;