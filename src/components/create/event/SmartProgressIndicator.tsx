import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, AlertCircle, ArrowRight } from "lucide-react";
import { useEventValidation } from "@/hooks/useEventValidation";

interface SmartProgressIndicatorProps {
  currentStep: number;
  eventData: any;
  onStepChange: (step: number) => void;
  steps: Array<{
    id: number;
    title: string;
    component: any;
  }>;
}

export default function SmartProgressIndicator({ 
  currentStep, 
  eventData, 
  onStepChange, 
  steps 
}: SmartProgressIndicatorProps) {
  const validation = useEventValidation(eventData);

  const getStepStatus = (stepId: number) => {
    const stepKey = ['details', 'artists', 'venue', 'callToAction', 'preview'][stepId - 1] as keyof typeof validation.steps;
    const stepValidation = validation.steps[stepKey];
    
    if (stepValidation.completionPercentage === 100) {
      return { status: 'complete', icon: CheckCircle, color: 'text-green-600' };
    } else if (stepValidation.completionPercentage > 0) {
      return { status: 'partial', icon: AlertCircle, color: 'text-amber-600' };
    } else {
      return { status: 'incomplete', icon: Circle, color: 'text-muted-foreground' };
    }
  };

  const canNavigateToStep = (stepId: number) => {
    // Can always go back to previous steps
    if (stepId <= currentStep) return true;
    
    // Can go to next step if current step has some progress
    if (stepId === currentStep + 1) {
      const currentStepKey = ['details', 'artists', 'venue', 'callToAction', 'preview'][currentStep - 1] as keyof typeof validation.steps;
      return validation.steps[currentStepKey]?.completionPercentage > 0;
    }
    
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Completamento evento</span>
          <Badge variant={validation.overall.completionPercentage === 100 ? "default" : "secondary"}>
            {validation.overall.completionPercentage}%
          </Badge>
        </div>
        <Progress value={validation.overall.completionPercentage} className="h-2" />
        {validation.overall.nextIncompleteStep && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            <span>Prossimo: {steps[validation.overall.nextIncompleteStep - 1]?.title}</span>
          </div>
        )}
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.id);
          const StepIcon = stepStatus.icon;
          const canNavigate = canNavigateToStep(step.id);
          const isActive = currentStep === step.id;
          
          return (
            <Button
              key={step.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-3 px-2 ${
                !canNavigate ? 'opacity-50 cursor-not-allowed' : ''
              } ${isActive ? 'ring-2 ring-primary/20' : ''}`}
              onClick={() => canNavigate && onStepChange(step.id)}
              disabled={!canNavigate}
            >
              <div className="flex items-center gap-1">
                <StepIcon className={`h-4 w-4 ${stepStatus.color}`} />
                <span className="text-xs font-medium">{step.id}</span>
              </div>
              <span className="text-xs text-center leading-tight">
                {step.title}
              </span>
              {/* Completion indicator */}
              <div className="w-full bg-muted rounded-full h-1 mt-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${validation.steps[['details', 'artists', 'venue', 'callToAction', 'preview'][step.id - 1] as keyof typeof validation.steps]?.completionPercentage || 0}%` 
                  }}
                />
              </div>
            </Button>
          );
        })}
      </div>

      {/* Validation Errors */}
      {validation.steps.details.errors.length > 0 && currentStep === 1 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
            <AlertCircle className="h-4 w-4" />
            Campi obbligatori mancanti
          </div>
          <ul className="text-sm text-destructive/80 space-y-1">
            {validation.steps.details.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}