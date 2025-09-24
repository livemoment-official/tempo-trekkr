import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Euro, 
  Users, 
  Clock, 
  MapPin, 
  Info,
  Ticket,
  Shield,
  CheckCircle 
} from "lucide-react";
import { useMomentTickets } from "@/hooks/useMomentTickets";
import { useAuth } from "@/contexts/AuthContext";

interface TicketPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moment: {
    id: string;
    title: string;
    description?: string;
    when_at?: string;
    place?: {
      name: string;
      address?: string;
    };
    price_cents: number;
    currency: string;
    livemoment_fee_percentage: number;
    organizer_fee_percentage: number;
    max_participants?: number;
    participant_count?: number;
  };
}

export function TicketPurchaseModal({ 
  open, 
  onOpenChange, 
  moment 
}: TicketPurchaseModalProps) {
  const { user } = useAuth();
  const { purchaseTicket, checkPendingPayments, isLoading } = useMomentTickets();
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [purchaseState, setPurchaseState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Check for pending payments when modal opens
  useEffect(() => {
    if (open && user) {
      checkPendingPayments();
    }
  }, [open, user, checkPendingPayments]);

  // Calculate fees
  const basePrice = moment.price_cents;
  const livemomentFee = Math.round(basePrice * (moment.livemoment_fee_percentage / 100));
  const organizerFee = Math.round(basePrice * (moment.organizer_fee_percentage / 100));
  const totalAmount = basePrice + livemomentFee + organizerFee;

  const formatPrice = (cents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(cents / 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data da definire';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchaseState('processing');
      const result = await purchaseTicket(moment.id);
      
      if (result?.feeBreakdown) {
        setFeeBreakdown(result.feeBreakdown);
        setPurchaseState('success');
        
        // Close modal after 2 seconds if payment was initiated
        setTimeout(() => {
          onOpenChange(false);
          setPurchaseState('idle');
          setFeeBreakdown(null);
        }, 2000);
      } else {
        setPurchaseState('error');
        setTimeout(() => setPurchaseState('idle'), 3000);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseState('error');
      setTimeout(() => setPurchaseState('idle'), 3000);
    }
  };

  const availableSpots = moment.max_participants 
    ? moment.max_participants - (moment.participant_count || 0)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-brand" />
            Acquista Biglietto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Moment Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-lg leading-tight">{moment.title}</h3>
              
              {moment.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {moment.description}
                </p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(moment.when_at)}</span>
                </div>
                
                {moment.place && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {moment.place.name}
                      {moment.place.address && `, ${moment.place.address}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {moment.participant_count || 0}
                    {moment.max_participants && `/${moment.max_participants}`} partecipanti
                  </span>
                  {availableSpots !== null && (
                    <Badge variant={availableSpots > 0 ? "secondary" : "destructive"} className="text-xs">
                      {availableSpots > 0 ? `${availableSpots} posti disponibili` : 'Sold Out'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Dettaglio Prezzo
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Prezzo base</span>
                  <span>{formatPrice(basePrice, moment.currency)}</span>
                </div>
                
                {livemomentFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee LiveMoment ({moment.livemoment_fee_percentage}%)</span>
                    <span>{formatPrice(livemomentFee, moment.currency)}</span>
                  </div>
                )}
                
                {organizerFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee organizzatore ({moment.organizer_fee_percentage}%)</span>
                    <span>{formatPrice(organizerFee, moment.currency)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-base">
                  <span>Totale</span>
                  <span>{formatPrice(totalAmount, moment.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Pagamento sicuro</p>
                <p>I tuoi dati di pagamento sono protetti da Stripe. Non memorizziamo le tue informazioni di pagamento.</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Condizioni di acquisto</p>
                <p>Acquistando il biglietto confermi la tua partecipazione al momento. I rimborsi sono disponibili fino a 24 ore prima dell'evento.</p>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="pt-2">
            {!user ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">Devi effettuare l'accesso per acquistare un biglietto</p>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Accedi
                </Button>
              </div>
            ) : availableSpots === 0 ? (
              <Button disabled className="w-full">
                Evento Sold Out
              </Button>
            ) : (
              <Button 
                onClick={handlePurchase}
                disabled={isLoading || purchaseState === 'processing'}
                className="w-full bg-gradient-to-r from-brand to-brand-accent hover:from-brand-accent hover:to-brand text-white font-medium"
                size="lg"
              >
                {purchaseState === 'processing' || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reindirizzamento...
                  </>
                ) : purchaseState === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reindirizzamento in corso...
                  </>
                ) : purchaseState === 'error' ? (
                  "Riprova"
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Acquista per {formatPrice(totalAmount, moment.currency)}
                  </>
                )}
              </Button>
            )}
          </div>

          {purchaseState === 'success' && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Reindirizzamento al pagamento in corso...
                </span>
              </div>
            </div>
          )}

          {purchaseState === 'error' && (
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Errore durante l'avvio del pagamento. Riprova.
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}