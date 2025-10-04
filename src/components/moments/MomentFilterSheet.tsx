import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { X, Sparkles } from "lucide-react";
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

const moodEmojis: { [key: string]: string } = {
  'Rilassato': '😌',
  'Energico': '⚡',
  'Creativo': '🎨',
  'Sociale': '🎉',
  'Avventuroso': '🚀',
  'Romantico': '💕',
  'Divertente': '😄',
  'Tranquillo': '🧘'
};

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
  const [hasChanges, setHasChanges] = useState(false);

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
    setHasChanges(true);
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    const updated = selectedSubcategories.includes(subcategory)
      ? selectedSubcategories.filter(s => s !== subcategory)
      : [...selectedSubcategories, subcategory];
    
    setSelectedSubcategories(updated);
    setHasChanges(true);
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMood(selectedMood === mood ? "" : mood);
    setHasChanges(true);
  };

  const handleApplyFilters = () => {
    const filters = {
      category: selectedCategory === "all" ? null : selectedCategory,
      subcategories: selectedSubcategories,
      ageRange,
      maxDistance,
      mood: selectedMood || null
    };
    onFiltersChange(filters);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategories([]);
    setAgeRange([18, 65]);
    setMaxDistance(50);
    setSelectedMood("");
    setHasChanges(true);
  };

  const currentCategory = mainCategories.find(cat => cat.id === selectedCategory);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Cerca Momenti</SheetTitle>
          <SheetDescription>
            Filtra per categoria, distanza, età e mood
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 pb-24">
          <div className="space-y-6 py-2">
            {/* Area Indicator - Centered */}
            <div className="flex justify-center">
              <AreaIndicator maxDistance={maxDistance} />
            </div>

            {/* Main Categories - Grid Layout */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Categorie</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <Button
                  key="all"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => handleCategoryChange("all")}
                  className="h-10 justify-start"
                >
                  <span className="text-base mr-2">✨</span>
                  <span className="text-sm">Tutti</span>
                </Button>
                {mainCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category.id)}
                    className="h-10 justify-start"
                  >
                    <span className="text-base mr-2">{category.emoji}</span>
                    <span className="text-sm">{category.name}</span>
                  </Button>
                ))}
              </div>
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

            {/* Age Range - Enhanced Display */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Fascia d'età</label>
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{ageRange[0]}</div>
                  <div className="text-xs text-muted-foreground">anni</div>
                </div>
                <div className="text-muted-foreground">←→</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{ageRange[1]}</div>
                  <div className="text-xs text-muted-foreground">anni</div>
                </div>
              </div>
              <Slider
                value={ageRange}
                onValueChange={(value) => {
                  setAgeRange(value as [number, number]);
                  setHasChanges(true);
                }}
                min={18}
                max={65}
                step={1}
                className="w-full"
              />
            </div>

            {/* Distance - Enhanced Display */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Distanza massima</label>
              <div className="text-center mb-2">
                <div className="text-2xl font-bold text-primary">{maxDistance}</div>
                <div className="text-xs text-muted-foreground">fino a {maxDistance} km</div>
              </div>
              <Slider
                value={[maxDistance]}
                onValueChange={(value) => {
                  setMaxDistance(value[0]);
                  setHasChanges(true);
                }}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Mood - Grid Layout */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Mood</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {moods.map((mood) => (
                  <Button
                    key={mood}
                    variant={selectedMood === mood ? "default" : "outline"}
                    onClick={() => handleMoodToggle(mood)}
                    className="h-auto py-3 flex-col gap-1"
                  >
                    <span className="text-2xl">{moodEmojis[mood]}</span>
                    <span className="text-xs">{mood}</span>
                  </Button>
                ))}
              </div>
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
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={handleResetFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Reset Filtri
              </Button>
            )}
          </div>
        </ScrollArea>

        {/* Fixed Apply Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button 
            size="lg" 
            className="w-full"
            disabled={!hasChanges && activeFiltersCount === 0}
            onClick={handleApplyFilters}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {activeFiltersCount > 0 
              ? `Applica Filtri (${activeFiltersCount})` 
              : 'Applica Filtri'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
