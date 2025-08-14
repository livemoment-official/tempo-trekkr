import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Utensils, Wine, Camera, Music, ShoppingBag } from "lucide-react";

interface ActivitySuggestionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

const activities = [
  { title: "Aperitivo", category: "Aperitivo", icon: Wine, duration: 120 },
  { title: "Caffè", category: "Caffè", icon: Coffee, duration: 60 },
  { title: "Cena", category: "Cena", icon: Utensils, duration: 180 },
  { title: "Shopping", category: "Shopping", icon: ShoppingBag, duration: 120 },
  { title: "Fotografia", category: "Fotografia", icon: Camera, duration: 90 },
  { title: "Concerto", category: "Musica", icon: Music, duration: 150 }
];

export default function ActivitySuggestionStep({ data, onChange, onNext }: ActivitySuggestionStepProps) {
  const handleActivitySelect = (activity: any) => {
    onChange({ ...data, activity });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Che attività vuoi proporre?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Seleziona il tipo di attività per trovare le persone giuste
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <Card 
              key={activity.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleActivitySelect(activity)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ~{activity.duration}min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}