import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, PartyPopper, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParticipationConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  momentTitle: string;
  momentId: string;
}

export const ParticipationConfirmModal = ({ 
  open, 
  onOpenChange, 
  momentTitle, 
  momentId 
}: ParticipationConfirmModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEnterChat = () => {
    onOpenChange(false);
    navigate(`/chat/moment/${momentId}`);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${momentTitle} - LiveMoment`,
          text: 'Unisciti a me per questo momento speciale!',
          url: window.location.href
        });
      } else {
        // Fallback per browser senza API share nativa
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiato!",
          description: "Il link è stato copiato negli appunti"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="text-center space-y-6 py-4">
          {/* Celebratory illustration */}
          <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <PartyPopper className="h-10 w-10 text-white" />
            <div className="absolute -top-2 -right-2 animate-pulse">
              <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
            </div>
            <div className="absolute -bottom-1 -left-2 animate-bounce">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-green-800">
              Sei ufficialmente dei nostri! 🎉
            </h2>
            <p className="text-green-700 text-sm leading-relaxed">
              Fantastico! Hai confermato la tua partecipazione a{" "}
              <span className="font-semibold">"{momentTitle}"</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleEnterChat}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Entra in chat
            </Button>
            
            <Button 
              onClick={handleShare}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50"
              size="lg"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Condividi
            </Button>
          </div>

          {/* Additional info */}
          <p className="text-xs text-green-600 px-4">
            Riceverai una notifica con tutti i dettagli prima dell'evento
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};