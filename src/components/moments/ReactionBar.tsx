import { Button } from "@/components/ui/button";
import { useMomentReactions, ReactionType } from "@/hooks/useMomentReactions";
import { cn } from "@/lib/utils";

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
  const { reactionCounts, userReaction, toggleReaction, isToggling } = useMomentReactions(momentId);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {reactionCounts.map(({ reaction_type, count }) => {
        const emoji = reactionEmojis[reaction_type];
        const isActive = userReaction?.reaction_type === reaction_type;
        
        return (
          <Button
            key={reaction_type}
            variant="ghost"
            size="sm"
            onClick={() => toggleReaction(reaction_type)}
            disabled={isToggling}
            className={cn(
              "flex items-center gap-1 h-8 px-2 transition-all duration-200",
              isActive && "bg-primary/10 scale-110",
              "hover:scale-105"
            )}
          >
            <span className="text-lg transition-all duration-200">
              {emoji}
            </span>
            {count > 0 && (
              <span className="text-xs font-medium text-foreground">
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}