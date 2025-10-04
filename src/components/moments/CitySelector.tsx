import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Navigation, Search } from "lucide-react";

const ITALIAN_CITIES = [
  "Milano", "Roma", "Torino", "Napoli", "Palermo",
  "Genova", "Bologna", "Firenze", "Bari", "Catania",
  "Venezia", "Verona", "Messina", "Padova", "Trieste",
  "Como", "Brescia", "Parma", "Modena", "Reggio Emilia",
  "Perugia", "Livorno", "Cagliari", "Foggia", "Salerno",
  "Ravenna", "Rimini", "Ferrara", "Sassari", "Monza",
  "Bergamo", "Trento", "Prato", "Taranto", "Latina",
  "Ancona", "Udine", "Piacenza", "Caserta", "Pescara",
  "Vicenza", "Siena", "Lucca", "Treviso", "Lecce"
].sort();

interface CitySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCity: string;
  onCitySelect: (city: string) => void;
  onUseCurrentLocation: () => void;
}

export function CitySelector({
  open,
  onOpenChange,
  selectedCity,
  onCitySelect,
  onUseCurrentLocation
}: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCities = ITALIAN_CITIES.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    onCitySelect(city);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleziona Città</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca città..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Current Location Button */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              onUseCurrentLocation();
              onOpenChange(false);
            }}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Usa posizione attuale
          </Button>

          {/* Cities List */}
          <ScrollArea className="h-[300px] rounded-md border">
            <div className="p-2">
              {filteredCities.length > 0 ? (
                <div className="space-y-1">
                  {filteredCities.map((city) => (
                    <Button
                      key={city}
                      variant={selectedCity === city ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleCitySelect(city)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {city}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Nessuna città trovata
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
