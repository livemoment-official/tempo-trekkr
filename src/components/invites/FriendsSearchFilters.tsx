
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";

interface FriendsSearchFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters?: any;
}

const moods = [
  'Rilassato', 'Energico', 'Creativo', 'Sociale', 
  'Avventuroso', 'Romantico', 'Divertente', 'Tranquillo'
];

const availabilityOptions = [
  { value: 'disponibile', label: 'Disponibile ora' },
  { value: 'occupato', label: 'Occupato' },
  { value: 'libero_stasera', label: 'Libero stasera' },
  { value: 'weekend', label: 'Disponibile weekend' }
];

export const FriendsSearchFilters = ({ 
  onFiltersChange, 
  currentFilters = {} 
}: FriendsSearchFiltersProps) => {
  const [ageRange, setAgeRange] = useState<[number, number]>(currentFilters.ageRange || [18, 65]);
  const [maxDistance, setMaxDistance] = useState<number>(currentFilters.maxDistance || 50);
  const [selectedMood, setSelectedMood] = useState<string>(currentFilters.mood || "");
  const [selectedAvailability, setSelectedAvailability] = useState<string>(currentFilters.availability || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync with external filters
  useEffect(() => {
    setAgeRange(currentFilters.ageRange || [18, 65]);
    setMaxDistance(currentFilters.maxDistance || 50);
    setSelectedMood(currentFilters.mood || "");
    setSelectedAvailability(currentFilters.availability || "");
  }, [currentFilters]);

  const activeFiltersCount = [
    selectedMood,
    selectedAvailability,
    ageRange[0] > 18 || ageRange[1] < 65,
    maxDistance < 50
  ].filter(Boolean).length;

  const updateFilters = (updates: any) => {
    const filters = {
      ageRange,
      maxDistance,
      mood: selectedMood || null,
      availability: selectedAvailability || null,
      ...updates
    };
    onFiltersChange(filters);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Advanced Filters Button */}
      <Sheet open={showAdvanced} onOpenChange={setShowAdvanced}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtri
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Filtri Ricerca Amici</SheetTitle>
            <SheetDescription>
              Trova persone compatibili con le tue preferenze
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Age Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Fascia d'età</label>
              <Slider
                value={ageRange}
                onValueChange={(value) => {
                  setAgeRange(value as [number, number]);
                  updateFilters({ ageRange: value as [number, number] });
                }}
                min={18}
                max={65}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{ageRange[0]} anni</span>
                <span>{ageRange[1]} anni</span>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Distanza massima</label>
              <Slider
                value={[maxDistance]}
                onValueChange={(value) => {
                  setMaxDistance(value[0]);
                  updateFilters({ maxDistance: value[0] });
                }}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-center text-xs text-muted-foreground">
                {maxDistance} km
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Mood</label>
              <Select 
                value={selectedMood || "none"} 
                onValueChange={(value) => {
                  const newMood = value === "none" ? "" : value;
                  setSelectedMood(newMood);
                  updateFilters({ mood: newMood || null });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tutti i mood</SelectItem>
                  {moods.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Disponibilità</label>
              <Select 
                value={selectedAvailability || "none"} 
                onValueChange={(value) => {
                  const newAvailability = value === "none" ? "" : value;
                  setSelectedAvailability(newAvailability);
                  updateFilters({ availability: newAvailability || null });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona disponibilità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tutte le disponibilità</SelectItem>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setAgeRange([18, 65]);
                setMaxDistance(50);
                setSelectedMood("");
                setSelectedAvailability("");
                updateFilters({
                  ageRange: [18, 65],
                  maxDistance: 50,
                  mood: null,
                  availability: null
                });
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filtri
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMood && (
            <Badge variant="secondary" className="text-xs">
              {selectedMood}
              <button 
                onClick={() => {
                  setSelectedMood("");
                  updateFilters({ mood: null });
                }}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedAvailability && (
            <Badge variant="secondary" className="text-xs">
              {availabilityOptions.find(opt => opt.value === selectedAvailability)?.label}
              <button 
                onClick={() => {
                  setSelectedAvailability("");
                  updateFilters({ availability: null });
                }}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
