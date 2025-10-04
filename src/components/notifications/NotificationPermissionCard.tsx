import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function NotificationPermissionCard() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifiche non supportate",
        description: "Il tuo browser non supporta le notifiche push",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: "Notifiche attivate!",
          description: "Riceverai aggiornamenti importanti sui tuoi inviti e momenti"
        });
      } else if (result === 'denied') {
        toast({
          title: "Notifiche bloccate",
          description: "Puoi attivarle manualmente dalle impostazioni del browser",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile richiedere il permesso per le notifiche",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!('Notification' in window)) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">Attiva le Notifiche</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ricevi notifiche per nuovi inviti, messaggi e aggiornamenti dei tuoi momenti
          </p>

          {permission === 'default' && (
            <Button 
              onClick={requestPermission} 
              className="mt-3"
              disabled={isLoading}
            >
              {isLoading ? "Richiesta in corso..." : "Attiva Notifiche"}
            </Button>
          )}

          {permission === 'granted' && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 mt-3">
              <Check className="h-4 w-4" />
              <span>Notifiche attivate</span>
            </div>
          )}

          {permission === 'denied' && (
            <p className="text-sm text-muted-foreground mt-3">
              Le notifiche sono bloccate. Puoi attivarle dalle impostazioni del browser.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
