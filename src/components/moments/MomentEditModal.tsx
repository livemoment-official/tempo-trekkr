import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUpdateContent } from "@/hooks/useContentActions";
import { MomentDetail } from "@/hooks/useMomentDetail";
import { Calendar, MapPin, Users, Tag } from "lucide-react";

interface MomentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moment: MomentDetail;
  onSuccess: () => void;
}

const availableTags = [
  "Spontaneo", "Aperitivo", "Sport", "Musica", "Arte", "Cibo", "Natura", 
  "Feste", "Relax", "Avventura", "Social", "Casa", "Serata", "Weekend"
];

export function MomentEditModal({ open, onOpenChange, moment, onSuccess }: MomentEditModalProps) {
  const { toast } = useToast();
  const updateMoment = useUpdateContent('moments');
  
  const [formData, setFormData] = useState({
    title: moment.title,
    description: moment.description,
    location: moment.place?.name || '',
    capacity: moment.max_participants?.toString() || '',
    ageMin: moment.age_range_min?.toString() || '18',
    ageMax: moment.age_range_max?.toString() || '65',
    date: moment.when_at ? new Date(moment.when_at).toISOString().slice(0, 16) : '',
    tags: moment.tags || []
  });

  useEffect(() => {
    if (moment) {
      setFormData({
        title: moment.title,
        description: moment.description,
        location: moment.place?.name || '',
        capacity: moment.max_participants?.toString() || '',
        ageMin: moment.age_range_min?.toString() || '18',
        ageMax: moment.age_range_max?.toString() || '65',
        date: moment.when_at ? new Date(moment.when_at).toISOString().slice(0, 16) : '',
        tags: moment.tags || []
      });
    }
  }, [moment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        when_at: formData.date ? new Date(formData.date).toISOString() : null,
        place: formData.location ? {
          name: formData.location,
          coordinates: moment.place?.coordinates
        } : null,
        max_participants: formData.capacity ? parseInt(formData.capacity) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        age_range_min: parseInt(formData.ageMin),
        age_range_max: parseInt(formData.ageMax),
        tags: formData.tags
      };

      await updateMoment.mutateAsync({ 
        id: moment.id, 
        data: updateData 
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating moment:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Momento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data e Ora
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Luogo
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Dove si svolge?"
              className="mt-1"
            />
          </div>

          {/* Capacity */}
          <div>
            <Label htmlFor="capacity" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Capacità massima
            </Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              placeholder="Numero massimo di partecipanti"
              className="mt-1"
            />
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ageMin">Età minima</Label>
              <Input
                id="ageMin"
                type="number"
                value={formData.ageMin}
                onChange={(e) => setFormData(prev => ({ ...prev, ageMin: e.target.value }))}
                min="13"
                max="100"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ageMax">Età massima</Label>
              <Input
                id="ageMax"
                type="number"
                value={formData.ageMax}
                onChange={(e) => setFormData(prev => ({ ...prev, ageMax: e.target.value }))}
                min="13"
                max="100"
                className="mt-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={formData.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={updateMoment.isPending}
              className="flex-1"
            >
              {updateMoment.isPending ? 'Salvando...' : 'Salva modifiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}