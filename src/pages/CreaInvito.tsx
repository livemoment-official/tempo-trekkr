import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ActivitySuggestionStep from "@/components/create/invite/ActivitySuggestionStep";
import PeopleSelectionStep from "@/components/create/invite/PeopleSelectionStep";
import InviteDetailsStep from "@/components/create/invite/InviteDetailsStep";
import InvitePreviewStep from "@/components/create/invite/InvitePreviewStep";

interface InviteData {
  activity: {
    title: string;
    category: string;
    suggestedDuration: number;
  };
  selectedPeople: string[];
  date: Date | null;
  location: {
    name: string;
    coordinates: [number, number] | null;
  };
  message: string;
}

export default function CreaInvito() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/invito";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [inviteData, setInviteData] = useState<InviteData>({
    activity: {
      title: "",
      category: "",
      suggestedDuration: 60
    },
    selectedPeople: [],
    date: null,
    location: { name: "", coordinates: null },
    message: ""
  });

  const steps = [
    { id: 1, title: "Attività", component: ActivitySuggestionStep },
    { id: 2, title: "Chi Invitare", component: PeopleSelectionStep },
    { id: 3, title: "Dettagli", component: InviteDetailsStep },
    { id: 4, title: "Anteprima", component: InvitePreviewStep }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea Invito</title>
        <meta name="description" content="Invita persone per un'attività basata su disponibilità e affinità." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/crea")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Crea Invito</h1>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              {step.id}
            </div>
            <span className={`ml-2 text-sm ${
              currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-3 ${
                currentStep > step.id ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{currentStepData?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {CurrentStepComponent && (
            <CurrentStepComponent 
              data={inviteData}
              onChange={setInviteData}
              onNext={handleNext}
            />
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/inviti")}>
                Invia Inviti
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}