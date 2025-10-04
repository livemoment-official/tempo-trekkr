import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Ticket, Users, MessageCircle, Shield, Star, Crown, MapPin, Palette, Clipboard, Calendar, Loader2, Sparkles, Zap, TrendingUp, PiggyBank } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StandardHeader from "@/components/layout/StandardHeader";
const proFeatures = [{
  icon: <Check className="h-5 w-5" />,
  title: "Partecipa e Crea senza limiti",
  description: "Attualmente puoi creare solo 2 Momenti al mese e partecipare a massimo 3 Momenti."
}, {
  icon: <Ticket className="h-5 w-5" />,
  title: "Momenti con Ticketing",
  description: "Attualmente non puoi vendere biglietti o ricevere contributi durante i tuoi Momenti."
}, {
  icon: <Users className="h-5 w-5" />,
  title: "Crea Gruppi e Community",
  description: "Attualmente non puoi creare chat basate su interessi comuni, solo partecipare agli eventi."
}, {
  icon: <MessageCircle className="h-5 w-5" />,
  title: "Chatta Privatamente con Tutti",
  description: "Attualmente puoi scrivere solo alle persone a cui sei amico e a chi organizza Momenti."
}, {
  icon: <Star className="h-5 w-5" />,
  title: "Badge Live Moment",
  description: "Prima il tuo profilo non era verificato ne visibile fra i Top 15 Badge li permette di avere più amici."
}];
const businessFeatures = [{
  icon: <Calendar className="h-5 w-5" />,
  title: "Eventi, Eventi, Eventi.",
  description: "Prima dovevi aspettare che qualcuno li scrivesse. Ora puoi essere trovato da tutti.",
  bgColor: "bg-orange-100",
  iconColor: "text-orange-600"
}, {
  icon: <Crown className="h-5 w-5" />,
  title: "Collaborazioni Iper Semplici",
  description: "Ora ti arrivano richieste direttamente da chi vuole creare eventi da te.",
  bgColor: "bg-amber-100",
  iconColor: "text-amber-600"
}, {
  icon: <Shield className="h-5 w-5" />,
  title: "Visibilità Privilegiata",
  description: "Sali in cima alle ricerche, vieni suggerito nei momenti in creazione e ricevi più inviti.",
  bgColor: "bg-emerald-100",
  iconColor: "text-emerald-600"
}, {
  icon: <Star className="h-5 w-5" />,
  title: "Tutti i benefici dell'Account Pro",
  description: "Accesso completo alle funzioni Pro: eventi illimitati, chat, gruppi, ticketing, badge.",
  bgColor: "bg-yellow-100",
  iconColor: "text-yellow-600"
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
    if (document.referrer && document.referrer.includes(window.location.host)) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Helmet>
        <title>LiveMoment · Passa a Pro</title>
        <meta name="description" content="Sblocca tutte le funzionalità premium di LiveMoment" />
      </Helmet>

      {/* Enhanced Header */}
      

      {/* Scarcity Timer */}
      

      <div className="container mx-auto px-4 py-4 md:py-6 pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-[calc(80px+env(safe-area-inset-bottom))] max-w-2xl">
        {/* Enhanced Plan Toggle */}
        <div className="p-0.5 bg-muted/50 backdrop-blur-sm rounded-full mb-3 md:mb-6 flex">
          <button onClick={() => setActiveTab('pro')} className={`flex-1 py-2 px-4 md:py-3 md:px-6 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'pro' ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg scale-105' : 'text-muted-foreground hover:text-foreground'}`}>
            <Crown className="h-4 w-4" />
            <span>Pro</span>
          </button>
          <button onClick={() => setActiveTab('business')} className={`flex-1 py-2 px-4 md:py-3 md:px-6 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'business' ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg scale-105' : 'text-muted-foreground hover:text-foreground'}`}>
            <TrendingUp className="h-4 w-4" />
            <span>Business</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 md:space-y-6">
          {activeTab === 'pro' ? <>
              {/* Enhanced Pro Features */}
              <div className="space-y-2 md:space-y-3">
                {proFeatures.map((feature, index) => <Card key={index} className="border border-border bg-card hover:border-primary/20 transition-all duration-200">
                    <CardContent className="flex items-start gap-3 p-3 md:gap-4 md:p-4">
                      <div className="flex-shrink-0 text-primary">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>

              {/* Enhanced Pricing */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {Object.entries(pricingPlans).map(([key, plan]) => <button key={key} onClick={() => setSelectedPlan(key as '1' | '3' | '6')} className={`relative p-3 md:p-4 rounded-xl border-2 transition-all duration-300 ${selectedPlan === key ? 'border-primary bg-gradient-to-br from-primary/10 to-orange-400/10 shadow-lg shadow-primary/20 scale-105' : 'border-border bg-card hover:border-primary/50 hover:shadow-md'} ${key === '3' ? 'animate-pulse-slow' : ''}`}>
                      {key === '3' && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                          ⭐ Più Popolare
                        </div>}
                      
                      <div className="text-center">
                        <div className={`text-2xl md:text-3xl font-bold mb-1 ${selectedPlan === key ? 'text-primary' : 'text-foreground'}`}>
                          {plan.months}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {plan.months === '1' ? 'mese' : 'mesi'}
                        </div>
                        
                        {plan.saving && <div className="mt-2 flex items-center justify-center gap-1 text-green-600">
                            <PiggyBank className="h-3 w-3" />
                            <span className="text-xs font-medium">Risparmi</span>
                          </div>}
                      </div>
                    </button>)}
                </div>

                <Card className={`border-2 transition-all duration-300 ${selectedPlan ? 'border-primary bg-gradient-to-br from-primary/5 via-background to-orange-400/5 shadow-xl' : 'border-border'}`}>
                  <CardContent className="p-4 md:p-6">
                    <div className="text-center space-y-2 md:space-y-3">
                      <div>
                        <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                          {pricingPlans[selectedPlan].price}
                        </span>
                        <span className="text-muted-foreground text-base md:text-lg">/mese</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Fatturato ogni {pricingPlans[selectedPlan].months} {pricingPlans[selectedPlan].months === '1' ? 'mese' : 'mesi'}: <span className="font-bold text-foreground">{pricingPlans[selectedPlan].total}</span>
                      </div>
                      {pricingPlans[selectedPlan].saving && <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full">
                          <PiggyBank className="h-4 w-4" />
                          {pricingPlans[selectedPlan].saving}
                        </div>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </> : <>
              {/* Business Features */}
              <div className="space-y-2 md:space-y-3">
                {businessFeatures.map((feature, index) => <Card key={index} className={`border border-border ${feature.bgColor}`}>
                    <CardContent className="flex items-start gap-3 p-3 md:gap-4 md:p-4">
                      <div className={`flex-shrink-0 ${feature.iconColor}`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>

              {/* Account Types */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Scegli il Profilo da Creare:</h3>
                <div className="space-y-2 md:space-y-3">
                  {accountTypes.map((account, index) => <button key={index} onClick={() => setSelectedBusinessType(account.title.toLowerCase().replace('account ', ''))} className={`w-full flex items-center justify-between p-3 md:p-4 rounded-xl border-2 transition-all ${selectedBusinessType === account.title.toLowerCase().replace('account ', '') ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-orange-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="text-orange-600">
                          {account.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-gray-900">{account.title}</div>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-gray-900">{account.price}</div>
                    </button>)}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  *I primi 2 mesi paghi 1€, puoi annullare quando vuoi.
                </p>
              </div>
            </>}

          {/* FAQ */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Faq</h2>
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="why-subscribe" className="border border-gray-200 rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium">Perché abbonarsi?</AccordionTrigger>
                <AccordionContent className="text-xs text-gray-600 pb-4">
                  L'abbonamento ti permette di accedere a tutte le funzionalità premium di Live Moment, 
                  inclusi eventi illimitati, chat private, gruppi e molto altro.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="what-means" className="border border-gray-200 rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium">Cosa significa farlo?</AccordionTrigger>
                <AccordionContent className="text-xs text-gray-600 pb-4">
                  Abbonarsi significa sbloccare il pieno potenziale della piattaforma Live Moment 
                  e avere accesso prioritario a tutte le nuove funzionalità.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cancel-subscription" className="border border-gray-200 rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium">Annullamento Abbonamento</AccordionTrigger>
                <AccordionContent className="text-xs text-gray-600 pb-4">
                  Puoi annullare il tuo abbonamento in qualsiasi momento dalle impostazioni del profilo. 
                  L'abbonamento rimarrà attivo fino alla scadenza del periodo pagato.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Enhanced Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t shadow-2xl p-4 z-40">
        <div className="container mx-auto max-w-2xl space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={checked => setAcceptedTerms(checked as boolean)} className="border-primary data-[state=checked]:bg-primary" />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              Accetto i{' '}
              <a href="#" className="text-primary underline hover:text-orange-400 transition-colors">
                termini e condizioni
              </a>
            </label>
          </div>

          <AuthGuard title="Accesso Richiesto" description="Devi essere autenticato per abbonarti">
            {subscribed ? <div className="space-y-2">
                <div className="text-center py-2 px-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-300 font-medium">
                    <Check className="h-4 w-4" />
                    <span>Abbonamento attivo: {subscriptionTier}</span>
                  </div>
                </div>
                <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-muted to-muted hover:from-muted/80 hover:to-muted/80">
                  {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Caricamento...</> : "Gestisci Abbonamento"}
                </Button>
              </div> : <Button onClick={handleSubscribe} disabled={!acceptedTerms || isLoading} className="group w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-orange-400 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] disabled:bg-muted disabled:text-muted-foreground transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]">
                {isLoading ? <span className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Caricamento...
                  </span> : <span className="flex items-center gap-2">
                    {activeTab === 'pro' ? 'Sblocca Pro Ora' : 'Crea Account Premium'}
                    <Sparkles className="h-5 w-5 group-hover:-rotate-12 transition-transform" />
                  </span>}
              </Button>}
          </AuthGuard>
          
          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>🔒 Pagamento sicuro</span>
            <span>•</span>
            <span>💳 Cancella quando vuoi</span>
            <span>•</span>
            <span>✨ Attiva subito</span>
          </div>
        </div>
      </div>
    </div>;
}