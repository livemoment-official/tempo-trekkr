import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { X, Calendar as CalendarIcon, Sparkles, Users, Euro } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useEventValidation } from "@/hooks/useEventValidation";
import { Progress } from "@/components/ui/progress";
import { MOMENT_CATEGORIES } from "@/constants/unifiedTags";
import { AdvancedTicketingSystem } from "./AdvancedTicketingSystem";

interface EnhancedEventDetailsStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

// Use unified categories for events to match moments
const eventCategories = MOMENT_CATEGORIES;
const smartPlaceholders = {
  concert: "Es. Concerto di [Artista] - Una serata indimenticabile di musica dal vivo...",
  festival: "Es. Festival estivo con i migliori artisti della scena musicale italiana...",
  teatro: "Es. Spettacolo teatrale che racconta la storia di...",
  arte: "Es. Mostra d'arte contemporanea che esplora il tema...",
  default: "Descrivi il tuo evento in modo coinvolgente..."
};
export default function EnhancedEventDetailsStep({
  data,
  onChange,
  onNext
}: EnhancedEventDetailsStepProps) {
  const [newTag, setNewTag] = useState("");
  const [hasTicketing, setHasTicketing] = useState(!!data.ticketing?.price);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const validation = useEventValidation(data);

  // Smart placeholder selection based on selected categories
  const getSmartPlaceholder = () => {
    if (data.tags?.includes("Concerto")) return smartPlaceholders.concert;
    if (data.tags?.includes("Festival")) return smartPlaceholders.festival;
    if (data.tags?.includes("Teatro")) return smartPlaceholders.teatro;
    if (data.tags?.includes("Arte")) return smartPlaceholders.arte;
    return smartPlaceholders.default;
  };

  // Auto-suggestion for event capacity based on category
  const getSuggestedCapacity = () => {
    if (data.tags?.includes("Concerto") || data.tags?.includes("Festival")) return "500";
    if (data.tags?.includes("Teatro")) return "200";
    if (data.tags?.includes("Workshop") || data.tags?.includes("Conferenza")) return "50";
    return "";
  };
  const handleAddTag = (tag: string) => {
    if (tag && !data.tags.includes(tag)) {
      onChange({
        ...data,
        tags: [...data.tags, tag]
      });
    }
    setNewTag("");
  };
  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...data,
      tags: data.tags.filter((tag: string) => tag !== tagToRemove)
    });
  };
  const handleDateSelect = (date: Date | undefined) => {
    onChange({
      ...data,
      date
    });
  };
  const handleLocationChange = (name: string, coordinates?: {
    lat: number;
    lng: number;
  }) => {
    onChange({
      ...data,
      location: {
        name,
        coordinates: coordinates ? [coordinates.lat, coordinates.lng] : null
      }
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.steps.details.isValid) {
      onNext();
    }
  };

  // Update ticketing state when hasTicketing changes
  useEffect(() => {
    if (!hasTicketing) {
      onChange({
        ...data,
        ticketing: null
      });
    } else if (!data.ticketing) {
      onChange({
        ...data,
        ticketing: {
          price: 0
        }
      });
    }
  }, [hasTicketing, data, onChange]);
  const getFieldValidationStatus = (fieldName: string) => {
    switch (fieldName) {
      case 'title':
        return data.title?.trim() ? 'valid' : 'invalid';
      case 'description':
        return data.description?.trim() ? 'valid' : 'empty';
      case 'date':
        return data.date ? 'valid' : 'invalid';
      case 'startTime':
        return data.startTime ? 'valid' : 'invalid';
      case 'location':
        return data.location?.name?.trim() ? 'valid' : 'empty';
      default:
        return 'empty';
    }
  };
  return <div className="space-y-6">
      {/* Progress indicator for this step */}
      

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title with real-time validation */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
            Titolo dell'evento *
            {getFieldValidationStatus('title') === 'valid' && <Badge variant="outline" className="text-xs">✓</Badge>}
          </Label>
          <Input id="title" value={data.title} onChange={e => onChange({
          ...data,
          title: e.target.value
        })} onFocus={() => setFocusedField('title')} onBlur={() => setFocusedField(null)} placeholder="Nome del tuo evento..." className={`transition-all ${getFieldValidationStatus('title') === 'valid' ? 'border-green-500/50 focus:border-green-500' : 'focus:border-primary'}`} required />
          {focusedField === 'title' && <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Suggerimento: Usa un titolo accattivante e descrittivo</span>
            </div>}
        </div>

        {/* Description with smart placeholder */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
            Descrizione
            {getFieldValidationStatus('description') === 'valid' && <Badge variant="outline" className="text-xs">✓</Badge>}
          </Label>
          <Textarea id="description" value={data.description} onChange={e => onChange({
          ...data,
          description: e.target.value
        })} onFocus={() => setFocusedField('description')} onBlur={() => setFocusedField(null)} placeholder={getSmartPlaceholder()} className={`transition-all ${getFieldValidationStatus('description') === 'valid' ? 'border-green-500/50 focus:border-green-500' : 'focus:border-primary'}`} rows={4} />
          {focusedField === 'description' && <div className="text-xs text-muted-foreground">
              {data.description?.length || 0}/500 caratteri
            </div>}
        </div>

        {/* Enhanced categories */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Categorie evento</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {eventCategories.map(tag => <Badge key={tag} variant={data.tags.includes(tag) ? "default" : "outline"} className="cursor-pointer justify-center py-2 hover:scale-105 transition-transform" onClick={() => handleAddTag(tag)}>
                {tag}
              </Badge>)}
          </div>

          <div className="flex gap-2">
            <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Categoria personalizzata..." onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag(newTag);
            }
          }} />
            <Button type="button" variant="outline" onClick={() => handleAddTag(newTag)} disabled={!newTag.trim()}>
              Aggiungi
            </Button>
          </div>

          {data.tags.length > 0 && <div className="flex flex-wrap gap-2">
              {data.tags.map((tag: string) => <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(tag)} />
                </Badge>)}
            </div>}
        </div>

        {/* Capacity and Ticketing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacità massima
            </Label>
            <Input id="capacity" type="number" value={data.capacity || ""} onChange={e => onChange({
            ...data,
            capacity: parseInt(e.target.value) || null
          })} placeholder={getSuggestedCapacity() || "Es. 100"} className="transition-all focus:border-primary" min="1" />
          </div>

        </div>

        {/* Date and Time with validation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center gap-2">
              Data evento *
              {getFieldValidationStatus('date') === 'valid' && <Badge variant="outline" className="text-xs">✓</Badge>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`w-full justify-start text-left font-normal ${getFieldValidationStatus('date') === 'valid' ? 'border-green-500/50' : 'border-border'}`}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.date ? format(data.date, "PPP", {
                  locale: it
                }) : "Seleziona data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={data.date} onSelect={handleDateSelect} disabled={date => date < new Date()} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-base font-medium flex items-center gap-2">
              Ora inizio *
              {getFieldValidationStatus('startTime') === 'valid' && <Badge variant="outline" className="text-xs">✓</Badge>}
            </Label>
            <Input id="startTime" type="time" value={data.startTime} onChange={e => onChange({
            ...data,
            startTime: e.target.value
          })} className={`transition-all ${getFieldValidationStatus('startTime') === 'valid' ? 'border-green-500/50 focus:border-green-500' : 'focus:border-primary'}`} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-base font-medium">Ora fine</Label>
            <Input id="endTime" type="time" value={data.endTime} onChange={e => onChange({
            ...data,
            endTime: e.target.value
          })} className="transition-all focus:border-primary" />
          </div>
        </div>

        {/* Location with validation */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Location
            {getFieldValidationStatus('location') === 'valid' && <Badge variant="outline" className="text-xs">✓</Badge>}
          </Label>
          <LocationSearchInput value={data.location.name} onChange={handleLocationChange} placeholder="Dove si svolgerà l'evento..." />
        </div>

        {/* Advanced Ticketing */}
        <AdvancedTicketingSystem
          data={data.advancedTicketing || { enabled: false, currency: 'EUR', phases: [] }}
          onChange={(advancedTicketing) => onChange({ ...data, advancedTicketing })}
          maxParticipants={data.capacity}
        />
      </form>
    </div>;
}