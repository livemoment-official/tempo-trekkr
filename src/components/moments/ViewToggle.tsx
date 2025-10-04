import { Button } from "@/components/ui/button";
import { List, MapPin } from "lucide-react";

interface ViewToggleProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-center gap-1 bg-muted p-1 rounded-lg w-fit">
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={`p-2 ${view === 'list' ? 'bg-background text-foreground shadow-sm' : ''}`}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'map' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('map')}
        className={`p-2 ${view === 'map' ? 'bg-background text-foreground shadow-sm' : ''}`}
      >
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  );
}
