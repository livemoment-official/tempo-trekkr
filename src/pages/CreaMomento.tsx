import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, ChevronLeft, Sparkles, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { useGeolocation } from "@/hooks/useGeolocation";
export default function CreaMomento() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/momento";

  // Get invite parameters from URL
  const inviteUserId = searchParams.get('inviteUserId');
  const inviteUserName = searchParams.get('inviteUserName');
  const isInviteFlow = Boolean(inviteUserId && inviteUserName);
  const {
    toast
  } = useToast();
  const {
    uploadGalleryImage,
    isUploading
  } = useImageUpload();
  const {
    titleSuggestions,
    categorySuggestions,
    generateSuggestions
  } = useAISuggestions();
  const {
    location: userLocation,
    requestLocation
  } = useGeolocation();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Unified Flow States
  const [step, setStep] = useState<'camera' | 'form'>('camera');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Moment Data
  const [momentData, setMomentData] = useState({
    title: "",
    selectedTime: "now" as "now" | "tonight" | "tomorrow" | "custom",
    customDateTime: "",
    location: "",
    selectedCategory: "",
    moodTag: "Spontaneo"
  });

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

    // Auto-set location if available
    if (userLocation) {
      setMomentData(prev => ({
        ...prev,
        location: "Posizione attuale"
      }));
    }

    // Generate AI suggestions
    await generateSuggestions({
      photo: file,
      location: momentData.location
    });

    // Move to form step
    setStep('form');
  }, [userLocation, momentData.location, generateSuggestions]);
  const getDateTime = useCallback((timeOption: string, customDateTime?: string): Date => {
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
  }, []);
  const handleCreateMoment = useCallback(async () => {
    if (!photo || !momentData.title.trim()) {
      toast({
        title: "Errore",
        description: "Foto e titolo sono obbligatori",
        variant: "destructive"
      });
      return;
    }
    try {
      // Get current user
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
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

      // Get location coordinates if needed
      let locationCoordinates;
      if (userLocation) {
        locationCoordinates = {
          lat: userLocation.lat,
          lng: userLocation.lng
        };
      }

      // Prepare moment data
      const when_at = getDateTime(momentData.selectedTime, momentData.customDateTime);
      const momentToCreate = {
        title: momentData.title,
        description: `Creato velocemente${momentData.selectedCategory ? ` • ${momentData.selectedCategory}` : ''}`,
        photos: [photoUrl],
        when_at: when_at.toISOString(),
        place: momentData.location ? {
          name: momentData.location,
          coordinates: locationCoordinates
        } : null,
        age_range_min: 18,
        age_range_max: 65,
        max_participants: null,
        mood_tag: momentData.moodTag,
        tags: momentData.selectedCategory ? [momentData.selectedCategory] : ["Spontaneo"],
        ticketing: {
          enabled: true,
          price: 0,
          currency: "EUR",
          platform_fee_percentage: 5,
          // Fixed 5% Live Moment fee
          organizer_fee_percentage: 0,
          // No organizer fee for moments
          ticketType: "standard"
        },
        host_id: user.id,
        is_public: true
      };

      // Create moment in database
      const {
        data,
        error
      } = await supabase.from('moments').insert([momentToCreate]).select().single();
      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // If this is an invite flow, create the invite
      if (isInviteFlow && inviteUserId && data?.id) {
        try {
          // Create invitation using the correct table structure
          const inviteData = {
            host_id: user.id,
            title: `Invito per: ${momentData.title}`,
            description: `${inviteUserName} sei invitato/a a questo momento!`,
            participants: [inviteUserId],
            invite_count: 1,
            status: 'pending',
            when_at: when_at.toISOString(),
            place: momentData.location ? {
              name: momentData.location,
              coordinates: locationCoordinates
            } : null
          };
          const {
            error: inviteError
          } = await supabase.from('invites').insert([inviteData]);
          if (inviteError) {
            console.error('Invite creation error:', inviteError);
            // Don't throw - moment was created successfully
          }
        } catch (inviteErr) {
          console.error('Failed to create invite:', inviteErr);
          // Don't throw - moment was created successfully  
        }
      }
      toast({
        title: "Momento creato! 🎉",
        description: isInviteFlow ? `Momento creato e invito inviato a ${inviteUserName}!` : "Il tuo momento è stato pubblicato in 30 secondi",
        duration: 4000
      });
      navigate("/");
    } catch (error) {
      console.error('Error creating moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il momento",
        variant: "destructive"
      });
    }
  }, [photo, momentData, userLocation, uploadGalleryImage, getDateTime, toast, navigate]);
  const resetFlow = useCallback(() => {
    setStep('camera');
    setPhoto(null);
    setPhotoPreview(null);
    setMomentData({
      title: "",
      selectedTime: "now",
      customDateTime: "",
      location: "",
      selectedCategory: "",
      moodTag: "Spontaneo"
    });
  }, []);
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea Momento</title>
        <meta name="description" content="Crea un nuovo momento condiviso su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Step 1: Camera */}
      {step === 'camera' && <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Scatta una foto</CardTitle>
            <p className="text-sm text-muted-foreground">Cattura il momento che vuoi condividere</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {photoPreview ? <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" />
                  Cambia foto
                </Button>
              </div> : <div className="border-2 border-dashed border-primary/25 rounded-lg p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                <Button onClick={() => cameraInputRef.current?.click()} className="mb-2">
                  <Camera className="mr-2 h-4 w-4" />
                  Scatta foto
                </Button>
                <p className="text-xs text-muted-foreground">o seleziona dalla galleria</p>
              </div>}
            
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/crea")} className="flex-1">
                Annulla
              </Button>
              {photo && <Button onClick={() => setStep('form')} className="flex-1">
                  Continua
                </Button>}
            </div>
          </CardContent>
        </Card>}

      {/* Step 2: Form */}
      {step === 'form' && <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep('camera')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-center flex-1">
                {isInviteFlow ? "Invita a un Momento" : "Completa i dettagli"}
              </CardTitle>
              <div className="w-8" />
            </div>
            {/* Invite Flow Info */}
            {isInviteFlow && <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Stai invitando {inviteUserName}</p>
                    <p className="text-xs text-muted-foreground">
                      Crea un momento insieme a questa persona
                    </p>
                  </div>
                </div>
              </div>}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Preview */}
            {photoPreview && <div className="relative h-32 rounded-lg overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>}

            {/* Title with AI Suggestions */}
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" value={momentData.title} onChange={e => setMomentData(prev => ({
            ...prev,
            title: e.target.value
          }))} placeholder="Dai un titolo al momento..." className="mt-2" />
              {titleSuggestions.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Suggerimenti AI:
                  </span>
                  {titleSuggestions.slice(0, 3).map((suggestion, index) => <Button key={index} variant="outline" size="sm" className="text-xs h-6" onClick={() => setMomentData(prev => ({
              ...prev,
              title: suggestion
            }))}>
                      {suggestion}
                    </Button>)}
                </div>}
            </div>

            {/* Quick Time Selection */}
            <div>
              <Label>Quando?</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button variant={momentData.selectedTime === "now" ? "default" : "outline"} size="sm" onClick={() => setMomentData(prev => ({
              ...prev,
              selectedTime: "now"
            }))}>
                  Ora
                </Button>
                <Button variant={momentData.selectedTime === "tonight" ? "default" : "outline"} size="sm" onClick={() => setMomentData(prev => ({
              ...prev,
              selectedTime: "tonight"
            }))}>
                  Stasera
                </Button>
                <Button variant={momentData.selectedTime === "tomorrow" ? "default" : "outline"} size="sm" onClick={() => setMomentData(prev => ({
              ...prev,
              selectedTime: "tomorrow"
            }))}>
                  Domani
                </Button>
              </div>
              {momentData.selectedTime === "custom" && <Input type="datetime-local" value={momentData.customDateTime} onChange={e => setMomentData(prev => ({
            ...prev,
            customDateTime: e.target.value
          }))} className="mt-2" />}
            </div>

            {/* Location */}
            <div>
              <Label>Dove?</Label>
              <Input value={momentData.location} onChange={e => setMomentData(prev => ({
            ...prev,
            location: e.target.value
          }))} placeholder={userLocation ? "Posizione attuale" : "Aggiungi luogo..."} className="mt-2" />
            </div>

            {/* Mood Tags */}
            <div>
              <Label>Mood</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Spontaneo", "Relax", "Energia", "Avventura", "Social"].map(mood => <Badge key={mood} variant={momentData.moodTag === mood ? "default" : "outline"} className="cursor-pointer" onClick={() => setMomentData(prev => ({
              ...prev,
              moodTag: mood
            }))}>
                    {mood}
                  </Badge>)}
              </div>
            </div>

            {/* Category Suggestions */}
            {categorySuggestions.length > 0 && <div>
                <Label className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Categorie suggerite
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categorySuggestions.slice(0, 5).map((category, index) => <Badge key={index} variant={momentData.selectedCategory === category ? "default" : "outline"} className="cursor-pointer" onClick={() => setMomentData(prev => ({
              ...prev,
              selectedCategory: category
            }))}>
                      {category}
                    </Badge>)}
                </div>
              </div>}

            {/* Fee Info */}
            

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetFlow} className="flex-1">
                Annulla
              </Button>
              <Button onClick={handleCreateMoment} disabled={!momentData.title.trim() || isUploading} className="flex-1">
                {isUploading ? "Creando..." : "Crea in 30sec"}
              </Button>
            </div>
          </CardContent>
        </Card>}
    </div>;
}