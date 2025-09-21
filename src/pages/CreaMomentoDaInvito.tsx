import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, ChevronLeft, Sparkles, Heart, Eye, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/contexts/AuthContext";
import MomentPreviewModal from "@/components/create/moment/MomentPreviewModal";
import { EnhancedLocationSearch } from "@/components/location/EnhancedLocationSearch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function CreaMomentoDaInvito() {
  const location = useLocation();
  const navigate = useNavigate();
  const { inviteId } = useParams<{ inviteId: string }>();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/momento-da-invito";
  const { user } = useAuth();

  const { toast } = useToast();
  const { uploadGalleryImage, isUploading } = useImageUpload();
  const { titleSuggestions, categorySuggestions, generateSuggestions } = useAISuggestions();
  const { location: userLocation, requestLocation } = useGeolocation();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Unified Flow States
  const [step, setStep] = useState<'camera' | 'form'>('camera');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch invite data
  const { data: invite, isLoading: inviteLoading } = useQuery({
    queryKey: ['invite', inviteId],
    queryFn: async () => {
      if (!inviteId) throw new Error('No invite ID provided');
      
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!inviteId,
  });

  // Moment Data - Pre-populated from invite
  const [momentData, setMomentData] = useState({
    title: "",
    description: "",
    selectedTime: "now" as "now" | "tonight" | "tomorrow" | "custom",
    customDateTime: "",
    customDate: null as Date | null,
    location: null as { name: string; address?: string; coordinates: { lat: number; lng: number } } | null,
    selectedCategory: "",
    moodTag: "Spontaneo",
    maxParticipants: 10
  });

  // Pre-populate data when invite loads
  useEffect(() => {
    if (invite) {
      const place = invite.place as any; // Cast from Json type
      setMomentData(prev => ({
        ...prev,
        title: invite.title || "",
        description: invite.description || "",
        location: place ? {
          name: place.name || "",
          address: place.address || "",
          coordinates: place.coordinates || null
        } : null,
        customDate: invite.when_at ? new Date(invite.when_at) : null,
        selectedTime: invite.when_at ? "custom" : "now"
      }));
    }
  }, [invite]);

  // Auto-start camera and location on mount
  useEffect(() => {
    // Auto-detect location
    requestLocation().catch(() => console.log('Geolocation not available'));

    // Auto-trigger camera
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 500);
  }, [requestLocation]);

  const handlePhotoCapture = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);

    // Auto-set location if available and not already set
    if (userLocation && !momentData.location) {
      setMomentData(prev => ({
        ...prev,
        location: {
          name: "La tua posizione",
          address: "Posizione corrente",
          coordinates: {
            lat: userLocation.lat,
            lng: userLocation.lng
          }
        }
      }));
    }

    // Generate AI suggestions
    await generateSuggestions({
      photo: file,
      location: momentData.location?.name || momentData.location?.address || ""
    });

    // Move to form step
    setStep('form');
  }, [userLocation, momentData.location, generateSuggestions]);

  const getDateTime = useCallback((timeOption: string, customDateTime?: string, customDate?: Date | null): Date => {
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
        if (customDate && customDateTime) {
          const [hours, minutes] = customDateTime.split(':');
          const result = new Date(customDate);
          result.setHours(parseInt(hours) || 19, parseInt(minutes) || 0, 0, 0);
          return result;
        }
        return customDateTime ? new Date(customDateTime) : customDate || now;
      default:
        return now;
    }
  }, []);

  const handleCreateMoment = useCallback(async () => {
    if (!photo || !momentData.title.trim() || !invite) {
      toast({
        title: "Errore",
        description: "Foto e titolo sono obbligatori",
        variant: "destructive"
      });
      return;
    }

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
      const photoUrl = await uploadGalleryImage(photo);
      if (!photoUrl) {
        throw new Error("Failed to upload photo");
      }

      // Get location coordinates from selected location
      let locationCoordinates;
      const location = momentData.location;
      if (location?.coordinates) {
        locationCoordinates = location.coordinates;
      } else if (userLocation) {
        locationCoordinates = {
          lat: userLocation.lat,
          lng: userLocation.lng
        };
      }

      // Prepare moment data
      const when_at = getDateTime(momentData.selectedTime, momentData.customDateTime, momentData.customDate);
      const momentToCreate = {
        title: momentData.title,
        description: momentData.description || `Trasformato da invito • ${momentData.selectedCategory || 'Spontaneo'}`,
        photos: [photoUrl],
        when_at: when_at.toISOString(),
        place: location ? {
          name: location.name || '',
          address: location.address,
          coordinates: locationCoordinates
        } : null,
        age_range_min: 18,
        age_range_max: 65,
        max_participants: momentData.maxParticipants || null,
        mood_tag: momentData.moodTag,
        tags: momentData.selectedCategory ? [momentData.selectedCategory] : ["Spontaneo"],
        ticketing: {
          enabled: true,
          price: 0,
          currency: "EUR",
          platform_fee_percentage: 5,
          organizer_fee_percentage: 0,
          ticketType: "standard"
        },
        host_id: user.id,
        participants: invite.participants || [],
        is_public: true
      };

      // Create moment in database
      const { data, error } = await supabase
        .from('moments')
        .insert([momentToCreate])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Update the original invite status to indicate it was transformed
      await supabase
        .from('invites')
        .update({ 
          can_be_public: true,
          status: 'accepted'
        })
        .eq('id', inviteId);

      toast({
        title: "Momento creato! 🎉",
        description: "L'invito è stato trasformato in un momento pubblico",
        duration: 4000
      });
      
      // Redirect to the created moment
      setTimeout(() => {
        navigate(`/moment/${data.id}`);
      }, 1500);

    } catch (error) {
      console.error('Error creating moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il momento",
        variant: "destructive"
      });
    }
  }, [photo, momentData, userLocation, uploadGalleryImage, getDateTime, toast, navigate, invite, inviteId]);

  const resetFlow = useCallback(() => {
    setStep('camera');
    setPhoto(null);
    setPhotoPreview(null);
  }, []);

  if (inviteLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Caricamento invito...</p>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Invito non trovato</p>
          <Button onClick={() => navigate('/inviti')} className="mt-4">
            Torna agli inviti
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea Momento da Invito</title>
        <meta name="description" content="Trasforma un invito in un momento pubblico condiviso." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/inviti')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Creaci il Momento</h1>
          <p className="text-sm text-muted-foreground">Da: {invite.title}</p>
        </div>
      </div>

      {/* Step 1: Camera */}
      {step === 'camera' && (
        <Card>
          <CardContent className="space-y-4">
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2" 
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Cambia foto
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-primary/25 rounded-lg p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                <Button onClick={() => cameraInputRef.current?.click()} className="mb-2">
                  <Camera className="mr-2 h-4 w-4" />
                  Scatta foto
                </Button>
                <p className="text-xs text-muted-foreground">o seleziona dalla galleria</p>
              </div>
            )}
            
            <input 
              ref={cameraInputRef} 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handlePhotoCapture} 
            />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/inviti")} className="flex-1">
                Annulla
              </Button>
              {photo && (
                <Button onClick={() => setStep('form')} className="flex-1">
                  Continua
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Form */}
      {step === 'form' && (
        <Card>
          <CardContent className="space-y-4">
            {/* Photo Preview */}
            {photoPreview && (
              <div className="relative h-32 rounded-lg overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Title with AI Suggestions */}
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input 
                id="title" 
                value={momentData.title} 
                onChange={e => setMomentData(prev => ({...prev, title: e.target.value}))} 
                placeholder="Dai un titolo al momento..." 
                className="mt-2" 
              />
              {titleSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Suggerimenti AI:
                  </span>
                  {titleSuggestions.slice(0, 3).map((suggestion, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-6" 
                      onClick={() => setMomentData(prev => ({...prev, title: suggestion}))}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Input 
                id="description" 
                value={momentData.description} 
                onChange={e => setMomentData(prev => ({...prev, description: e.target.value}))} 
                placeholder="Racconta qualcosa in più..." 
                className="mt-2" 
              />
            </div>

            {/* Max Participants */}
            <div>
              <Label htmlFor="maxParticipants">Max Partecipanti</Label>
              <Input 
                id="maxParticipants" 
                type="number" 
                min="2" 
                max="50" 
                value={momentData.maxParticipants} 
                onChange={e => setMomentData(prev => ({...prev, maxParticipants: parseInt(e.target.value) || 10}))} 
                className="mt-2" 
              />
            </div>

            {/* Quick Time Selection */}
            <div>
              <Label>Quando?</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <Button 
                  variant={momentData.selectedTime === "now" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setMomentData(prev => ({...prev, selectedTime: "now"}))}
                >
                  Ora
                </Button>
                <Button 
                  variant={momentData.selectedTime === "tonight" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setMomentData(prev => ({...prev, selectedTime: "tonight"}))}
                >
                  Stasera
                </Button>
                <Button 
                  variant={momentData.selectedTime === "tomorrow" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setMomentData(prev => ({...prev, selectedTime: "tomorrow"}))}
                >
                  Domani
                </Button>
                <Button 
                  variant={momentData.selectedTime === "custom" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setMomentData(prev => ({...prev, selectedTime: "custom"}))}
                >
                  Altro
                </Button>
              </div>
              {momentData.selectedTime === "custom" && (
                <div className="mt-2 space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !momentData.customDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {momentData.customDate ? format(momentData.customDate, "PPP") : "Seleziona data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={momentData.customDate || undefined}
                        onSelect={(date) => setMomentData(prev => ({...prev, customDate: date || null}))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input 
                    type="time" 
                    value={momentData.customDateTime} 
                    onChange={e => setMomentData(prev => ({...prev, customDateTime: e.target.value}))} 
                    placeholder="Seleziona orario"
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <Label>Dove?</Label>
              <EnhancedLocationSearch
                onLocationSelect={(selectedLocation) => 
                  setMomentData(prev => ({
                    ...prev,
                    location: {
                      name: selectedLocation.name,
                      address: selectedLocation.address,
                      coordinates: {
                        lat: selectedLocation.lat,
                        lng: selectedLocation.lng
                      }
                    }
                  }))
                }
                placeholder={momentData.location?.name || "Cerca un luogo..."}
                value={momentData.location?.name || ""}
                className="mt-2"
              />
            </div>

            {/* Mood Tags */}
            <div>
              <Label>Mood</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Spontaneo", "Relax", "Avventura", "Cultura", "Sport", "Food"].map((mood) => (
                  <Button
                    key={mood}
                    variant={momentData.moodTag === mood ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMomentData(prev => ({...prev, moodTag: mood}))}
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetFlow}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
              <Button onClick={() => setShowPreview(true)} variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Anteprima
              </Button>
              <Button 
                onClick={handleCreateMoment} 
                disabled={isUploading || !photo || !momentData.title.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Crea Momento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && photoPreview && (
        <MomentPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          momentData={momentData}
          photoPreview={photoPreview}
          userProfile={user ? {
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utente',
            avatar_url: user.user_metadata?.avatar_url
          } : undefined}
          onConfirm={handleCreateMoment}
          isCreating={isUploading}
        />
      )}
    </div>
  );
}