import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Plus } from "lucide-react";

interface ArtistSelectionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

// Mock data for artists
const mockArtists = [
  {
    id: "1",
    name: "Marco Rossi",
    genres: ["Jazz", "Blues"],
    location: "Milano",
    verified: true,
    avatar: null
  },
  {
    id: "2", 
    name: "DJ Elena",
    genres: ["Electronic", "House"],
    location: "Roma", 
    verified: false,
    avatar: null
  },
  {
    id: "3",
    name: "Band Aurora",
    genres: ["Rock", "Indie"],
    location: "Torino",
    verified: true,
    avatar: null
  }
];

export default function ArtistSelectionStep({ data, onChange, onNext }: ArtistSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArtists, setFilteredArtists] = useState(mockArtists);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockArtists.filter(artist =>
      artist.name.toLowerCase().includes(query.toLowerCase()) ||
      artist.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredArtists(filtered);
  };

  const toggleArtistSelection = (artistId: string) => {
    const selectedArtists = data.selectedArtists.includes(artistId)
      ? data.selectedArtists.filter((id: string) => id !== artistId)
      : [...data.selectedArtists, artistId];
    
    onChange({ ...data, selectedArtists });
  };

  const getSelectedArtists = () => {
    return mockArtists.filter(artist => data.selectedArtists.includes(artist.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Seleziona artisti</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Cerca e invita artisti per il tuo evento
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Cerca artisti per nome o genere..."
          className="pl-10"
        />
      </div>

      {/* Selected artists */}
      {data.selectedArtists.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Artisti selezionati ({data.selectedArtists.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getSelectedArtists().map((artist) => (
              <Card key={artist.id} className="border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{artist.name}</span>
                          {artist.verified && (
                            <Badge variant="secondary" className="text-xs">Verificato</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{artist.location}</p>
                        <div className="flex gap-1 mt-1">
                          {artist.genres.map((genre) => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleArtistSelection(artist.id)}
                    >
                      Rimuovi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available artists */}
      <div>
        <h4 className="font-medium mb-3">Artisti disponibili</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredArtists
            .filter(artist => !data.selectedArtists.includes(artist.id))
            .map((artist) => (
              <Card key={artist.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted/70 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{artist.name}</span>
                          {artist.verified && (
                            <Badge variant="secondary" className="text-xs">Verificato</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{artist.location}</p>
                        <div className="flex gap-1 mt-1">
                          {artist.genres.map((genre) => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleArtistSelection(artist.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {filteredArtists.filter(artist => !data.selectedArtists.includes(artist.id)).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nessun artista trovato</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Continua
        </Button>
      </div>
    </div>
  );
}