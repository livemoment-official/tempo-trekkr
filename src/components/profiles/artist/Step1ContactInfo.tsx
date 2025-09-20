import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step1ContactInfoProps {
  data: any;
  updateData: (data: any) => void;
}

const italianProvinces = [
  'Agrigento', 'Alessandria', 'Ancona', 'Aosta', 'Arezzo', 'Ascoli Piceno', 'Asti', 'Avellino',
  'Bari', 'Barletta-Andria-Trani', 'Belluno', 'Benevento', 'Bergamo', 'Biella', 'Bologna', 'Bolzano',
  'Brescia', 'Brindisi', 'Cagliari', 'Caltanissetta', 'Campobasso', 'Carbonia-Iglesias', 'Caserta',
  'Catania', 'Catanzaro', 'Chieti', 'Como', 'Cosenza', 'Cremona', 'Crotone', 'Cuneo',
  'Enna', 'Fermo', 'Ferrara', 'Firenze', 'Foggia', 'Forlì-Cesena', 'Frosinone', 'Genova',
  'Gorizia', 'Grosseto', 'Imperia', 'Isernia', 'La Spezia', 'Latina', 'Lecce', 'Lecco',
  'Livorno', 'Lodi', 'Lucca', 'Macerata', 'Mantova', 'Massa-Carrara', 'Matera', 'Messina',
  'Milano', 'Modena', 'Monza e Brianza', 'Napoli', 'Novara', 'Nuoro', 'Olbia-Tempio', 'Oristano',
  'Padova', 'Palermo', 'Parma', 'Pavia', 'Perugia', 'Pesaro e Urbino', 'Pescara', 'Piacenza',
  'Pisa', 'Pistoia', 'Pordenone', 'Potenza', 'Prato', 'Ragusa', 'Ravenna', 'Reggio Calabria',
  'Reggio Emilia', 'Rieti', 'Rimini', 'Roma', 'Rovigo', 'Salerno', 'Sassari', 'Savona',
  'Siena', 'Siracusa', 'Sondrio', 'Taranto', 'Teramo', 'Terni', 'Torino', 'Trapani',
  'Trento', 'Treviso', 'Trieste', 'Udine', 'Varese', 'Venezia', 'Verbano-Cusio-Ossola',
  'Vercelli', 'Verona', 'Vibo Valentia', 'Vicenza', 'Viterbo'
];

export const Step1ContactInfo: React.FC<Step1ContactInfoProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Informazioni di Contatto</h2>
        <p className="text-muted-foreground">Inserisci le tue informazioni principali</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="stage_name">Nome d'Arte *</Label>
          <Input
            id="stage_name"
            value={data.stage_name}
            onChange={(e) => updateData({ stage_name: e.target.value })}
            placeholder="Il tuo nome artistico"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome Reale *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="Il tuo nome completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Età *</Label>
          <Input
            id="age"
            type="number"
            min="16"
            max="100"
            value={data.age}
            onChange={(e) => updateData({ age: parseInt(e.target.value) || 18 })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefono *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="+39 xxx xxx xxxx"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="province">Provincia *</Label>
          <Select
            value={data.province}
            onValueChange={(value) => updateData({ province: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona la tua provincia" />
            </SelectTrigger>
            <SelectContent>
              {italianProvinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Privacy:</strong> Le tue informazioni di contatto verranno condivise solo con organizzatori 
          interessati alle tue performance e saranno trattate secondo la nostra privacy policy.
        </p>
      </div>
    </div>
  );
};