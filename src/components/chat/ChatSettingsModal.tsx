import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, Users, Volume2, VolumeX } from "lucide-react";

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatTitle: string;
  chatType: 'moment' | 'group' | 'event';
}

export function ChatSettingsModal({ 
  isOpen, 
  onClose, 
  chatTitle, 
  chatType 
}: ChatSettingsModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Impostazioni Chat
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{chatTitle}</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Notifications Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notifiche</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="notifications" className="text-sm">
                  Notifiche messaggi
                </Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound" className="text-sm">
                  Suoni notifiche
                </Label>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                disabled={!notificationsEnabled}
              />
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Privacy</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="show-participants" className="text-sm">
                  Mostra partecipanti
                </Label>
              </div>
              <Switch
                id="show-participants"
                checked={showParticipants}
                onCheckedChange={setShowParticipants}
              />
            </div>
          </div>

          <Separator />

          {/* Chat Type Specific Settings */}
          {chatType === 'moment' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Momento</h3>
              <p className="text-xs text-muted-foreground">
                Le impostazioni del momento possono essere modificate solo dall'organizzatore.
              </p>
            </div>
          )}

          {chatType === 'group' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Gruppo</h3>
              <p className="text-xs text-muted-foreground">
                Le impostazioni del gruppo possono essere modificate solo dall'amministratore.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}