import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, MessageSquare, Check, Ticket, Users, MessageCircle, Shield, Star, Gift, Crown, MapPin, Palette, Clipboard, Camera, Calendar, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
const proFeatures = [{
  icon: <Check className="h-5 w-5" />,
  title: "Partecipa e Crea senza limiti",
  description: "Attualmente puoi creare solo 2 Momenti al mese e partecipare a massimo 3 Momenti.",
  bgColor: "bg-green-50 border border-green-200",
  iconColor: "text-green-600"
}, {
  icon: <Ticket className="h-5 w-5" />,
  title: "Momenti con Ticketing",
  description: "Attualmente non puoi vendere biglietti o ricevere contributi durante i tuoi Momenti.",
  bgColor: "bg-red-50 border border-red-200",
  iconColor: "text-red-600"
}, {
  icon: <Users className="h-5 w-5" />,
  title: "Crea Gruppi e Community",
  description: "Attualmente non puoi creare chat basate su interessi comuni, solo partecipare agli eventi.",
  bgColor: "bg-blue-50 border border-blue-200",
  iconColor: "text-blue-600"
}, {
  icon: <MessageCircle className="h-5 w-5" />,
  title: "Chatta Privatamente con Tutti",
  description: "Attualmente puoi scrivere solo alle persone a cui sei amico e a chi organizza Momenti.",
  bgColor: "bg-purple-50 border border-purple-200",
  iconColor: "text-purple-600"
}, {
  icon: <Star className="h-5 w-5" />,
  title: "Badge Live Moment",
  description: "Prima il tuo profilo non era verificato ne visibile fra i Top 15 Badge li permette di avere più amici.",
  bgColor: "bg-card border border-border shadow-card",
  iconColor: "text-primary"
}];
const businessFeatures = [{
  icon: <Calendar className="h-5 w-5" />,
  title: "Eventi, Eventi, Eventi.",
  description: "Prima dovevi aspettare che qualcuno li scrivesse. Ora puoi essere trovato da tutti.",
  bgColor: "bg-orange-50 border border-orange-200",
  iconColor: "text-orange-600"
}, {
  icon: <Crown className="h-5 w-5" />,
  title: "Collaborazioni Iper Semplici",
  description: "Ora ti arrivano richieste direttamente da chi vuole creare eventi da te.",
  bgColor: "bg-amber-50 border border-amber-200",
  iconColor: "text-amber-600"
}, {
  icon: <Shield className="h-5 w-5" />,
  title: "Visibilità Privilegiata",
  description: "Sali in cima alle ricerche, vieni suggerito nei momenti in creazione e ricevi più inviti.",
  bgColor: "bg-emerald-50 border border-emerald-200",
  iconColor: "text-emerald-600"
}, {
  icon: <Star className="h-5 w-5" />,
  title: "Tutti i benefici dell'Account Pro",
  description: "Accesso completo alle funzioni Pro: eventi illimitati, chat, gruppi, ticketing, badge.",
  bgColor: "bg-card border border-border shadow-card",
  iconColor: "text-primary"
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
  const [selectedPlan, setSelectedPlan] = useState<'1' | '3' | '12'>('3');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('location');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'pro' | 'business'>('pro');
  const pricingPlans = {
    '1': {
      months: '1',
      price: '9,99€',
      total: '9,99€',
      saving: ''
    },
    '3': {
      months: '3',
      price: '6,99€',
      total: '19,99€',
      saving: 'Risparmi 9,98€'
    },
    '12': {
      months: '12',
      price: '5,00€',
      total: '59,99€',
      saving: 'Risparmi 59,89€'
    }
  };
  const handleSubscribe = () => {
    if (!acceptedTerms) {
      alert('Accetta i termini e le condizioni di Live Moment');
      return;
    }

    // TODO: Implement Stripe checkout
    console.log(`Subscribing to ${activeTab} plan:`, selectedPlan);
  };
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · Upgrade Profilo</title>
        <meta name="description" content="Upgrade il tuo profilo LiveMoment con funzionalità premium" />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <img 
            src="/lovable-uploads/be87aac4-28ee-46dc-a364-a47e28f79fb5.png" 
            alt="LiveMoment Mascot" 
            className="h-10 w-10 hover-scale press-scale"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto pb-32">
        {/* Plan Toggle */}
        <div className="p-4">
          <div className="flex bg-muted rounded-full p-1 shadow-card">
            <button onClick={() => setActiveTab('pro')} className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-smooth ${activeTab === 'pro' ? 'gradient-brand text-foreground shadow-brand' : 'text-muted-foreground hover:text-foreground'}`}>
              Pro
            </button>
            <button onClick={() => setActiveTab('business')} className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-smooth ${activeTab === 'business' ? 'bg-card text-card-foreground shadow-elevated' : 'text-muted-foreground hover:text-foreground'}`}>
              Business
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 space-y-6">
          {activeTab === 'pro' ? <>
              {/* Pro Features */}
              <div className="space-y-4">
                {proFeatures.map((feature, index) => <div key={index} className={`flex gap-4 p-4 rounded-xl ${feature.bgColor} hover-scale transition-smooth`}>
                    <div className={`flex-shrink-0 ${feature.iconColor}`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 text-card-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>)}
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(pricingPlans).map(([key, plan]) => <button key={key} onClick={() => setSelectedPlan(key as '1' | '3' | '12')} className={`relative p-3 rounded-xl border-2 transition-smooth hover-scale ${selectedPlan === key ? 'border-primary bg-primary/5 shadow-brand' : 'border-border bg-card shadow-card hover:shadow-elevated'}`}>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${selectedPlan === key ? 'text-primary' : 'text-card-foreground'}`}>
                          {plan.months}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {plan.months === '1' ? 'Mese' : 'Mesi'}
                        </div>
                        <div className="text-xs font-semibold text-card-foreground">{plan.price}</div>
                        <div className="text-xs text-muted-foreground">{plan.total}</div>
                        {plan.saving && <div className="text-xs text-green-600 font-medium mt-1">{plan.saving}</div>}
                      </div>
                    </button>)}
                </div>
              </div>
            </> : <>
              {/* Business Features */}
              <div className="space-y-4">
                {businessFeatures.map((feature, index) => <div key={index} className={`flex gap-4 p-4 rounded-xl ${feature.bgColor} hover-scale transition-smooth`}>
                    <div className={`flex-shrink-0 ${feature.iconColor}`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 text-card-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>)}
              </div>

              {/* Account Types */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base text-card-foreground">Scegli il Profilo da Creare:</h3>
                <div className="space-y-3">
                  {accountTypes.map((account, index) => <button key={index} onClick={() => setSelectedBusinessType(account.title.toLowerCase().replace('account ', ''))} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-smooth hover-scale ${selectedBusinessType === account.title.toLowerCase().replace('account ', '') ? 'border-primary bg-primary/5 shadow-brand' : 'border-border bg-card shadow-card hover:shadow-elevated'}`}>
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {account.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-card-foreground">{account.title}</div>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-card-foreground">{account.price}</div>
                    </button>)}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  *I primi 2 mesi paghi 1€, puoi annullare quando vuoi.
                </p>
              </div>
            </>}

          {/* FAQ */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-card-foreground">Faq</h2>
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="why-subscribe" className="border border-border rounded-xl px-4 bg-card shadow-card">
                <AccordionTrigger className="text-sm font-medium text-card-foreground">Perché abbonarsi?</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-4">
                  L'abbonamento ti permette di accedere a tutte le funzionalità premium di Live Moment, 
                  inclusi eventi illimitati, chat private, gruppi e molto altro.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="what-means" className="border border-border rounded-xl px-4 bg-card shadow-card">
                <AccordionTrigger className="text-sm font-medium text-card-foreground">Cosa significa farlo?</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-4">
                  Abbonarsi significa sbloccare il pieno potenziale della piattaforma Live Moment 
                  e avere accesso prioritario a tutte le nuove funzionalità.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cancel-subscription" className="border border-border rounded-xl px-4 bg-card shadow-card">
                <AccordionTrigger className="text-sm font-medium text-card-foreground">Annullamento Abbonamento</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-4">
                  Puoi annullare il tuo abbonamento in qualsiasi momento dalle impostazioni del profilo. 
                  L'abbonamento rimarrà attivo fino alla scadenza del periodo pagato.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-ios-elevated p-4 max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={checked => setAcceptedTerms(checked as boolean)} className="mt-0.5" />
            <label htmlFor="terms" className="text-xs text-muted-foreground">
              Accetto i termini e le condizioni di Live Moment
            </label>
          </div>
          
          <Button 
            onClick={handleSubscribe} 
            className="w-full gradient-brand text-foreground py-4 rounded-xl font-semibold text-base shadow-brand hover-scale press-scale transition-smooth border-0" 
            disabled={!acceptedTerms}
          >
            {activeTab === 'pro' ? 'Abbonati a Live Moment' : 'Crea il tuo Account Premium'}
          </Button>
        </div>
      </div>
    </div>;
}