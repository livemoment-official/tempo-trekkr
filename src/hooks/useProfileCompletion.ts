import { useState, useEffect } from 'react';

interface ProfileCompletionData {
  completionPercentage: number;
  missingFields: string[];
  suggestions: string[];
  completedCount: number;
  totalFields: number;
}

export function useProfileCompletion(profile: any): ProfileCompletionData {
  const [completionData, setCompletionData] = useState<ProfileCompletionData>({
    completionPercentage: 0,
    missingFields: [],
    suggestions: [],
    completedCount: 0,
    totalFields: 0
  });

  useEffect(() => {
    if (!profile) {
      setCompletionData({
        completionPercentage: 0,
        missingFields: [],
        suggestions: [],
        completedCount: 0,
        totalFields: 0
      });
      return;
    }

    const fields = [
      { key: 'name', label: 'Nome', suggestion: 'Aggiungi il tuo nome per personalizzare il profilo' },
      { key: 'username', label: 'Username', suggestion: 'Scegli un username unico per essere trovato facilmente' },
      { key: 'bio', label: 'Bio', suggestion: 'Racconta qualcosa di te in poche parole' },
      { key: 'avatar_url', label: 'Foto profilo', suggestion: 'Carica una foto per rendere il profilo più accattivante' },
      { key: 'mood', label: 'Mood', suggestion: 'Condividi il tuo stato d\'animo attuale' },
      { key: 'job_title', label: 'Lavoro', suggestion: 'Aggiungi la tua professione' },
      { key: 'interests', label: 'Interessi', suggestion: 'Elenca i tuoi hobby e passioni', isArray: true },
      { key: 'gallery', label: 'Galleria foto', suggestion: 'Aggiungi foto per mostrare i tuoi momenti', isArray: true },
      { key: 'instagram_username', label: 'Instagram', suggestion: 'Collega il tuo profilo social' },
      { key: 'relationship_status', label: 'Stato relazione', suggestion: 'Condividi il tuo stato sentimentale' }
    ];

    const completedFields = fields.filter(field => {
      const value = profile[field.key];
      if (field.isArray) {
        return Array.isArray(value) && value.length > 0;
      }
      return value && value.toString().trim() !== '';
    });

    const missingFields = fields.filter(field => {
      const value = profile[field.key];
      if (field.isArray) {
        return !Array.isArray(value) || value.length === 0;
      }
      return !value || value.toString().trim() === '';
    });

    const completionPercentage = Math.round((completedFields.length / fields.length) * 100);
    
    const suggestions = missingFields.slice(0, 3).map(field => field.suggestion);

    setCompletionData({
      completionPercentage,
      missingFields: missingFields.map(f => f.label),
      suggestions,
      completedCount: completedFields.length,
      totalFields: fields.length
    });
  }, [profile]);

  return completionData;
}