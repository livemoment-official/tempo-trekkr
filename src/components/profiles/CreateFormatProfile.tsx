import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Plus, X, Upload, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";

const formatSchema = z.object({
  // Step 1
  name: z.string().min(1, "Nome obbligatorio"),
  category: z.string().min(1, "Categoria obbligatoria"),
  social_link: z.string().url("Link non valido").min(1, "Link obbligatorio"),
  representative_image: z.string().min(1, "Immagine obbligatoria"),
  support_gallery: z.array(z.string()).optional(),
  logo_url: z.string().optional(),
  description: z.string().min(10, "Descrizione troppo breve (min 10 caratteri)"),
  
  // Step 2
  activities: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  avg_participants: z.number().min(1, "Numero partecipanti obbligatorio"),
  avg_cost_per_participant: z.number().min(0, "Costo obbligatorio"),
  artist_categories: z.array(z.string()).min(1, "Seleziona almeno una categoria artista"),
  staff_roles: z.array(z.string()).optional(),
  location_types: z.array(z.string()).min(1, "Seleziona almeno un tipo di location"),
  recommended_days: z.string().min(1, "Giorni consigliati obbligatori"),
  event_timings: z.array(z.string()).optional(),
  
  // Step 3
  founder_name: z.string().min(1, "Nome founder obbligatorio"),
  founder_photo: z.string().min(1, "Foto founder obbligatoria"),
  founder_bio: z.string().min(10, "Bio troppo breve (min 10 caratteri)"),
  founder_email: z.string().email("Email non valida"),
  founder_phone: z.string().min(1, "Numero di telefono obbligatorio"),
  privacy_accepted: z.boolean().refine(val => val === true, "Devi accettare la privacy"),
});

type FormatFormData = z.infer<typeof formatSchema>;

