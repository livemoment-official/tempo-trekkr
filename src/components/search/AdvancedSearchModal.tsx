import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Euro, 
  Filter,
  X
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";

interface AdvancedSearchFilters {
  query?: string;
  category?: string;
  subcategories?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  ageMin?: number;
  ageMax?: number;
  maxDistance?: number;
  province?: string;
  isPaid?: boolean | null;
  priceMin?: number;
  priceMax?: number;
  mood?: string;
}

interface AdvancedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (filters: AdvancedSearchFilters) => void;
  initialFilters?: AdvancedSearchFilters;
}

const ITALIAN_PROVINCES = [
  "Milano", "Roma", "Napoli", "Torino", "Palermo", "Genova", "Bologna", 
  "Firenze", "Bari", "Catania", "Venezia", "Verona", "Messina", "Padova",
  "Trieste", "Brescia", "Parma", "Modena", "Reggio Calabria", "Reggio Emilia",
  "Perugia", "Ravenna", "Livorno", "Cagliari", "Foggia", "Rimini", "Salerno",
  "Ferrara", "Sassari", "Latina", "Giugliano in Campania", "Monza", "Bergamo"
];

const CATEGORIES = [
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

const MOODS = [
  'Rilassato', 'Energico', 'Creativo', 'Sociale', 
  'Avventuroso', 'Romantico', 'Divertente', 'Tranquillo'
];

export const AdvancedSearchModal = ({ 
  open, 
  onOpenChange, 
  onSearch, 
  initialFilters = {} 
}: AdvancedSearchModalProps) => {
  const [filters, setFilters] = useState<AdvancedSearchFilters>(initialFilters);
  const [subcategorySearch, setSubcategorySearch] = useState("");

  const selectedCategory = CATEGORIES.find(cat => cat.id === filters.category);
  const availableSubcategories = selectedCategory ? selectedCategory.subcategories : [];
  const filteredSubcategories = availableSubcategories.filter(sub => 
    sub.toLowerCase().includes(subcategorySearch.toLowerCase())
  );

  const handleQuickDate = (type: string) => {
    const today = new Date();
    let dateFrom: Date, dateTo: Date;

    switch (type) {
      case 'today':
        dateFrom = dateTo = today;
        break;
      case 'tomorrow':
        dateFrom = dateTo = addDays(today, 1);
        break;
      case 'weekend':
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        dateFrom = addDays(weekStart, 5); // Saturday
        dateTo = addDays(weekStart, 6); // Sunday
        break;
      case 'week':
        dateFrom = startOfWeek(today, { weekStartsOn: 1 });
        dateTo = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'month':
        dateFrom = startOfMonth(today);
        dateTo = endOfMonth(today);
        break;
      default:
        return;
    }

    setFilters(prev => ({ ...prev, dateFrom, dateTo }));
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    const current = filters.subcategories || [];
    const updated = current.includes(subcategory)
      ? current.filter(s => s !== subcategory)
      : [...current, subcategory];
    setFilters(prev => ({ ...prev, subcategories: updated }));
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const handleSearch = () => {
    onSearch(filters);
    onOpenChange(false);
  };

  const resetFilters = () => {
    setFilters({});
    setSubcategorySearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ricerca Avanzata
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-24">
            {/* Search Query */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cerca</label>
              <Input
                value={filters.query || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Cerca momenti, eventi, persone..."
              />
            </div>

            <Separator />

            {/* Quick Date Buttons */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Quando
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate('today')}
                  className="text-xs"
                >
                  Oggi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate('tomorrow')}
                  className="text-xs"
                >
                  Domani
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate('weekend')}
                  className="text-xs"
                >
                  Weekend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate('week')}
                  className="text-xs"
                >
                  Settimana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate('month')}
                  className="text-xs"
                >
                  Mese
                </Button>
              </div>
              
              {(filters.dateFrom || filters.dateTo) && (
                <div className="text-xs text-muted-foreground">
                  {filters.dateFrom && format(filters.dateFrom, "dd MMM", { locale: it })}
                  {filters.dateFrom && filters.dateTo && " - "}
                  {filters.dateTo && format(filters.dateTo, "dd MMM", { locale: it })}
                </div>
              )}
            </div>

            <Separator />

            {/* Category */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Categoria</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={filters.category === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      category: prev.category === category.id ? undefined : category.id,
                      subcategories: prev.category === category.id ? [] : prev.subcategories
                    }))}
                    className="justify-start text-xs h-10"
                  >
                    <span className="mr-2">{category.emoji}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            {selectedCategory && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Sottocategorie</label>
                <Input
                  placeholder="Cerca sottocategoria..."
                  value={subcategorySearch}
                  onChange={(e) => setSubcategorySearch(e.target.value)}
                  className="text-sm"
                />
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filteredSubcategories.map((subcategory) => (
                    <div
                      key={subcategory}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSubcategoryToggle(subcategory)}
                    >
                      <Checkbox
                        checked={(filters.subcategories || []).includes(subcategory)}
                        onChange={() => handleSubcategoryToggle(subcategory)}
                      />
                      <label className="flex-1 cursor-pointer text-sm">
                        {subcategory}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Province */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Provincia
              </label>
              <Select 
                value={filters.province || "all"} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  province: value === "all" ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona provincia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le provincie</SelectItem>
                  {ITALIAN_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distance */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Distanza massima</label>
              <Slider
                value={[filters.maxDistance || 50]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: value[0] }))}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-center text-xs text-muted-foreground">
                {filters.maxDistance || 50} km
              </div>
            </div>

            <Separator />

            {/* Age Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Fascia d'età</label>
              <Slider
                value={[filters.ageMin || 18, filters.ageMax || 65]}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  ageMin: value[0], 
                  ageMax: value[1] 
                }))}
                min={18}
                max={65}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.ageMin || 18} anni</span>
                <span>{filters.ageMax || 65} anni</span>
              </div>
            </div>

            <Separator />

            {/* Payment */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Prezzo
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={filters.isPaid === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      isPaid: prev.isPaid === false ? null : false,
                      priceMin: undefined,
                      priceMax: undefined
                    }))}
                    className="flex-1"
                  >
                    Gratuiti
                  </Button>
                  <Button
                    variant={filters.isPaid === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      isPaid: prev.isPaid === true ? null : true 
                    }))}
                    className="flex-1"
                  >
                    A pagamento
                  </Button>
                </div>
                
                {filters.isPaid === true && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min €"
                        value={filters.priceMin || ""}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceMin: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max €"
                        value={filters.priceMax || ""}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          priceMax: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Mood */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Mood</label>
              <Select 
                value={filters.mood || "all"} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  mood: value === "all" ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i mood</SelectItem>
                  {MOODS.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed bottom actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-background border-t p-4 space-y-3">
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {activeFiltersCount} filtri attivi
              </span>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          )}
          
          <Button 
            onClick={handleSearch}
            className="w-full gradient-brand text-brand-black font-medium"
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            Cerca ({activeFiltersCount} filtri)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};