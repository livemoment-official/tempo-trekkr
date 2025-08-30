import { Button } from "@/components/ui/button";
import { Heart, Flame, Star, ThumbsUp } from "lucide-react";
import { useMomentReactions, ReactionType } from "@/hooks/useMomentReactions";
import { cn } from "@/lib/utils";

const reactionIcons = {
  heart: Heart,
  fire: Flame,
  star: Star,
  thumbs_up: ThumbsUp,
} as const;

const reactionColors = {
  heart: "text-red-500",
  fire: "text-orange-500", 
  star: "text-yellow-500",
  thumbs_up: "text-blue-500",
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
        const Icon = reactionIcons[reaction_type];
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
              isActive && "bg-primary/10",
              isActive ? reactionColors[reaction_type] : "text-muted-foreground",
              "hover:scale-105"
            )}
          >
            <Icon 
              size={16} 
              className={cn(
                "transition-all duration-200",
                isActive && "fill-current"
              )} 
            />
            {count > 0 && (
              <span className="text-xs font-medium">
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}