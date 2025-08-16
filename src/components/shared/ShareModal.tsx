import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  contentType: 'moment' | 'event';
  contentId: string;
  title: string;
  children?: React.ReactNode;
}

export function ShareModal({ contentType, contentId, title, children }: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/${contentType === 'moment' ? 'momenti' : 'eventi'}/${contentId}`;

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
        await navigator.share({
          title: title,
          text: `Guarda questo ${contentType === 'moment' ? 'momento' : 'evento'}: ${title}`,
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
          <DialogTitle>Condividi {contentType === 'moment' ? 'Momento' : 'Evento'}</DialogTitle>
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