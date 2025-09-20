import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from './useImageUpload';
import { useToast } from './use-toast';

export function useProfileAvatar() {
  const { user } = useAuth();
  const { uploadAvatar, isUploading } = useImageUpload();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current avatar from profiles table
  const fetchAvatar = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setAvatarUrl(data?.avatar_url || null);
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };

  // Update avatar in both profiles table and auth metadata
  const updateAvatar = async (file: File): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non autenticato",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Upload to storage
      const newAvatarUrl = await uploadAvatar(file);
      if (!newAvatarUrl) {
        throw new Error('Upload fallito');
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl }
      });

      if (authError) throw authError;

      // Update local state
      setAvatarUrl(newAvatarUrl);

      toast({
        title: "Successo",
        description: "Avatar aggiornato con successo"
      });

      return true;
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'avatar",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, [user]);

  return {
    avatarUrl,
    updateAvatar,
    isLoading: isLoading || isUploading,
    fetchAvatar
  };
}