import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, MapPin } from "lucide-react";

interface MomentFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  ageRange: [number, number];
  onAgeRangeChange: (range: [number, number]) => void;
  maxDistance: number;
  onMaxDistanceChange: (distance: number) => void;
  selectedMood: string | null;
  onMoodChange: (mood: string | null) => void;
}

const categories = [
  { id: 'calcio', name: 'Calcio', emoji: '⚽' },
  { id: 'aperitivo', name: 'Aperitivo', emoji: '🍺' },
  { id: 'feste', name: 'Feste', emoji: '🎉' },
  { id: 'casa', name: 'In Casa', emoji: '🏠' },
  { id: 'sport', name: 'Sport', emoji: '🏃' },
  { id: 'musica', name: 'Musica', emoji: '🎵' },
  { id: 'arte', name: 'Arte', emoji: '🎨' },
  { id: 'cibo', name: 'Cibo', emoji: '🍕' },
  { id: 'natura', name: 'Natura', emoji: '🌿' }
];

const moods = [
  'Rilassato', 'Energico', 'Creativo', 'Sociale', 
  'Avventuroso', 'Romantico', 'Divertente', 'Tranquillo'
];

export function MomentFilters({
  selectedCategory,
  onCategoryChange,
  ageRange,
  onAgeRangeChange,
  maxDistance,
  onMaxDistanceChange,
  selectedMood,
  onMoodChange
}: MomentFiltersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const activeFiltersCount = [
    selectedCategory,
    selectedMood,
    ageRange[0] > 18 || ageRange[1] < 65,
    maxDistance < 50
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="whitespace-nowrap"
        >
          Tutti
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(
              selectedCategory === category.id ? null : category.id
            )}
            className="whitespace-nowrap"
          >
            {category.emoji} {category.name}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center gap-2">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtri Avanzati
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtri Avanzati</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Age Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Fascia d'età</label>
                <div className="px-2">
                  <Slider
                    value={ageRange}
                    onValueChange={(value) => onAgeRangeChange(value as [number, number])}
                    min={18}
                    max={65}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{ageRange[0]} anni</span>
                    <span>{ageRange[1]} anni</span>
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Distanza massima
                </label>
                <div className="px-2">
                  <Slider
                    value={[maxDistance]}
                    onValueChange={(value) => onMaxDistanceChange(value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-xs text-muted-foreground mt-1">
                    {maxDistance} km
                  </div>
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Mood</label>
                <Select value={selectedMood || ""} onValueChange={(value) => onMoodChange(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i mood</SelectItem>
                    {moods.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  onCategoryChange(null);
                  onAgeRangeChange([18, 65]);
                  onMaxDistanceChange(50);
                  onMoodChange(null);
                  setIsSheetOpen(false);
                }}
              >
                Reset Filtri
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Active filters display */}
        {(selectedMood || ageRange[0] > 18 || ageRange[1] < 65 || maxDistance < 50) && (
          <div className="flex gap-1 flex-wrap">
            {selectedMood && (
              <Badge variant="secondary" className="text-xs">
                {selectedMood}
                <button 
                  onClick={() => onMoodChange(null)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {(ageRange[0] > 18 || ageRange[1] < 65) && (
              <Badge variant="secondary" className="text-xs">
                {ageRange[0]}-{ageRange[1]} anni
                <button 
                  onClick={() => onAgeRangeChange([18, 65])}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {maxDistance < 50 && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {maxDistance}km
                <button 
                  onClick={() => onMaxDistanceChange(50)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}