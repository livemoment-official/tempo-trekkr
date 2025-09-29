import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Search, MapPin, Users, Plus, Loader2, Filter } from "lucide-react";
import { useQualityVenues } from "@/hooks/useQualityVenues";
import { ProfileQualityBadge, CompletenessBar } from "@/components/ui/profile-quality-badge";
interface VenueSelectionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
export default function VenueSelectionStep({
  data,
  onChange,
  onNext
}: VenueSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minScore, setMinScore] = useState(50);
  
  const {
    data: venues,
    isLoading
  } = useQualityVenues({
    onlyComplete,
    onlyVerified,
    minCompletenessScore: minScore
  });
  const filteredVenues = venues?.filter(venue => venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || venue.venue_type?.toLowerCase().includes(searchQuery.toLowerCase()) || venue.description?.toLowerCase().includes(searchQuery.toLowerCase()) || venue.amenities?.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase()))) || [];
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const toggleVenueSelection = (venueId: string) => {
    const selectedVenues = data.selectedVenues.includes(venueId) ? data.selectedVenues.filter((id: string) => id !== venueId) : [...data.selectedVenues, venueId];
    onChange({
      ...data,
      selectedVenues
    });
  };
  const getSelectedVenues = () => {
    return venues?.filter(venue => data.selectedVenues.includes(venue.id)) || [];
  };
  return <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtri Qualità</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="complete-only-venue" className="text-sm">Solo profili completi</Label>
            <Switch 
              id="complete-only-venue"
              checked={onlyComplete} 
              onCheckedChange={setOnlyComplete} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="verified-only-venue" className="text-sm">Solo verificati</Label>
            <Switch 
              id="verified-only-venue"
              checked={onlyVerified} 
              onCheckedChange={setOnlyVerified} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Punteggio minimo: {minScore}%</Label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Cerca location per nome, tipo o servizi..." className="pl-10" disabled={isLoading} />
      </div>

      {isLoading && <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Caricamento location...</span>
        </div>}

      {/* Selected venues */}
      {data.selectedVenues.length > 0 && !isLoading && <div>
          <h4 className="font-medium mb-3">Location selezionate ({data.selectedVenues.length})</h4>
          <div className="grid grid-cols-1 gap-3">
            {getSelectedVenues().map(venue => <Card key={venue.id} className="border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={(venue.images as string[] | null)?.[0] || '/livemoment-mascot.png'} alt={venue.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-lg">
                          <MapPin className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{venue.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <ProfileQualityBadge 
                            completenessScore={venue.completeness_score || 0}
                            isComplete={venue.is_complete || false}
                            isVerified={venue.verified}
                            size="sm"
                          />
                          {venue.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <span>{venue.venue_type}</span>
                          {venue.capacity && <>
                              <Users className="h-3 w-3 ml-2" />
                              <span>{venue.capacity} persone</span>
                            </>}
                        </div>
                        <CompletenessBar score={venue.completeness_score || 0} className="mb-2" />
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities?.slice(0, 3).map(amenity => <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleVenueSelection(venue.id)}>
                      Rimuovi
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>}

      {/* Available venues */}
      {!isLoading && <div>
        <h4 className="font-medium mb-3">Location disponibili</h4>
        <div className="grid grid-cols-1 gap-3">
          {filteredVenues.filter(venue => !data.selectedVenues.includes(venue.id)).map(venue => <Card key={venue.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={(venue.images as string[] | null)?.[0] || '/livemoment-mascot.png'} alt={venue.name} />
                        <AvatarFallback className="bg-gradient-to-br from-muted to-muted/70 text-muted-foreground rounded-lg">
                          <MapPin className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{venue.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <ProfileQualityBadge 
                            completenessScore={venue.completeness_score || 0}
                            isComplete={venue.is_complete || false}
                            isVerified={venue.verified}
                            size="sm"
                          />
                          {venue.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <span>{venue.venue_type}</span>
                          {venue.capacity && <>
                              <Users className="h-3 w-3 ml-2" />
                              <span>{venue.capacity} persone</span>
                            </>}
                        </div>
                        <CompletenessBar score={venue.completeness_score || 0} className="mb-2" />
                        {venue.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{venue.description}</p>}
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities?.slice(0, 3).map(amenity => <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleVenueSelection(venue.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
        </div>
      </div>}

      {!isLoading && filteredVenues.filter(venue => !data.selectedVenues.includes(venue.id)).length === 0 && <div className="text-center py-8 text-muted-foreground">
          <p>Nessuna location trovata</p>
        </div>}

      <div className="flex justify-end">
        
      </div>
    </div>;
}