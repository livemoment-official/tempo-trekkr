import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
interface CreateMomentFromGroupModalProps {
  groupId: string;
  groupTitle: string;
  groupCategory: string;
  groupLocation?: any;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function CreateMomentFromGroupModal({
  groupId,
  groupTitle,
  groupCategory,
  groupLocation,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: CreateMomentFromGroupModalProps) {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [formData, setFormData] = useState({
    title: `Momento: ${groupTitle}`,
    description: '',
    date: '',
    time: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: 'Errore',
        description: 'Inserisci tutti i campi obbligatori',
        variant: 'destructive'
      });
      return;
    }
    setIsCreating(true);
    try {
      // Combine date and time
      const whenAt = new Date(`${formData.date}T${formData.time}`);

      // Create moment with group's ID (so it uses the same chat)
      const {
        data: moment,
        error
      } = await supabase.from('moments').insert({
        id: groupId,
        // Use same ID as group for shared chat
        title: formData.title,
        description: formData.description,
        when_at: whenAt.toISOString(),
        place: groupLocation,
        host_id: user?.id,
        participants: [],
        tags: [groupCategory],
        mood_tag: groupCategory,
        is_public: true,
        registration_status: 'open'
      }).select().single();
      if (error) {
        // If moment with same ID exists, create with different ID
        if (error.code === '23505') {
          const {
            data: newMoment,
            error: retryError
          } = await supabase.from('moments').insert({
            title: formData.title,
            description: formData.description,
            when_at: whenAt.toISOString(),
            place: groupLocation,
            host_id: user?.id,
            participants: [],
            tags: [groupCategory],
            mood_tag: groupCategory,
            is_public: true,
            registration_status: 'open'
          }).select().single();
          if (retryError) throw retryError;
          toast({
            title: 'Momento creato!',
            description: `Il momento "${formData.title}" è stato creato.`
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Momento creato!',
          description: `Il momento "${formData.title}" è stato creato e condivide la chat del gruppo.`
        });
      }

      // Reset form and close modal
      setFormData({
        title: `Momento: ${groupTitle}`,
        description: '',
        date: '',
        time: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating moment:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile creare il momento. Riprova.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crea Momento dal Gruppo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pre-populated info from group */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Info ereditate dal gruppo:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="capitalize">📂 {groupCategory}</span>
              </div>
              {groupLocation && <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{groupLocation.name}</span>
                </div>}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Titolo momento *</Label>
            <Input id="title" value={formData.title} onChange={e => setFormData(prev => ({
            ...prev,
            title: e.target.value
          }))} placeholder="Nome del momento" className="mt-2" />
          </div>

          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))} placeholder="Descrivi il momento..." className="mt-2" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Data *</Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="date" type="date" value={formData.date} onChange={e => setFormData(prev => ({
                ...prev,
                date: e.target.value
              }))} className="pl-10" min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div>
              <Label htmlFor="time">Orario *</Label>
              <div className="relative mt-2">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="time" type="time" value={formData.time} onChange={e => setFormData(prev => ({
                ...prev,
                time: e.target.value
              }))} className="pl-10" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annulla
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? 'Creazione...' : 'Crea Momento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}