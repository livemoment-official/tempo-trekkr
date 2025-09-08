import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";

interface QuickMomentData {
  title: string;
  photo: File;
  timeOption: "now" | "tonight" | "tomorrow" | "custom";
  customDateTime?: string;
  location?: string;
  category?: string;
}

export function useQuickCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { uploadGalleryImage } = useImageUpload();
  const navigate = useNavigate();

  const getDateTimeFromOption = (timeOption: string, customDateTime?: string): Date => {
    const now = new Date();
    
    switch (timeOption) {
      case "now":
        return now;
      
      case "tonight":
        const tonight = new Date(now);
        tonight.setHours(20, 0, 0, 0);
        if (tonight <= now) {
          tonight.setDate(tonight.getDate() + 1);
        }
        return tonight;
      
      case "tomorrow":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(19, 0, 0, 0);
        return tomorrow;
      
      case "custom":
        return customDateTime ? new Date(customDateTime) : now;
      
      default:
        return now;
    }
  };

  const createQuickMoment = async (data: QuickMomentData) => {
    setIsCreating(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per creare un momento",
          variant: "destructive"
        });
        return;
      }

      // Upload photo
      const photoUrl = await uploadGalleryImage(data.photo);
      if (!photoUrl) {
        throw new Error("Failed to upload photo");
      }

      // Get location coordinates if needed
      let locationCoordinates;
      if (data.location) {
        try {
          // Use browser geolocation as fallback for quick creation
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 300000 // 5 minutes
            });
          });
          locationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        } catch (error) {
          // Continue without coordinates if geolocation fails
          console.log("Geolocation not available, continuing without coordinates");
        }
      }

      // Prepare moment data
      const when_at = getDateTimeFromOption(data.timeOption, data.customDateTime);
      
      const momentToCreate = {
        title: data.title,
        description: `Creato velocemente tramite Quick Create${data.category ? ` • ${data.category}` : ''}`,
        photos: [photoUrl],
        when_at: when_at.toISOString(),
        place: data.location ? {
          name: data.location,
          coordinates: locationCoordinates
        } : null,
        age_range_min: 18,
        age_range_max: 65,
        max_participants: null,
        mood_tag: "Spontaneo",
        tags: data.category ? [data.category] : ["Spontaneo"],
        ticketing: null,
        host_id: user.id,
        is_public: true
      };

      // Create moment in database
      const { data: moment, error } = await supabase
        .from('moments')
        .insert([momentToCreate])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: "Momento creato! 🎉",
        description: "Il tuo momento è stato pubblicato in 30 secondi",
        duration: 4000
      });

      // Navigate to the created moment or home
      navigate("/");
      
    } catch (error) {
      console.error('Error creating quick moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il momento velocemente",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createQuickMoment,
    isCreating
  };
}