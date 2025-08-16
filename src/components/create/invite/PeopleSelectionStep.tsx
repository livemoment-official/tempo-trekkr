import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Heart, Plus, Check } from "lucide-react";
interface PeopleSelectionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

// Mock data for available people
const mockPeople = [{
  id: "1",
  name: "Sofia",
  mood: "energica",
  distance: "2km",
  availability: "Ora",
  interests: ["Arte", "Caffè"]
}, {
  id: "2",
  name: "Marco",
  mood: "rilassato",
  distance: "1km",
  availability: "Ora",
  interests: ["Musica", "Aperitivo"]
}, {
  id: "3",
  name: "Elena",
  mood: "social",
  distance: "3km",
  availability: "Tra 1h",
  interests: ["Shopping", "Cena"]
}];
export default function PeopleSelectionStep({
  data,
  onChange,
  onNext
}: PeopleSelectionStepProps) {
  const togglePersonSelection = (personId: string) => {
    const selected = data.selectedPeople.includes(personId) ? data.selectedPeople.filter((id: string) => id !== personId) : [...data.selectedPeople, personId];
    onChange({
      ...data,
      selectedPeople: selected
    });
  };
  return <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Chi vuoi invitare?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Persone disponibili ordinate per vicinanza e affinità
        </p>
      </div>

      <div className="space-y-3">
        {mockPeople.map(person => {
        const isSelected = data.selectedPeople.includes(person.id);
        return <Card key={person.id} className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{person.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{person.name}</span>
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          {person.mood}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {person.distance}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {person.availability}
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {person.interests.map(interest => <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>)}
                      </div>
                    </div>
                  </div>
                  <Button variant={isSelected ? "default" : "outline"} size="sm" onClick={() => togglePersonSelection(person.id)}>
                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>;
      })}
      </div>

      <div className="flex justify-end">
        
      </div>
    </div>;
}