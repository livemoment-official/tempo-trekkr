import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationFormData } from './LocationRegistrationWizard';

interface Step3ArtistWelcomeProps {
  data: LocationFormData;
  onChange: (data: Partial<LocationFormData>) => void;
}

const artistBenefitOptions = [
  'Drink gratuiti durante l\'esibizione',
  'Pasto gratuito',
  'Parcheggio riservato',
  'Assistenza tecnica',
  'Promozione sui social media',
  'Video/foto professionali',
  'Merchandising esposto',
  'Spazio per vendita diretta',
  'Copertura spese trasporto',
  'Alloggio per artisti fuori sede',
  'Sala prove disponibile',
  'Networking con altri artisti',
];

export function Step3ArtistWelcome({ data, onChange }: Step3ArtistWelcomeProps) {
  const handleBenefitToggle = (benefit: string, checked: boolean) => {
    const updatedBenefits = checked
      ? [...data.artistBenefits, benefit]
      : data.artistBenefits.filter(b => b !== benefit);
    
    onChange({ artistBenefits: updatedBenefits });
  };

  const handleMessageChange = (message: string) => {
    onChange({ artistWelcomeMessage: message });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Accoglienza Artisti</h2>
        <p className="text-muted-foreground">
          Definisci come accogli e supporti gli artisti nel tuo locale
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Quali benefici offri agli artisti? *
          </Label>
          <p className="text-sm text-muted-foreground">
            Seleziona tutti i benefici che il tuo locale può offrire agli artisti
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {artistBenefitOptions.map((benefit) => (
              <div key={benefit} className="flex items-center space-x-2">
                <Checkbox
                  id={benefit}
                  checked={data.artistBenefits.includes(benefit)}
                  onCheckedChange={(checked) => handleBenefitToggle(benefit, checked as boolean)}
                />
                <Label
                  htmlFor={benefit}
                  className="text-sm font-normal cursor-pointer"
                >
                  {benefit}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="artistWelcomeMessage" className="text-base font-semibold">
            Messaggio di benvenuto per gli artisti
          </Label>
          <p className="text-sm text-muted-foreground">
            Scrivi un messaggio personale che verrà mostrato agli artisti interessati
          </p>
          <Textarea
            id="artistWelcomeMessage"
            value={data.artistWelcomeMessage}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Ciao! Siamo entusiasti di ospitare la tua arte nel nostro locale. Crediamo nel supportare gli artisti locali e offriamo..."
            rows={6}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {data.artistWelcomeMessage.length}/500 caratteri
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Suggerimento
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Un messaggio accogliente e dettagliato sui benefici offerti aumenta le probabilità 
            che gli artisti scelgano il tuo locale per le loro esibizioni.
          </p>
        </div>
      </div>
    </div>
  );
}