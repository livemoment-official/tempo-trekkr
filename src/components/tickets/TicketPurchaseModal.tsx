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
import { AuthModal } from "@/components/auth/AuthModal";

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
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check for pending payments when modal opens
  useEffect(() => {
    if (open && user) {
      checkPendingPayments();
    }
  }, [open, user, checkPendingPayments]);

  // Price breakdown (fees are included in the ticket price, not added)
  const ticketPrice = moment.price_cents;
  const livemomentFee = Math.round(ticketPrice * (moment.livemoment_fee_percentage / 100));
  const organizerRevenue = ticketPrice - livemomentFee;

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
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Ticket className="h-5 w-5 text-brand" />
            Partecipa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Moment Info */}
          <Card>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <h3 className="font-semibold text-base sm:text-lg leading-tight">{moment.title}</h3>
              
              {moment.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {moment.description}
                </p>
              )}
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{formatDate(moment.when_at)}</span>
                </div>
                
                {moment.place && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">
                      {moment.place.name}
                      {moment.place.address && `, ${moment.place.address}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span>
                      {moment.participant_count || 0}
                      {moment.max_participants && `/${moment.max_participants}`} partecipanti
                    </span>
                    {availableSpots !== null && (
                      <Badge variant={availableSpots > 0 ? "secondary" : "destructive"} className="text-xs w-fit">
                        {availableSpots > 0 ? `${availableSpots} posti disponibili` : 'Sold Out'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Euro className="h-4 w-4" />
                Prezzo del biglietto
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Prezzo finale</span>
                  <span>{formatPrice(ticketPrice, moment.currency)}</span>
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Come viene suddiviso il prezzo:</p>
                  <div className="flex justify-between">
                    <span>• All'organizzatore (95%)</span>
                    <span>{formatPrice(organizerRevenue, moment.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• A LiveMoment (5%)</span>
                    <span>{formatPrice(livemomentFee, moment.currency)}</span>
                  </div>
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
              <>
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3 text-sm">Devi effettuare l'accesso per acquistare un biglietto</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full sm:w-auto"
                  >
                    Accedi
                  </Button>
                </div>
                <AuthModal 
                  open={showAuthModal} 
                  onOpenChange={(open) => setShowAuthModal(open)} 
                />
                </>
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
                    Acquista per {formatPrice(ticketPrice, moment.currency)}
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