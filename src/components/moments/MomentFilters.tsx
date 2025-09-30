import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X, List, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AreaIndicator } from "./AreaIndicator";
import { MOMENT_CATEGORIES } from "@/constants/unifiedTags";

interface MomentFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters?: any;
  view?: 'list' | 'map';
  onViewChange?: (view: 'list' | 'map') => void;
}

// Category data aligned with unified tags
const mainCategories = MOMENT_CATEGORIES.map(category => ({
  id: category.toLowerCase().replace(/\s+/g, '_'),
  name: category,
  emoji: getCategoryEmoji(category),
  subcategories: getSubcategoriesForCategory(category)
}));

function getCategoryEmoji(category: string): string {
  const emojiMap: { [key: string]: string } = {
    'Socializzazione': '🎉',
    'Sport': '⚽',
    'Cibo': '🍺',
    'Cultura': '🏛️',
    'Outdoor': '🌿',
    'Relax': '🧘',
    'Famiglia': '👨‍👩‍👧‍👦',
    'Lavoro': '💼',
    'Spontaneo': '✨',
    'Arte': '🎨',
    'Musica': '🎵',
    'Gaming': '🎮',
    'Viaggio': '✈️',
    'Shopping': '🛍️',
    'Fotografia': '📸',
    'Fitness': '💪',
    'Studio': '📚',
    'Tecnologia': '💻',
    'Benessere': '🧘‍♀️',
    'Volontariato': '🤝',
    'Cinema': '🎬',
    'Tea': '🍵',
    'Teatro': '🎭',
    'Concerti': '🎤',
    'Bar': '🍸',
    'Discoteca': '💃',
    'Netflix': '📺',
    'Lettura': '📖',
    'Cucina': '👨‍🍳'
  };
  return emojiMap[category] || '✨';
}

function getSubcategoriesForCategory(category: string): string[] {
  // Simplified subcategories based on main category
  const subcategoriesMap: { [key: string]: string[] } = {
    'Sport': ['Calcio', 'Tennis', 'Pallavolo', 'Running', 'Palestra', 'Nuoto'],
    'Cibo': ['Aperitivo', 'Cena', 'Pranzo', 'Colazione', 'Street Food'],
    'Cultura': ['Musei', 'Teatro', 'Cinema', 'Concerti', 'Mostre'],
    'Outdoor': ['Parchi', 'Trekking', 'Mare', 'Montagna', 'Picnic'],
    'Socializzazione': ['Feste', 'Karaoke', 'Meet & Greet', 'Networking']
  };
  return subcategoriesMap[category] || [];
}

const moods = [
  'Rilassato', 'Energico', 'Creativo', 'Sociale', 
  'Avventuroso', 'Romantico', 'Divertente', 'Tranquillo'
];

