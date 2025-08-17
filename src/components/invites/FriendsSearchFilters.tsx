import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, Heart, X } from "lucide-react";

interface FriendsSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  availabilityFilter: string;
  onAvailabilityChange: (availability: string) => void;
}

const moods = [
  "🎉 Festaiolo",
  "🍕 Chill", 
  "🎭 Artistico",
  "🏃‍♂️ Sportivo",
  "📚 Culturale",
  "🌙 Romantico",
  "🎵 Musicale",
  "🍽️ Gourmet"
];

const availabilityOptions = [
  { value: "all", label: "Tutti" },
  { value: "now", label: "Ora" },
  { value: "today", label: "Oggi" },
  { value: "weekend", label: "Questo weekend" },
  { value: "week", label: "Questa settimana" }
];

export default function FriendsSearchFilters({
  searchQuery,
  onSearchChange,
  selectedMood,
  onMoodChange,
  radiusKm,
  onRadiusChange,
  availabilityFilter,
  onAvailabilityChange
}: FriendsSearchFiltersProps) {
  return (
    <Card className="border-muted/50">
      <CardContent className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Cerca per nome, username o interessi..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1.5 h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Availability Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Disponibilità</span>
            </div>
            <Select value={availabilityFilter} onValueChange={onAvailabilityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Distanza</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {radiusKm} km
              </Badge>
            </div>
            <Slider
              value={[radiusKm]}
              onValueChange={(value) => onRadiusChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Mood Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mood</span>
            </div>
            <Select value={selectedMood} onValueChange={onMoodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti i mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i mood</SelectItem>
                {moods.map(mood => (
                  <SelectItem key={mood} value={mood}>
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedMood !== "all" || availabilityFilter !== "all" || radiusKm !== 5) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-muted/50">
            <span className="text-xs text-muted-foreground">Filtri attivi:</span>
            {searchQuery && (
              <Badge variant="minimal" className="text-xs">
                Ricerca: {searchQuery}
                <button 
                  onClick={() => onSearchChange("")}
                  className="ml-2 hover:text-destructive font-medium"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedMood !== "all" && (
              <Badge variant="minimal" className="text-xs">
                Mood: {selectedMood}
                <button 
                  onClick={() => onMoodChange("all")}
                  className="ml-2 hover:text-destructive font-medium"
                >
                  ×
                </button>
              </Badge>
            )}
            {availabilityFilter !== "all" && (
              <Badge variant="minimal" className="text-xs">
                Disponibilità: {availabilityOptions.find(o => o.value === availabilityFilter)?.label}
                <button 
                  onClick={() => onAvailabilityChange("all")}
                  className="ml-2 hover:text-destructive font-medium"
                >
                  ×
                </button>
              </Badge>
            )}
            {radiusKm !== 5 && (
              <Badge variant="minimal" className="text-xs">
                Distanza: {radiusKm}km
                <button 
                  onClick={() => onRadiusChange(5)}
                  className="ml-2 hover:text-destructive font-medium"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}