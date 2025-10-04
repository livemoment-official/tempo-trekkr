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
import { Plus, Trash2, Euro, Ticket } from "lucide-react";
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
  maxParticipants?: number;
  simplified?: boolean; // For moments, show simplified version
}
export const AdvancedTicketingSystem = ({
  data,
  onChange,
  selectedArtists = [],
  maxParticipants,
  simplified = false
}: AdvancedTicketingSystemProps) => {
  const [ticketingData, setTicketingData] = useState<AdvancedTicketingData>(data || {
    enabled: false,
    currency: 'EUR',
    phases: [],
    artistSplits: []
  });
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
      updateData({
        artistSplits: initialSplits
      });
    }
  }, [selectedArtists]);
  const updateData = (updates: Partial<AdvancedTicketingData>) => {
    const newData = {
      ...ticketingData,
      ...updates
    };
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
      name: ticketingData.phases.length === 0 ? 'Early Bird' : ticketingData.phases.length === 1 ? 'Regular' : 'Last Minute',
      price: 0,
      maxTickets: 0
    };
    updateData({
      phases: [...ticketingData.phases, newPhase]
    });
  };
  const updatePhase = (index: number, updates: Partial<TicketPhase>) => {
    const newPhases = ticketingData.phases.map((phase, i) => i === index ? {
      ...phase,
      ...updates
    } : phase);
    updateData({
      phases: newPhases
    });
  };
  const removePhase = (index: number) => {
    const newPhases = ticketingData.phases.filter((_, i) => i !== index);
    updateData({
      phases: newPhases
    });
  };
  const updateArtistSplit = (artistId: string, updates: Partial<ArtistSplit>) => {
    const newSplits = (ticketingData.artistSplits || []).map(split => split.artistId === artistId ? {
      ...split,
      ...updates
    } : split);
    updateData({
      artistSplits: newSplits
    });
  };
  const calculateBreakdown = (price: number) => {
    const liveMomentFee = price * 0.05;
    const remainingForSplits = price - liveMomentFee;
    
    const artistsTotalPercentage = ticketingData.artistSplits?.reduce((sum, split) => {
      if (split.paymentType === 'percentage') return sum + split.percentage;
      return sum;
    }, 0) || 0;

    const artistsTotalFixed = ticketingData.artistSplits?.reduce((sum, split) => {
      if (split.paymentType === 'fixed') return sum + split.fixedAmount;
      return sum;
    }, 0) || 0;

    const artistsFromPercentage = remainingForSplits * (artistsTotalPercentage / 100);
    const totalToArtists = artistsFromPercentage + artistsTotalFixed;
    const toOrganizer = remainingForSplits - totalToArtists;

    return {
      liveMomentFee,
      totalToArtists,
      toOrganizer,
      artistsPercentage: artistsTotalPercentage,
      artistsFixed: artistsTotalFixed
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
  return <div className="space-y-6">
      <Card className="border-0 shadow-none bg-transparent md:shadow-card md:border md:bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                {simplified ? "Biglietti a Pagamento" : "Sistema di Ticketing Avanzato"}
              </CardTitle>
              
            </div>
            <Switch checked={ticketingData.enabled} onCheckedChange={enabled => updateData({
            enabled
          })} />
          </div>
        </CardHeader>

        {ticketingData.enabled && <CardContent className="space-y-6 pt-6 px-0 md:px-6">
            {/* Currency Selection */}
            <div className="space-y-2">
              <Label>Valuta</Label>
              <Select value={ticketingData.currency} onValueChange={(value: 'EUR' | 'USD' | 'GBP') => updateData({
            currency: value
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

            <Separator />

            {/* Ticket Phases */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Fasi di Vendita</h3>
                  <p className="text-sm text-muted-foreground">
                    Crea diverse fasi con prezzi e disponibilità
                  </p>
                </div>
                <Button onClick={addPhase} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Fase
                </Button>
              </div>

              {ticketingData.phases.map((phase, index) => <Card key={index} className="border-0 shadow-none bg-muted/30 md:shadow-card md:border md:bg-card">
                  <CardContent className="pt-6 space-y-4 px-4 md:px-6">
                    <div className="flex items-center justify-between">
                      <Input value={phase.name} onChange={e => updatePhase(index, {
                  name: e.target.value
                })} placeholder="Nome fase" className="max-w-xs" />
                      <Button variant="ghost" size="icon" onClick={() => removePhase(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prezzo ({currencySymbol})</Label>
                        <Input type="number" value={phase.price} onChange={e => updatePhase(index, {
                    price: Number(e.target.value)
                  })} min="0" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label>Biglietti Disponibili</Label>
                        <Input type="number" value={phase.maxTickets} onChange={e => updatePhase(index, {
                    maxTickets: Number(e.target.value)
                  })} min="0" max={maxParticipants} placeholder={maxParticipants ? `Max ${maxParticipants}` : "Nessun limite"} />
                        {maxParticipants && <p className="text-xs text-muted-foreground">
                            Massimo: {maxParticipants} partecipanti
                          </p>}
                      </div>
                    </div>

                    {/* Price Preview for Simplified Mode */}
                    {simplified && phase.price > 0 && <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Prezzo per l'utente:</span>
                          <span className="font-medium">{phase.price.toFixed(2)} {currencySymbol}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Fee LiveMoment (5%) inclusa:</span>
                          <span>{(phase.price * 0.05).toFixed(2)} {currencySymbol}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-1 border-t">
                          <span>All'organizzatore:</span>
                          <span>{(phase.price * 0.95).toFixed(2)} {currencySymbol}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 pt-1 border-t">
                          La fee è già inclusa nel prezzo mostrato al cliente
                        </p>
                      </div>}
                  </CardContent>
                </Card>)}
            </div>

            {/* Artist Payment Splits - Only for events (not simplified mode) */}
            {!simplified && selectedArtists.length > 0 && <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Divisione Ricavi Artisti</h3>
                    <p className="text-sm text-muted-foreground">
                      Configura come dividere i ricavi con gli artisti
                    </p>
                  </div>

                  {selectedArtists.map(artist => {
              const split = ticketingData.artistSplits?.find(s => s.artistId === artist.id);
              if (!split) return null;
              return <Card key={artist.id}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={artist.avatar_url} />
                              <AvatarFallback>{artist.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{artist.stage_name || artist.name}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Tipo Pagamento</Label>
                              <Select value={split.paymentType} onValueChange={(value: 'none' | 'percentage' | 'fixed') => updateArtistSplit(artist.id, {
                        paymentType: value
                      })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nessun Pagamento</SelectItem>
                                  <SelectItem value="percentage">Percentuale</SelectItem>
                                  <SelectItem value="fixed">Importo Fisso</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {split.paymentType === 'percentage' && <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Percentuale</Label>
                                  <span className="text-sm font-medium">{split.percentage}%</span>
                                </div>
                                <Slider value={[split.percentage]} onValueChange={([value]) => updateArtistSplit(artist.id, {
                        percentage: value
                      })} min={0} max={100 - LIVEMOMENT_FEE} step={1} />
                              </div>}

                            {split.paymentType === 'fixed' && <div className="space-y-2">
                                <Label>Importo Fisso ({currencySymbol})</Label>
                                <Input type="number" value={split.fixedAmount} onChange={e => updateArtistSplit(artist.id, {
                        fixedAmount: Number(e.target.value)
                      })} min="0" step="0.01" />
                              </div>}
                          </div>
                        </CardContent>
                      </Card>;
            })}
                </div>
              </>}
          </CardContent>}
      </Card>
    </div>;
};