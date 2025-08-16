import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EventDetailsStep from "@/components/create/event/EventDetailsStep";
import ArtistSelectionStep from "@/components/create/event/ArtistSelectionStep";
import VenueSelectionStep from "@/components/create/event/VenueSelectionStep";
import CallToActionStep from "@/components/create/event/CallToActionStep";
import EventPreviewStep from "@/components/create/event/EventPreviewStep";
interface EventData {
  title: string;
  description: string;
  tags: string[];
  date: Date | null;
  startTime: string;
  endTime: string;
  location: {
    name: string;
    coordinates: [number, number] | null;
  };
  capacity: number | null;
  ticketing: any;
  selectedArtists: string[];
  selectedVenues: string[];
  callToAction: {
    enabled: boolean;
    message: string;
    type: "open" | "invite_only";
  };
  photos: string[];
}
export default function CreaEvento() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/evento";
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    description: "",
    tags: [],
    date: null,
    startTime: "",
    endTime: "",
    location: { name: "", coordinates: null },
    capacity: null,
    ticketing: null,
    selectedArtists: [],
    selectedVenues: [],
    callToAction: {
      enabled: false,
      message: "",
      type: "open"
    },
    photos: []
  });
  const steps = [{
    id: 1,
    title: "Dettagli",
    component: EventDetailsStep
  }, {
    id: 2,
    title: "Artisti",
    component: ArtistSelectionStep
  }, {
    id: 3,
    title: "Location",
    component: VenueSelectionStep
  }, {
    id: 4,
    title: "Call-to-Action",
    component: CallToActionStep
  }, {
    id: 5,
    title: "Anteprima",
    component: EventPreviewStep
  }];
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
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea Evento</title>
        <meta name="description" content="Organizza un nuovo evento su LiveMoment con artisti e location." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/crea")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Crea Evento</h1>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, index) => <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {step.id}
            </div>
            <span className={`ml-2 text-sm ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
              {step.title}
            </span>
            {index < steps.length - 1 && <div className={`w-8 h-0.5 mx-3 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />}
          </div>)}
      </div>

      <Card>
        <CardHeader>
          
        </CardHeader>
        <CardContent>
          {CurrentStepComponent && <CurrentStepComponent data={eventData} onChange={setEventData} onNext={handleNext} />}
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
            
            {currentStep < steps.length ? <Button onClick={handleNext}>
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button> : <Button onClick={() => navigate("/eventi")}>
                Pubblica Evento
              </Button>}
          </div>
        </CardContent>
      </Card>
    </div>;
}