import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Search, User, Plus, Loader2, Filter } from "lucide-react";
import { useQualityArtists } from "@/hooks/useQualityArtists";
import { ProfileQualityBadge, CompletenessBar } from "@/components/ui/profile-quality-badge";
interface ArtistSelectionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
export default function ArtistSelectionStep({
  data,
  onChange,
  onNext
}: ArtistSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minScore, setMinScore] = useState(50);
  
  const {
    data: artists,
    isLoading
  } = useQualityArtists({
    onlyComplete,
    onlyVerified,
    minCompletenessScore: minScore
  });
  const filteredArtists = artists?.filter(artist => artist.name.toLowerCase().includes(searchQuery.toLowerCase()) || artist.stage_name?.toLowerCase().includes(searchQuery.toLowerCase()) || artist.genres?.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())) || artist.artist_type?.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const toggleArtistSelection = (artistId: string) => {
    const selectedArtists = data.selectedArtists.includes(artistId) ? data.selectedArtists.filter((id: string) => id !== artistId) : [...data.selectedArtists, artistId];
    onChange({
      ...data,
      selectedArtists
    });
  };
  const getSelectedArtists = () => {
    return artists?.filter(artist => data.selectedArtists.includes(artist.id)) || [];
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
            <Label htmlFor="complete-only" className="text-sm">Solo profili completi</Label>
            <Switch 
              id="complete-only"
              checked={onlyComplete} 
              onCheckedChange={setOnlyComplete} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="verified-only" className="text-sm">Solo verificati</Label>
            <Switch 
              id="verified-only"
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
        <Input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Cerca artisti per nome, genere o tipo..." className="pl-10" disabled={isLoading} />
      </div>

      {isLoading && <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Caricamento artisti...</span>
        </div>}

      {/* Selected artists */}
      {data.selectedArtists.length > 0 && !isLoading && <div>
          <h4 className="font-medium mb-3">Artisti selezionati ({data.selectedArtists.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getSelectedArtists().map(artist => <Card key={artist.id} className="border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={artist.avatar_url || '/livemoment-mascot.png'} alt={artist.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                          {artist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{artist.name}</span>
                          {artist.stage_name && <span className="text-sm text-muted-foreground">({artist.stage_name})</span>}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <ProfileQualityBadge 
                            completenessScore={artist.completeness_score || 0}
                            isComplete={artist.is_complete || false}
                            isVerified={artist.verified}
                            size="sm"
                          />
                          {artist.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{artist.artist_type}</p>
                        <CompletenessBar score={artist.completeness_score || 0} className="mb-2" />
                        <div className="flex gap-1 flex-wrap">
                          {artist.genres?.slice(0, 3).map(genre => <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleArtistSelection(artist.id)}>
                      Rimuovi
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>}

      {/* Available artists */}
      {!isLoading && <div>
        <h4 className="font-medium mb-3">Artisti disponibili</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredArtists.filter(artist => !data.selectedArtists.includes(artist.id)).map(artist => <Card key={artist.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={artist.avatar_url || '/livemoment-mascot.png'} alt={artist.name} />
                        <AvatarFallback className="bg-gradient-to-br from-muted to-muted/70 text-muted-foreground">
                          {artist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{artist.name}</span>
                          {artist.stage_name && <span className="text-sm text-muted-foreground">({artist.stage_name})</span>}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <ProfileQualityBadge 
                            completenessScore={artist.completeness_score || 0}
                            isComplete={artist.is_complete || false}
                            isVerified={artist.verified}
                            size="sm"
                          />
                          {artist.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{artist.artist_type}</p>
                        <CompletenessBar score={artist.completeness_score || 0} className="mb-2" />
                        {artist.bio && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{artist.bio}</p>}
                        <div className="flex gap-1 flex-wrap">
                          {artist.genres?.slice(0, 3).map(genre => <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleArtistSelection(artist.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
        </div>
      </div>}

      {filteredArtists.filter(artist => !data.selectedArtists.includes(artist.id)).length === 0 && <div className="text-center py-8 text-muted-foreground">
          <p>Nessun artista trovato</p>
        </div>}

      <div className="flex justify-end">
        
      </div>
    </div>;
}