interface CreateFormatProfileProps {
  onSubmit: (data: Omit<FormatFormData, 'privacy_accepted'>) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = [
  "Musica Live",
  "DJ Set",
  "Teatro",
  "Arte & Cultura",
  "Sport & Wellness",
  "Food & Drink",
  "Networking",
  "Workshop",
  "Festival",
  "Altro"
];

const ARTIST_CATEGORIES = [
  "Musicista",
  "DJ",
  "Band",
  "Performer",
  "Attore",
  "Artista Visivo",
  "Ballerino",
  "Altro"
];

const STAFF_ROLES = [
  "Organizzatore",
  "Direttore Artistico",
  "Pubbliche Relazioni & Magnet",
  "Presentatore/Moderatore",
  "Maestro/Animatore",
  "Tecnico Audio/Video",
  "Videomaker/Fotografo",
  "Content Creator/Influencer",
  "Gestore Logistica",
  "Coordinatore Sicurezza"
];

const LOCATION_TYPES = [
  "Club/Discoteca",
  "Bar/Pub",
  "Ristorante",
  "Teatro",
  "Sala Concerti",
  "Spazio Polivalente",
  "Location Outdoor",
  "Galleria d'Arte",
  "Centro Culturale",
  "Altro"
];

export function CreateFormatProfile({ onSubmit, onCancel }: CreateFormatProfileProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activities, setActivities] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [eventTimings, setEventTimings] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newTiming, setNewTiming] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const { uploadImage } = useImageUpload();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<FormatFormData>({
    resolver: zodResolver(formatSchema),
    defaultValues: {
      activities: [],
      materials: [],
      event_timings: [],
      support_gallery: [],
      staff_roles: [],
      artist_categories: [],
      location_types: [],
      privacy_accepted: false
    }
  });

  const representativeImage = watch("representative_image");
  const supportGallery = watch("support_gallery") || [];
  const logoUrl = watch("logo_url");
  const founderPhoto = watch("founder_photo");
  const selectedStaffRoles = watch("staff_roles") || [];
  const selectedArtistCategories = watch("artist_categories") || [];
  const selectedLocationTypes = watch("location_types") || [];

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleImageUpload = async (file: File, field: 'representative_image' | 'logo_url' | 'founder_photo') => {
    try {
      setIsUploading(true);
      const url = await uploadImage(file, {
        bucket: 'avatars',
        folder: 'format-profiles',
        maxSizeMB: 5
      });
      
      if (url) {
        setValue(field, url);
        toast.success("Immagine caricata con successo");
      }
    } catch (error) {
      toast.error("Errore durante il caricamento dell'immagine");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadImage(file, {
        bucket: 'avatars',
        folder: 'format-profiles/gallery',
        maxSizeMB: 5
      });
      
      if (url) {
        const currentGallery = supportGallery || [];
        setValue("support_gallery", [...currentGallery, url]);
        toast.success("Immagine aggiunta alla galleria");
      }
    } catch (error) {
      toast.error("Errore durante il caricamento dell'immagine");
    } finally {
      setIsUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = supportGallery.filter((_, i) => i !== index);
    setValue("support_gallery", newGallery);
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      const updated = [...activities, newActivity.trim()];
      setActivities(updated);
      setValue("activities", updated);
      setNewActivity("");
    }
  };

  const removeActivity = (index: number) => {
    const updated = activities.filter((_, i) => i !== index);
    setActivities(updated);
    setValue("activities", updated);
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      const updated = [...materials, newMaterial.trim()];
      setMaterials(updated);
      setValue("materials", updated);
      setNewMaterial("");
    }
  };

  const removeMaterial = (index: number) => {
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
    setValue("materials", updated);
  };

  const addTiming = () => {
    if (newTiming.trim()) {
      const updated = [...eventTimings, newTiming.trim()];
      setEventTimings(updated);
      setValue("event_timings", updated);
      setNewTiming("");
    }
  };

  const removeTiming = (index: number) => {
    const updated = eventTimings.filter((_, i) => i !== index);
    setEventTimings(updated);
    setValue("event_timings", updated);
  };

  const toggleStaffRole = (role: string) => {
    const current = selectedStaffRoles || [];
    const updated = current.includes(role)
      ? current.filter(r => r !== role)
      : [...current, role];
    setValue("staff_roles", updated);
  };

  const toggleArtistCategory = (category: string) => {
    const current = selectedArtistCategories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setValue("artist_categories", updated);
  };

  const toggleLocationType = (type: string) => {
    const current = selectedLocationTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setValue("location_types", updated);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormatFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'category', 'social_link', 'representative_image', 'description'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['avg_participants', 'avg_cost_per_participant', 'artist_categories', 'location_types', 'recommended_days'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async (data: FormatFormData) => {
    const { privacy_accepted, ...profileData } = data;
    await onSubmit(profileData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Crea il tuo Format
          </h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} di {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Card>
          <CardContent className="p-6">
            {/* Step 1: Original Moment */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Original Moment</h3>
                
                <div>
                  <Label htmlFor="name">Nome del Format *</Label>
                  <Input id="name" {...register("name")} placeholder="Es: Aperitivo Jazz sotto le stelle" />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <Label htmlFor="social_link">Pagina Instagram / TikTok *</Label>
                  <Input id="social_link" {...register("social_link")} placeholder="https://instagram.com/..." />
                  {errors.social_link && <p className="text-sm text-destructive mt-1">{errors.social_link.message}</p>}
                </div>

                <div>
                  <Label>Immagine Rappresentativa *</Label>
                  {representativeImage ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <img src={representativeImage} alt="Rappresentativa" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setValue("representative_image", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Carica immagine</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'representative_image')}
                      />
                    </label>
                  )}
                  {errors.representative_image && <p className="text-sm text-destructive mt-1">{errors.representative_image.message}</p>}
                </div>

                <div>
                  <Label>Galleria a Supporto</Label>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {supportGallery.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Aggiungi immagini</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleGalleryUpload(file));
                      }}
                    />
                  </label>
                </div>

                <div>
                  <Label>Logo (opzionale)</Label>
                  {logoUrl ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain bg-muted" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setValue("logo_url", "")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Logo</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo_url')}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descrizione *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Descrivi il tuo format..."
                    rows={5}
                  />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Dettagli</h3>

                <div>
                  <Label>Lista di Attività</Label>
                  <div className="space-y-2 mb-2">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-muted rounded">{activity}</div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeActivity(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      placeholder="Aggiungi attività"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                    />
                    <Button type="button" onClick={addActivity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Materiali che serviranno</Label>
                  <div className="space-y-2 mb-2">
                    {materials.map((material, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-muted rounded">{material}</div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      placeholder="Aggiungi materiale"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                    />
                    <Button type="button" onClick={addMaterial}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="avg_participants">Media Partecipanti *</Label>
                    <Input
                      id="avg_participants"
                      type="number"
                      {...register("avg_participants", { valueAsNumber: true })}
                      placeholder="50"
                    />
                    {errors.avg_participants && <p className="text-sm text-destructive mt-1">{errors.avg_participants.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="avg_cost_per_participant">Spesa Media (€) *</Label>
                    <Input
                      id="avg_cost_per_participant"
                      type="number"
                      {...register("avg_cost_per_participant", { valueAsNumber: true })}
                      placeholder="25"
                    />
                    {errors.avg_cost_per_participant && <p className="text-sm text-destructive mt-1">{errors.avg_cost_per_participant.message}</p>}
                  </div>
                </div>

                <div>
                  <Label>Artisti Coinvolti *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ARTIST_CATEGORIES.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`artist-${category}`}
                          checked={selectedArtistCategories.includes(category)}
                          onCheckedChange={() => toggleArtistCategory(category)}
                        />
                        <label htmlFor={`artist-${category}`} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.artist_categories && <p className="text-sm text-destructive mt-1">{errors.artist_categories.message}</p>}
                </div>

                <div>
                  <Label>Staff Coinvolto</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {STAFF_ROLES.map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`staff-${role}`}
                          checked={selectedStaffRoles.includes(role)}
                          onCheckedChange={() => toggleStaffRole(role)}
                        />
                        <label htmlFor={`staff-${role}`} className="text-sm cursor-pointer">
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Location Adatte *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {LOCATION_TYPES.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${type}`}
                          checked={selectedLocationTypes.includes(type)}
                          onCheckedChange={() => toggleLocationType(type)}
                        />
                        <label htmlFor={`location-${type}`} className="text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.location_types && <p className="text-sm text-destructive mt-1">{errors.location_types.message}</p>}
                </div>

                <div>
                  <Label htmlFor="recommended_days">Giorni Consigliati *</Label>
                  <Input
                    id="recommended_days"
                    {...register("recommended_days")}
                    placeholder="Es: Venerdì e Sabato sera"
                  />
                  {errors.recommended_days && <p className="text-sm text-destructive mt-1">{errors.recommended_days.message}</p>}
                </div>

                <div>
                  <Label>Tempistiche dell'Evento</Label>
                  <p className="text-xs text-muted-foreground mb-2">Es: 19:00-20:00 Aperitivo</p>
                  <div className="space-y-2 mb-2">
                    {eventTimings.map((timing, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-muted rounded">{timing}</div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTiming(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTiming}
                      onChange={(e) => setNewTiming(e.target.value)}
                      placeholder="Aggiungi tempistica"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTiming())}
                    />
                    <Button type="button" onClick={addTiming}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Founder */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Info Founder</h3>

                <div>
                  <Label htmlFor="founder_name">Nome del Founder *</Label>
                  <Input id="founder_name" {...register("founder_name")} placeholder="Mario Rossi" />
                  {errors.founder_name && <p className="text-sm text-destructive mt-1">{errors.founder_name.message}</p>}
                </div>

                <div>
                  <Label>Foto Profilo del Founder *</Label>
                  {founderPhoto ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden">
                      <img src={founderPhoto} alt="Founder" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setValue("founder_photo", "")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-full cursor-pointer hover:bg-muted/50">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Foto</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'founder_photo')}
                      />
                    </label>
                  )}
                  {errors.founder_photo && <p className="text-sm text-destructive mt-1">{errors.founder_photo.message}</p>}
                </div>

                <div>
                  <Label htmlFor="founder_bio">La Bio del Founder *</Label>
                  <Textarea
                    id="founder_bio"
                    {...register("founder_bio")}
                    placeholder="Racconta chi sei e perché hai creato questo format..."
                    rows={5}
                  />
                  {errors.founder_bio && <p className="text-sm text-destructive mt-1">{errors.founder_bio.message}</p>}
                </div>

                <div>
                  <Label htmlFor="founder_email">La tua Email *</Label>
                  <Input
                    id="founder_email"
                    type="email"
                    {...register("founder_email")}
                    placeholder="email@esempio.com"
                  />
                  {errors.founder_email && <p className="text-sm text-destructive mt-1">{errors.founder_email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="founder_phone">Numero di Telefono *</Label>
                  <Input
                    id="founder_phone"
                    type="tel"
                    {...register("founder_phone")}
                    placeholder="+39 333 1234567"
                  />
                  {errors.founder_phone && <p className="text-sm text-destructive mt-1">{errors.founder_phone.message}</p>}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    onCheckedChange={(checked) => setValue("privacy_accepted", checked as boolean)}
                  />
                  <label htmlFor="privacy" className="text-sm leading-none cursor-pointer">
                    Accetto i termini e le condizioni sulla privacy e il trattamento dei dati *
                  </label>
                </div>
                {errors.privacy_accepted && <p className="text-sm text-destructive mt-1">{errors.privacy_accepted.message}</p>}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? onCancel : prevStep}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? 'Annulla' : 'Indietro'}
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Avanti
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Caricamento...' : 'Crea Format'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}