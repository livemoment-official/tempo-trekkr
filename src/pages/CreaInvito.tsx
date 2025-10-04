import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import StandardHeader from "@/components/layout/StandardHeader";
import ActivitySuggestionStep from "@/components/create/invite/ActivitySuggestionStep";
import PeopleSelectionStep from "@/components/create/invite/PeopleSelectionStep";
import InviteDetailsStep from "@/components/create/invite/InviteDetailsStep";
import InvitePreviewStep from "@/components/create/invite/InvitePreviewStep";
import { useCreateInvite } from "@/hooks/useInvites";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useEffect } from "react";

interface InviteData {
  activity: {
    title: string;
    category: string;
    suggestedDuration: number;
  };
  selectedPeople: string[];
  date: Date | null;
  time?: string;
  location: {
    name: string;
    coordinates: [number, number] | null;
  };
  message: string;
}
export default function CreaInvito() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createInvite = useCreateInvite();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/invito";
  const [currentStep, setCurrentStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData>({
    activity: {
      title: "",
      category: "",
      suggestedDuration: 60
    },
    selectedPeople: [],
    date: null,
    time: undefined,
    location: {
      name: "",
      coordinates: null
    },
    message: ""
  });
  const steps = [{
    id: 1,
    title: "Attività",
    component: ActivitySuggestionStep
  }, {
    id: 2,
    title: "Chi Invitare",
    component: PeopleSelectionStep
  }, {
    id: 3,
    title: "Dettagli",
    component: InviteDetailsStep
  }];
  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;
  
  // Auto-save draft to localStorage
  const saveDraft = async (data: InviteData) => {
    if (data.activity.title || data.selectedPeople.length > 0) {
      localStorage.setItem('invite-draft', JSON.stringify(data));
    }
  };

  useAutoSave({
    data: inviteData,
    onSave: saveDraft,
    delay: 3000,
    enabled: currentStep > 1 && currentStep < steps.length
  });

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('invite-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        // Convert date string back to Date object if it exists
        if (parsedDraft.date) {
          parsedDraft.date = new Date(parsedDraft.date);
        }
        setInviteData(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

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

  const handleSendInvites = async () => {
    // Validation
    if (inviteData.selectedPeople.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno una persona da invitare",
        variant: "destructive",
      });
      return;
    }

    if (!inviteData.activity.title) {
      toast({
        title: "Errore",
        description: "Seleziona un'attività",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Combine date and time if both are provided
      let whenAt = inviteData.date;
      if (inviteData.date && inviteData.time) {
        const [hours, minutes] = inviteData.time.split(':');
        whenAt = new Date(inviteData.date);
        whenAt.setHours(parseInt(hours), parseInt(minutes));
      }

      // Create place object if location is provided
      const place = inviteData.location.name ? {
        name: inviteData.location.name,
        coordinates: inviteData.location.coordinates
      } : null;

      // Send one invite per selected person
      const invitePromises = inviteData.selectedPeople.map(personId => 
        createInvite.mutateAsync({
          title: inviteData.activity.title,
          description: inviteData.message || `Ti va di fare ${inviteData.activity.title.toLowerCase()} insieme?`,
          participants: [personId],
          when_at: whenAt || undefined,
          place: place,
          activity_category: inviteData.activity.category,
        })
      );

      await Promise.all(invitePromises);

      toast({
        title: "Inviti inviati!",
        description: `Hai inviato ${inviteData.selectedPeople.length} ${inviteData.selectedPeople.length === 1 ? 'invito' : 'inviti'} con successo`,
      });

      // Clear draft after successful send
      localStorage.removeItem('invite-draft');

      navigate('/inviti');
    } catch (error) {
      console.error('Error sending invites:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile inviare gli inviti. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · Invita</title>
        <meta name="description" content="Invita persone per un'attività basata su disponibilità e affinità." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <StandardHeader 
        title="Invita" 
        onBack={() => navigate('/crea')}
      />

      {/* Main Content */}
      <main className="container py-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Minimal Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      index < currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : index === currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id}
                  </div>
                  {/* Label - hidden on mobile, visible on desktop */}
                  <span className="hidden md:block text-xs mt-2 text-center text-muted-foreground max-w-[80px]">
                    {step.title}
                  </span>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 md:w-16 mx-1 md:mx-2 rounded transition-colors ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {CurrentStepComponent && <CurrentStepComponent data={inviteData} onChange={setInviteData} onNext={handleNext} />}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-20">
        <div className="container py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {currentStep === steps.length ? (
              <Button 
                onClick={handleSendInvites}
                disabled={isSending || inviteData.selectedPeople.length === 0}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white font-semibold h-12"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Invio...
                  </>
                ) : (
                  "Invia"
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 2 && inviteData.selectedPeople.length === 0}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white font-semibold h-12"
              >
                Avanti
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>;
}