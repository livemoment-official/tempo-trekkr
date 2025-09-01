import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Euro, Ticket, CreditCard, Users } from "lucide-react";
interface TicketingData {
  enabled: boolean;
  price: number;
  currency: string;
  maxTickets?: number;
  ticketType: "standard" | "vip" | "early_bird";
  description?: string;
  livemomentFeePercentage?: number;
  organizerFeePercentage?: number;
}
interface TicketingSystemProps {
  data: TicketingData;
  onChange: (data: TicketingData) => void;
  maxParticipants?: number;
}
export const TicketingSystem = ({
  data,
  onChange,
  maxParticipants
}: TicketingSystemProps) => {
  const [localData, setLocalData] = useState<TicketingData>(data);
  const updateData = (updates: Partial<TicketingData>) => {
    const newData = {
      ...localData,
      ...updates
    };
    setLocalData(newData);
    onChange(newData);
  };
  const ticketTypes = [{
    value: "standard",
    label: "Standard",
    icon: Ticket
  }, {
    value: "vip",
    label: "VIP",
    icon: CreditCard
  }, {
    value: "early_bird",
    label: "Early Bird",
    icon: Users
  }];
  return <Card>
      
      <CardContent className="space-y-4">
        {/* Enable ticketing toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Biglietti a pagamento</Label>
            <p className="text-sm text-muted-foreground">
              Imposta un prezzo per la partecipazione
            </p>
          </div>
          <Switch checked={localData.enabled} onCheckedChange={enabled => updateData({
          enabled
        })} />
        </div>

        {localData.enabled && <div className="space-y-4 mt-4 p-4 bg-muted/50 rounded-lg">
            {/* Price input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prezzo</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="price" type="number" min="0" step="0.01" value={localData.price || ""} onChange={e => updateData({
                price: parseFloat(e.target.value) || 0
              })} className="pl-10" placeholder="0.00" />
                </div>
              </div>

              <div>
                <Label htmlFor="currency">Valuta</Label>
                <Select value={localData.currency} onValueChange={currency => updateData({
              currency
            })}>
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

            {/* Ticket type */}
            

            {/* Max tickets */}
            <div>
              <Label htmlFor="maxTickets">Biglietti disponibili</Label>
              <Input id="maxTickets" type="number" min="1" max={maxParticipants || undefined} value={localData.maxTickets || ""} onChange={e => updateData({
            maxTickets: parseInt(e.target.value) || undefined
          })} placeholder={`Max ${maxParticipants || "illimitati"}`} />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="ticketDescription">Descrizione biglietto</Label>
              <Input id="ticketDescription" value={localData.description || ""} onChange={e => updateData({
            description: e.target.value
          })} placeholder="Incluso nel prezzo..." />
            </div>

            {/* Fee Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="livemomentFee">Fee LiveMoment (%)</Label>
                <Input 
                  id="livemomentFee" 
                  type="number" 
                  min="0" 
                  max="20" 
                  step="0.5"
                  value={localData.livemomentFeePercentage || 5} 
                  onChange={e => updateData({
                    livemomentFeePercentage: parseFloat(e.target.value) || 5
                  })} 
                  placeholder="5" 
                />
              </div>
              
              <div>
                <Label htmlFor="organizerFee">Fee organizzatore (%)</Label>
                <Input 
                  id="organizerFee" 
                  type="number" 
                  min="0" 
                  max="10" 
                  step="0.5"
                  value={localData.organizerFeePercentage || 0} 
                  onChange={e => updateData({
                    organizerFeePercentage: parseFloat(e.target.value) || 0
                  })} 
                  placeholder="0" 
                />
              </div>
            </div>

            {/* Preview with Fee Breakdown */}
            <div className="p-3 bg-background rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Badge variant="secondary" className="mb-1">
                    {ticketTypes.find(t => t.value === localData.ticketType)?.label}
                  </Badge>
                  {localData.description && <p className="text-xs text-muted-foreground">
                      {localData.description}
                    </p>}
                </div>
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-1 text-xs border-t pt-2">
                <div className="flex justify-between">
                  <span>Prezzo base:</span>
                  <span className="font-medium">{localData.price} {localData.currency}</span>
                </div>
                {(localData.livemomentFeePercentage || 5) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee LiveMoment ({localData.livemomentFeePercentage || 5}%):</span>
                    <span>{((localData.price * (localData.livemomentFeePercentage || 5)) / 100).toFixed(2)} {localData.currency}</span>
                  </div>
                )}
                {(localData.organizerFeePercentage || 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee organizzatore ({localData.organizerFeePercentage || 0}%):</span>
                    <span>{((localData.price * (localData.organizerFeePercentage || 0)) / 100).toFixed(2)} {localData.currency}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t">
                  <span>Totale utente:</span>
                  <span>
                    {(localData.price + 
                      (localData.price * (localData.livemomentFeePercentage || 5)) / 100 + 
                      (localData.price * (localData.organizerFeePercentage || 0)) / 100
                    ).toFixed(2)} {localData.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>}
      </CardContent>
    </Card>;
};