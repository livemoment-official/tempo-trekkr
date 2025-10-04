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
import { safeIncludes, safeArrayLength } from "@/lib/safeUtils";
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
  const [accessType, setAccessType] = useState<'both' | 'private_rental' | 'public_booking'>('both');
  const [collaborationType, setCollaborationType] = useState<'both' | 'rental_only' | 'partnership'>('both');
  const {
    data: venues,
    isLoading
  } = useQualityVenues({
    onlyComplete,
    onlyVerified,
    minCompletenessScore: minScore
  });
  const filteredVenues = venues?.filter(venue => {
    // Text search
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || venue.description?.toLowerCase().includes(searchQuery.toLowerCase()) || venue.venue_type?.toLowerCase().includes(searchQuery.toLowerCase()) || venue.amenities?.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // Access type filter
    if (accessType !== 'both') {
      const hasRental = venue.pricing && (venue.pricing as any).rental_cost;
      const hasPublicBooking = venue.venue_type === 'bar' || venue.venue_type === 'restaurant' || venue.venue_type === 'club';
      if (accessType === 'private_rental' && !hasRental) return false;
      if (accessType === 'public_booking' && !hasPublicBooking) return false;
    }

    // Collaboration type filter
    if (collaborationType !== 'both') {
      const supportsPartnership = venue.agreement_types?.includes('partnership') || venue.agreement_types?.includes('revenue_share');
      const supportsRental = venue.pricing && (venue.pricing as any).rental_cost;
      if (collaborationType === 'partnership' && !supportsPartnership) return false;
      if (collaborationType === 'rental_only' && !supportsRental) return false;
    }
    return true;
  }) || [];
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const maxVenues = 3; // Limite massimo venues

  const toggleVenueSelection = (venueId: string) => {
    const currentSelected = data.selectedVenues || [];
    const isSelected = safeIncludes(currentSelected, venueId);
    if (isSelected) {
      // Rimuovi venue
      const selectedVenues = currentSelected.filter((id: string) => id !== venueId);
      onChange({
        ...data,
        selectedVenues
      });
    } else {
      // Aggiungi venue se non supera il limite
      if (safeArrayLength(currentSelected) < maxVenues) {
        const selectedVenues = [...currentSelected, venueId];
        onChange({
          ...data,
          selectedVenues
        });
      }
    }
  };
  const getSelectedVenues = () => {
    const currentSelected = data.selectedVenues || [];
    return venues?.filter(venue => safeIncludes(currentSelected, venue.id)) || [];
  };
  return <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtri Ricerca</span>
        </div>
        
        {/* Quality Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="venue-complete" className="text-sm">Solo profili completi</Label>
            <Switch id="venue-complete" checked={onlyComplete} onCheckedChange={setOnlyComplete} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="venue-verified" className="text-sm">Solo verificate</Label>
            <Switch id="venue-verified" checked={onlyVerified} onCheckedChange={setOnlyVerified} />
          </div>
          
        </div>

        {/* Advanced Filters */}
        <div className="border-t pt-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo di Accesso</Label>
            <div className="flex gap-2">
              <Button type="button" variant={accessType === 'both' ? 'default' : 'outline'} size="sm" onClick={() => setAccessType('both')} className="flex-1">
                Tutti
              </Button>
              <Button type="button" variant={accessType === 'private_rental' ? 'default' : 'outline'} size="sm" onClick={() => setAccessType('private_rental')} className="flex-1">
                🏢 Affitto Privato
              </Button>
              <Button type="button" variant={accessType === 'public_booking' ? 'default' : 'outline'} size="sm" onClick={() => setAccessType('public_booking')} className="flex-1">
                🌐 Prenotazione Pubblica
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Modalità di Collaborazione</Label>
            <div className="flex gap-2">
              <Button type="button" variant={collaborationType === 'both' ? 'default' : 'outline'} size="sm" onClick={() => setCollaborationType('both')} className="flex-1">
                Tutti
              </Button>
              <Button type="button" variant={collaborationType === 'rental_only' ? 'default' : 'outline'} size="sm" onClick={() => setCollaborationType('rental_only')} className="flex-1">
                Solo Affitto
              </Button>
              <Button type="button" variant={collaborationType === 'partnership' ? 'default' : 'outline'} size="sm" onClick={() => setCollaborationType('partnership')} className="flex-1">
                Partnership
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Affitto:</strong> costo fisso per l'intera sala • <strong>Partnership:</strong> accordo basato su revenue share o collaborazione
            </p>
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
      {safeArrayLength(data.selectedVenues) > 0 && !isLoading && <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Location selezionate ({safeArrayLength(data.selectedVenues)}/{maxVenues})</h4>
            <div className="text-sm text-muted-foreground">
              Prima che accetta vince!
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {getSelectedVenues().map((venue, index) => <Card key={venue.id} className="border-primary/50 relative">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={(venue.images as string[] | null)?.[0] || '/livemoment-mascot.png'} alt={venue.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-lg">
                            <MapPin className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{venue.name}</span>
                          {index === 0 && <Badge variant="default" className="text-xs">Priorità Alta</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <ProfileQualityBadge completenessScore={venue.completeness_score || 0} isComplete={venue.is_complete || false} isVerified={venue.verified} size="sm" />
                          {venue.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <span className="truncate">{venue.venue_type}</span>
                          {venue.capacity && <>
                              <Users className="h-3 w-3 ml-2 flex-shrink-0" />
                              <span className="flex-shrink-0">{venue.capacity} persone</span>
                            </>}
                        </div>
                        <CompletenessBar score={venue.completeness_score || 0} className="mb-2" />
                        <div className="flex flex-wrap gap-1 mb-2">
                          {venue.amenities?.slice(0, 3).map(amenity => <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>)}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {venue.pricing && (venue.pricing as any).rental_cost && <Badge variant="secondary" className="text-xs">
                              💶 Affitto
                            </Badge>}
                          {venue.agreement_types?.includes('partnership') && <Badge variant="outline" className="text-xs">
                              🤝 Partnership
                            </Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Button variant="outline" size="sm" onClick={() => toggleVenueSelection(venue.id)} className="min-w-[80px]">
                        Rimuovi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>}

      {/* Available venues */}
      {!isLoading && <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Location disponibili</h4>
          {safeArrayLength(data.selectedVenues) >= maxVenues && <Badge variant="secondary" className="text-xs">
              Limite raggiunto ({maxVenues})
            </Badge>}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filteredVenues.filter(venue => !safeIncludes(data.selectedVenues || [], venue.id)).map(venue => <Card key={venue.id} className={`hover:shadow-md transition-all cursor-pointer ${safeArrayLength(data.selectedVenues) >= maxVenues ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={(venue.images as string[] | null)?.[0] || '/livemoment-mascot.png'} alt={venue.name} />
                        <AvatarFallback className="bg-gradient-to-br from-muted to-muted/70 text-muted-foreground rounded-lg">
                          <MapPin className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{venue.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <ProfileQualityBadge completenessScore={venue.completeness_score || 0} isComplete={venue.is_complete || false} isVerified={venue.verified} size="sm" />
                          {venue.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <span className="truncate">{venue.venue_type}</span>
                          {venue.capacity && <>
                              <Users className="h-3 w-3 ml-2 flex-shrink-0" />
                              <span className="flex-shrink-0">{venue.capacity} persone</span>
                            </>}
                        </div>
                        <CompletenessBar score={venue.completeness_score || 0} className="mb-2" />
                        {venue.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{venue.description}</p>}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {venue.amenities?.slice(0, 3).map(amenity => <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>)}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {venue.pricing && (venue.pricing as any).rental_cost && <Badge variant="secondary" className="text-xs">
                              💶 Affitto
                            </Badge>}
                          {venue.agreement_types?.includes('partnership') && <Badge variant="outline" className="text-xs">
                              🤝 Partnership
                            </Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Button variant="outline" size="sm" onClick={() => toggleVenueSelection(venue.id)} disabled={safeArrayLength(data.selectedVenues) >= maxVenues} className="min-w-[80px]">
                        <Plus className="h-4 w-4 mr-1" />
                        Aggiungi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
        </div>
      </div>}

      {!isLoading && filteredVenues.filter(venue => !safeIncludes(data.selectedVenues || [], venue.id)).length === 0 && <div className="text-center py-8 text-muted-foreground">
          <p>Nessuna location trovata</p>
        </div>}

      <div className="flex justify-end">
        
      </div>
    </div>;
}