import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Calendar, MapPin, CircleDot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { toast } from 'sonner';

interface Availability {
  id: string;
  is_on: boolean;
  shareable: boolean;
  start_at?: string;
  end_at?: string;
}

type AvailabilityStatus = 'offline' | 'online' | 'available' | 'busy';

export function AvailabilityToggle() {
  const { user } = useAuth();
  const { isOnline, updatePresence, setOffline } = useRealTimePresence();
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<AvailabilityStatus>('offline');

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const setAvailableToGoOut = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Set auto-expiry to 4 hours from now
      const autoExpiry = new Date();
      autoExpiry.setHours(autoExpiry.getHours() + 4);
      
      // Update or create availability
      const availabilityData = {
        user_id: user.id,
        is_on: true,
        shareable: true,
        start_at: new Date().toISOString(),
        end_at: autoExpiry.toISOString(),
        updated_at: new Date().toISOString()
      };

      if (availability) {
        const { error } = await supabase
          .from('availability')
          .update(availabilityData)
          .eq('id', availability.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('availability')
          .insert(availabilityData)
          .select()
          .single();
        if (error) throw error;
        setAvailability(data);
      }

      // Update presence status
      await updatePresence('Disponibile a uscire');
      setStatus('available');
      
      toast.success('Sei ora disponibile a uscire! Altri utenti vicini possono trovarti.');
    } catch (error) {
      console.error('Error setting availability:', error);
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  const setOnlineOnly = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Disable availability but keep online
      if (availability) {
        await supabase
          .from('availability')
          .update({ 
            is_on: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', availability.id);
      }

      await updatePresence('Online');
      setStatus('online');
      toast.success('Sei online ma non disponibile a uscire');
    } catch (error) {
      console.error('Error setting online status:', error);
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  const setOfflineStatus = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Disable availability
      if (availability) {
        await supabase
          .from('availability')
          .update({ 
            is_on: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', availability.id);
      }

      await setOffline();
      setStatus('offline');
      toast.success('Sei ora offline');
    } catch (error) {
      console.error('Error setting offline:', error);
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  const updateShareable = async (shareable: boolean) => {
    if (!availability || !user) return;

    try {
      const { error } = await supabase
        .from('availability')
        .update({ 
          shareable,
          updated_at: new Date().toISOString()
        })
        .eq('id', availability.id);

      if (error) throw error;
      
      setAvailability({ ...availability, shareable });
      toast.success(shareable ? 'Disponibilità ora visibile ad altri' : 'Disponibilità ora privata');
    } catch (error) {
      console.error('Error updating shareability:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  useEffect(() => {
    // Determine status based on availability and presence
    if (!isOnline) {
      setStatus('offline');
    } else if (availability?.is_on && availability?.shareable) {
      setStatus('available');
    } else if (isOnline) {
      setStatus('online');
    }
  }, [isOnline, availability]);

  const getStatusInfo = () => {
    switch (status) {
      case 'available':
        return {
          label: 'Disponibile a uscire',
          description: 'Altri possono trovarti e invitarti',
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: CircleDot
        };
      case 'online':
        return {
          label: 'Online',
          description: 'Attivo ma non disponibile a uscire',
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: CircleDot
        };
      case 'busy':
        return {
          label: 'Occupato',
          description: 'Non disturbare',
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          icon: CircleDot
        };
      default:
        return {
          label: 'Offline',
          description: 'Non visibile agli altri',
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: CircleDot
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <Card className="shadow-card hover:shadow-sm transition-smooth">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full relative ${statusInfo.bgColor}`}>
                <statusInfo.icon className={`h-4 w-4 ${statusInfo.textColor}`} />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusInfo.color} border-2 border-white`} />
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {statusInfo.label}
                  {status === 'available' && (
                    <Badge variant="secondary" className="text-xs">
                      Visibile
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {statusInfo.description}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-xs"
            >
              Cambia
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              onClick={setAvailableToGoOut}
              disabled={isLoading}
              variant={status === 'available' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
            >
              <CircleDot className="w-3 h-3 mr-1" />
              Disponibile ora
            </Button>
            <Button
              onClick={setOnlineOnly}
              disabled={isLoading}
              variant={status === 'online' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
            >
              Solo online
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestisci il tuo stato</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Status Options */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Scegli il tuo stato</div>
              
              <button
                onClick={setAvailableToGoOut}
                disabled={isLoading}
                className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                  status === 'available'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CircleDot className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium text-green-700">Disponibile a uscire</div>
                    <div className="text-xs text-green-600">Altri possono trovarti e invitarti (scade in 4h)</div>
                  </div>
                </div>
              </button>

              <button
                onClick={setOnlineOnly}
                disabled={isLoading}
                className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                  status === 'online'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CircleDot className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-700">Solo online</div>
                    <div className="text-xs text-blue-600">Attivo ma non disponibile a uscire</div>
                  </div>
                </div>
              </button>

              <button
                onClick={setOfflineStatus}
                disabled={isLoading}
                className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                  status === 'offline'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CircleDot className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-700">Offline</div>
                    <div className="text-xs text-gray-600">Non visibile agli altri utenti</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>Quando sei "Disponibile a uscire", appari nella ricerca degli altri utenti vicini</span>
              </div>
            </div>

            <Button
              onClick={() => setShowSettings(false)}
              variant="outline"
              className="w-full"
            >
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}