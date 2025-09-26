import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMomentReactions, ReactionType } from "@/hooks/useMomentReactions";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const reactionEmojis = {
  idea: "💡",
  star_eyes: "🤩", 
  yellow_heart: "💛",
} as const;

interface ReactionBarProps {
  momentId: string;
  className?: string;
}

export function ReactionBar({ momentId, className }: ReactionBarProps) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { reactionCounts, userReaction, toggleReaction, isToggling } = useMomentReactions(momentId);

  const handleReactionClick = (reactionType: ReactionType) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    toggleReaction(reactionType);
  };

  return (
    <>
      <TooltipProvider>
        <div className={cn("flex items-center gap-2 p-1 rounded-full bg-black/0 z-20 pointer-events-auto", className)}>
          {reactionCounts.map(({ reaction_type, count }) => {
            const emoji = reactionEmojis[reaction_type];
            const isActive = userReaction?.reaction_type === reaction_type;
            
            return (
              <Tooltip key={reaction_type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => handleReactionClick(reaction_type)}
                    disabled={isToggling}
                    className={cn(
                      "rounded-full h-9 px-3 bg-white/70 dark:bg-black/40 backdrop-blur-md",
                      "ring-1 ring-black/10 dark:ring-white/10 shadow-sm",
                      "hover:bg-white/80 dark:hover:bg-black/50 transition-all duration-200",
                      "flex items-center gap-1",
                      isActive && "ring-2 ring-primary/40 scale-105 bg-primary/10"
                    )}
                  >
                    <span className="text-lg transition-all duration-200">
                      {emoji}
                    </span>
                    <span className="ml-1 text-xs font-medium tabular-nums text-foreground">
                      {count}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reagisci</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Accedi per reagire"
        description="Effettua l'accesso per reagire ai momenti"
      />
    </>
  );
}