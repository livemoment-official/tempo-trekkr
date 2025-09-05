import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Trophy } from "lucide-react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

interface ProfileProgressIndicatorProps {
  profile: any;
  className?: string;
}

export function ProfileProgressIndicator({ profile, className }: ProfileProgressIndicatorProps) {
  const { completionPercentage, suggestions, completedCount, totalFields } = useProfileCompletion(profile);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-primary";
    if (percentage >= 60) return "bg-orange-500";
    return "bg-muted-foreground";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <Trophy className="h-4 w-4 text-primary" />;
    if (percentage >= 60) return <CheckCircle className="h-4 w-4 text-orange-500" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 80) return "Profilo Completo";
    if (percentage >= 60) return "Quasi fatto";
    return "Iniziamo";
  };

  return (
    <Card className={`shadow-card transition-smooth hover:shadow-elevated ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(completionPercentage)}
            <span className="font-medium text-sm">{getStatusText(completionPercentage)}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{totalFields}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Completamento profilo</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2"
          />
        </div>

        {suggestions.length > 0 && completionPercentage < 100 && (
          <div className="mt-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Suggerimenti:</div>
            {suggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-primary">•</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Ottimo! Il tuo profilo è completo
          </div>
        )}
      </CardContent>
    </Card>
  );
}