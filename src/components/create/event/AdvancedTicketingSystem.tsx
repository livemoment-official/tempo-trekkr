import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Users, DollarSign, Percent, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";

export interface TicketPhase {
  name: string;
  price: number;
  maxTickets: number;
}

export interface ArtistSplit {
  artistId: string;
  paymentType: 'none' | 'percentage' | 'fixed';
  percentage: number;
  fixedAmount: number;
}

export interface AdvancedTicketingData {
  enabled: boolean;
  currency: 'EUR' | 'USD' | 'GBP';
  phases: TicketPhase[];
  artistSplits?: ArtistSplit[];
}

interface AdvancedTicketingSystemProps {
  data?: AdvancedTicketingData;
  onChange: (data: AdvancedTicketingData) => void;
  selectedArtists?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    stage_name?: string;
  }>;
}

export const AdvancedTicketingSystem = ({ data, onChange, selectedArtists = [] }: AdvancedTicketingSystemProps) => {
  const [ticketingData, setTicketingData] = useState<AdvancedTicketingData>(
    data || {
      enabled: false,
      currency: 'EUR',
      phases: [],
      artistSplits: []
    }
  );

  const LIVEMOMENT_FEE = 5; // 5% fee

  // Initialize artist splits when artists change
  useEffect(() => {
    if (selectedArtists.length > 0 && (!ticketingData.artistSplits || ticketingData.artistSplits.length === 0)) {
      const initialSplits: ArtistSplit[] = selectedArtists.map(artist => ({
        artistId: artist.id,
        paymentType: 'none',
        percentage: 0,
        fixedAmount: 0
      }));
      updateData({ artistSplits: initialSplits });
    }
  }, [selectedArtists]);

  const updateData = (updates: Partial<AdvancedTicketingData>) => {
    const newData = { ...ticketingData, ...updates };
    setTicketingData(newData);
    onChange(newData);
  };

  useEffect(() => {
    if (data) {
      setTicketingData(data);
    }
  }, [data]);

  const addPhase = () => {
    const newPhase: TicketPhase = {
      name: ticketingData.phases.length === 0 ? 'Early Bird' : 
            ticketingData.phases.length === 1 ? 'Regular' : 'Last Minute',
      price: 0,
      maxTickets: 0
    };
    updateData({ phases: [...ticketingData.phases, newPhase] });
  };

  const updatePhase = (index: number, updates: Partial<TicketPhase>) => {
    const newPhases = ticketingData.phases.map((phase, i) => 
      i === index ? { ...phase, ...updates } : phase
    );
    updateData({ phases: newPhases });
  };

  const removePhase = (index: number) => {
    const newPhases = ticketingData.phases.filter((_, i) => i !== index);
    updateData({ phases: newPhases });
  };

  const updateArtistSplit = (artistId: string, updates: Partial<ArtistSplit>) => {
    const newSplits = (ticketingData.artistSplits || []).map(split =>
      split.artistId === artistId ? { ...split, ...updates } : split
    );
    updateData({ artistSplits: newSplits });
  };

  const calculateBreakdown = (price: number) => {
    const livemomentFee = (price * LIVEMOMENT_FEE) / 100;
    let artistsTotal = 0;

    (ticketingData.artistSplits || []).forEach(split => {
      if (split.paymentType === 'percentage') {
        artistsTotal += (price * split.percentage) / 100;
      } else if (split.paymentType === 'fixed') {
        artistsTotal += split.fixedAmount / 100;
      }
    });

    const organizerAmount = price - livemomentFee - artistsTotal;
    
    return {
      livemomentFee,
      artistsTotal,
      organizerAmount
    };
  };

  const getTotalPercentageAllocated = () => {
    let total = LIVEMOMENT_FEE;
    (ticketingData.artistSplits || []).forEach(split => {
      if (split.paymentType === 'percentage') {
        total += split.percentage;
      }
    });
    return total;
  };

  const currencySymbol = ticketingData.currency === 'EUR' ? '€' : ticketingData.currency === 'USD' ? '$' : '£';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="ticketing-enabled" className="text-base font-semibold">
            Biglietti a Pagamento
          </Label>
          <p className="text-sm text-muted-foreground">
            Attiva la vendita di biglietti per il tuo evento
          </p>
        </div>
        <Switch
          id="ticketing-enabled"
          checked={ticketingData.enabled}
          onCheckedChange={(checked) => updateData({ enabled: checked })}
        />
      </div>

      {ticketingData.enabled && (
        <>
          <div className="space-y-2">
            <Label>Valuta</Label>
            <Select
              value={ticketingData.currency}
              onValueChange={(value: 'EUR' | 'USD' | 'GBP') => updateData({ currency: value })}
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Fasi di Vendita</h3>
                <p className="text-sm text-muted-foreground">
                  Crea fino a 3 fasi con prezzi diversi
                </p>
              </div>
              {ticketingData.phases.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhase}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Fase
                </Button>
              )}
            </div>

            {ticketingData.phases.map((phase, index) => (
              <Card key={index}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Fase {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePhase(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Fase</Label>
                    <Input
                      value={phase.name}
                      onChange={(e) => updatePhase(index, { name: e.target.value })}
                      placeholder="es. Early Bird"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prezzo ({currencySymbol})</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={phase.price || ''}
                        onChange={(e) => updatePhase(index, { price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Biglietti</Label>
                      <Input
                        type="number"
                        min="0"
                        value={phase.maxTickets || ''}
                        onChange={(e) => updatePhase(index, { maxTickets: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {phase.price > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3">Breakdown Prezzo</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Prezzo biglietto:</span>
                          <span className="font-medium text-foreground">{phase.price.toFixed(2)} {currencySymbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee LiveMoment (5%):</span>
                          <span>-{((phase.price * 5) / 100).toFixed(2)} {currencySymbol}</span>
                        </div>
                        {(() => {
                          const breakdown = calculateBreakdown(phase.price);
                          return (
                            <>
                              {breakdown.artistsTotal > 0 && (
                                <div className="flex justify-between">
                                  <span>Artisti:</span>
                                  <span>-{breakdown.artistsTotal.toFixed(2)} {currencySymbol}</span>
                                </div>
                              )}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-medium text-foreground">
                                <span>Organizzatore riceve:</span>
                                <span className={breakdown.organizerAmount < 0 ? "text-destructive" : ""}>
                                  {breakdown.organizerAmount.toFixed(2)} {currencySymbol}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Artist Split Section */}
      {ticketingData.enabled && selectedArtists.length > 0 && ticketingData.phases.length > 0 && (
        <>
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Distribuzione Incassi agli Artisti
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Decidi quanto dare a ogni artista dai biglietti venduti
              </p>
            </div>

            {getTotalPercentageAllocated() > 95 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Attenzione: rimane solo il {(100 - getTotalPercentageAllocated()).toFixed(1)}% per l&apos;organizzatore
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {selectedArtists.map(artist => {
                const split = ticketingData.artistSplits?.find(s => s.artistId === artist.id);
                if (!split) return null;

                return (
                  <Card key={artist.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={artist.avatar_url} />
                            <AvatarFallback>{artist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{artist.stage_name || artist.name}</p>
                            <p className="text-sm text-muted-foreground">{artist.name}</p>
                          </div>
                          <Badge variant={split.paymentType === 'none' ? 'secondary' : 'default'}>
                            {split.paymentType === 'percentage' ? `${split.percentage}%` :
                             split.paymentType === 'fixed' ? `${(split.fixedAmount / 100).toFixed(2)} ${currencySymbol}` :
                             'Nessun pagamento'}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Tipo di Pagamento</Label>
                            <Select
                              value={split.paymentType}
                              onValueChange={(value: 'none' | 'percentage' | 'fixed') => 
                                updateArtistSplit(artist.id, { paymentType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nessun pagamento</SelectItem>
                                <SelectItem value="percentage">Percentuale del ricavato</SelectItem>
                                <SelectItem value="fixed">Importo fisso per biglietto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {split.paymentType === 'percentage' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                  <Percent className="h-4 w-4" />
                                  Percentuale
                                </Label>
                                <span className="text-sm font-medium">{split.percentage}%</span>
                              </div>
                              <Slider
                                value={[split.percentage]}
                                onValueChange={([value]) => updateArtistSplit(artist.id, { percentage: value })}
                                max={Math.min(50, 100 - getTotalPercentageAllocated() + split.percentage)}
                                step={1}
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                Per esempio: {split.percentage > 0 && ticketingData.phases[0] && 
                                  `${((ticketingData.phases[0].price * split.percentage) / 100).toFixed(2)} ${currencySymbol} 
                                  per biglietto da ${ticketingData.phases[0].price} ${currencySymbol}`
                                }
                              </p>
                            </div>
                          )}

                          {split.paymentType === 'fixed' && (
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Importo Fisso per Biglietto
                              </Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={split.fixedAmount / 100}
                                  onChange={(e) => updateArtistSplit(artist.id, { 
                                    fixedAmount: Math.round(parseFloat(e.target.value || '0') * 100) 
                                  })}
                                  placeholder="0.00"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  {currencySymbol}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary for first phase */}
            {ticketingData.phases[0] && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Esempio con {ticketingData.phases[0].name}</CardTitle>
                  <CardDescription>Distribuzione per biglietto da {ticketingData.phases[0].price} {currencySymbol}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Prezzo biglietto:</span>
                      <span className="font-medium">{ticketingData.phases[0].price.toFixed(2)} {currencySymbol}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-muted-foreground">
                      <span>Fee LiveMoment (5%):</span>
                      <span>-{((ticketingData.phases[0].price * 5) / 100).toFixed(2)} {currencySymbol}</span>
                    </div>
                    {(ticketingData.artistSplits || []).map(split => {
                      const artist = selectedArtists.find(a => a.id === split.artistId);
                      if (!artist || split.paymentType === 'none') return null;

                      const amount = split.paymentType === 'percentage'
                        ? (ticketingData.phases[0].price * split.percentage) / 100
                        : split.fixedAmount / 100;

                      return (
                        <div key={split.artistId} className="flex justify-between text-muted-foreground">
                          <span>{artist.stage_name || artist.name}:</span>
                          <span>-{amount.toFixed(2)} {currencySymbol}</span>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between font-medium text-foreground">
                      <span>Organizzatore riceve:</span>
                      <span className={calculateBreakdown(ticketingData.phases[0].price).organizerAmount < 0 ? "text-destructive" : "text-primary"}>
                        {calculateBreakdown(ticketingData.phases[0].price).organizerAmount.toFixed(2)} {currencySymbol}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};
