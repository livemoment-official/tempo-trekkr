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
import { safeIncludes, safeArrayLength } from "@/lib/safeUtils";
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
  const [paymentType, setPaymentType] = useState<'both' | 'with_cachet' | 'without_cachet'>('both');
  const [collaborationType, setCollaborationType] = useState<'both' | 'emergent' | 'professional'>('both');
  const {
    data: artists,
    isLoading
  } = useQualityArtists({
    onlyComplete,
    onlyVerified,
    minCompletenessScore: minScore
  });
  const filteredArtists = artists?.filter(artist => {
    // Text search
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) || artist.stage_name?.toLowerCase().includes(searchQuery.toLowerCase()) || artist.genres?.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())) || artist.artist_type?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Payment type filter
    if (paymentType !== 'both') {
      const hasCachet = artist.cachet_info && Object.keys(artist.cachet_info).length > 0;
      if (paymentType === 'with_cachet' && !hasCachet) return false;
      if (paymentType === 'without_cachet' && hasCachet) return false;
    }

    // Collaboration type filter
    if (collaborationType !== 'both') {
      // We consider "emergent" as artists with less experience or without cachet
      // and "professional" as verified or with cachet
      const isEmergent = !artist.verified && (!artist.cachet_info || Object.keys(artist.cachet_info).length === 0);
      const isProfessional = artist.verified || artist.cachet_info && Object.keys(artist.cachet_info).length > 0;
      if (collaborationType === 'emergent' && !isEmergent) return false;
      if (collaborationType === 'professional' && !isProfessional) return false;
    }
    return true;
  }) || [];
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const toggleArtistSelection = (artistId: string) => {
    const currentSelected = data.selectedArtists || [];
    const selectedArtists = safeIncludes(currentSelected, artistId) ? currentSelected.filter((id: string) => id !== artistId) : [...currentSelected, artistId];
    onChange({
      ...data,
      selectedArtists
    });
  };
  const getSelectedArtists = () => {
    const currentSelected = data.selectedArtists || [];
    return artists?.filter(artist => safeIncludes(currentSelected, artist.id)) || [];
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
            <Label htmlFor="complete-only" className="text-sm">Solo profili completi</Label>
            <Switch id="complete-only" checked={onlyComplete} onCheckedChange={setOnlyComplete} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="verified-only" className="text-sm">Solo verificati</Label>
            <Switch id="verified-only" checked={onlyVerified} onCheckedChange={setOnlyVerified} />
          </div>
          
        </div>

        {/* Advanced Filters */}
        <div className="border-t pt-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo di Compenso</Label>
            <div className="flex gap-2">
              <Button type="button" variant={paymentType === 'both' ? 'default' : 'outline'} size="sm" onClick={() => setPaymentType('both')} className="flex-1">
                Tutti
              </Button>
              <Button type="button" variant={paymentType === 'with_cachet' ? 'default' : 'outline'} size="sm" onClick={() => setPaymentType('with_cachet')} className="flex-1">
                Con Cachet
              </Button>
              <Button type="button" variant={paymentType === 'without_cachet' ? 'default' : 'outline'} size="sm" onClick={() => setPaymentType('without_cachet')} className="flex-1">
                Senza Cachet
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo di Collaborazione</Label>
            <div className="flex gap-2">
              <Button type="button" variant={collaborationType === 'both' ? 'default' : 'outline'} size="sm" onClick={() => setCollaborationType('both')} className="flex-1">
                Tutti
              </Button>
              <Button type="button" variant={collaborationType === 'emergent' ? 'default' : 'outline'} size="sm" onClick={() => setCollaborationType('emergent')} className="flex-1">
                Progetto Emergente
              </Button>
              <Button type="button" variant={collaborationType === 'professional' ? 'default' : 'outline'} size="sm" onClick={() => setCollaborationType('professional')} className="flex-1">
                Lavoro Artistico
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Emergente:</strong> collaborazione alla pari, visibilità reciproca • <strong>Artistico:</strong> performance professionale retribuita
            </p>
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
      {safeArrayLength(data.selectedArtists) > 0 && !isLoading && <div>
          <h4 className="font-medium mb-3">Artisti selezionati ({safeArrayLength(data.selectedArtists)})</h4>
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
                          <ProfileQualityBadge completenessScore={artist.completeness_score || 0} isComplete={artist.is_complete || false} isVerified={artist.verified} size="sm" />
                          {artist.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{artist.artist_type}</p>
                        <CompletenessBar score={artist.completeness_score || 0} className="mb-2" />
                        <div className="flex gap-1 flex-wrap mb-2">
                          {artist.genres?.slice(0, 3).map(genre => <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>)}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {artist.cachet_info && Object.keys(artist.cachet_info).length > 0 && <Badge variant="secondary" className="text-xs">
                              💰 Con Cachet
                            </Badge>}
                          {!artist.verified && (!artist.cachet_info || Object.keys(artist.cachet_info).length === 0) && <Badge variant="outline" className="text-xs">
                              🌱 Emergente
                            </Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Button variant="outline" size="sm" onClick={() => toggleArtistSelection(artist.id)} className="min-w-[80px]">
                        Rimuovi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>}

      {/* Available artists */}
      {!isLoading && <div>
        <h4 className="font-medium mb-3">Artisti disponibili</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredArtists.filter(artist => !safeIncludes(data.selectedArtists || [], artist.id)).map(artist => <Card key={artist.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                          <ProfileQualityBadge completenessScore={artist.completeness_score || 0} isComplete={artist.is_complete || false} isVerified={artist.verified} size="sm" />
                          {artist.verified && <Badge variant="secondary" className="text-xs">Verificato</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{artist.artist_type}</p>
                        <CompletenessBar score={artist.completeness_score || 0} className="mb-2" />
                        {artist.bio && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{artist.bio}</p>}
                        <div className="flex gap-1 flex-wrap mb-2">
                          {artist.genres?.slice(0, 3).map(genre => <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>)}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {artist.cachet_info && Object.keys(artist.cachet_info).length > 0 && <Badge variant="secondary" className="text-xs">
                              💰 Con Cachet
                            </Badge>}
                          {!artist.verified && (!artist.cachet_info || Object.keys(artist.cachet_info).length === 0) && <Badge variant="outline" className="text-xs">
                              🌱 Emergente
                            </Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Button variant="outline" size="sm" onClick={() => toggleArtistSelection(artist.id)} className="min-w-[80px]">
                        <Plus className="h-4 w-4 mr-1" />
                        Aggiungi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
        </div>
      </div>}

      {filteredArtists.filter(artist => !safeIncludes(data.selectedArtists || [], artist.id)).length === 0 && <div className="text-center py-8 text-muted-foreground">
          <p>Nessun artista trovato</p>
        </div>}

      <div className="flex justify-end">
        
      </div>
    </div>;
}