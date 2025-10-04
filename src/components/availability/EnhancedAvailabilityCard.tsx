import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useDeleteAvailability, useUpdateAvailability } from '@/hooks/useAvailability';
import { Calendar, Clock, Edit3, Trash2, UserPlus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
interface EnhancedAvailabilityCardProps {
  availability: Tables<'availability'>;
  userId?: string;
  onEditRequest?: (availability: Tables<'availability'>) => void;
}
function formatDateTime(dt?: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatTime(dt?: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });
}
export function EnhancedAvailabilityCard({
  availability,
  userId,
  onEditRequest
}: EnhancedAvailabilityCardProps) {
  const {
    toast
  } = useToast();
  const updater = useUpdateAvailability(userId);
  const deleter = useDeleteAvailability(userId);
  const isActive = availability.is_on;
  const isShareable = availability.shareable;
  const isInvitable = isActive && isShareable;
  const handleToggleActive = async (checked: boolean) => {
    try {
      await updater.mutateAsync({
        id: availability.id,
        patch: {
          is_on: checked
        }
      });
      toast({
        title: checked ? "Disponibilità attivata" : "Disponibilità disattivata",
        description: checked ? "Ora sei invitabile in questo slot" : "Non riceverai più inviti per questo slot"
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare",
        variant: "destructive"
      });
    }
  };
  const handleToggleShareable = async (checked: boolean) => {
    try {
      await updater.mutateAsync({
        id: availability.id,
        patch: {
          shareable: checked
        }
      });
      toast({
        title: checked ? "Disponibilità condivisa" : "Disponibilità privata",
        description: checked ? "Altri possono vedere questo slot" : "Questo slot è ora privato"
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare",
        variant: "destructive"
      });
    }
  };
  const handleDelete = async () => {
    try {
      await deleter.mutateAsync(availability.id);
      toast({
        title: "Eliminato",
        description: "Slot di disponibilità rimosso"
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile eliminare",
        variant: "destructive"
      });
    }
  };
  return <Card className={`shadow-card transition-all duration-200 ${isInvitable ? 'ring-2 ring-primary/20 bg-gradient-to-r from-primary/5 to-transparent' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {formatDateTime(availability.start_at)}
              </span>
              {isInvitable && <Badge variant="default" className="text-xs">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Invitabile
                </Badge>}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatTime(availability.start_at)} - {formatTime(availability.end_at)}
              </span>
            </div>
          </div>
          
          {/* Edit button in top right corner */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 hover:opacity-100" onClick={() => onEditRequest?.(availability)}>
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>

        {/* Call to action for invitable slots */}
        {isInvitable}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={handleToggleActive} />
              <span className="text-xs text-muted-foreground">Attivo</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch checked={isShareable} onCheckedChange={handleToggleShareable} />
              <span className="text-xs text-muted-foreground">Visibile</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>;
}