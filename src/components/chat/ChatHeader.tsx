import { ArrowLeft, Settings, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onShowParticipants: () => void;
  onShowSettings: () => void;
  avatar?: React.ReactNode;
  chatType?: 'group' | 'moment' | 'city' | 'friend' | 'conversation';
  eventDate?: string;
  eventTime?: string;
  location?: string;
  participantCount?: number;
}

export function ChatHeader({ 
  title, 
  subtitle, 
  onBack, 
  onShowParticipants, 
  onShowSettings,
  avatar,
  chatType,
  eventDate,
  eventTime,
  location,
  participantCount
}: ChatHeaderProps) {
  
  // Generate contextual subtitle based on chat type
  const getContextualSubtitle = () => {
    if (subtitle) return subtitle;
    
    switch (chatType) {
      case 'moment':
        if (eventDate && eventTime) {
          return `${eventDate} alle ${eventTime}`;
        }
        if (location) {
          return location;
        }
        return 'Chat del momento';
      case 'city':
        return 'Chat della città';
      case 'group':
        return participantCount ? `${participantCount} partecipanti` : 'Chat di gruppo';
      case 'friend':
      case 'conversation':
        return 'Conversazione privata';
      default:
        return undefined;
    }
  };
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-3 flex-1">
        {avatar}
        
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{title}</h1>
          {getContextualSubtitle() && (
            <p className="text-sm text-muted-foreground truncate">{getContextualSubtitle()}</p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onShowParticipants}>
            Vedi partecipanti
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onShowSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Impostazioni chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}