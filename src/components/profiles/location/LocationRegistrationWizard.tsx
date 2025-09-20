import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Step1GeneralInfo } from './Step1GeneralInfo';
import { Step2VenueDetails } from './Step2VenueDetails';
import { Step3ArtistWelcome } from './Step3ArtistWelcome';
import { Step4CommunityAttraction } from './Step4CommunityAttraction';
import { Step5EventHosting } from './Step5EventHosting';

interface LocationRegistrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export interface LocationFormData {
  // Step 1: General Info
  contactPersonName: string;
  contactPersonSurname: string;
  contactEmail: string;
  contactPhone: string;
  howDiscovered: string;

  // Step 2: Venue Details
  name: string;
  venueType: string;
  description: string;
  address: string;
  city: string;
  province: string;
  socialMediaProfiles: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };

  // Step 3: Artist Welcome
  artistBenefits: string[];
  artistWelcomeMessage: string;

  // Step 4: Community Attraction
  communityAdvantages: string[];
  rewards10People: string;
  rewards30People: string;
  specialOffer: string;
  availabilitySchedule: {
    [key: string]: boolean;
  };

  // Step 5: Event Hosting
  agreementTypes: string[];
  rentalCostInfo: string;
  preferredEventTypes: string[];
  musicGenres: string[];
  maxCapacitySeated: number;
  maxCapacityStanding: number;
  audioSetup: string[];
  additionalEquipment: string[];
  serviceDetails: string[];
  recommendedHours: string;
}

const initialFormData: LocationFormData = {
  contactPersonName: '',
  contactPersonSurname: '',
  contactEmail: '',
  contactPhone: '',
  howDiscovered: '',
  name: '',
  venueType: '',
  description: '',
  address: '',
  city: '',
  province: '',
  socialMediaProfiles: {},
  artistBenefits: [],
  artistWelcomeMessage: '',
  communityAdvantages: [],
  rewards10People: '',
  rewards30People: '',
  specialOffer: '',
  availabilitySchedule: {},
  agreementTypes: [],
  rentalCostInfo: '',
  preferredEventTypes: [],
  musicGenres: [],
  maxCapacitySeated: 0,
  maxCapacityStanding: 0,
  audioSetup: [],
  additionalEquipment: [],
  serviceDetails: [],
  recommendedHours: '',
};

const steps = [
  { title: 'Informazioni Generali', component: Step1GeneralInfo },
  { title: 'Dettagli Locale', component: Step2VenueDetails },
  { title: 'Accoglienza Artisti', component: Step3ArtistWelcome },
  { title: 'Attrazione Community', component: Step4CommunityAttraction },
  { title: 'Gestione Eventi', component: Step5EventHosting },
];

export function LocationRegistrationWizard({ onComplete, onCancel }: LocationRegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<LocationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinalChoice, setShowFinalChoice] = useState(false);
  const { toast } = useToast();
  const { createVenueProfile } = useUserProfiles();

  // Auto-save functionality
  useAutoSave({
    data: formData,
    onSave: async (data) => {
      localStorage.setItem('locationWizardData', JSON.stringify(data));
    },
    delay: 5000,
    enabled: true,
  });

  // Load saved data on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('locationWizardData');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalChoice(true);
    }
  };

  const handlePrev = () => {
    if (showFinalChoice) {
      setShowFinalChoice(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataChange = (stepData: Partial<LocationFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleSubmit = async (updateExisting: boolean) => {
    setIsSubmitting(true);
    try {
      const venueData = {
        name: formData.name,
        description: formData.description,
        venue_type: formData.venueType,
        location: {
          address: formData.address,
          city: formData.city,
          province: formData.province,
        },
        contact_person_name: formData.contactPersonName,
        contact_person_surname: formData.contactPersonSurname,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        how_discovered: formData.howDiscovered,
        social_media_profiles: formData.socialMediaProfiles,
        artist_benefits: formData.artistBenefits,
        artist_welcome_message: formData.artistWelcomeMessage,
        community_advantages: formData.communityAdvantages,
        rewards_10_people: formData.rewards10People,
        rewards_30_people: formData.rewards30People,
        special_offer: formData.specialOffer,
        availability_schedule: formData.availabilitySchedule,
        agreement_types: formData.agreementTypes,
        rental_cost_info: formData.rentalCostInfo,
        preferred_event_types: formData.preferredEventTypes,
        music_genres: formData.musicGenres,
        max_capacity_seated: formData.maxCapacitySeated,
        max_capacity_standing: formData.maxCapacityStanding,
        audio_setup: formData.audioSetup,
        additional_equipment: formData.additionalEquipment,
        service_details: formData.serviceDetails,
        recommended_hours: formData.recommendedHours,
      };

      await createVenueProfile(venueData);
      
      // Clear saved data
      localStorage.removeItem('locationWizardData');
      
      toast({
        title: "Profilo Location creato!",
        description: updateExisting 
          ? "Il tuo profilo è stato aggiornato con successo." 
          : "Il nuovo profilo location è stato creato con successo.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating venue profile:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del profilo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  if (showFinalChoice) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Completa Registrazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg font-medium mb-4">
                  Fantastico! Hai completato tutti i passaggi.
                </p>
                <p className="text-muted-foreground mb-6">
                  Come vuoi procedere con il tuo profilo?
                </p>
              </div>

              <div className="grid gap-4">
                <Button
                  size="lg"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="w-full py-6"
                >
                  Aggiorna profilo attuale
                  <p className="text-sm opacity-80 mt-1">
                    Converte il tuo profilo esistente in un profilo location
                  </p>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="w-full py-6"
                >
                  Crea nuovo profilo
                  <p className="text-sm opacity-80 mt-1">
                    Mantieni il profilo attuale e aggiungi un profilo location
                  </p>
                </Button>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna indietro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Registrazione Location</h1>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} di {steps.length}</span>
              <span>{Math.round(progress)}% completato</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm font-medium">{steps[currentStep].title}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={formData}
                onChange={handleDataChange}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Completa' : 'Avanti'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}