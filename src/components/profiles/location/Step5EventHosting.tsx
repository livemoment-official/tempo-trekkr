import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationFormData } from './LocationRegistrationWizard';

interface Step5EventHostingProps {
  data: LocationFormData;
  onChange: (data: Partial<LocationFormData>) => void;
}

const agreementTypeOptions = [
  'Solo consumazioni',
  'Affitto fisso',
  'Percentuale su incassi',
  'Misto (affitto + consumazioni)',
  'Revenue sharing',
  'Sponsorizzazione eventi',
];

const eventTypeOptions = [
  'Concerti acustici',
  'Live music',
  'DJ set',
  'Karaoke',
  'Stand-up comedy',
  'Serate a tema',
  'Feste private',
  'Presentazioni',
  'Mostre artistiche',
  'Workshop',
  'Degustazioni',
  'Eventi corporate',
];

const musicGenreOptions = [
  'Pop',
  'Rock',
  'Jazz',
  'Blues',
  'Folk',
  'Elettronica',
  'Hip Hop',
  'Reggae',
  'Indie',
  'Classica',
  'Country',
  'Funk',
  'Soul',
  'R&B',
];

const audioSetupOptions = [
  'Impianto audio professionale',
  'Microfoni wireless',
  'Mixer digitale',
  'Casse monitor',
  'Amplificatori per strumenti',
  'Piano/Tastiera',
  'Batteria completa',
  'Sistema karaoke',
  'Proiettore/Schermo',
  'Luci sceniche',
];

const equipmentOptions = [
  'Palco rialzato',
  'Sistema di registrazione',
  'Streaming live',
  'Aria condizionata',
  'Riscaldamento',
  'Guardaroba',
  'Spazio backstage',
  'Bar completo',
  'Cucina attrezzata',
  'Parcheggio privato',
];

const serviceOptions = [
  'Servizio al tavolo',
  'Buffet organizzato',
  'Catering esterno',
  'Sicurezza/Hostess',
  'Fotografo eventi',
  'Social media coverage',
  'Pulizie post-evento',
  'Assistenza tecnica',
  'Coordinamento eventi',
  'Decorazioni personalizzate',
];

export function Step5EventHosting({ data, onChange }: Step5EventHostingProps) {
  const handleCheckboxToggle = (field: keyof LocationFormData, option: string, checked: boolean) => {
    const currentArray = (data[field] as string[]) || [];
    const updatedArray = checked
      ? [...currentArray, option]
      : currentArray.filter(item => item !== option);
    
    onChange({ [field]: updatedArray });
  };

  const handleInputChange = (field: keyof LocationFormData, value: string | number) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Gestione Eventi</h2>
        <p className="text-muted-foreground">
          Configura come gestisci gli eventi nel tuo locale
        </p>
      </div>

      <div className="space-y-6">
        {/* Agreement Types */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Tipologie di accordo *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agreementTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={data.agreementTypes.includes(type)}
                  onCheckedChange={(checked) => handleCheckboxToggle('agreementTypes', type, checked as boolean)}
                />
                <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rental Cost Info */}
        <div className="space-y-2">
          <Label htmlFor="rentalCostInfo">Informazioni sui costi</Label>
          <Textarea
            id="rentalCostInfo"
            value={data.rentalCostInfo}
            onChange={(e) => handleInputChange('rentalCostInfo', e.target.value)}
            placeholder="Dettagli sui costi di affitto, percentuali, consumazioni minime..."
            rows={3}
          />
        </div>

        {/* Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="maxCapacitySeated">Capienza posti a sedere</Label>
            <Input
              id="maxCapacitySeated"
              type="number"
              value={data.maxCapacitySeated || ''}
              onChange={(e) => handleInputChange('maxCapacitySeated', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCapacityStanding">Capienza in piedi</Label>
            <Input
              id="maxCapacityStanding"
              type="number"
              value={data.maxCapacityStanding || ''}
              onChange={(e) => handleInputChange('maxCapacityStanding', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Preferred Event Types */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Tipologie di eventi preferite</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eventTypeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={data.preferredEventTypes.includes(type)}
                  onCheckedChange={(checked) => handleCheckboxToggle('preferredEventTypes', type, checked as boolean)}
                />
                <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Music Genres */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Generi musicali</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {musicGenreOptions.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox
                  id={genre}
                  checked={data.musicGenres.includes(genre)}
                  onCheckedChange={(checked) => handleCheckboxToggle('musicGenres', genre, checked as boolean)}
                />
                <Label htmlFor={genre} className="text-sm font-normal cursor-pointer">
                  {genre}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Setup */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Attrezzatura audio</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {audioSetupOptions.map((setup) => (
              <div key={setup} className="flex items-center space-x-2">
                <Checkbox
                  id={setup}
                  checked={data.audioSetup.includes(setup)}
                  onCheckedChange={(checked) => handleCheckboxToggle('audioSetup', setup, checked as boolean)}
                />
                <Label htmlFor={setup} className="text-sm font-normal cursor-pointer">
                  {setup}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Equipment */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Attrezzature aggiuntive</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {equipmentOptions.map((equipment) => (
              <div key={equipment} className="flex items-center space-x-2">
                <Checkbox
                  id={equipment}
                  checked={data.additionalEquipment.includes(equipment)}
                  onCheckedChange={(checked) => handleCheckboxToggle('additionalEquipment', equipment, checked as boolean)}
                />
                <Label htmlFor={equipment} className="text-sm font-normal cursor-pointer">
                  {equipment}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Service Details */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Servizi aggiuntivi</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {serviceOptions.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={data.serviceDetails.includes(service)}
                  onCheckedChange={(checked) => handleCheckboxToggle('serviceDetails', service, checked as boolean)}
                />
                <Label htmlFor={service} className="text-sm font-normal cursor-pointer">
                  {service}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Hours */}
        <div className="space-y-2">
          <Label htmlFor="recommendedHours">Orari consigliati per eventi</Label>
          <Select
            value={data.recommendedHours}
            onValueChange={(value) => handleInputChange('recommendedHours', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona l'orario preferito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18:00-22:00">18:00 - 22:00 (Aperitivo)</SelectItem>
              <SelectItem value="20:00-24:00">20:00 - 24:00 (Cena)</SelectItem>
              <SelectItem value="22:00-02:00">22:00 - 02:00 (Serata)</SelectItem>
              <SelectItem value="14:00-18:00">14:00 - 18:00 (Pomeriggio)</SelectItem>
              <SelectItem value="flexible">Flessibile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            🚀 Ottimizza il tuo profilo
          </h4>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Più dettagli fornisci sulle tue capacità e servizi, più sarà facile per 
            organizzatori e artisti trovare il locale perfetto per i loro eventi.
          </p>
        </div>
      </div>
    </div>
  );
}