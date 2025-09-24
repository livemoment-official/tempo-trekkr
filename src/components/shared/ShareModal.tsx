import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  contentType: 'moment' | 'event' | 'group';
  contentId: string;
  title: string;
  children?: React.ReactNode;
}

export function ShareModal({ contentType, contentId, title, children }: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const getUrlPath = () => {
    switch (contentType) {
      case 'moment': return 'moment';
      case 'event': return 'evento';
      case 'group': return 'chat/group';
      default: return 'moment';
    }
  };
  
  const shareUrl = `${window.location.origin}/${getUrlPath()}/${contentId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copiato!",
        description: "Il link è stato copiato negli appunti"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Non è stato possibile copiare il link",
        variant: "destructive"
      });
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        const getContentTypeLabel = () => {
          switch (contentType) {
            case 'moment': return 'momento';
            case 'event': return 'evento';
            case 'group': return 'gruppo';
            default: return 'contenuto';
          }
        };

        await navigator.share({
          title: title,
          text: `Guarda questo ${getContentTypeLabel()}: ${title}`,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Condividi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Condividi {contentType === 'moment' ? 'Momento' : contentType === 'event' ? 'Evento' : 'Gruppo'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="share-url" className="text-sm font-medium">
              Link da condividere
            </Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleWebShare} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Condividi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}