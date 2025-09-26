import { ArrowLeft, MoreVertical, Edit, Share2, Trash2, Flag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MomentHeaderProps {
  title: string;
  isHost: boolean;
  isParticipant: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onLeave?: () => void;
}

export function MomentHeader({
  title,
  isHost,
  isParticipant,
  onBack,
  onEdit,
  onShare,
  onDelete,
  onReport,
  onLeave
}: MomentHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate text-foreground">{title}</h1>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isHost && (
              <>
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica momento
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}
            
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Condividi
              </DropdownMenuItem>
            )}

            {!isHost && (
              <>
                <DropdownMenuSeparator />
                {isParticipant && onLeave && (
                  <DropdownMenuItem onClick={onLeave} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Abbandona momento
                  </DropdownMenuItem>
                )}
                {onReport && (
                  <DropdownMenuItem onClick={onReport} className="text-destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Segnala
                  </DropdownMenuItem>
                )}
              </>
            )}

            {isHost && onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina momento
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}