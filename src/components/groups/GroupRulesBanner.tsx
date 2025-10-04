import { useState, useEffect } from "react";
import { Users, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

interface GroupRulesBannerProps {
  onDismiss?: () => void;
}

export function GroupRulesBanner({ onDismiss }: GroupRulesBannerProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("groupRulesBannerExpanded");
    return saved ? JSON.parse(saved) : true;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.setItem("groupRulesBannerExpanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  const handleCreateGroup = () => {
    if (isAuthenticated) {
      navigate("/crea-gruppo");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground text-base">
                Come Funzionano i Gruppi di Live Moment
              </h3>
              <p className="text-xs text-muted-foreground">
                {isExpanded ? "Clicca per comprimere" : "Clicca per espandere"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-4 pb-4 animate-fade-in">
            <div className="space-y-3 mb-4">
              <div className="flex gap-3 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Crea gruppi pubblici o privati</strong> per organizzare eventi, condividere momenti e chattare con la tua community.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Invita amici o lascia che tutti scoprano</strong> il tuo gruppo nella sezione "Esplora" se è pubblico.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Chatta in tempo reale</strong> con i membri del gruppo, condividi foto, video e vocali.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Organizza momenti collettivi</strong> direttamente dal gruppo e coordina le attività con i partecipanti.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">5</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Gestisci i partecipanti</strong>: come host, puoi moderare il gruppo e rimuovere utenti se necessario.
                </p>
              </div>
            </div>

            <Button
              onClick={handleCreateGroup}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crea il Tuo Gruppo
            </Button>
          </div>
        )}
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Accedi per creare un gruppo"
        description="Devi effettuare il login per poter creare un gruppo"
      />
    </>
  );
}
