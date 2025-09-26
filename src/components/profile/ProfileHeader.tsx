import { ArrowLeft, MoreVertical, Share, Flag, UserMinus, UserX, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  userName: string;
  userId: string;
  isFriend: boolean;
  onRemoveFriend?: () => void;
  onBlockUser?: () => void;
  onReportUser?: () => void;
}

export function ProfileHeader({ 
  userName, 
  userId, 
  isFriend, 
  onRemoveFriend, 
  onBlockUser, 
  onReportUser 
}: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBack = () => {
    navigate(-1);
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/user/${userId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profilo di ${userName}`,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copy to clipboard
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link copiato!",
        description: "Il link del profilo è stato copiato negli appunti.",
      });
    }
  };

  const handleCopyLink = async () => {
    const profileUrl = `${window.location.origin}/user/${userId}`;
    await navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copiato!",
      description: "Il link del profilo è stato copiato negli appunti.",
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {userName}
          </h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
            <DropdownMenuItem onClick={handleShareProfile} className="cursor-pointer">
              <Share className="h-4 w-4 mr-2" />
              Condividi profilo
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              Copia link profilo
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {isFriend ? (
              <DropdownMenuItem 
                onClick={onRemoveFriend}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Rimuovi amico
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={onBlockUser}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <UserX className="h-4 w-4 mr-2" />
                Blocca utente
              </DropdownMenuItem>
            )}

            <DropdownMenuItem 
              onClick={onReportUser}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Flag className="h-4 w-4 mr-2" />
              Segnala utente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}