export const MomentFilters = ({ 
  onFiltersChange, 
  currentFilters = {}, 
  view = 'list', 
  onViewChange 
}: MomentFiltersProps) => {
  
  const setView = (newView: 'list' | 'map') => {
    onViewChange?.(newView);
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(currentFilters.category || "all");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(currentFilters.subcategories || []);
  const [ageRange, setAgeRange] = useState<[number, number]>(currentFilters.ageRange || [18, 65]);
  const [maxDistance, setMaxDistance] = useState<number>(currentFilters.maxDistance || 50);
  const [selectedMood, setSelectedMood] = useState<string>(currentFilters.mood || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync with external filters
  useEffect(() => {
    setSelectedCategory(currentFilters.category || "all");
    setSelectedSubcategories(currentFilters.subcategories || []);
    setAgeRange(currentFilters.ageRange || [18, 65]);
    setMaxDistance(currentFilters.maxDistance || 50);
    setSelectedMood(currentFilters.mood || "");
  }, [currentFilters]);

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedSubcategories.length > 0,
    selectedMood,
    ageRange[0] > 18 || ageRange[1] < 65,
    maxDistance < 50
  ].filter(Boolean).length;

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategories([]); // Reset subcategories when changing main category
    
    const filters = {
      category: categoryId === "all" ? null : categoryId,
      subcategories: [],
      ageRange,
      maxDistance,
      mood: selectedMood || null
    };
    onFiltersChange(filters);
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    const updated = selectedSubcategories.includes(subcategory)
      ? selectedSubcategories.filter(s => s !== subcategory)
      : [...selectedSubcategories, subcategory];
    
    setSelectedSubcategories(updated);
    
    const filters = {
      category: selectedCategory === "all" ? null : selectedCategory,
      subcategories: updated,
      ageRange,
      maxDistance,
      mood: selectedMood || null
    };
    onFiltersChange(filters);
  };

  const currentCategory = mainCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Main Categories - Horizontal Scrollable */}
        <div className="relative">
          <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
            <div className="flex gap-2 px-1 pb-2 w-max">
              <Button
                key="all"
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange("all")}
                className="flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                ✨ Tutti
              </Button>
              {mainCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className="flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  {category.emoji} {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Advanced Filters and View Toggle */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className={`p-2 ${view === 'list' ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'map' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('map')}
              className={`p-2 ${view === 'map' ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>

          {/* Advanced Filters and Area Indicator */}
          <div className="flex items-center gap-3">
            <AreaIndicator />
            
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
                <SheetTitle>Filtri</SheetTitle>
                <SheetDescription>
                  Personalizza la tua ricerca con filtri dettagliati
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Subcategories */}
                {currentCategory && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Sottocategorie</label>
                    <div className="flex flex-wrap gap-2">
                      {currentCategory.subcategories.map((subcategory) => (
                        <Button
                          key={subcategory}
                          variant={selectedSubcategories.includes(subcategory) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSubcategoryToggle(subcategory)}
                          className="text-xs"
                        >
                          {subcategory}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Age Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Fascia d'età</label>
                  <Slider
                    value={ageRange}
                    onValueChange={(value) => {
                      setAgeRange(value as [number, number]);
                      const filters = {
                        category: selectedCategory === "all" ? null : selectedCategory,
                        subcategories: selectedSubcategories,
                        ageRange: value as [number, number],
                        maxDistance,
                        mood: selectedMood || null
                      };
                      onFiltersChange(filters);
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
                      const filters = {
                        category: selectedCategory === "all" ? null : selectedCategory,
                        subcategories: selectedSubcategories,
                        ageRange,
                        maxDistance: value[0],
                        mood: selectedMood || null
                      };
                      onFiltersChange(filters);
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
                  <Select value={selectedMood || "none"} onValueChange={(value) => {
                    const newMood = value === "none" ? "" : value;
                    setSelectedMood(newMood);
                    const filters = {
                      category: selectedCategory === "all" ? null : selectedCategory,
                      subcategories: selectedSubcategories,
                      ageRange,
                      maxDistance,
                      mood: newMood || null
                    };
                    onFiltersChange(filters);
                  }}>
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

                {/* Reset Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubcategories([]);
                    setAgeRange([18, 65]);
                    setMaxDistance(50);
                    setSelectedMood("");
                    onFiltersChange({
                      category: null,
                      subcategories: [],
                      ageRange: [18, 65],
                      maxDistance: 50,
                      mood: null
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Filtri
                </Button>
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {mainCategories.find(cat => cat.id === selectedCategory)?.name}
              <button 
                onClick={() => handleCategoryChange("all")}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedSubcategories.map((sub) => (
            <Badge key={sub} variant="secondary" className="text-xs">
              {sub}
              <button 
                onClick={() => handleSubcategoryToggle(sub)}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {selectedMood && (
            <Badge variant="secondary" className="text-xs">
              {selectedMood}
              <button 
                onClick={() => {
                  setSelectedMood("");
                  const filters = {
                    category: selectedCategory === "all" ? null : selectedCategory,
                    subcategories: selectedSubcategories,
                    ageRange,
                    maxDistance,
                    mood: null
                  };
                  onFiltersChange(filters);
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
