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
    const stepKey = ['details', 'artists', 'venue', 'media', 'callToAction', 'preview'][stepId - 1] as keyof typeof validation.steps;
    const stepValidation = validation.steps[stepKey];
    if (stepValidation.completionPercentage === 100) {
      return {
        status: 'complete',
        icon: CheckCircle,
        color: 'text-green-600'
      };
    } else if (stepValidation.completionPercentage > 0) {
      return {
        status: 'partial',
        icon: AlertCircle,
        color: 'text-amber-600'
      };
    } else {
      return {
        status: 'incomplete',
        icon: Circle,
        color: 'text-muted-foreground'
      };
    }
  };
  const canNavigateToStep = (stepId: number) => {
    // Can always go back to previous steps
    if (stepId <= currentStep) return true;

    // Can go to next step if current step has some progress
    if (stepId === currentStep + 1) {
      const currentStepKey = ['details', 'artists', 'venue', 'media', 'callToAction', 'preview'][currentStep - 1] as keyof typeof validation.steps;
      return validation.steps[currentStepKey]?.completionPercentage > 0;
    }
    return false;
  };
  return <div className="space-y-3">
      {/* Compact Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Completamento</span>
          <Badge variant={validation.overall.completionPercentage === 100 ? "default" : "secondary"} className="text-xs">
            {validation.overall.completionPercentage}%
          </Badge>
        </div>
        {validation.overall.nextIncompleteStep}
      </div>

      {/* Compact Progress Bar */}
      <Progress value={validation.overall.completionPercentage} className="h-1.5" />

      {/* Horizontal Step Navigation */}
      <div className="flex items-center justify-between gap-1">
        {steps.map(step => {
        const stepStatus = getStepStatus(step.id);
        const StepIcon = stepStatus.icon;
        const canNavigate = canNavigateToStep(step.id);
        const isActive = currentStep === step.id;
        return <Button key={step.id} variant={isActive ? "default" : "ghost"} size="sm" className={`flex items-center gap-1 h-8 px-2 text-xs ${!canNavigate ? 'opacity-50 cursor-not-allowed' : ''} ${isActive ? 'ring-1 ring-primary/30' : ''}`} onClick={() => canNavigate && onStepChange(step.id)} disabled={!canNavigate}>
              <StepIcon className={`h-3 w-3 ${stepStatus.color}`} />
              <span className="hidden sm:inline">{step.title}</span>
              <span className="sm:hidden">{step.id}</span>
            </Button>;
      })}
      </div>

      {/* Compact Validation Errors */}
      {validation.steps.details.errors.length > 0 && currentStep === 1 && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
          <div className="flex items-center gap-2 text-destructive text-xs font-medium mb-1">
            <AlertCircle className="h-3 w-3" />
            Campi obbligatori mancanti
          </div>
          <ul className="text-xs text-destructive/80 space-y-0.5">
            {validation.steps.details.errors.slice(0, 3).map((error, index) => <li key={index}>• {error}</li>)}
            {validation.steps.details.errors.length > 3 && <li>• ... e altri {validation.steps.details.errors.length - 3}</li>}
          </ul>
        </div>}
    </div>;
}