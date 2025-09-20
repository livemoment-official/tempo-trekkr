import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface Step3ExhibitionInfoProps {
  data: any;
  updateData: (data: any) => void;
}

const idealSituationOptions = [
  'Matrimoni',
  'Feste private',
  'Eventi aziendali',
  'Sagre e feste di paese',
  'Locali e pub',
  'Ristoranti',
  'Hotel e resort',
  'Centri commerciali',
  'Fiere ed esposizioni',
  'Concerti',
  'Teatro',
  'Strada'
];

const eventTypeOptions = [
  'Aperitivi',
  'Cene',
  'Feste danzanti',
  'Spettacoli',
  'Intrattenimento bambini',
  'Cerimonie',
  'Inaugurazioni',
  'Presentazioni',
  'Workshop',
  'Conferenze'
];

export const Step3ExhibitionInfo: React.FC<Step3ExhibitionInfoProps> = ({ data, updateData }) => {
  const addIdealSituation = (situation: string) => {
    if (!data.ideal_situations.includes(situation)) {
      updateData({
        ideal_situations: [...data.ideal_situations, situation]
      });
    }
  };

  const removeIdealSituation = (situation: string) => {
    updateData({
      ideal_situations: data.ideal_situations.filter((s: string) => s !== situation)
    });
  };

  const addEventType = (type: string) => {
    if (!data.event_types.includes(type)) {
      updateData({
        event_types: [...data.event_types, type]
      });
    }
  };

  const removeEventType = (type: string) => {
    updateData({
      event_types: data.event_types.filter((t: string) => t !== type)
    });
  };

  const addTargetProvince = (province: string) => {
    if (province && !data.target_provinces.includes(province)) {
      updateData({
        target_provinces: [...data.target_provinces, province]
      });
    }
  };

  const removeTargetProvince = (province: string) => {
    updateData({
      target_provinces: data.target_provinces.filter((p: string) => p !== province)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Informazioni Esibizioni</h2>
        <p className="text-muted-foreground">Descrivi la tua esperienza e le tue preferenze</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="exhibition_description">Descrizione della tua arte *</Label>
          <Textarea
            id="exhibition_description"
            value={data.exhibition_description}
            onChange={(e) => updateData({ exhibition_description: e.target.value })}
            placeholder="Descrivi il tuo stile, la tua esperienza e cosa rende unica la tua performance..."
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="experience_years">Anni di Esperienza</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              value={data.experience_years}
              onChange={(e) => updateData({ experience_years: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience_size">Pubblico Coinvolgibile</Label>
            <Select
              value={data.audience_size}
              onValueChange={(value) => updateData({ audience_size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona dimensione pubblico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intimate">Intimo (10-30 persone)</SelectItem>
                <SelectItem value="small">Piccolo (30-100 persone)</SelectItem>
                <SelectItem value="medium">Medio (100-300 persone)</SelectItem>
                <SelectItem value="large">Grande (300-1000 persone)</SelectItem>
                <SelectItem value="massive">Molto grande (1000+ persone)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="performance_duration">Durata Performance</Label>
          <Select
            value={data.performance_duration}
            onValueChange={(value) => updateData({ performance_duration: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona durata tipica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15min">15 minuti</SelectItem>
              <SelectItem value="30min">30 minuti</SelectItem>
              <SelectItem value="1h">1 ora</SelectItem>
              <SelectItem value="2h">2 ore</SelectItem>
              <SelectItem value="3h">3 ore</SelectItem>
              <SelectItem value="evening">Serata intera</SelectItem>
              <SelectItem value="flexible">Flessibile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Situazioni Ideali *</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.ideal_situations.map((situation: string) => (
              <Badge key={situation} variant="secondary" className="gap-1">
                {situation}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4"
                  onClick={() => removeIdealSituation(situation)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Select onValueChange={addIdealSituation}>
            <SelectTrigger>
              <SelectValue placeholder="Aggiungi situazione ideale" />
            </SelectTrigger>
            <SelectContent>
              {idealSituationOptions
                .filter(option => !data.ideal_situations.includes(option))
                .map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Tipi di Eventi</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.event_types.map((type: string) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {type}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4"
                  onClick={() => removeEventType(type)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Select onValueChange={addEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Aggiungi tipo di evento" />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions
                .filter(option => !data.event_types.includes(option))
                .map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};