import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ImageUploadOptions {
  bucket: 'avatars' | 'galleries';
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function useImageUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Validate file
  const validateFile = (file: File, options: ImageUploadOptions): string | null => {
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024; // Convert to bytes
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return `Il file è troppo grande. Massimo ${options.maxSizeMB || 5}MB consentiti.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `Tipo di file non supportato. Formati consentiti: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    return null;
  };

  // Generate unique filename
  const generateFilename = (originalName: string, userId: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${userId}_${timestamp}_${randomString}.${extension}`;
  };

  // Upload single image
  const uploadImage = useCallback(async (
    file: File, 
    options: ImageUploadOptions
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per caricare immagini",
        variant: "destructive"
      });
      return null;
    }

    // Validate file
    const validationError = validateFile(file, options);
    if (validationError) {
      toast({
        title: "File non valido",
        description: validationError,
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate filename
      const filename = generateFilename(file.name, user.id);
      const folder = options.folder || user.id;
      const filePath = `${folder}/${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      setUploadProgress(100);
      
      toast({
        title: "Upload completato",
        description: "Immagine caricata con successo"
      });

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Errore upload",
        description: error.message || "Errore durante il caricamento dell'immagine",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user, toast]);

  // Upload multiple images
  const uploadImages = useCallback(async (
    files: FileList | File[], 
    options: ImageUploadOptions
  ): Promise<string[]> => {
    const fileArray = Array.from(files);
    const urls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress((i / fileArray.length) * 100);
      
      const url = await uploadImage(file, options);
      if (url) {
        urls.push(url);
      }
    }

    return urls;
  }, [uploadImage]);

  // Delete image
  const deleteImage = useCallback(async (
    url: string, 
    bucket: 'avatars' | 'galleries'
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === bucket);
      if (bucketIndex === -1) {
        throw new Error('Invalid URL format');
      }
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Immagine eliminata",
        description: "L'immagine è stata rimossa con successo"
      });

      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Errore eliminazione",
        description: error.message || "Errore durante l'eliminazione dell'immagine",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Update profile avatar
  const updateAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    const url = await uploadImage(file, {
      bucket: 'avatars',
      folder: user.id,
      maxSizeMB: 2,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (!url) return null;

    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Avatar aggiornato",
        description: "La tua foto profilo è stata aggiornata"
      });

      return url;
    } catch (error: any) {
      console.error('Avatar update error:', error);
      toast({
        title: "Errore aggiornamento",
        description: "Errore nell'aggiornamento dell'avatar",
        variant: "destructive"
      });
      return null;
    }
  }, [user, uploadImage, toast]);

  // Add images to gallery
  const addToGallery = useCallback(async (files: FileList | File[]): Promise<string[]> => {
    if (!user) return [];

    const urls = await uploadImages(files, {
      bucket: 'galleries',
      folder: user.id,
      maxSizeMB: 8,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (urls.length === 0) return [];

    try {
      // Get current gallery
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('gallery')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentGallery = profile.gallery || [];
      const newGallery = [...currentGallery, ...urls];

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ gallery: newGallery })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Foto aggiunte",
        description: `${urls.length} foto aggiunte alla galleria`
      });

      return urls;
    } catch (error: any) {
      console.error('Gallery update error:', error);
      toast({
        title: "Errore galleria",
        description: "Errore nell'aggiornamento della galleria",
        variant: "destructive"
      });
      return [];
    }
  }, [user, uploadImages, toast]);

  return {
    isUploading,
    uploadProgress,
    uploadImage,
    uploadImages,
    deleteImage,
    updateAvatar,
    addToGallery
  };
}