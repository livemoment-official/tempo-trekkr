import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Step1ContactInfo } from './Step1ContactInfo';
import { Step2ArtistType } from './Step2ArtistType';
import { Step3ExhibitionInfo } from './Step3ExhibitionInfo';
import { Step4Media } from './Step4Media';
import { Step5Review } from './Step5Review';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ArtistData {
  stage_name: string;
  age: number;
  phone: string;
  province: string;
  artist_type: string;
  specialization: string;
  social_media: {
    facebook?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
  };
  exhibition_description: string;
  ideal_situations: string[];
  target_provinces: string[];
  event_types: string[];
  experience_years: number;
  instruments: string[];
  audience_size: string;
  performance_duration: string;
  cachet_info: {
    min_price?: number;
    max_price?: number;
    negotiable?: boolean;
  };
  profile_video_url?: string;
  avatar_url?: string;
  bio: string;
  name: string;
}

interface ArtistRegistrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  existingData?: Partial<ArtistData>;
}

const initialData: ArtistData = {
  stage_name: '',
  age: 18,
  phone: '',
  province: '',
  artist_type: '',
  specialization: '',
  social_media: {},
  exhibition_description: '',
  ideal_situations: [],
  target_provinces: [],
  event_types: [],
  experience_years: 0,
  instruments: [],
  audience_size: '',
  performance_duration: '',
  cachet_info: {},
  bio: '',
  name: ''
};

export const ArtistRegistrationWizard: React.FC<ArtistRegistrationWizardProps> = ({
  onComplete,
  onCancel,
  existingData
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ArtistData>({ ...initialData, ...existingData });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const steps = [
    { number: 1, title: 'Contatti', component: Step1ContactInfo },
    { number: 2, title: 'Tipo Artista', component: Step2ArtistType },
    { number: 3, title: 'Esibizioni', component: Step3ExhibitionInfo },
    { number: 4, title: 'Media', component: Step4Media },
    { number: 5, title: 'Revisione', component: Step5Review }
  ];

  const updateData = (stepData: Partial<ArtistData>) => {
    setData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const { error } = await supabase
        .from('artists')
        .upsert({
          user_id: user.id,
          name: data.name,
          bio: data.bio,
          avatar_url: data.avatar_url,
          stage_name: data.stage_name,
          age: data.age,
          phone: data.phone,
          province: data.province,
          artist_type: data.artist_type,
          specialization: data.specialization,
          social_media: data.social_media,
          exhibition_description: data.exhibition_description,
          ideal_situations: data.ideal_situations,
          target_provinces: data.target_provinces,
          event_types: data.event_types,
          experience_years: data.experience_years,
          instruments: data.instruments,
          audience_size: data.audience_size,
          performance_duration: data.performance_duration,
          cachet_info: data.cachet_info,
          profile_video_url: data.profile_video_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Profilo artista creato',
        description: 'Il tuo profilo artista è stato salvato con successo!'
      });

      onComplete();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante il salvataggio del profilo.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step.number 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {step.number}
            </div>
            <span className="ml-2 text-sm font-medium">{step.title}</span>
            {index < steps.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-4
                ${currentStep > step.number ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Current step content */}
      <div className="bg-card rounded-lg p-6">
        <CurrentStepComponent
          data={data}
          {...(currentStep !== 5 && { updateData })}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              Avanti
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Salvataggio...' : 'Completa Registrazione'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};