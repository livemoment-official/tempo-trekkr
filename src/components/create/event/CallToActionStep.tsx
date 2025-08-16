import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Users, Lock } from "lucide-react";
interface CallToActionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
export default function CallToActionStep({
  data,
  onChange,
  onNext
}: CallToActionStepProps) {
  const handleCallToActionChange = (field: string, value: any) => {
    onChange({
      ...data,
      callToAction: {
        ...data.callToAction,
        [field]: value
      }
    });
  };
  return <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Call-to-Action</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Configura come invitare persone al tuo evento
        </p>
      </div>

      {/* Enable/Disable CTA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5" />
              <CardTitle className="text-base">Abilita inviti automatici</CardTitle>
            </div>
            <Switch checked={data.callToAction.enabled} onCheckedChange={checked => handleCallToActionChange('enabled', checked)} />
          </div>
        </CardHeader>
        {data.callToAction.enabled && <CardContent className="pt-0 space-y-4">
            {/* CTA Type */}
            <div>
              <Label className="text-sm font-medium">Tipo di invito</Label>
              <RadioGroup value={data.callToAction.type} onValueChange={value => handleCallToActionChange('type', value)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="open" id="open" />
                  <Label htmlFor="open" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Invito aperto - Tutti possono partecipare
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invite_only" id="invite_only" />
                  <Label htmlFor="invite_only" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Solo su invito - Richiesta approvazione
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* CTA Message */}
            <div>
              <Label htmlFor="cta-message" className="text-sm font-medium">
                Messaggio di invito
              </Label>
              <Textarea id="cta-message" value={data.callToAction.message} onChange={e => handleCallToActionChange('message', e.target.value)} placeholder={data.callToAction.type === 'open' ? "Unisciti al nostro evento! Tutti sono benvenuti..." : "Richiedi l'invito per partecipare a questo evento esclusivo..."} className="mt-2" rows={3} />
            </div>

            {/* Preview */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Anteprima invito</h4>
              <div className="bg-background p-3 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {data.callToAction.type === 'open' ? <Users className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-blue-600" />}
                  <span className="text-sm font-medium">
                    {data.callToAction.type === 'open' ? 'Evento Aperto' : 'Solo su Invito'}
                  </span>
                </div>
                <p className="text-sm">
                  {data.callToAction.message || "Messaggio di invito personalizzato..."}
                </p>
                <Button size="sm" className="mt-2">
                  {data.callToAction.type === 'open' ? 'Partecipa' : 'Richiedi Invito'}
                </Button>
              </div>
            </div>
          </CardContent>}
      </Card>

      {!data.callToAction.enabled && <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Gli inviti automatici sono disabilitati. Potrai invitare persone manualmente dopo aver creato l'evento.
          </p>
        </div>}

      <div className="flex justify-end">
        
      </div>
    </div>;
}