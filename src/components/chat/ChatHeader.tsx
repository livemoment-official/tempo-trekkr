import { ArrowLeft, Settings, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  onCreateMoment?: () => void;
  showCreateMoment?: boolean;
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
  participantCount,
  onCreateMoment,
  showCreateMoment
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
  return <div className="bg-card border-b border-border">
      {/* Main header with title and actions */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {avatar}
          
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showCreateMoment && onCreateMoment && <Button variant="default" size="sm" onClick={onCreateMoment} className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Crea il Momento
            </Button>}
          
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
                Impostazioni
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contextual information row */}
      {getContextualSubtitle() && <div className="px-4 pb-3">
          
        </div>}
    </div>;
}