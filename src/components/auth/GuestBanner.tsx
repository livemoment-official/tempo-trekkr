import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, UserPlus, Eye } from 'lucide-react';
import { AuthModal } from './AuthModal';

export function GuestBanner() {
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      <Card className="mx-4 mb-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Unisciti a LiveMoment</div>
              <div className="text-xs text-muted-foreground">
                Accedi per partecipare ai momenti e creare eventi
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowModal(true)}
              className="h-8 px-3 text-xs"
            >
              Registrati
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AuthModal
        open={showModal}
        onOpenChange={setShowModal}
        title="Benvenuto in LiveMoment"
        description="Accedi per partecipare a momenti unici nella tua città"
      />
    </>
  );
}