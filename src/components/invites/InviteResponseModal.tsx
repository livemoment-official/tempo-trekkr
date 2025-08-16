import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Invite } from "@/hooks/useInvites";

interface InviteResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invite: Invite;
  responseType: 'accepted' | 'rejected' | 'postponed';
  onConfirm: (message?: string) => void;
}

export default function InviteResponseModal({ 
  open, 
  onOpenChange, 
  invite,
  responseType,
  onConfirm 
}: InviteResponseModalProps) {
  const [message, setMessage] = useState("");

  const getTitle = () => {
    switch (responseType) {
      case 'accepted': return `Accetta invito: ${invite.title}`;
      case 'rejected': return `Rifiuta invito: ${invite.title}`;
      case 'postponed': return `Rimanda invito: ${invite.title}`;
    }
  };

  const getDescription = () => {
    switch (responseType) {
      case 'accepted': return "Vuoi aggiungere un messaggio per confermare la tua partecipazione?";
      case 'rejected': return "Vuoi spiegare perché non puoi partecipare?";
      case 'postponed': return "Vuoi proporre una data alternativa o lasciare un messaggio?";
    }
  };

  const getPlaceholder = () => {
    switch (responseType) {
      case 'accepted': return "Es: Perfetto! Ci vediamo lì 😊";
      case 'rejected': return "Es: Mi dispiace, ho già un impegno...";
      case 'postponed': return "Es: Che ne dici di domani alla stessa ora?";
    }
  };

  const getButtonText = () => {
    switch (responseType) {
      case 'accepted': return "Conferma Partecipazione";
      case 'rejected': return "Rifiuta Invito";
      case 'postponed': return "Proponi Rimando";
    }
  };

  const getButtonVariant = () => {
    switch (responseType) {
      case 'accepted': return "default" as const;
      case 'rejected': return "destructive" as const;
      case 'postponed': return "secondary" as const;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(message.trim() || undefined);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">{getDescription()}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={getPlaceholder()}
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant={getButtonVariant()}
              className="flex-1"
            >
              {getButtonText()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}