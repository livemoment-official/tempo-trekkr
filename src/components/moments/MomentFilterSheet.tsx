import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AreaIndicator } from "./AreaIndicator";
import { MOMENT_CATEGORIES } from "@/constants/unifiedTags";

interface MomentFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFiltersChange: (filters: any) => void;
  currentFilters?: any;
}

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
    'Spontaneo': '🎲',
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
  return emojiMap[category] || '';
}

function getSubcategoriesForCategory(category: string): string[] {
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

export function MomentFilterSheet({ 
  open, 
  onOpenChange, 
  onFiltersChange, 
  currentFilters = {} 
}: MomentFilterSheetProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(currentFilters.category || "all");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(currentFilters.subcategories || []);
  const [ageRange, setAgeRange] = useState<[number, number]>(currentFilters.ageRange || [18, 65]);
  const [maxDistance, setMaxDistance] = useState<number>(currentFilters.maxDistance || 50);
  const [selectedMood, setSelectedMood] = useState<string>(currentFilters.mood || "");

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
    setSelectedSubcategories([]);
    
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Cerca Momenti</SheetTitle>
          <SheetDescription>
            Filtra per categoria, distanza, età e mood
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-6">
            {/* Area Indicator */}
            <AreaIndicator />

            {/* Main Categories */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Categorie</label>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  <Button
                    key="all"
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange("all")}
                    className="shrink-0"
                  >
                    Tutti
                  </Button>
                  {mainCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                      className="shrink-0"
                    >
                      {category.emoji} {category.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Subcategories */}
            {currentCategory && currentCategory.subcategories.length > 0 && (
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

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Filtri attivi ({activeFiltersCount})</label>
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
              </div>
            )}

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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
