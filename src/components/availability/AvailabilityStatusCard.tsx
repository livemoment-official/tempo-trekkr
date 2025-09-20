import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleDot, Plus, Clock } from 'lucide-react';
import { QuickAvailabilitySelector } from './QuickAvailabilitySelector';
import { AvailabilityForm } from './AvailabilityForm';
import { useAvailabilityStatus } from '@/hooks/useAvailabilityStatus';

export function AvailabilityStatusCard() {
  const { status, isOnline } = useAvailabilityStatus();
  const [showQuickSelector, setShowQuickSelector] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const getStatusDisplay = () => {
    if (!isOnline) {
      return {
        label: 'Offline',
        description: 'Non visibile agli altri',
        color: 'bg-gray-400',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: CircleDot
      };
    }
    
    if (status === 'available') {
      return {
        label: 'Disponibilità a Uscire',
        description: 'Altri possono trovarti e invitarti',
        color: 'bg-disponibile-uscire',
        textColor: 'text-disponibile-uscire',
        bgColor: 'bg-disponibile-uscire/10',
        icon: CircleDot
      };
    }
    
    return {
      label: 'Online',
      description: 'Connesso ma non disponibile',
      color: 'bg-blue-500',
      textColor: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      icon: CircleDot
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <Card className="shadow-card hover:shadow-sm transition-smooth">
      <CardContent className="p-4 space-y-4">
        {/* Status Display */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full relative ${statusInfo.bgColor}`}>
            <statusInfo.icon className={`h-4 w-4 ${statusInfo.textColor}`} />
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusInfo.color} border-2 border-white`} />
          </div>
          <div>
            <div className="font-medium">
              {statusInfo.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {statusInfo.description}
            </div>
          </div>
        </div>

        {/* Availability Actions */}
        {isOnline && (
          <div className="space-y-3">
            {/* Quick Availability */}
            {!showQuickSelector ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickSelector(true)}
                className="w-full justify-start text-sm h-10 font-medium"
              >
                <Clock className="h-4 w-4 mr-2" />
                Disponibile ora
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium">Disponibile ora</div>
                <QuickAvailabilitySelector 
                  onAvailabilitySet={() => setShowQuickSelector(false)} 
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowQuickSelector(false)}
                  className="text-xs text-muted-foreground"
                >
                  Annulla
                </Button>
              </div>
            )}

            {/* Schedule Availability */}
            {!showScheduleForm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScheduleForm(true)}
                className="w-full justify-start text-sm h-10 text-muted-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Programma disponibilità
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Programma disponibilità</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowScheduleForm(false)}
                    className="h-auto p-1 text-xs text-muted-foreground"
                  >
                    Chiudi
                  </Button>
                </div>
                <AvailabilityForm />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}