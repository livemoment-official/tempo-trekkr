import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationFormData } from './LocationRegistrationWizard';

interface Step2VenueDetailsProps {
  data: LocationFormData;
  onChange: (data: Partial<LocationFormData>) => void;
}

const venueTypes = [
  'Bar',
  'Ristorante',
  'Pub',
  'Club/Discoteca',
  'Sala eventi',
  'Teatro',
  'Centro culturale',
  'Spazio all\'aperto',
  'Hotel',
  'Lounge bar',
  'Wine bar',
  'Birreria',
  'Altro',
];

const italianProvinces = [
  'AG', 'AL', 'AN', 'AO', 'AR', 'AP', 'AT', 'AV', 'BA', 'BT', 'BL', 'BN', 'BG', 'BI', 'BO', 'BZ', 'BS', 'BR',
  'CA', 'CL', 'CB', 'CI', 'CE', 'CT', 'CZ', 'CH', 'CO', 'CS', 'CR', 'KR', 'CN', 'EN', 'FM', 'FE', 'FI', 'FG',
  'FC', 'FR', 'GE', 'GO', 'GR', 'IM', 'IS', 'SP', 'LT', 'LE', 'LC', 'LI', 'LO', 'LU', 'MC', 'MN', 'MS', 'MT',
  'ME', 'MI', 'MO', 'MB', 'NA', 'NO', 'NU', 'OR', 'PD', 'PA', 'PR', 'PV', 'PG', 'PU', 'PE', 'PC', 'PI', 'PT',
  'PN', 'PZ', 'PO', 'RG', 'RA', 'RC', 'RE', 'RI', 'RN', 'RM', 'RO', 'SA', 'VS', 'SS', 'SV', 'SI', 'SR', 'SO',
  'TA', 'TE', 'TR', 'TO', 'TP', 'TN', 'TV', 'TS', 'UD', 'VA', 'VE', 'VB', 'VC', 'VR', 'VV', 'VI', 'VT',
];

export function Step2VenueDetails({ data, onChange }: Step2VenueDetailsProps) {
  const handleInputChange = (field: keyof LocationFormData, value: string) => {
    onChange({ [field]: value });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    onChange({
      socialMediaProfiles: {
        ...data.socialMediaProfiles,
        [platform]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Dettagli del Locale</h2>
        <p className="text-muted-foreground">
          Raccontaci del tuo locale e della sua posizione
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome del Locale *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Il nome del tuo locale"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueType">Tipo di Locale *</Label>
          <Select
            value={data.venueType}
            onValueChange={(value) => handleInputChange('venueType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona il tipo" />
            </SelectTrigger>
            <SelectContent>
              {venueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Provincia *</Label>
          <Select
            value={data.province}
            onValueChange={(value) => handleInputChange('province', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona provincia" />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {italianProvinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Indirizzo *</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Via, Piazza, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Città *</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Nome della città"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrizione del Locale</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descrivi il tuo locale, l'atmosfera, lo stile..."
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Media (opzionale)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={data.socialMediaProfiles.instagram || ''}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              placeholder="@nome_locale"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={data.socialMediaProfiles.facebook || ''}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              placeholder="facebook.com/nome_locale"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Sito Web</Label>
            <Input
              id="website"
              value={data.socialMediaProfiles.website || ''}
              onChange={(e) => handleSocialMediaChange('website', e.target.value)}
              placeholder="www.nome-locale.it"
            />
          </div>
        </div>
      </div>
    </div>
  );
}