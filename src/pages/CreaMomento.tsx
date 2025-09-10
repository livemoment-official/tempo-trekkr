import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Upload, X, MapPin, Calendar as CalendarIcon, Users, Clock, Zap, Camera, ChevronLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MOMENT_CATEGORIES, MOOD_TAGS } from "@/constants/unifiedTags";
import { TicketingSystem } from "@/components/TicketingSystem";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { useGeolocation } from "@/hooks/useGeolocation";
interface MomentData {
  photos: string[];
  title: string;
  description: string;
  location: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  ageRangeMin: number;
  ageRangeMax: number;
  maxParticipants: number | null;
  moodTag: string;
  startDate: Date | undefined;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  ticketing: {
    enabled: boolean;
    price: number;
    currency: string;
    maxTickets?: number;
    ticketType: "standard" | "vip" | "early_bird";
    description?: string;
  };
}
export default function CreaMomento() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/momento";
  const { toast } = useToast();
  const { uploadGalleryImage, isUploading } = useImageUpload();
  const { titleSuggestions, categorySuggestions, generateSuggestions, isGenerating } = useAISuggestions();
  const { location: userLocation, requestLocation } = useGeolocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Quick Create Flow States
  const [quickCreateStep, setQuickCreateStep] = useState<'none' | 'camera' | 'form'>('none');
  const [quickPhoto, setQuickPhoto] = useState<File | null>(null);
  const [quickPhotoPreview, setQuickPhotoPreview] = useState<string | null>(null);

  // Quick Create Data
  const [quickData, setQuickData] = useState({
    title: "",
    selectedTime: "now" as "now" | "tonight" | "tomorrow" | "custom",
    customDateTime: "",
    location: "",
    selectedCategory: "",
    moodTag: "Spontaneo"
  });

  // Advanced Form Data
  const [momentData, setMomentData] = useState<MomentData>({
    photos: [],
    title: "",
    description: "",
    location: "",
    ageRangeMin: 18,
    ageRangeMax: 65,
    maxParticipants: null,
    moodTag: "",
    startDate: undefined,
    startTime: "",
    endDate: undefined,
    endTime: "",
    ticketing: {
      enabled: false,
      price: 0,
      currency: "EUR",
      ticketType: "standard"
    }
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Quick Create Flow Handlers
  const startQuickCreate = useCallback(async () => {
    setQuickCreateStep('camera');
    // Auto-detect location
    try {
      await requestLocation();
    } catch (error) {
      console.log('Geolocation not available');
    }
    
    // Auto-trigger camera
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 100);
  }, [requestLocation]);

  const handleQuickPhotoCapture = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setQuickPhoto(file);
    const preview = URL.createObjectURL(file);
    setQuickPhotoPreview(preview);
    
    // Auto-set location if available
    if (userLocation) {
      setQuickData(prev => ({ ...prev, location: "Posizione attuale" }));
    }
    
    // Generate AI suggestions
    await generateSuggestions({ photo: file, location: quickData.location });
    
    // Move to form step
    setQuickCreateStep('form');
  }, [userLocation, quickData.location, generateSuggestions]);

  const getQuickDateTime = useCallback((timeOption: string, customDateTime?: string): Date => {
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

  const handleQuickCreate = useCallback(async () => {
    if (!quickPhoto || !quickData.title.trim()) {
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
      const photoUrl = await uploadGalleryImage(quickPhoto);
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
      const when_at = getQuickDateTime(quickData.selectedTime, quickData.customDateTime);
      
      const momentToCreate = {
        title: quickData.title,
        description: `Creato velocemente ${quickData.selectedCategory ? ` • ${quickData.selectedCategory}` : ''}`,
        photos: [photoUrl],
        when_at: when_at.toISOString(),
        place: quickData.location ? {
          name: quickData.location,
          coordinates: locationCoordinates
        } : null,
        age_range_min: 18,
        age_range_max: 65,
        max_participants: null,
        mood_tag: quickData.moodTag,
        tags: quickData.selectedCategory ? [quickData.selectedCategory] : ["Spontaneo"],
        ticketing: {
          enabled: true,
          price: 0,
          currency: "EUR",
          platform_fee_percentage: 5, // Fixed 5% Live Moment fee
          organizer_fee_percentage: 0, // No organizer fee for moments
          ticketType: "standard"
        },
        host_id: user.id,
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

      toast({
        title: "Momento creato! 🎉",
        description: "Il tuo momento è stato pubblicato in 30 secondi",
        duration: 4000
      });

      navigate("/");
      
    } catch (error) {
      console.error('Error creating quick moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il momento velocemente",
        variant: "destructive"
      });
    }
  }, [quickPhoto, quickData, userLocation, uploadGalleryImage, getQuickDateTime, toast, navigate]);

  const resetQuickCreate = useCallback(() => {
    setQuickCreateStep('none');
    setQuickPhoto(null);
    setQuickPhotoPreview(null);
    setQuickData({
      title: "",
      selectedTime: "now",
      customDateTime: "",
      location: "",
      selectedCategory: "",
      moodTag: "Spontaneo"
    });
  }, []);

  // Advanced Form Handlers (existing logic)
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const uploadedPhotos = [...momentData.photos];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const photoUrl = URL.createObjectURL(file);
        uploadedPhotos.push(photoUrl);
      }
    }
    setMomentData({
      ...momentData,
      photos: uploadedPhotos
    });
    toast({
      title: "Foto caricate",
      description: `${files.length} foto aggiunte al momento`
    });
  }, [momentData, toast]);
  const removePhoto = (index: number) => {
    const updatedPhotos = momentData.photos.filter((_: any, i: number) => i !== index);
    setMomentData({
      ...momentData,
      photos: updatedPhotos
    });
  };
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  const handlePublish = async () => {
    if (!momentData.title.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo per il momento",
        variant: "destructive"
      });
      return;
    }

    if (!momentData.startDate || !momentData.startTime) {
      toast({
        title: "Errore",
        description: "Inserisci data e ora di inizio",
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

      // Upload photos to storage
      const uploadedPhotos: string[] = [];
      for (const photo of momentData.photos) {
        if (photo.startsWith('blob:')) {
          const response = await fetch(photo);
          const blob = await response.blob();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('galleries')
            .upload(`moments/${user.id}/${fileName}`, blob);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('galleries')
            .getPublicUrl(uploadData.path);
          
          uploadedPhotos.push(publicUrl);
        }
      }

      // Create when_at timestamp from date and time
      const [hours, minutes] = momentData.startTime.split(':').map(Number);
      const when_at = new Date(momentData.startDate);
      when_at.setHours(hours, minutes, 0, 0);

      // Prepare moment data
      const momentToCreate = {
        title: momentData.title,
        description: momentData.description || null,
        photos: uploadedPhotos,
        when_at: when_at.toISOString(),
        place: momentData.location ? {
          name: momentData.location,
          coordinates: momentData.locationCoordinates
        } : null,
        age_range_min: momentData.ageRangeMin,
        age_range_max: momentData.ageRangeMax,
        max_participants: momentData.maxParticipants,
        mood_tag: momentData.moodTag || null,
        tags: selectedTags,
        ticketing: momentData.ticketing.enabled ? momentData.ticketing : null,
        host_id: user.id,
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
        toast({
          title: "Errore",
          description: "Non è stato possibile creare il momento",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Momento creato!",
        description: "Il tuo momento è stato pubblicato con successo"
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
  };
  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea Momento</title>
        <meta name="description" content="Crea un nuovo momento condiviso su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Quick Create Flow - Step 1: Camera */}
      {quickCreateStep === 'camera' && (
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Scatta una foto</CardTitle>
            <p className="text-sm text-muted-foreground">Cattura il momento che vuoi condividere</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickPhotoPreview ? (
              <div className="relative">
                <img src={quickPhotoPreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
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
              onChange={handleQuickPhotoCapture}
            />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetQuickCreate} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Indietro
              </Button>
              {quickPhoto && (
                <Button onClick={() => setQuickCreateStep('form')} className="flex-1">
                  Continua
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Create Flow - Step 2: Form */}
      {quickCreateStep === 'form' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setQuickCreateStep('camera')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-center flex-1">Completa i dettagli</CardTitle>
              <div className="w-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Preview */}
            {quickPhotoPreview && (
              <div className="relative h-32 rounded-lg overflow-hidden">
                <img src={quickPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Title with AI Suggestions */}
            <div>
              <Label htmlFor="quick-title">Titolo *</Label>
              <Input
                id="quick-title"
                value={quickData.title}
                onChange={(e) => setQuickData(prev => ({ ...prev, title: e.target.value }))}
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
                      onClick={() => setQuickData(prev => ({ ...prev, title: suggestion }))}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Time Selection */}
            <div>
              <Label>Quando?</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={quickData.selectedTime === "now" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuickData(prev => ({ ...prev, selectedTime: "now" }))}
                >
                  Ora
                </Button>
                <Button
                  variant={quickData.selectedTime === "tonight" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuickData(prev => ({ ...prev, selectedTime: "tonight" }))}
                >
                  Stasera
                </Button>
                <Button
                  variant={quickData.selectedTime === "tomorrow" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuickData(prev => ({ ...prev, selectedTime: "tomorrow" }))}
                >
                  Domani
                </Button>
              </div>
              {quickData.selectedTime === "custom" && (
                <Input
                  type="datetime-local"
                  value={quickData.customDateTime}
                  onChange={(e) => setQuickData(prev => ({ ...prev, customDateTime: e.target.value }))}
                  className="mt-2"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <Label>Dove?</Label>
              <Input
                value={quickData.location}
                onChange={(e) => setQuickData(prev => ({ ...prev, location: e.target.value }))}
                placeholder={userLocation ? "Posizione attuale" : "Aggiungi luogo..."}
                className="mt-2"
              />
            </div>

            {/* Mood Tags */}
            <div>
              <Label>Mood</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Spontaneo", "Relax", "Energia", "Avventura", "Social"].map(mood => (
                  <Badge
                    key={mood}
                    variant={quickData.moodTag === mood ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setQuickData(prev => ({ ...prev, moodTag: mood }))}
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category Suggestions */}
            {categorySuggestions.length > 0 && (
              <div>
                <Label className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Categorie suggerite
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categorySuggestions.slice(0, 5).map((category, index) => (
                    <Badge
                      key={index}
                      variant={quickData.selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setQuickData(prev => ({ ...prev, selectedCategory: category }))}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Fee Info */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Fee Live Moment</span>
                <span className="font-medium">5%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fee fissa per tutti i momenti (non modificabile)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetQuickCreate} className="flex-1">
                Annulla
              </Button>
              <Button 
                onClick={handleQuickCreate} 
                disabled={!quickData.title.trim() || isUploading}
                className="flex-1"
              >
                {isUploading ? "Creando..." : "Crea in 30sec"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode Selection & Advanced Form */}
      {quickCreateStep === 'none' && (
        <>
          {/* Quick Create Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button 
              onClick={startQuickCreate}
              className="h-16 gradient-brand shadow-brand hover-scale text-left"
              size="lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">Creazione Veloce</div>
                  <div className="text-xs opacity-90">30 secondi</div>
                </div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 hover-scale text-left"
              size="lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Modalità Avanzata</div>
                  <div className="text-xs text-muted-foreground">Controllo completo</div>
                </div>
              </div>
            </Button>
          </div>

      <Card>
        
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div>
            <Label className="text-base font-medium">Aggiungi foto</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 mt-2">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <div className="mt-2">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Seleziona foto
                      </span>
                    </Button>
                  </Label>
                  <Input id="photo-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileUpload} />
                </div>
              </div>
            </div>

            {momentData.photos.length > 0 && <div className="grid grid-cols-3 gap-2 mt-4">
                {momentData.photos.map((photo: string, index: number) => <div key={index} className="relative group">
                    <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    <Button variant="destructive" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePhoto(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>)}
              </div>}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-medium">
              Titolo *
            </Label>
            <Input id="title" value={momentData.title} onChange={e => setMomentData({
            ...momentData,
            title: e.target.value
          })} placeholder="Dai un titolo al tuo momento..." className="mt-2" required />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-medium">
              Descrizione
            </Label>
            <Textarea id="description" value={momentData.description} onChange={e => setMomentData({
            ...momentData,
            description: e.target.value
          })} placeholder="Racconta qualcosa in più..." className="mt-2" rows={3} />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-base font-medium">
              Dove
            </Label>
            <div className="mt-2">
              <LocationSearchInput value={momentData.location} onChange={(value, coordinates) => setMomentData({
              ...momentData,
              location: value,
              locationCoordinates: coordinates
            })} placeholder="Cerca un luogo... (es. Bar Central, Milano)" />
            </div>
          </div>

          {/* Data e ora di inizio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Data di inizio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !momentData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {momentData.startDate ? format(momentData.startDate, "PPP") : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={momentData.startDate}
                    onSelect={(date) => setMomentData({ ...momentData, startDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="startTime" className="text-base font-medium">Ora di inizio *</Label>
              <div className="relative mt-2">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={momentData.startTime}
                  onChange={(e) => setMomentData({ ...momentData, startTime: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Data e ora di fine (opzionale) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Data di fine (opzionale)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !momentData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {momentData.endDate ? format(momentData.endDate, "PPP") : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={momentData.endDate}
                    onSelect={(date) => setMomentData({ ...momentData, endDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="endTime" className="text-base font-medium">Ora di fine (opzionale)</Label>
              <div className="relative mt-2">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={momentData.endTime}
                  onChange={(e) => setMomentData({ ...momentData, endTime: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Range di età */}
          <div>
            <Label className="text-base font-medium">Range di età preferibile</Label>
            <div className="mt-3 space-y-4">
              <div className="px-3">
                <Slider value={[momentData.ageRangeMin, momentData.ageRangeMax]} onValueChange={values => setMomentData({
                ...momentData,
                ageRangeMin: values[0],
                ageRangeMax: values[1]
              })} min={16} max={80} step={1} className="w-full" />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{momentData.ageRangeMin} anni</span>
                <span>{momentData.ageRangeMax} anni</span>
              </div>
            </div>
          </div>

          {/* Numero massimo partecipanti */}
          <div>
            <Label htmlFor="maxParticipants" className="text-base font-medium">
              Numero massimo partecipanti
            </Label>
            <div className="relative mt-2">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="maxParticipants" type="number" min="1" max="1000" value={momentData.maxParticipants || ""} onChange={e => setMomentData({
              ...momentData,
              maxParticipants: e.target.value ? parseInt(e.target.value) : null
            })} placeholder="Illimitati" className="pl-10" />
            </div>
          </div>

          {/* Mood Tag */}
          <div>
            <Label className="text-base font-medium">Mood dell'evento</Label>
            <Select value={momentData.moodTag} onValueChange={value => setMomentData({
            ...momentData,
            moodTag: value
          })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Seleziona il mood..." />
              </SelectTrigger>
              <SelectContent>
                {MOOD_TAGS.map(mood => <SelectItem key={mood} value={mood}>
                    {mood}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Sistema Ticketing */}
          <TicketingSystem data={momentData.ticketing} onChange={ticketing => setMomentData({
          ...momentData,
          ticketing
        })} maxParticipants={momentData.maxParticipants || undefined} />

          {/* Tags */}
          <div>
            <Label className="text-base font-medium">Categorie</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOMENT_CATEGORIES.map(tag => <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => handleTagToggle(tag)}>
                  {tag}
                </Badge>)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate("/crea")} className="flex-1">
              Annulla
            </Button>
            <Button onClick={handlePublish} disabled={!momentData.title.trim() || !momentData.startDate || !momentData.startTime} className="flex-1">
              Pubblica
            </Button>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}