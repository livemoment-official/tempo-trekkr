import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Filter, MapPin, Search } from "lucide-react";

interface MomentFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
  ageRange: [number, number];
  onAgeRangeChange: (range: [number, number]) => void;
  maxDistance: number;
  onMaxDistanceChange: (distance: number) => void;
  selectedMood: string | null;
  onMoodChange: (mood: string | null) => void;
}

const mainCategories = [
  { 
    id: 'sport', 
    name: 'Sport', 
    emoji: '⚽',
    subcategories: ['Calcio', 'Pallavolo', 'Tennis', 'Basket', 'Nuoto', 'Running', 'Padel', 'Golf']
  },
  { 
    id: 'food_drinks', 
    name: 'Food & Drinks', 
    emoji: '🍺',
    subcategories: ['Aperitivo', 'Cena', 'Pranzo', 'Cocktail', 'Wine Tasting', 'Street Food', 'Cooking Class']
  },
  { 
    id: 'cultura', 
    name: 'Cultura', 
    emoji: '🏛️',
    subcategories: ['Musei', 'Mostre', 'Teatro', 'Cinema', 'Concerti', 'Libri', 'Arte', 'Storia']
  },
  { 
    id: 'natura', 
    name: 'Natura', 
    emoji: '🌿',
    subcategories: ['Trekking', 'Parchi', 'Mare', 'Montagna', 'Picnic', 'Birdwatching', 'Giardinaggio']
  },
  { 
    id: 'social', 
    name: 'Social', 
    emoji: '🎉',
    subcategories: ['Feste', 'Karaoke', 'Giochi da Tavolo', 'Speed Dating', 'Networking', 'Meet & Greet']
  },
  { 
    id: 'relax', 
    name: 'Relax', 
    emoji: '🧘',
    subcategories: ['Spa', 'Yoga', 'Meditazione', 'Massage', 'Terme', 'Benessere', 'Lettura']
  },
  { 
    id: 'casa', 
    name: 'In Casa', 
    emoji: '🏠',
    subcategories: ['Film Night', 'Cena a Casa', 'Giochi', 'Studio Together', 'Netflix & Chill']
  }
];

const moods = [
  'Rilassato', 'Energico', 'Creativo', 'Sociale', 
  'Avventuroso', 'Romantico', 'Divertente', 'Tranquillo'
];

export function MomentFilters({
  selectedCategory,
  onCategoryChange,
  selectedSubcategories,
  onSubcategoriesChange,
  ageRange,
  onAgeRangeChange,
  maxDistance,
  onMaxDistanceChange,
  selectedMood,
  onMoodChange
}: MomentFiltersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [subcategorySearch, setSubcategorySearch] = useState("");

  const activeFiltersCount = [
    selectedCategory,
    selectedSubcategories?.length > 0,
    selectedMood,
    ageRange[0] > 18 || ageRange[1] < 65,
    maxDistance < 50
  ].filter(Boolean).length;

  const selectedMainCategory = mainCategories.find(cat => cat.id === selectedCategory);
  const availableSubcategories = selectedMainCategory ? selectedMainCategory.subcategories : [];
  const filteredSubcategories = availableSubcategories.filter(sub => 
    sub.toLowerCase().includes(subcategorySearch.toLowerCase())
  );

  const handleSubcategoryToggle = (subcategory: string) => {
    if (!selectedSubcategories) return;
    
    const updatedSubcategories = selectedSubcategories.includes(subcategory)
      ? selectedSubcategories.filter(s => s !== subcategory)
      : [...selectedSubcategories, subcategory];
    onSubcategoriesChange(updatedSubcategories);
  };

  return (
    <div className="space-y-4">
      {/* Main Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => {
            onCategoryChange(null);
            onSubcategoriesChange([]);
          }}
          className={`flex flex-col items-center gap-1 p-3 rounded-full min-w-[80px] transition-all ${
            !selectedCategory 
              ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
              : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/70'
          }`}
        >
          <span className="text-2xl">🌟</span>
          <span className="text-xs font-medium">Tutti</span>
        </button>
        {mainCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              if (selectedCategory === category.id) {
                onCategoryChange(null);
                onSubcategoriesChange([]);
              } else {
                onCategoryChange(category.id);
                onSubcategoriesChange([]);
                setCategorySheetOpen(true);
              }
            }}
            className={`flex flex-col items-center gap-1 p-3 rounded-full min-w-[80px] transition-all ${
              selectedCategory === category.id 
                ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/70'
            }`}
          >
            <span className="text-2xl">{category.emoji}</span>
            <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Subcategory Sheet */}
      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedMainCategory?.emoji} {selectedMainCategory?.name}
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca sottocategoria..."
                value={subcategorySearch}
                onChange={(e) => setSubcategorySearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {filteredSubcategories.map((subcategory) => (
                <div
                  key={subcategory}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer"
                  onClick={() => handleSubcategoryToggle(subcategory)}
                >
                  <Checkbox
                    checked={selectedSubcategories?.includes(subcategory) || false}
                    onChange={() => handleSubcategoryToggle(subcategory)}
                  />
                  <label className="flex-1 cursor-pointer text-sm font-medium">
                    {subcategory}
                  </label>
                </div>
              ))}
            </div>

            <Button 
              className="w-full"
              onClick={() => setCategorySheetOpen(false)}
            >
              Conferma ({selectedSubcategories?.length || 0} selezionate)
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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
                <Select value={selectedMood || "tutti"} onValueChange={(value) => onMoodChange(value === "tutti" ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti i mood</SelectItem>
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