import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MessageCircle, Users, UserCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ChatPermission = "everyone" | "followers_only" | "friends_only" | "none";

interface ChatPermissionSettingsProps {
  currentPermission: string;
  onUpdate: (newPermission: string) => void;
  onClose: () => void;
}

export const ChatPermissionSettings = ({ 
  currentPermission, 
  onUpdate, 
  onClose 
}: ChatPermissionSettingsProps) => {
  const [selectedPermission, setSelectedPermission] = useState<ChatPermission>(currentPermission as ChatPermission);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const permissionOptions = [
    {
      value: "everyone",
      label: "Tutti",
      description: "Chiunque può scriverti",
      icon: MessageCircle
    },
    {
      value: "followers_only",
      label: "Solo chi mi segue",
      description: "Solo i tuoi follower possono scriverti",
      icon: UserCheck
    },
    {
      value: "friends_only",
      label: "Solo amici",
      description: "Solo i tuoi amici possono scriverti",
      icon: Users
    },
    {
      value: "none",
      label: "Nessuno",
      description: "Nessuno può scriverti",
      icon: X
    }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ chat_permission: selectedPermission })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      onUpdate(selectedPermission);
      toast({
        title: "Impostazioni aggiornate",
        description: "Le tue preferenze per i messaggi sono state salvate."
      });
      onClose();
    } catch (error) {
      console.error('Error updating chat permissions:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare le impostazioni.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chi può scriverti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedPermission} onValueChange={(value) => setSelectedPermission(value as ChatPermission)}>
          {permissionOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="flex items-center gap-2 font-medium cursor-pointer">
                    <IconComponent className="h-4 w-4" />
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || selectedPermission === currentPermission}
            className="flex-1"
          >
            {isLoading ? "Salvando..." : "Salva"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};