import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOMENT_CATEGORIES } from "@/constants/unifiedTags";
import { Wine, Coffee, Utensils, Camera, Music, ShoppingBag, Dumbbell, Palette, Clapperboard, BookOpen, Beer, Plane, Gamepad2, Sparkles, Cake, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
interface ActivitySuggestionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

// Map MOMENT_CATEGORIES to icons and durations
const categoryMapping: Record<string, {
  icon: LucideIcon;
  duration: number;
}> = {
  "🍽️ Aperitivo": {
    icon: Wine,
    duration: 120
  },
  "☕ Caffè": {
    icon: Coffee,
    duration: 60
  },
  "🍷 Cena": {
    icon: Utensils,
    duration: 180
  },
  "🎭 Teatro": {
    icon: Clapperboard,
    duration: 150
  },
  "🎨 Arte": {
    icon: Palette,
    duration: 90
  },
  "🎵 Musica Live": {
    icon: Music,
    duration: 180
  },
  "🏋️ Sport": {
    icon: Dumbbell,
    duration: 90
  },
  "📚 Cultura": {
    icon: BookOpen,
    duration: 120
  },
  "🎬 Cinema": {
    icon: Clapperboard,
    duration: 150
  },
  "📷 Fotografia": {
    icon: Camera,
    duration: 90
  },
  "🛍️ Shopping": {
    icon: ShoppingBag,
    duration: 120
  },
  "🍺 Pub": {
    icon: Beer,
    duration: 120
  },
  "✈️ Viaggio": {
    icon: Plane,
    duration: 240
  },
  "🎮 Gaming": {
    icon: Gamepad2,
    duration: 120
  },
  "✨ Festa": {
    icon: Sparkles,
    duration: 180
  },
  "🎂 Compleanno": {
    icon: Cake,
    duration: 180
  },
  "💑 Romantico": {
    icon: Heart,
    duration: 120
  }
};

// Create activities array from unified categories
const activities = MOMENT_CATEGORIES.map(category => {
  const mapping = categoryMapping[category] || {
    icon: Wine,
    duration: 120
  };
  return {
    title: category,
    category: category,
    icon: mapping.icon,
    duration: mapping.duration
  };
});
export default function ActivitySuggestionStep({
  data,
  onChange,
  onNext
}: ActivitySuggestionStepProps) {
  const handleActivitySelect = (activity: any) => {
    onChange({
      ...data,
      activity: activity.title,
      activity_category: activity.category
    });
    onNext();
  };
  return <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Che attività vuoi proporre?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Seleziona il tipo di attività per trovare le persone giuste
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map(activity => {
        const Icon = activity.icon;
        return <Card key={activity.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleActivitySelect(activity)}>
              <CardContent className="p-4 flex items-center gap-4">
                
                <div className="flex-1">
                  
                  <div className="flex items-center gap-2 mt-1">
                    
                    
                  </div>
                </div>
              </CardContent>
            </Card>;
      })}
      </div>
    </div>;
}