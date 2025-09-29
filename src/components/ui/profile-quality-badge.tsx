import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileQualityBadgeProps {
  completenessScore: number;
  isComplete: boolean;
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export function ProfileQualityBadge({ 
  completenessScore, 
  isComplete, 
  isVerified, 
  size = "sm",
  showScore = false 
}: ProfileQualityBadgeProps) {
  const getQualityLevel = () => {
    if (isVerified) return "premium";
    if (completenessScore >= 80) return "excellent";
    if (completenessScore >= 60) return "good";
    if (completenessScore >= 40) return "fair";
    return "poor";
  };

  const qualityLevel = getQualityLevel();

  const badgeConfig = {
    premium: {
      variant: "default" as const,
      className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0",
      icon: <Star className="h-3 w-3" />,
      text: "Premium"
    },
    excellent: {
      variant: "default" as const,
      className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
      icon: <CheckCircle className="h-3 w-3" />,
      text: "Eccellente"
    },
    good: {
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle className="h-3 w-3" />,
      text: "Buono"
    },
    fair: {
      variant: "outline" as const,
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: <AlertCircle className="h-3 w-3" />,
      text: "Discreto"
    },
    poor: {
      variant: "outline" as const,
      className: "bg-red-50 text-red-700 border-red-200",
      icon: <AlertCircle className="h-3 w-3" />,
      text: "Incompleto"
    }
  };

  const config = badgeConfig[qualityLevel];
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        config.className,
        sizeClasses[size],
        "flex items-center gap-1 font-medium"
      )}
    >
      {config.icon}
      {config.text}
      {showScore && ` (${completenessScore}%)`}
    </Badge>
  );
}

interface CompletenessBarProps {
  score: number;
  className?: string;
}

export function CompletenessBar({ score, className }: CompletenessBarProps) {
  const getBarColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">Completezza profilo</span>
        <span className="text-xs font-medium">{score}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={cn("h-2 rounded-full transition-all duration-300", getBarColor())}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}