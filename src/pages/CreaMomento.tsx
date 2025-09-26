import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Camera, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import InstagramCameraInterface from "@/components/create/moment/InstagramCameraInterface";
import { EnhancedLocationSearch } from "@/components/location/EnhancedLocationSearch";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";
import { useReverseGeocoding } from "@/hooks/useReverseGeocoding";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
interface MomentData {
  title: string;
  description: string;
  photos: string[];
  tags: string[];
  mood_tag: string;
  when_at: Date | null;
  end_at: Date | null;
  place: any;
  is_public: boolean;
  max_participants?: number;
}
const popularCategories = ["Aperitivo", "Cena", "Caffè", "Sport", "Arte", "Musica", "Cinema", "Teatro", "Shopping", "Natura", "Fotografia", "Viaggio"];
export default function CreaMomento() {
  const [step, setStep] = useState<'camera' | 'form' | 'preview'>('camera');
  const [momentData, setMomentData] = useState<MomentData>({
    title: '',
    description: '',
    photos: [],
    tags: [],
    mood_tag: '',
    when_at: null,
    end_at: null,
    place: null,
    is_public: true,
    max_participants: 8
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isUploading, setIsUploading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if creating from invite
  const inviteId = searchParams.get('fromInvite');
  const {
    location,
    requestLocation,
    isLoading: locationLoading
  } = useUnifiedGeolocation();
  const {
    reverseGeocode
  } = useReverseGeocoding();
  const {
    uploadGalleryImage
  } = useImageUpload();
  const {
    titleSuggestions,
    generateSuggestions,
    isGenerating
  } = useAISuggestions();

  // Fetch invite data if creating from invite
  const {
    data: invite
  } = useQuery({
    queryKey: ['invite', inviteId],
    queryFn: async () => {
      if (!inviteId) return null;
      const {
        data,
        error
      } = await supabase.from('invites').select('*').eq('id', inviteId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!inviteId
  });

  // Auto-set location on mount
  useEffect(() => {
    if (!location && !locationLoading) {
      requestLocation();
    }
  }, [location, locationLoading, requestLocation]);

  // Pre-populate data when invite loads
  useEffect(() => {
    if (invite) {
      const place = invite.place as any;
      setMomentData(prev => ({
        ...prev,
        title: invite.title || '',
        description: invite.description || '',
        place: place ? {
          lat: place.lat || place.coordinates?.lat,
          lng: place.lng || place.coordinates?.lng,
          name: place.name || '',
          address: place.address || place.formatted_address || ''
        } : null
      }));

      // Set date if available
      if (invite.when_at) {
        const inviteDate = new Date(invite.when_at);
        setStartDate(inviteDate);
        setStartTime(format(inviteDate, 'HH:mm'));

        // Set end date 4 hours later
        const endDate = new Date(inviteDate.getTime() + 4 * 60 * 60 * 1000);
        setEndDate(endDate);
        setEndTime(format(endDate, 'HH:mm'));
      }
    }
  }, [invite]);

  // Auto-fill location when available
  useEffect(() => {
    if (location && !momentData.place) {
      reverseGeocode(location.lat, location.lng).then(result => {
        if (result) {
          setMomentData(prev => ({
            ...prev,
            place: {
              lat: location.lat,
              lng: location.lng,
              name: result.formatted_address,
              address: result.formatted_address
            }
          }));

          // Generate suggestions based on location
          generateSuggestions({
            location: result.formatted_address
          });
        }
      });
    }
  }, [location, momentData.place, reverseGeocode, generateSuggestions]);

  // Auto-calculate end time when start time changes
  useEffect(() => {
    if (startDate && startTime && !endDate && !endTime) {
      const startDateTime = new Date(startDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Add 4 hours
      const endDateTime = new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000);
      setEndDate(endDateTime);
      setEndTime(format(endDateTime, 'HH:mm'));
      setMomentData(prev => ({
        ...prev,
        when_at: startDateTime,
        end_at: endDateTime
      }));
    }
  }, [startDate, startTime, endDate, endTime]);
  const handlePhotoCapture = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      const photoUrl = await uploadGalleryImage(file);
      if (photoUrl) {
        setMomentData(prev => ({
          ...prev,
          photos: [photoUrl]
        }));
        setStep('form');
        toast({
          title: "Foto caricata",
          description: "La tua foto è stata caricata con successo!"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Errore upload",
        description: "Errore durante il caricamento della foto",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadGalleryImage, toast]);
  const handleLocationSelect = useCallback((locationData: any) => {
    setMomentData(prev => ({
      ...prev,
      place: locationData
    }));
  }, []);
  const handleDateTimeChange = useCallback(() => {
    if (startDate && startTime) {
      const startDateTime = new Date(startDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      let endDateTime = null;
      if (endDate && endTime) {
        endDateTime = new Date(endDate);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, 0, 0);
      }
      setMomentData(prev => ({
        ...prev,
        when_at: startDateTime,
        end_at: endDateTime
      }));
    }
  }, [startDate, startTime, endDate, endTime]);
  const handleQuickTimeSelect = useCallback((type: 'tonight' | 'tomorrow' | 'weekend') => {
    const now = new Date();
    let date: Date;
    let startTimeStr: string;
    let endTimeStr: string;
    switch (type) {
      case 'tonight':
        date = new Date();
        startTimeStr = '19:00';
        endTimeStr = '23:00';
        break;
      case 'tomorrow':
        date = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        startTimeStr = '12:00';
        endTimeStr = '16:00';
        break;
      case 'weekend':
        // Next Saturday
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
        date = new Date(now.getTime() + (daysUntilSaturday || 7) * 24 * 60 * 60 * 1000);
        startTimeStr = '15:00';
        endTimeStr = '19:00';
        break;
    }
    setStartDate(date);
    setEndDate(date);
    setStartTime(startTimeStr);
    setEndTime(endTimeStr);
  }, []);
  const handleAddTag = useCallback((tag: string) => {
    if (tag && !momentData.tags.includes(tag)) {
      setMomentData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  }, [momentData.tags]);
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setMomentData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  }, []);
  useEffect(() => {
    handleDateTimeChange();
  }, [handleDateTimeChange]);
  const handleCreateMoment = useCallback(async () => {
    if (!momentData.title.trim()) {
      toast({
        title: "Titolo richiesto",
        description: "Inserisci un titolo per il momento",
        variant: "destructive"
      });
      return;
    }
    if (!momentData.when_at || !momentData.end_at) {
      toast({
        title: "Data e ora richieste",
        description: "Inserisci data di inizio e fine del momento",
        variant: "destructive"
      });
      return;
    }
    if (momentData.end_at <= momentData.when_at) {
      toast({
        title: "Data fine non valida",
        description: "La data di fine deve essere successiva a quella di inizio",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsUploading(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const momentToCreate = {
        title: momentData.title,
        description: momentData.description,
        photos: momentData.photos,
        tags: momentData.tags,
        mood_tag: momentData.mood_tag,
        when_at: momentData.when_at.toISOString(),
        end_at: momentData.end_at.toISOString(),
        place: momentData.place,
        is_public: momentData.is_public,
        max_participants: momentData.max_participants,
        host_id: user.id,
        participants: [user.id]
      };
      const {
        data: newMoment,
        error
      } = await supabase.from('moments').insert([momentToCreate]).select().single();
      if (error) throw error;

      // If created from invite, update the invite status
      if (inviteId && invite) {
        await supabase.from('invites').update({
          can_be_public: true,
          status: 'accepted'
        }).eq('id', inviteId);
      }
      toast({
        title: inviteId ? "Momento creato da invito! 🎉" : "Momento creato!",
        description: inviteId ? "L'invito è stato trasformato in un momento pubblico" : "Il tuo momento è stato pubblicato con successo"
      });
      navigate(`/moment/${newMoment.id}`);
    } catch (error) {
      console.error('Create moment error:', error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione del momento",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [momentData, toast, navigate]);
  if (step === 'camera') {
    return <>
        <Helmet>
          <title>Crea Nuovo Momento | LiveMoment</title>
          <meta name="description" content="Crea e condividi un nuovo momento speciale con la community LiveMoment" />
        </Helmet>
        <InstagramCameraInterface onPhotoCapture={handlePhotoCapture} onCancel={() => navigate(-1)} />
      </>;
  }
  if (step === 'form') {
    return <div className="min-h-screen bg-background">
        <Helmet>
          <title>Dettagli Momento | LiveMoment</title>
          <meta name="description" content="Aggiungi dettagli al tuo momento" />
        </Helmet>
        
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Crea il momento</h1>
              {inviteId && <Badge variant="secondary" className="text-xs">
                  Da invito: {invite?.title}
                </Badge>}
            </div>
            
            <Button onClick={handleCreateMoment} disabled={isUploading || !momentData.title.trim()} size="sm">
              {isUploading ? "Creando..." : "Pubblica"}
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Photo Preview */}
          {momentData.photos.length > 0 && <div className="space-y-2">
              <Label>Anteprima</Label>
              <div className="aspect-[1080/1350] max-w-sm mx-auto rounded-lg overflow-hidden bg-muted">
                <img src={momentData.photos[0]} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>}

          {/* Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-semibold">Cosa stai facendo? *</Label>
            <Input id="title" value={momentData.title} onChange={e => setMomentData(prev => ({
            ...prev,
            title: e.target.value
          }))} placeholder="Scrivi il titolo del momento..." />
            
            {/* Title Suggestions */}
            {titleSuggestions.length > 0 && <div className="space-y-2">
                
                <div className="flex flex-wrap gap-2">
                  {titleSuggestions.map(suggestion => <Badge key={suggestion} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setMomentData(prev => ({
                ...prev,
                title: suggestion
              }))}>
                      {suggestion}
                    </Badge>)}
                </div>
              </div>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">Aggiungi una descrizione</Label>
            <Textarea id="description" value={momentData.description} onChange={e => setMomentData(prev => ({
            ...prev,
            description: e.target.value
          }))} placeholder="Racconta qualcosa in più..." rows={3} className="text-sm" />
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Massimo partecipanti</Label>
            <Input id="maxParticipants" type="number" min="2" max="50" value={momentData.max_participants || 8} onChange={e => setMomentData(prev => ({
            ...prev,
            max_participants: parseInt(e.target.value) || 8
          }))} className="w-24" />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categorie</Label>
            <div className="flex flex-wrap gap-2">
              {popularCategories.map(category => <Badge key={category} variant={momentData.tags.includes(category) ? "default" : "outline"} className="cursor-pointer" onClick={() => handleAddTag(category)}>
                  {category}
                </Badge>)}
            </div>
            
            {/* Selected Categories */}
            {momentData.tags.length > 0 && <div className="flex flex-wrap gap-2">
                {momentData.tags.map(tag => <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>)}
              </div>}
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <Label>Data e orari *</Label>
            
            {/* Quick Time Buttons */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => handleQuickTimeSelect('tonight')}>
                Stasera
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleQuickTimeSelect('tomorrow')}>
                Domani
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleQuickTimeSelect('weekend')}>
                Nel weekend
              </Button>
            </div>
            
            {/* Start Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy", {
                    locale: it
                  }) : "Data inizio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="pl-10" />
              </div>
            </div>

            {/* End Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy", {
                    locale: it
                  }) : "Data fine"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="pl-10" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>
              <MapPin className="inline h-4 w-4 mr-1" />
              Posizione
            </Label>
            <EnhancedLocationSearch onLocationSelect={handleLocationSelect} placeholder="Dove ti trovi?" />
          </div>
        </div>
      </div>;
  }
  return null;
}