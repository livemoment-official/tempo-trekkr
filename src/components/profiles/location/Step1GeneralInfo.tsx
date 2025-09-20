import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationFormData } from './LocationRegistrationWizard';

interface Step1GeneralInfoProps {
  data: LocationFormData;
  onChange: (data: Partial<LocationFormData>) => void;
}

const discoveryOptions = [
  'Google',
  'Instagram',
  'Facebook',
  'Amici',
  'Passaparola',
  'Eventi locali',
  'Pubblicità',
  'Giornali/Riviste',
  'Radio',
  'Altro',
];

export function Step1GeneralInfo({ data, onChange }: Step1GeneralInfoProps) {
  const handleInputChange = (field: keyof LocationFormData, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Informazioni Generali</h2>
        <p className="text-muted-foreground">
          Iniziamo con le tue informazioni di contatto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contactPersonName">Nome *</Label>
          <Input
            id="contactPersonName"
            value={data.contactPersonName}
            onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
            placeholder="Il tuo nome"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPersonSurname">Cognome *</Label>
          <Input
            id="contactPersonSurname"
            value={data.contactPersonSurname}
            onChange={(e) => handleInputChange('contactPersonSurname', e.target.value)}
            placeholder="Il tuo cognome"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={data.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            placeholder="la-tua-email@esempio.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Telefono *</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={data.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            placeholder="+39 123 456 7890"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="howDiscovered">Come ci hai conosciuto? *</Label>
          <Select
            value={data.howDiscovered}
            onValueChange={(value) => handleInputChange('howDiscovered', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona un'opzione" />
            </SelectTrigger>
            <SelectContent>
              {discoveryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Privacy:</strong> I tuoi dati personali saranno utilizzati solo per la gestione del profilo 
          e non saranno condivisi con terze parti senza il tuo consenso.
        </p>
      </div>
    </div>
  );
}