import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationFormData } from './LocationRegistrationWizard';

interface Step4CommunityAttractionProps {
  data: LocationFormData;
  onChange: (data: Partial<LocationFormData>) => void;
}

const communityAdvantageOptions = [
  'Sconti per gruppi numerosi',
  'Menu degustazione esclusivo',
  'Aperitivo di benvenuto',
  'Tavoli riservati',
  'Servizio prioritario',
  'Parcheggio agevolato',
  'Wi-Fi gratuito',
  'Spazio per feste private',
  'Organizzazione eventi personalizzati',
  'Foto di gruppo professionale',
  'Gadget del locale',
  'Tessera fedeltà',
];

const weekDays = [
  { key: 'lunedi', label: 'Lunedì' },
  { key: 'martedi', label: 'Martedì' },
  { key: 'mercoledi', label: 'Mercoledì' },
  { key: 'giovedi', label: 'Giovedì' },
  { key: 'venerdi', label: 'Venerdì' },
  { key: 'sabato', label: 'Sabato' },
  { key: 'domenica', label: 'Domenica' },
];

export function Step4CommunityAttraction({ data, onChange }: Step4CommunityAttractionProps) {
  const handleAdvantageToggle = (advantage: string, checked: boolean) => {
    const updatedAdvantages = checked
      ? [...data.communityAdvantages, advantage]
      : data.communityAdvantages.filter(a => a !== advantage);
    
    onChange({ communityAdvantages: updatedAdvantages });
  };

  const handleInputChange = (field: keyof LocationFormData, value: string) => {
    onChange({ [field]: value });
  };

  const handleScheduleToggle = (day: string, checked: boolean) => {
    onChange({
      availabilitySchedule: {
        ...data.availabilitySchedule,
        [day]: checked,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Attrazione Community</h2>
        <p className="text-muted-foreground">
          Definisci i vantaggi e le offerte per attrarre la community
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Quali vantaggi offri alla community? *
          </Label>
          <p className="text-sm text-muted-foreground">
            Seleziona tutti i vantaggi che offri ai visitatori
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {communityAdvantageOptions.map((advantage) => (
              <div key={advantage} className="flex items-center space-x-2">
                <Checkbox
                  id={advantage}
                  checked={data.communityAdvantages.includes(advantage)}
                  onCheckedChange={(checked) => handleAdvantageToggle(advantage, checked as boolean)}
                />
                <Label
                  htmlFor={advantage}
                  className="text-sm font-normal cursor-pointer"
                >
                  {advantage}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rewards10People">Premio per gruppi da 10 persone</Label>
            <Input
              id="rewards10People"
              value={data.rewards10People}
              onChange={(e) => handleInputChange('rewards10People', e.target.value)}
              placeholder="es. Aperitivo gratuito per il capogruppo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rewards30People">Premio per gruppi da 30 persone</Label>
            <Input
              id="rewards30People"
              value={data.rewards30People}
              onChange={(e) => handleInputChange('rewards30People', e.target.value)}
              placeholder="es. Sconto 15% sul conto totale"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialOffer">Offerta speciale</Label>
          <Textarea
            id="specialOffer"
            value={data.specialOffer}
            onChange={(e) => handleInputChange('specialOffer', e.target.value)}
            placeholder="Descrivi un'offerta speciale per eventi organizzati tramite la piattaforma..."
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Disponibilità settimanale</Label>
          <p className="text-sm text-muted-foreground">
            Seleziona i giorni in cui il locale è disponibile per eventi
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekDays.map((day) => (
              <div key={day.key} className="flex items-center space-x-2">
                <Checkbox
                  id={day.key}
                  checked={data.availabilitySchedule[day.key] || false}
                  onCheckedChange={(checked) => handleScheduleToggle(day.key, checked as boolean)}
                />
                <Label
                  htmlFor={day.key}
                  className="text-sm font-normal cursor-pointer"
                >
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            🎯 Strategia di successo
          </h4>
          <p className="text-sm text-green-800 dark:text-green-200">
            Offerte attraenti e premi per gruppi numerosi aumentano significativamente 
            la partecipazione agli eventi e la fedeltà dei clienti.
          </p>
        </div>
      </div>
    </div>
  );
}