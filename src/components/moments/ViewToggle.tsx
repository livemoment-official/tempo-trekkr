import { Button } from "@/components/ui/button";
import { List, MapPin } from "lucide-react";

interface ViewToggleProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
  isVisible?: boolean;
}

export function ViewToggle({ view, onViewChange, isVisible = true }: ViewToggleProps) {
  return (
    <div 
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        flex items-center justify-center gap-1 bg-muted/90 p-1 rounded-lg w-fit
        shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}
    >
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
