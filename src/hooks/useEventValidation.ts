import { useMemo } from 'react';

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

interface StepValidation {
  isValid: boolean;
  errors: string[];
  completionPercentage: number;
}

interface ValidationResult {
  steps: {
    details: StepValidation;
    artists: StepValidation;
    venue: StepValidation;
    media: StepValidation;
    callToAction: StepValidation;
    preview: StepValidation;
  };
  overall: {
    isValid: boolean;
    completionPercentage: number;
    nextIncompleteStep: number | null;
  };
}

export function useEventValidation(data: EventData): ValidationResult {
  return useMemo(() => {
    // Step 1: Details validation
    const detailsErrors: string[] = [];
    let detailsCompletion = 0;
    const totalDetailsFields = 7; // title, description, category, date, startTime, location, capacity

    if (!data.title?.trim()) {
      detailsErrors.push("Il titolo è obbligatorio");
    } else {
      detailsCompletion += 1;
    }

    if (data.description?.trim()) {
      detailsCompletion += 1;
    }

    if (data.tags?.length > 0) {
      detailsCompletion += 1;
    }

    if (!data.date) {
      detailsErrors.push("La data è obbligatoria");
    } else {
      detailsCompletion += 1;
    }

    if (!data.startTime) {
      detailsErrors.push("L'ora di inizio è obbligatoria");
    } else {
      detailsCompletion += 1;
    }

    if (data.location?.name?.trim()) {
      detailsCompletion += 1;
    }

    if (data.capacity && data.capacity > 0) {
      detailsCompletion += 1;
    }

    const detailsStep: StepValidation = {
      isValid: detailsErrors.length === 0,
      errors: detailsErrors,
      completionPercentage: Math.round((detailsCompletion / totalDetailsFields) * 100)
    };

    // Step 2: Artists validation (optional but scored)
    const artistsCompletion = data.selectedArtists?.length > 0 ? 100 : 0;
    const artistsStep: StepValidation = {
      isValid: true, // Always valid since it's optional
      errors: [],
      completionPercentage: artistsCompletion
    };

    // Step 3: Venue validation (optional but scored)
    const venueCompletion = data.selectedVenues?.length > 0 ? 100 : 0;
    const venueStep: StepValidation = {
      isValid: true, // Always valid since it's optional
      errors: [],
      completionPercentage: venueCompletion
    };

    // Step 4: Media validation (optional but scored)
    const mediaCompletion = data.photos?.length > 0 ? 100 : 0;
    const mediaStep: StepValidation = {
      isValid: true, // Always valid since it's optional
      errors: [],
      completionPercentage: mediaCompletion
    };

    // Step 5: Call to Action validation
    const callToActionErrors: string[] = [];
    let callToActionCompletion = 50; // Base completion for having the step

    if (data.callToAction?.enabled) {
      if (!data.callToAction.message?.trim()) {
        callToActionErrors.push("Il messaggio call-to-action è obbligatorio quando abilitato");
      } else {
        callToActionCompletion = 100;
      }
    } else {
      callToActionCompletion = 100; // If disabled, consider it complete
    }

    const callToActionStep: StepValidation = {
      isValid: callToActionErrors.length === 0,
      errors: callToActionErrors,
      completionPercentage: callToActionCompletion
    };

    // Step 6: Preview validation
    const previewCompletion = 100; // Preview is always complete when reached
    const previewStep: StepValidation = {
      isValid: true,
      errors: [],
      completionPercentage: previewCompletion
    };

    // Calculate overall validation
    const stepValidations = [detailsStep, artistsStep, venueStep, mediaStep, callToActionStep, previewStep];
    const overallCompletion = Math.round(
      stepValidations.reduce((sum, step) => sum + step.completionPercentage, 0) / stepValidations.length
    );

    const requiredStepsValid = detailsStep.isValid && callToActionStep.isValid;
    
    // Find next incomplete step
    let nextIncompleteStep: number | null = null;
    const stepCompletions = [
      detailsStep.completionPercentage,
      artistsStep.completionPercentage,
      venueStep.completionPercentage,
      mediaStep.completionPercentage,
      callToActionStep.completionPercentage,
      previewStep.completionPercentage
    ];

    for (let i = 0; i < stepCompletions.length; i++) {
      if (stepCompletions[i] < 100) {
        nextIncompleteStep = i + 1;
        break;
      }
    }

    return {
      steps: {
        details: detailsStep,
        artists: artistsStep,
        venue: venueStep,
        media: mediaStep,
        callToAction: callToActionStep,
        preview: previewStep
      },
      overall: {
        isValid: requiredStepsValid,
        completionPercentage: overallCompletion,
        nextIncompleteStep
      }
    };
  }, [data]);
}