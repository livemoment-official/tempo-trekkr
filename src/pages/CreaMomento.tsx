import { useState } from "react";
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
import { ArrowLeft, Upload, X, MapPin, Calendar as CalendarIcon, Users, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MOMENT_CATEGORIES, MOOD_TAGS } from "@/constants/unifiedTags";
import { TicketingSystem } from "@/components/TicketingSystem";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { supabase } from "@/integrations/supabase/client";
import { QuickCreateMomentModal } from "@/components/create/moment/QuickCreateMomentModal";
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
  const {
    toast
  } = useToast();
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
  const [showQuickCreate, setShowQuickCreate] = useState(false);
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
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea Momento</title>
        <meta name="description" content="Crea un nuovo momento condiviso su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Quick Create Options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button 
          onClick={() => setShowQuickCreate(true)}
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

      {/* Quick Create Modal */}
      <QuickCreateMomentModal 
        open={showQuickCreate}
        onOpenChange={setShowQuickCreate}
        onSuccess={() => {
          setShowQuickCreate(false);
          navigate("/");
        }}
      />
    </div>;
}