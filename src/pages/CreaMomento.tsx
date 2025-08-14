import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PhotoUploadStep from "@/components/create/moment/PhotoUploadStep";
import MomentDetailsStep from "@/components/create/moment/MomentDetailsStep";
import DateLocationStep from "@/components/create/moment/DateLocationStep";
import MomentPreviewStep from "@/components/create/moment/MomentPreviewStep";

interface MomentData {
  photos: string[];
  title: string;
  description: string;
  tags: string[];
  date: Date | null;
  location: {
    name: string;
    coordinates: [number, number] | null;
  };
}

export default function CreaMomento() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/momento";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [momentData, setMomentData] = useState<MomentData>({
    photos: [],
    title: "",
    description: "",
    tags: [],
    date: null,
    location: { name: "", coordinates: null }
  });

  const steps = [
    { id: 1, title: "Foto", component: PhotoUploadStep },
    { id: 2, title: "Dettagli", component: MomentDetailsStep },
    { id: 3, title: "Quando e Dove", component: DateLocationStep },
    { id: 4, title: "Anteprima", component: MomentPreviewStep }
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
        <title>LiveMoment · Crea Momento</title>
        <meta name="description" content="Crea un nuovo momento condiviso su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/crea")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Crea Momento</h1>
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
              data={momentData}
              onChange={setMomentData}
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
              <Button onClick={() => navigate("/momenti")}>
                Pubblica Momento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}