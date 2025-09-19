import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useChatMedia() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadMediaFile = async (
    file: File,
    type: 'image' | 'video' | 'audio'
  ): Promise<{
    url: string;
    fileName: string;
    fileSize: number;
    duration?: number;
  } | null> => {
    if (!user) return null;

    setIsUploading(true);
    try {
      // Validate file type
      const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        video: ['video/mp4', 'video/webm', 'video/quicktime'],
        audio: ['audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/aac']
      };

      if (!allowedTypes[type].includes(file.type)) {
        toast({
          title: "Formato non supportato",
          description: `Formato file non supportato per ${type}`,
          variant: "destructive"
        });
        return null;
      }

      // Check file size limits (adjust as needed)
      const maxSizes = {
        image: 10 * 1024 * 1024, // 10MB
        video: 100 * 1024 * 1024, // 100MB
        audio: 50 * 1024 * 1024 // 50MB
      };

      if (file.size > maxSizes[type]) {
        toast({
          title: "File troppo grande",
          description: `Il file ${type} non può essere più grande di ${Math.round(maxSizes[type] / (1024 * 1024))}MB`,
          variant: "destructive"
        });
        return null;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${user.id}/${type}/${timestamp}.${extension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      let duration: number | undefined;

      // Get duration for audio/video files
      if (type === 'audio' || type === 'video') {
        try {
          duration = await getMediaDuration(file);
        } catch (error) {
          console.warn('Could not get media duration:', error);
        }
      }

      return {
        url: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        duration
      };

    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Errore Upload",
        description: "Errore nel caricamento del file",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadAudioBlob = async (
    audioBlob: Blob,
    duration: number
  ): Promise<{
    url: string;
    fileName: string;
    fileSize: number;
    duration: number;
  } | null> => {
    if (!user) return null;

    setIsUploading(true);
    try {
      // Create file from blob
      const timestamp = Date.now();
      const fileName = `${user.id}/audio/voice_${timestamp}.webm`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, audioBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'audio/webm'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        fileName: `Messaggio vocale ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
        fileSize: audioBlob.size,
        duration
      };

    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Errore Upload",
        description: "Errore nel caricamento dell'audio",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const createPoll = async (
    question: string,
    options: Array<{ text: string; count: number }>
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          question,
          options,
          created_by: user.id,
          allows_multiple: false,
          is_anonymous: false
        })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Errore Sondaggio",
        description: "Errore nella creazione del sondaggio",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    uploadMediaFile,
    uploadAudioBlob,
    createPoll,
    isUploading
  };
}

// Helper function to get media duration
function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    
    if (file.type.startsWith('audio/')) {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      audio.addEventListener('error', reject);
      audio.src = url;
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      });
      video.addEventListener('error', reject);
      video.src = url;
    } else {
      URL.revokeObjectURL(url);
      reject(new Error('Unsupported media type'));
    }
  });
}