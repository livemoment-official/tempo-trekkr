import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Crown } from "lucide-react";

interface SubscriptionLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: "messages" | "events" | "moments" | "generic";
  currentCount?: number;
  maxCount?: number;
}

export default function SubscriptionLimitModal({
  open,
  onOpenChange,
  limitType = "generic",
  currentCount,
  maxCount
}: SubscriptionLimitModalProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [open]);

  const limitMessages = {
    messages: {
      emoji: "💬",
      title: "Limite Messaggi Raggiunto",
      description: `Hai raggiunto il limite di ${maxCount} messaggi. Passa a Pro per messaggi illimitati!`,
    },
    events: {
      emoji: "🎉",
      title: "Limite Eventi Raggiunto",
      description: `Hai creato ${currentCount}/${maxCount} eventi. Sblocca eventi illimitati con Pro!`,
    },
    moments: {
      emoji: "📸",
      title: "Limite Momenti Raggiunto",
      description: `Hai condiviso ${currentCount}/${maxCount} momenti. Continua a creare con Pro!`,
    },
    generic: {
      emoji: "✨",
      title: "Passa a Pro!",
      description: "Sblocca tutte le funzionalità premium e goditi LiveMoment senza limiti.",
    },
  };

  const content = limitMessages[limitType];

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/abbonamento");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden border-0 bg-gradient-to-br from-background via-background to-primary/5 p-0">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-orange-400 to-primary animate-gradient-shift opacity-75 blur-sm" />
        
        <div className="relative bg-background/95 backdrop-blur-xl rounded-lg p-6 m-[2px]">
          {/* Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          )}

          <DialogHeader className="space-y-4 text-center">
            {/* Large emoji with pulse */}
            <div className="flex justify-center">
              <div className="text-7xl animate-bounce-slow">
                {content.emoji}
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
              {content.title}
            </DialogTitle>
            
            <DialogDescription className="text-base text-muted-foreground">
              {content.description}
            </DialogDescription>
          </DialogHeader>

          {/* Features preview */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Funzionalità illimitate</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all">
              <div className="p-2 rounded-full bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Supporto prioritario</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all">
              <div className="p-2 rounded-full bg-primary/10">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Badge esclusivo PRO</span>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 border-2 border-background" />
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  +2.4k utenti Pro
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-primary">4.9</span>
                <span className="text-xs text-muted-foreground">★★★★★</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-orange-400 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Crown className="h-5 w-5 mr-2" />
              Sblocca Tutto con Pro
            </Button>
            
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Continua gratis
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Cancella quando vuoi • 💳 Garanzia 30 giorni
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
