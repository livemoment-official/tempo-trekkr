import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Check, Ticket, Users, MessageCircle, Shield, Star, Gift, Crown, MapPin, Palette, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const proFeatures = [
  {
    icon: <Check className="h-4 w-4 text-green-600" />,
    title: "Partecipa e Crea senza limiti",
    description: "Attualmente puoi creare solo 2 Momenti al mese e partecipare a massimo 3 Momenti."
  },
  {
    icon: <Ticket className="h-4 w-4 text-red-500" />,
    title: "Momenti con Ticketing",
    description: "Attualmente non puoi vendere biglietti o ricevere contributi durante i tuoi Momenti."
  },
  {
    icon: <Users className="h-4 w-4 text-blue-500" />,
    title: "Crea Gruppi e Community",
    description: "Attualmente non puoi creare chat basate su interessi comuni, solo partecipare agli eventi."
  },
  {
    icon: <MessageCircle className="h-4 w-4 text-purple-500" />,
    title: "Chatta Privatamente con Tutti",
    description: "Attualmente puoi scrivere solo alle persone a cui sei amico e a chi organizza Momenti."
  },
  {
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    title: "Badge Live Moment",
    description: "Prima il tuo profilo non era verificato ne visibile fra i Top 15 Badge li permette di avere più amici."
  }
];

const businessFeatures = [
  {
    icon: <Gift className="h-4 w-4 text-orange-500" />,
    title: "Eventi, Eventi, Eventi.",
    description: "Prima dovevi aspettare che qualcuno li scrivesse. Ora puoi essere trovato da tutti."
  },
  {
    icon: <Crown className="h-4 w-4 text-yellow-600" />,
    title: "Collaborazioni Iper Semplici",
    description: "Ora ti arrivano richieste direttamente da chi vuole creare eventi da te."
  },
  {
    icon: <Shield className="h-4 w-4 text-red-600" />,
    title: "Visibilità Privilegiata",
    description: "Sali in cima alle ricerche, vieni suggerito nei momenti in creazione e ricevi più inviti."
  },
  {
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    title: "Tutti i benefici dell'Account Pro",
    description: "Accesso completo alle funzioni Pro: eventi illimitati, chat, gruppi, ticketing, badge."
  }
];

const accountTypes = [
  {
    title: "Account Location",
    icon: <MapPin className="h-8 w-8" />,
    price: "29,99€/mese"
  },
  {
    title: "Account Artisti",
    icon: <Palette className="h-8 w-8" />,
    price: "4,99€/mese"
  },
  {
    title: "Account Organizzatori",
    icon: <Clipboard className="h-8 w-8" />,
    price: "5,99€/mese"
  }
];

export default function Abbonamento() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'1' | '3' | '12'>('1');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeTab, setActiveTab] = useState('pro');

  const pricingPlans = {
    '1': { months: '1', price: '9,99€', originalPrice: '9,99€', discount: '' },
    '3': { months: '3', price: '19,99€', originalPrice: '29,97€', discount: '6,99€ di mese' },
    '12': { months: '12', price: '59,99€', originalPrice: '119,88€', discount: '5,00€ di mese' }
  };

  const handleSubscribe = (type: 'pro' | 'business') => {
    if (!acceptedTerms) {
      alert('Accetta i termini e le condizioni di Live Moment');
      return;
    }
    
    // TODO: Implement Stripe checkout
    console.log(`Subscribing to ${type} plan:`, selectedPlan);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>LiveMoment · Upgrade Profilo</title>
        <meta name="description" content="Upgrade il tuo profilo LiveMoment con funzionalità premium" />
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="font-serif text-lg font-bold">Live Moment</div>
          <div className="w-8 h-8" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Plan Toggle */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-full p-1">
            <TabsTrigger 
              value="pro" 
              className="rounded-full data-[state=active]:bg-orange-400 data-[state=active]:text-white"
            >
              Pro
            </TabsTrigger>
            <TabsTrigger 
              value="business"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Business
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pro" className="space-y-6 mt-6">
            {/* Pro Features */}
            <div className="space-y-4">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex gap-3 p-4 bg-cream-50 rounded-xl">
                  <div className="flex-shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(pricingPlans).map(([key, plan]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key as '1' | '3' | '12')}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPlan === key 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${selectedPlan === key ? 'text-orange-600' : ''}`}>
                        {plan.months}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {plan.months === '1' ? 'Mese' : 'Mesi'}
                      </div>
                      <div className="text-sm font-semibold mt-2">{plan.price}</div>
                      {plan.discount && (
                        <div className="text-xs text-muted-foreground">{plan.discount}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms-pro"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="terms-pro" className="text-xs text-muted-foreground">
                Accetto i termini e le condizioni di Live Moment
              </label>
            </div>

            {/* Subscribe Button */}
            <Button 
              onClick={() => handleSubscribe('pro')}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white py-6 rounded-xl font-medium"
              disabled={!acceptedTerms}
            >
              Abbonati a Live Moment
            </Button>
          </TabsContent>

          <TabsContent value="business" className="space-y-6 mt-6">
            {/* Business Features */}
            <div className="space-y-4">
              {businessFeatures.map((feature, index) => (
                <div key={index} className="flex gap-3 p-4 bg-cream-50 rounded-xl">
                  <div className="flex-shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Account Types */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Scegli il Profilo da Creare:</h3>
              {accountTypes.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-orange-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-orange-600">
                      {account.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{account.title}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-sm">{account.price}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              *I primi 2 mesi paghi 1€, puoi annullare quando vuoi.
            </p>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms-business"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="terms-business" className="text-xs text-muted-foreground">
                Accetto i termini e le condizioni di Live Moment
              </label>
            </div>

            {/* Subscribe Button */}
            <Button 
              onClick={() => handleSubscribe('business')}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white py-6 rounded-xl font-medium"
              disabled={!acceptedTerms}
            >
              Crea il tuo Account Premium
            </Button>
          </TabsContent>
        </Tabs>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Faq</h2>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="why-subscribe" className="border rounded-xl px-4">
              <AccordionTrigger className="text-sm">Perché abbonarsi?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                L'abbonamento ti permette di accedere a tutte le funzionalità premium di Live Moment, 
                inclusi eventi illimitati, chat private, gruppi e molto altro.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="what-means" className="border rounded-xl px-4">
              <AccordionTrigger className="text-sm">Cosa significa farlo?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Abbonarsi significa sbloccare il pieno potenziale della piattaforma Live Moment 
                e avere accesso prioritario a tutte le nuove funzionalità.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="cancel-subscription" className="border rounded-xl px-4">
              <AccordionTrigger className="text-sm">Annullamento Abbonamento</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Puoi annullare il tuo abbonamento in qualsiasi momento dalle impostazioni del profilo. 
                L'abbonamento rimarrà attivo fino alla scadenza del periodo pagato.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}