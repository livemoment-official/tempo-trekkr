import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Ticket, Users, MessageCircle, Shield, Star, Crown, MapPin, Palette, Clipboard, Calendar, Loader2, TrendingUp, PiggyBank } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StandardHeader from "@/components/layout/StandardHeader";
import { MessageCircleMore } from "lucide-react";
const proFeatures = [{
  icon: "✨",
  title: "Partecipa e Crea senza limiti",
  description: "Crea e partecipa a eventi illimitati ogni mese. Attualmente: 5 al mese."
}, {
  icon: "🎫",
  title: "Momenti con Ticketing",
  description: "Vendi biglietti e ricevi contributi nei tuoi eventi. Attualmente: non disponibile."
}, {
  icon: "👥",
  title: "Crea Gruppi e Community",
  description: "Crea chat di gruppo basate su interessi comuni. Attualmente: solo partecipazione."
}, {
  icon: "💬",
  title: "Chatta con Tutti",
  description: "Invia messaggi privati a qualsiasi utente della piattaforma. Attualmente: solo amici."
}, {
  icon: "⭐",
  title: "Badge Live Moment",
  description: "Profilo verificato e visibilità nei Top 15. Attualmente: non verificato."
}];
const businessFeatures = [{
  icon: "📅",
  title: "Ospita Eventi",
  description: "Diventa visibile e ricevi richieste di collaborazione. Attualmente: non disponibile."
}, {
  icon: "👑",
  title: "Collaborazioni Dirette",
  description: "Ricevi richieste di eventi direttamente nel tuo profilo. Attualmente: limitato."
}, {
  icon: "🛡️",
  title: "Visibilità Privilegiata",
  description: "Appari in cima alle ricerche e ricevi più inviti. Attualmente: posizione standard."
}, {
  icon: "⭐",
  title: "Tutti i Benefici Pro",
  description: "Eventi illimitati, chat, gruppi, ticketing e badge. Attualmente: limitato."
}];
const accountTypes = [{
  title: "Account Location",
  icon: <MapPin className="h-6 w-6" />,
  price: "29,99€/mese"
}, {
  title: "Account Artisti",
  icon: <Palette className="h-6 w-6" />,
  price: "4,99€/mese"
}, {
  title: "Account Organizzatori",
  icon: <Clipboard className="h-6 w-6" />,
  price: "5,99€/mese"
}];
export default function Abbonamento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<'1' | '3' | '6'>('3');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('location');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'pro' | 'business'>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  const {
    session,
    subscribed,
    subscriptionTier,
    checkSubscription
  } = useAuth();

  // Handle payment result from Stripe redirect
  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1
          };
        } else if (prev.minutes > 0) {
          return {
            hours: prev.hours,
            minutes: prev.minutes - 1,
            seconds: 59
          };
        } else if (prev.hours > 0) {
          return {
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59
          };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true') {
      toast.success("Pagamento completato con successo!", {
        description: "Il tuo abbonamento è stato attivato."
      });
      // Remove query params from URL
      window.history.replaceState({}, '', '/abbonamento');
      // Refresh subscription status
      checkSubscription();
    } else if (canceled === 'true') {
      toast.error("Pagamento annullato", {
        description: "Puoi riprovare quando vuoi."
      });
      // Remove query params from URL
      window.history.replaceState({}, '', '/abbonamento');
    }
  }, [searchParams, checkSubscription]);
  const pricingPlans = {
    '1': {
      months: '1',
      price: '4,99€',
      total: '4,99€',
      saving: ''
    },
    '3': {
      months: '3',
      price: '3,33€',
      total: '9,99€',
      saving: 'Risparmi 5,00€'
    },
    '6': {
      months: '6',
      price: '3,33€',
      total: '19,99€',
      saving: 'Risparmi 10,00€'
    }
  };
  const handleSubscribe = async () => {
    if (!acceptedTerms) {
      toast.error("Devi accettare i termini e condizioni per continuare");
      return;
    }
    if (!session) {
      toast.error("Devi essere autenticato per abbonarti");
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: activeTab,
          duration: selectedPlan
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) {
        console.error('Checkout error:', error);
        toast.error("Errore durante la creazione del checkout");
        return;
      }

      // Redirect to Stripe checkout in the same tab for better UX
      if (data?.url) {
        window.location.href = data.url;
        toast.success("Reindirizzamento al pagamento...");
      }
    } catch (error) {
      console.error('Exception during checkout:', error);
      toast.error("Errore durante il processo di pagamento");
    } finally {
      setIsLoading(false);
    }
  };
  const handleManageSubscription = async () => {
    if (!session) {
      toast.error("Devi essere autenticato per gestire l'abbonamento");
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) {
        console.error('Customer portal error:', error);
        toast.error("Errore durante l'apertura del portale cliente");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        toast.success("Apertura portale gestione abbonamento...");
      }
    } catch (error) {
      console.error('Exception during customer portal:', error);
      toast.error("Errore durante l'apertura del portale");
    } finally {
      setIsLoading(false);
    }
  };
  const handleBack = () => {
    navigate('/profilo');
  };
  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Helmet>
        <title>LiveMoment · Passa a Pro</title>
        <meta name="description" content="Sblocca tutte le funzionalità premium di LiveMoment" />
      </Helmet>

      <StandardHeader 
        title="Abbonamento" 
        onBack={handleBack}
        rightActions={
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => window.open('https://wa.me/393334567890', '_blank')}
          >
            <MessageCircleMore className="h-5 w-5" />
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-3 md:py-4 pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-[calc(80px+env(safe-area-inset-bottom))] max-w-2xl">
        {/* Plan Toggle */}
        <div className="p-1 bg-muted/30 rounded-full mb-4 flex border border-border/50">
          <button 
            onClick={() => setActiveTab('pro')} 
            className={`flex-1 py-2.5 px-5 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'pro' 
                ? 'bg-primary text-white shadow-md ring-2 ring-black' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="h-4 w-4" />
            <span>Pro</span>
          </button>
          <button 
            onClick={() => setActiveTab('business')} 
            className={`flex-1 py-2.5 px-5 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'business' 
                ? 'bg-primary text-white shadow-md ring-2 ring-black' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Business</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 md:space-y-4">
          {activeTab === 'pro' ? <>
              {/* Pro Features */}
              <div className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <Card key={index} className="border-0 bg-orange-50/40 hover:bg-orange-50/60 transition-all duration-200">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex-shrink-0 text-2xl">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.description.split('Attualmente')[0]}
                          <strong>Attualmente</strong>{feature.description.split('Attualmente')[1]}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(pricingPlans).map(([key, plan]) => (
                    <button 
                      key={key} 
                      onClick={() => setSelectedPlan(key as '1' | '3' | '6')} 
                      className={`relative p-4 rounded-3xl border-2 transition-all duration-200 ${
                        selectedPlan === key 
                          ? 'border-primary bg-primary text-white shadow-xl shadow-primary/30' 
                          : 'border-border bg-muted/30 hover:border-primary/50'
                      }`}
                    >
                      {key === '1' && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap ring-1 ring-black">
                          ⭐ Popolare
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className={`text-5xl font-bold mb-1 ${
                          selectedPlan === key ? 'text-white' : 'text-foreground'
                        }`}>
                          {plan.months}
                        </div>
                        <div className={`text-xs ${
                          selectedPlan === key ? 'text-white/80' : 'text-muted-foreground'
                        }`}>
                          {plan.months === '1' ? 'mese' : 'mesi'}
                        </div>
                        
                        {plan.saving && (
                          <div className={`mt-2 text-[10px] font-medium ${
                            selectedPlan === key ? 'text-white' : 'text-green-600'
                          }`}>
                            Risparmio
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <Card className="border-0 bg-orange-50/40">
                  <CardContent className="p-5">
                    <div className="text-center space-y-2">
                      <div>
                        <span className="text-4xl font-bold text-foreground">
                          {pricingPlans[selectedPlan].price}
                        </span>
                        <span className="text-muted-foreground text-sm">/mese</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Fatturato ogni {pricingPlans[selectedPlan].months} {pricingPlans[selectedPlan].months === '1' ? 'mese' : 'mesi'}: <span className="font-bold text-foreground">{pricingPlans[selectedPlan].total}</span>
                      </div>
                      {pricingPlans[selectedPlan].saving && (
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full">
                          <PiggyBank className="h-4 w-4" />
                          {pricingPlans[selectedPlan].saving}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </> : <>
              {/* Business Features */}
              <div className="space-y-3">
                {businessFeatures.map((feature, index) => (
                  <Card key={index} className="border-0 bg-orange-50/40 hover:bg-orange-50/60 transition-all duration-200">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex-shrink-0 text-2xl">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {feature.description.split('Attualmente')[0]}
                          <strong>Attualmente</strong>{feature.description.split('Attualmente')[1]}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Account Types */}
              <div className="space-y-2.5">
                <h3 className="font-semibold text-sm">Scegli il Profilo da Creare:</h3>
                <div className="space-y-2">
                  {accountTypes.map((account, index) => <button key={index} onClick={() => setSelectedBusinessType(account.title.toLowerCase().replace('account ', ''))} className={`w-full flex items-center justify-between p-2.5 md:p-3 rounded-xl border-2 transition-all ${selectedBusinessType === account.title.toLowerCase().replace('account ', '') ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-orange-50'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="text-orange-600">
                          {account.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-xs text-gray-900">{account.title}</div>
                        </div>
                      </div>
                      <div className="font-bold text-xs text-gray-900">{account.price}</div>
                    </button>)}
                </div>
                <p className="text-[10px] text-gray-500 text-center">
                  *I primi 2 mesi paghi 1€, puoi annullare quando vuoi.
                </p>
              </div>
            </>}

          {/* FAQ */}
          <div className="space-y-2.5">
            <h2 className="font-bold text-sm">Faq</h2>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="why-subscribe" className="border border-gray-200 rounded-xl px-3">
                <AccordionTrigger className="text-xs font-medium py-3">Perché abbonarsi?</AccordionTrigger>
                <AccordionContent className="text-[11px] text-gray-600 pb-3">
                  Accedi a eventi illimitati, chat private, gruppi e molto altro.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="what-means" className="border border-gray-200 rounded-xl px-3">
                <AccordionTrigger className="text-xs font-medium py-3">Cosa significa farlo?</AccordionTrigger>
                <AccordionContent className="text-[11px] text-gray-600 pb-3">
                  Sblocca il pieno potenziale della piattaforma e accesso prioritario alle novità.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cancel-subscription" className="border border-gray-200 rounded-xl px-3">
                <AccordionTrigger className="text-xs font-medium py-3">Annullamento Abbonamento</AccordionTrigger>
                <AccordionContent className="text-[11px] text-gray-600 pb-3">
                  Cancella quando vuoi. L'abbonamento resta attivo fino alla scadenza del periodo pagato.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 z-40">
        <div className="container mx-auto max-w-2xl space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms} 
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} 
              className="border-primary data-[state=checked]:bg-primary" 
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              Accetto i{' '}
              <a href="#" className="text-primary underline hover:text-orange-400 transition-colors">
                termini e condizioni
              </a>
            </label>
          </div>

          <AuthGuard title="Accesso Richiesto" description="Devi essere autenticato per abbonarti">
            {subscribed ? <div className="space-y-1.5">
                <div className="text-center py-1.5 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-700 dark:text-green-300 font-medium">
                    <Check className="h-3.5 w-3.5" />
                    <span>Abbonamento attivo: {subscriptionTier}</span>
                  </div>
                </div>
                <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-muted to-muted hover:from-muted/80 hover:to-muted/80">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Caricamento...</> : "Gestisci Abbonamento"}
                </Button>
              </div> : <Button onClick={handleSubscribe} disabled={!acceptedTerms || isLoading} className="group w-full h-11 text-sm font-semibold bg-gradient-to-r from-primary via-orange-400 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] disabled:bg-muted disabled:text-muted-foreground transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]">
                {isLoading ? <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Caricamento...
                  </span> : <span className="flex items-center gap-1.5">
                    {activeTab === 'pro' ? 'Sblocca Pro Ora' : 'Crea Account Premium'}
                  </span>}
              </Button>}
          </AuthGuard>
          
          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground flex-wrap">
            <span>🔒 Sicuro</span>
            <span>•</span>
            <span>💳 Cancella quando vuoi</span>
            <span>•</span>
            <span>✨ Attivazione immediata</span>
          </div>
        </div>
      </div>
    </div>;
}