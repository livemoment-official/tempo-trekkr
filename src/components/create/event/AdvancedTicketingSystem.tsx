import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Euro, Ticket, CreditCard, Users, Timer, Calendar } from "lucide-react";

interface TicketPhase {
  id: string;
  name: string;
  price: number;
  maxTickets?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  isActive: boolean;
}

interface AdvancedTicketingData {
  enabled: boolean;
  currency: string;
  phases: TicketPhase[];
  livemomentFeePercentage?: number;
  organizerFeePercentage?: number;
}

interface AdvancedTicketingSystemProps {
  data: AdvancedTicketingData;
  onChange: (data: AdvancedTicketingData) => void;
  maxParticipants?: number;
}

export const AdvancedTicketingSystem = ({
  data,
  onChange,
  maxParticipants
}: AdvancedTicketingSystemProps) => {
  const [localData, setLocalData] = useState<AdvancedTicketingData>(data);

  const updateData = (updates: Partial<AdvancedTicketingData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onChange(newData);
  };

  const addPhase = () => {
    const newPhase: TicketPhase = {
      id: `phase_${Date.now()}`,
      name: `Fase ${localData.phases.length + 1}`,
      price: 0,
      maxTickets: undefined,
      isActive: true
    };

    updateData({
      phases: [...localData.phases, newPhase]
    });
  };

  const updatePhase = (phaseId: string, updates: Partial<TicketPhase>) => {
    const updatedPhases = localData.phases.map(phase =>
      phase.id === phaseId ? { ...phase, ...updates } : phase
    );
    updateData({ phases: updatedPhases });
  };

  const removePhase = (phaseId: string) => {
    const updatedPhases = localData.phases.filter(phase => phase.id !== phaseId);
    updateData({ phases: updatedPhases });
  };

  const getPhaseIcon = (index: number) => {
    const icons = [Ticket, Timer, CreditCard];
    const Icon = icons[index % icons.length];
    return <Icon className="h-4 w-4" />;
  };

  const calculateTotal = (price: number) => {
    const livemomentFee = price * (localData.livemomentFeePercentage || 5) / 100;
    const organizerFee = price * (localData.organizerFeePercentage || 0) / 100;
    return price + livemomentFee + organizerFee;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Sistema Ticketing Avanzato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable ticketing toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Biglietti a pagamento</Label>
            <p className="text-sm text-muted-foreground">
              Configura vendita biglietti multi-fase (Early Bird, Regular, Last Minute)
            </p>
          </div>
          <Switch 
            checked={localData.enabled} 
            onCheckedChange={enabled => updateData({ enabled })} 
          />
        </div>

        {localData.enabled && (
          <div className="space-y-6">
            {/* Currency Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Valuta</Label>
                <Select 
                  value={localData.currency} 
                  onValueChange={currency => updateData({ currency })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ticket Phases */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Fasi di Vendita</h4>
                <Button 
                  onClick={addPhase} 
                  variant="outline" 
                  size="sm"
                  disabled={localData.phases.length >= 3}
                >
                  Aggiungi Fase
                </Button>
              </div>

              {localData.phases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nessuna fase configurata. Aggiungi una fase per iniziare.</p>
                </div>
              )}

              {localData.phases.map((phase, index) => (
                <Card key={phase.id} className="border-l-4 border-l-primary/30">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPhaseIcon(index)}
                          <span className="font-medium">Fase {index + 1}</span>
                          <Badge variant="outline" className="text-xs">
                            {index === 0 ? "Early Bird" : index === 1 ? "Regular" : "Last Minute"}
                          </Badge>
                        </div>
                        <Button 
                          onClick={() => removePhase(phase.id)}
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          Rimuovi
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`phase-name-${phase.id}`}>Nome fase</Label>
                          <Input
                            id={`phase-name-${phase.id}`}
                            value={phase.name}
                            onChange={e => updatePhase(phase.id, { name: e.target.value })}
                            placeholder="Early Bird, Regular..."
                          />
                        </div>

                        <div>
                          <Label htmlFor={`phase-price-${phase.id}`}>Prezzo</Label>
                          <div className="relative">
                            <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`phase-price-${phase.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={phase.price || ""}
                              onChange={e => updatePhase(phase.id, { price: parseFloat(e.target.value) || 0 })}
                              className="pl-10"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`phase-tickets-${phase.id}`}>Max biglietti</Label>
                          <Input
                            id={`phase-tickets-${phase.id}`}
                            type="number"
                            min="1"
                            max={maxParticipants || undefined}
                            value={phase.maxTickets || ""}
                            onChange={e => updatePhase(phase.id, { maxTickets: parseInt(e.target.value) || undefined })}
                            placeholder="Illimitati"
                          />
                        </div>
                      </div>

                      {/* Price Preview */}
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Prezzo base:</span>
                            <span className="font-medium">{phase.price} {localData.currency}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Fee LiveMoment (5%):</span>
                            <span>{(phase.price * 0.05).toFixed(2)} {localData.currency}</span>
                          </div>
                          <Separator className="my-1" />
                          <div className="flex justify-between font-semibold">
                            <span>Totale utente:</span>
                            <span>{calculateTotal(phase.price).toFixed(2)} {localData.currency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {localData.phases.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Riepilogo Vendite
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {localData.phases.map((phase, index) => (
                      <div key={phase.id} className="space-y-1">
                        <div className="font-medium">{phase.name}</div>
                        <div className="text-muted-foreground">
                          {calculateTotal(phase.price).toFixed(2)} {localData.currency}
                        </div>
                        {phase.maxTickets && (
                          <div className="text-xs text-muted-foreground">
                            Max: {phase.maxTickets} biglietti
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};