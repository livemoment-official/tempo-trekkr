import { useState, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import EnhancedEventDetailsStep from "@/components/create/event/EnhancedEventDetailsStep";
import ArtistSelectionStep from "@/components/create/event/ArtistSelectionStep";
import VenueSelectionStep from "@/components/create/event/VenueSelectionStep";
import CallToActionStep from "@/components/create/event/CallToActionStep";
import EventPreviewStep from "@/components/create/event/EventPreviewStep";
import SmartProgressIndicator from "@/components/create/event/SmartProgressIndicator";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useEventValidation } from "@/hooks/useEventValidation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    location: {
      name: "",
      coordinates: null
    },
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
  const {
    toast
  } = useToast();
  const steps = [{
    id: 1,
    title: "Dettagli",
    component: EnhancedEventDetailsStep
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
  const validation = useEventValidation(eventData);

  // Auto-save functionality
  const handleAutoSave = useCallback(async (data: any) => {
    // In a real app, this would save to localStorage or make an API call
    localStorage.setItem('draft_event', JSON.stringify(data));
  }, []);
  useAutoSave({
    data: eventData,
    onSave: handleAutoSave,
    delay: 8000,
    enabled: true
  });

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft_event');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setEventData(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);
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
  const handleStepChange = (stepId: number) => {
    setCurrentStep(stepId);
  };
  const handleManualSave = () => {
    handleAutoSave(eventData);
    toast({
      title: "Evento salvato",
      description: "Le tue modifiche sono state salvate",
      duration: 2000
    });
  };
  const canProceedToNext = () => {
    if (currentStep === 1) {
      return validation.steps.details.isValid;
    }
    return true; // Other steps are optional
  };
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · Crea Evento</title>
        <meta name="description" content="Organizza un nuovo evento su LiveMoment con artisti e location." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              
              <SmartProgressIndicator currentStep={currentStep} eventData={eventData} onStepChange={handleStepChange} steps={steps} />
            </CardHeader>
            
            <CardContent className="space-y-6">
              {CurrentStepComponent && <CurrentStepComponent data={eventData} onChange={setEventData} onNext={handleNext} />}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Indietro
                </Button>
                
                <div className="flex items-center gap-2">
                  
                  
                  {currentStep < steps.length ? <Button onClick={handleNext} disabled={!canProceedToNext()}>
                      Avanti
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button> : <Button onClick={async () => {
                  try {
                    // Get current user first
                    const {
                      data: {
                        user
                      }
                    } = await supabase.auth.getUser();
                    if (!user) {
                      throw new Error('Utente non autenticato');
                    }

                    // Save event to database
                    const eventToSave = {
                      title: eventData.title,
                      description: eventData.description,
                      host_id: user.id,
                      // CRITICAL: Add missing host_id
                      when_at: eventData.date && eventData.startTime ? new Date(`${eventData.date.toDateString()} ${eventData.startTime}`).toISOString() : null,
                      place: eventData.location.coordinates ? {
                        name: eventData.location.name,
                        address: eventData.location.name,
                        lat: eventData.location.coordinates[1],
                        lng: eventData.location.coordinates[0],
                        coordinates: {
                          lat: eventData.location.coordinates[1],
                          lng: eventData.location.coordinates[0]
                        }
                      } : null,
                      max_participants: eventData.capacity,
                      tags: eventData.tags,
                      photos: eventData.photos,
                      ticketing: eventData.ticketing,
                      discovery_on: true
                    };
                    const {
                      data,
                      error
                    } = await supabase.from('events').insert(eventToSave).select().single();
                    if (error) throw error;

                    // Save artist and venue selections
                    if (eventData.selectedArtists.length > 0) {
                      const {
                        error: artistError
                      } = await supabase.from('event_artists').insert(eventData.selectedArtists.map(artistId => ({
                        event_id: data.id,
                        artist_id: artistId,
                        status: 'invited',
                        invitation_message: `Ti invitiamo a partecipare all'evento "${eventData.title}"`
                      })));
                      if (artistError) console.error('Error saving artist invitations:', artistError);
                    }
                    if (eventData.selectedVenues.length > 0) {
                      const {
                        error: venueError
                      } = await supabase.from('event_venues').insert(eventData.selectedVenues.map(venueId => ({
                        event_id: data.id,
                        venue_id: venueId,
                        status: 'contacted',
                        contact_message: `Siamo interessati alla vostra location per l'evento "${eventData.title}"`
                      })));
                      if (venueError) console.error('Error saving venue contacts:', venueError);
                    }

                    // Send notifications to artists and venues (non-blocking)
                    if (eventData.selectedArtists.length > 0 || eventData.selectedVenues.length > 0) {
                      try {
                        console.log('Sending notifications for event:', data.id);
                        await supabase.functions.invoke('send-event-notifications', {
                          body: {
                            eventId: data.id,
                            artistIds: eventData.selectedArtists,
                            venueIds: eventData.selectedVenues
                          }
                        });
                        console.log('Notifications sent successfully');
                      } catch (notificationError) {
                        console.error('Error sending notifications:', notificationError);
                        // Don't block event creation if notifications fail
                      }
                    }
                    handleAutoSave(eventData);
                    toast({
                      title: "Evento pubblicato!",
                      description: "Il tuo evento è ora visibile a tutti",
                      duration: 3000
                    });
                    navigate(`/event/${data.id}`);
                  } catch (error) {
                    console.error('Error saving event:', error);
                    toast({
                      title: "Errore",
                      description: "Errore nella pubblicazione dell'evento",
                      variant: "destructive"
                    });
                  }
                }} disabled={!validation.overall.isValid}>
                      Pubblica Evento
                    </Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
}