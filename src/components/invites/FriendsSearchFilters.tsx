import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { MOMENT_CATEGORIES } from "@/constants/unifiedTags";

interface FriendsSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  availabilityFilter: string;
  onAvailabilityChange: (filter: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  ageRange?: [number, number];
  onAgeRangeChange?: (range: [number, number]) => void;
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
  searchQuery, 
  onSearchChange, 
  selectedMood, 
  onMoodChange, 
  radiusKm, 
  onRadiusChange, 
  availabilityFilter, 
  onAvailabilityChange,
  selectedCategory = "all",
  onCategoryChange = () => {},
  ageRange: externalAgeRange,
  onAgeRangeChange
}: FriendsSearchFiltersProps) => {
  const [internalAgeRange, setInternalAgeRange] = useState<[number, number]>([18, 65]);
  const [open, setOpen] = useState(false);
  
  const ageRange = externalAgeRange || internalAgeRange;
  const handleAgeRangeChange = (value: [number, number]) => {
    if (onAgeRangeChange) {
      onAgeRangeChange(value);
    } else {
      setInternalAgeRange(value);
    }
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (ageRange[0] !== 18 || ageRange[1] !== 65) count++;
    if (radiusKm !== 5) count++;
    if (selectedMood !== "all") count++;
    if (availabilityFilter !== "all") count++;
    if (selectedCategory !== "all") count++;
    return count;
  };

  const resetFilters = () => {
    handleAgeRangeChange([18, 65]);
    onRadiusChange(5);
    onMoodChange("all");
    onAvailabilityChange("all");
    onCategoryChange("all");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Cerca per nome, username o interessi..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Section */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Categorie</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange("all")}
            className="whitespace-nowrap shrink-0"
          >
            ✨ Tutti
          </Button>
          {MOMENT_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="whitespace-nowrap shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Age Range Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Fascia d'età</label>
          <span className="text-xs text-muted-foreground font-medium">
            {ageRange[0]} - {ageRange[1]} anni
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {/* Advanced Filters Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtri
              {activeFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {activeFiltersCount()}
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
                  onValueChange={(value) => handleAgeRangeChange(value as [number, number])}
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
                  value={[radiusKm]}
                  onValueChange={(value) => onRadiusChange(value[0])}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-xs text-muted-foreground">
                  {radiusKm} km
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Mood</label>
                <Select 
                  value={selectedMood} 
                  onValueChange={onMoodChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i mood</SelectItem>
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
                  value={availabilityFilter} 
                  onValueChange={onAvailabilityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona disponibilità" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le disponibilità</SelectItem>
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
                onClick={resetFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Reset Filtri
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Quick Filters */}
        <div className="flex gap-2">
          <Button 
            variant={selectedMood === "Sociale" ? "default" : "outline"} 
            size="sm"
            onClick={() => onMoodChange(selectedMood === "Sociale" ? "all" : "Sociale")}
            className="whitespace-nowrap"
          >
            Sociale
          </Button>
          <Button 
            variant={selectedMood === "Avventuroso" ? "default" : "outline"} 
            size="sm"
            onClick={() => onMoodChange(selectedMood === "Avventuroso" ? "all" : "Avventuroso")}
            className="whitespace-nowrap"
          >
            Avventuroso
          </Button>
          <Button 
            variant={selectedMood === "Rilassato" ? "default" : "outline"} 
            size="sm"
            onClick={() => onMoodChange(selectedMood === "Rilassato" ? "all" : "Rilassato")}
            className="whitespace-nowrap"
          >
            Rilassato
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {selectedCategory}
              <button 
                onClick={() => onCategoryChange("all")}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedMood !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {selectedMood}
              <button 
                onClick={() => onMoodChange("all")}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {availabilityFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {availabilityOptions.find(opt => opt.value === availabilityFilter)?.label}
              <button 
                onClick={() => onAvailabilityChange("all")}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {radiusKm !== 5 && (
            <Badge variant="secondary" className="text-xs">
              {radiusKm} km
              <button 
                onClick={() => onRadiusChange(5)}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {(ageRange[0] !== 18 || ageRange[1] !== 65) && (
            <Badge variant="secondary" className="text-xs">
              {ageRange[0]}-{ageRange[1]} anni
              <button 
                onClick={() => handleAgeRangeChange([18, 65])}
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