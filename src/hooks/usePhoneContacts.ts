import { useState } from 'react';
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MatchedContact {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  phone: string;
}

export function usePhoneContacts() {
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<MatchedContact[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  // Normalize phone number (remove spaces, keep only digits and +)
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\s+/g, '').trim();
  };

  // Hash phone number using SHA-256
  const hashPhone = async (phone: string): Promise<string> => {
    const normalized = normalizePhone(phone);
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Request contacts permission
  const requestPermissions = async (): Promise<boolean> => {
    try {
      // Check if we're on a platform that supports contacts
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: "Funzionalità non disponibile",
          description: "La sincronizzazione contatti è disponibile solo su dispositivi mobili",
          variant: "destructive"
        });
        return false;
      }

      const permission = await Contacts.requestPermissions();
      const granted = permission.contacts === 'granted';
      setHasPermission(granted);

      if (!granted) {
        toast({
          title: "Permesso negato",
          description: "LiveMoment ha bisogno dell'accesso ai contatti per trovare i tuoi amici",
          variant: "destructive"
        });
      }

      return granted;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      toast({
        title: "Errore",
        description: "Impossibile richiedere i permessi per i contatti",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get device contacts and match with LiveMoment users
  const syncContacts = async (): Promise<MatchedContact[]> => {
    setIsLoading(true);
    
    try {
      // Check platform
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: "Funzionalità non disponibile",
          description: "La sincronizzazione contatti è disponibile solo su dispositivi mobili",
          variant: "destructive"
        });
        return [];
      }

      // Request permission if not already granted
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return [];
      }

      // Get device contacts
      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true,
        }
      });

      console.log(`Found ${result.contacts.length} contacts on device`);

      // Extract all phone numbers and hash them
      const phoneHashes: string[] = [];
      for (const contact of result.contacts) {
        if (contact.phones && contact.phones.length > 0) {
          for (const phone of contact.phones) {
            if (phone.number) {
              const hash = await hashPhone(phone.number);
              phoneHashes.push(hash);
            }
          }
        }
      }

      if (phoneHashes.length === 0) {
        toast({
          title: "Nessun contatto trovato",
          description: "Nessun numero di telefono trovato nei tuoi contatti",
        });
        return [];
      }

      console.log(`Hashed ${phoneHashes.length} phone numbers`);

      // Call edge function to match phone hashes with users
      const { data, error } = await supabase.functions.invoke('match-phone-contacts', {
        body: { phoneHashes }
      });

      if (error) {
        console.error('Error matching contacts:', error);
        toast({
          title: "Errore",
          description: "Impossibile trovare i tuoi amici",
          variant: "destructive"
        });
        return [];
      }

      const matchedUsers: MatchedContact[] = data.matches || [];
      setContacts(matchedUsers);

      toast({
        title: "Sincronizzazione completata",
        description: `Trovati ${matchedUsers.length} amici su LiveMoment`,
      });

      return matchedUsers;
    } catch (error) {
      console.error('Error syncing contacts:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la sincronizzazione",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update user's phone hash in profile
  const updatePhoneHash = async (phoneNumber: string): Promise<boolean> => {
    try {
      const hash = await hashPhone(phoneNumber);
      const { error } = await supabase
        .from('profiles')
        .update({ phone_hash: hash })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error updating phone hash:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePhoneHash:', error);
      return false;
    }
  };

  return {
    isLoading,
    contacts,
    hasPermission,
    requestPermissions,
    syncContacts,
    updatePhoneHash,
  };
}
