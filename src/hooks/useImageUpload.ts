import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UploadOptions {
  bucket: 'avatars' | 'galleries' | 'group-avatars';
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function useImageUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (
    file: File, 
    options: UploadOptions
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per caricare immagini",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024; // Default 5MB
    if (file.size > maxSize) {
      toast({
        title: "File troppo grande",
        description: `Il file deve essere inferiore a ${options.maxSizeMB || 5}MB`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato non supportato",
        description: "Sono supportati solo file JPEG, PNG e WebP",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);
      
      toast({
        title: "Upload completato",
        description: "Immagine caricata con successo",
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore upload",
        description: "Impossibile caricare l'immagine. Riprova.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (
    bucket: string,
    filePath: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Immagine eliminata",
        description: "L'immagine è stata rimossa con successo",
      });

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Errore eliminazione",
        description: "Impossibile eliminare l'immagine",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    return uploadImage(file, {
      bucket: 'avatars',
      folder: user?.id,
      maxSizeMB: 2,
    });
  };

  const uploadGalleryImage = async (file: File): Promise<string | null> => {
    return uploadImage(file, {
      bucket: 'galleries',
      folder: user?.id,
      maxSizeMB: 10,
    });
  };

  const uploadGroupAvatar = async (file: File): Promise<string | null> => {
    return uploadImage(file, {
      bucket: 'group-avatars',
      maxSizeMB: 2,
    });
  };

  return {
    uploadImage,
    deleteImage,
    uploadAvatar,
    uploadGalleryImage,
    uploadGroupAvatar,
    isUploading,
    uploadProgress,
  };
}