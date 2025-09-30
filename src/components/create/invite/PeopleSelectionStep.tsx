import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Heart, Plus, Check, Loader2 } from "lucide-react";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PeopleSelectionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
export default function PeopleSelectionStep({
  data,
  onChange,
  onNext
}: PeopleSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const userLocation = useUserLocation();
  const { data: users, isLoading } = useAllUsers(
    userLocation.getUserLocation ? null : { lat: 0, lng: 0 }
  );

  const togglePersonSelection = (personId: string) => {
    const selected = data.selectedPeople.includes(personId) 
      ? data.selectedPeople.filter((id: string) => id !== personId) 
      : [...data.selectedPeople, personId];
    onChange({
      ...data,
      selectedPeople: selected
    });
  };

  // Filter users based on search query
  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.interests?.some(interest => interest.toLowerCase().includes(query))
    );
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Chi vuoi invitare?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Persone disponibili ordinate per vicinanza e affinità
        </p>
      </div>

      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Cerca per nome o interessi..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Users List */}
      {!isLoading && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "Nessun utente trovato" : "Nessun utente disponibile al momento"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map(person => {
              const isSelected = data.selectedPeople.includes(person.id);
              return (
                <Card 
                  key={person.id} 
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                  onClick={() => togglePersonSelection(person.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={person.avatar_url} alt={person.name} />
                          <AvatarFallback>{person.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{person.name || person.username}</span>
                            {person.mood && (
                              <Badge variant="outline" className="text-xs">
                                <Heart className="h-3 w-3 mr-1" />
                                {person.mood}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {person.distance_km !== undefined && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {person.distance_km.toFixed(1)}km
                              </div>
                            )}
                            {person.job_title && (
                              <span className="text-xs">{person.job_title}</span>
                            )}
                          </div>
                          {person.interests && person.interests.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {person.interests.slice(0, 3).map((interest, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant={isSelected ? "default" : "outline"} 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePersonSelection(person.id);
                        }}
                      >
                        {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Selection Count */}
      {data.selectedPeople.length > 0 && (
        <div className="bg-primary/10 rounded-lg p-3 text-center">
          <p className="text-sm font-medium">
            {data.selectedPeople.length} {data.selectedPeople.length === 1 ? 'persona selezionata' : 'persone selezionate'}
          </p>
        </div>
      )}
    </div>
  );
}