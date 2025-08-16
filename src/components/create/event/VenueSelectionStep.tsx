import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, Plus } from "lucide-react";
interface VenueSelectionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

// Mock data for venues
const mockVenues = [{
  id: "1",
  name: "Teatro Alla Scala",
  location: "Milano",
  capacity: 2000,
  amenities: ["Audio professionale", "Palco", "Parcheggio"],
  verified: true
}, {
  id: "2",
  name: "Club Alcatraz",
  location: "Milano",
  capacity: 500,
  amenities: ["Dancefloor", "Bar", "Luci LED"],
  verified: true
}, {
  id: "3",
  name: "Palazzo dei Congressi",
  location: "Roma",
  capacity: 1000,
  amenities: ["Sale conferenze", "Catering", "Wi-Fi"],
  verified: false
}];
export default function VenueSelectionStep({
  data,
  onChange,
  onNext
}: VenueSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVenues, setFilteredVenues] = useState(mockVenues);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockVenues.filter(venue => venue.name.toLowerCase().includes(query.toLowerCase()) || venue.location.toLowerCase().includes(query.toLowerCase()) || venue.amenities.some(amenity => amenity.toLowerCase().includes(query.toLowerCase())));
    setFilteredVenues(filtered);
  };
  const toggleVenueSelection = (venueId: string) => {
    const selectedVenues = data.selectedVenues.includes(venueId) ? data.selectedVenues.filter((id: string) => id !== venueId) : [...data.selectedVenues, venueId];
    onChange({
      ...data,
      selectedVenues
    });
  };
  const getSelectedVenues = () => {
    return mockVenues.filter(venue => data.selectedVenues.includes(venue.id));
  };
  return <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Seleziona location</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Cerca e seleziona le location per il tuo evento
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Cerca location per nome, città o servizi..." className="pl-10" />
      </div>

      {/* Selected venues */}
      {data.selectedVenues.length > 0 && <div>
          <h4 className="font-medium mb-3">Location selezionate ({data.selectedVenues.length})</h4>
          <div className="grid grid-cols-1 gap-3">
            {getSelectedVenues().map(venue => <Card key={venue.id} className="border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{venue.name}</span>
                          {venue.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{venue.location}</span>
                          <Users className="h-3 w-3 ml-2" />
                          <span>{venue.capacity} persone</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.map(amenity => <Badge key={amenity} variant="outline" className="text-xs">
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
      <div>
        <h4 className="font-medium mb-3">Location disponibili</h4>
        <div className="grid grid-cols-1 gap-3">
          {filteredVenues.filter(venue => !data.selectedVenues.includes(venue.id)).map(venue => <Card key={venue.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted/70 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{venue.name}</span>
                          {venue.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{venue.location}</span>
                          <Users className="h-3 w-3 ml-2" />
                          <span>{venue.capacity} persone</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.map(amenity => <Badge key={amenity} variant="outline" className="text-xs">
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
      </div>

      {filteredVenues.filter(venue => !data.selectedVenues.includes(venue.id)).length === 0 && <div className="text-center py-8 text-muted-foreground">
          <p>Nessuna location trovata</p>
        </div>}

      <div className="flex justify-end">
        
      </div>
    </div>;
}