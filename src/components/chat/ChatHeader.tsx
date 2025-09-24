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
}

export function ChatHeader({ 
  title, 
  subtitle, 
  onBack, 
  onShowParticipants, 
  onShowSettings,
  avatar 
}: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-3 flex-1">
        {avatar}
        
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
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