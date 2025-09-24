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
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
}

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
    is_public: true
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { location, requestLocation, isLoading: locationLoading } = useUnifiedGeolocation();
  const { reverseGeocode } = useReverseGeocoding();
  const { uploadGalleryImage } = useImageUpload();

  // Auto-set location on mount
  useEffect(() => {
    if (!location && !locationLoading) {
      requestLocation();
    }
  }, [location, locationLoading, requestLocation]);

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
        }
      });
    }
  }, [location, momentData.place, reverseGeocode]);

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
      
      const { data: { user } } = await supabase.auth.getUser();
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
        host_id: user.id,
        participants: [user.id]
      };

      const { data: newMoment, error } = await supabase
        .from('moments')
        .insert([momentToCreate])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Momento creato!",
        description: "Il tuo momento è stato pubblicato con successo"
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
    return (
      <>
        <Helmet>
          <title>Crea Nuovo Momento | LiveMoment</title>
          <meta name="description" content="Crea e condividi un nuovo momento speciale con la community LiveMoment" />
        </Helmet>
        <InstagramCameraInterface
          onPhotoCapture={handlePhotoCapture}
          onCancel={() => navigate(-1)}
        />
      </>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Dettagli Momento | LiveMoment</title>
          <meta name="description" content="Aggiungi dettagli al tuo momento" />
        </Helmet>
        
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('camera')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
            <h1 className="font-semibold">Nuovo Momento</h1>
            <Button
              onClick={handleCreateMoment}
              disabled={isUploading || !momentData.title.trim()}
              size="sm"
            >
              {isUploading ? "Creando..." : "Pubblica"}
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Photo Preview */}
          {momentData.photos.length > 0 && (
            <div className="space-y-2">
              <Label>Anteprima</Label>
              <div className="aspect-[1080/1350] max-w-sm mx-auto rounded-lg overflow-hidden bg-muted">
                <img 
                  src={momentData.photos[0]} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titolo del momento *</Label>
            <Input
              id="title"
              value={momentData.title}
              onChange={(e) => setMomentData(prev => ({...prev, title: e.target.value}))}
              placeholder="Cosa stai facendo?"
              className="text-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={momentData.description}
              onChange={(e) => setMomentData(prev => ({...prev, description: e.target.value}))}
              placeholder="Aggiungi una descrizione..."
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <Label>Data e orari *</Label>
            
            {/* Start Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy", { locale: it }) : "Data inizio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* End Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy", { locale: it }) : "Data fine"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>
              <MapPin className="inline h-4 w-4 mr-1" />
              Posizione
            </Label>
            <EnhancedLocationSearch
              onLocationSelect={handleLocationSelect}
              placeholder="Dove ti trovi?"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}