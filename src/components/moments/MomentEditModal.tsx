import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUpdateContent } from "@/hooks/useContentActions";
import { MomentDetail } from "@/hooks/useMomentDetail";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Calendar, MapPin, Users, Tag, Camera, Trash2, UserX, Upload } from "lucide-react";

interface MomentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moment: MomentDetail;
  onSuccess: () => void;
  onDelete?: () => void;
}

const availableTags = [
  "Spontaneo", "Aperitivo", "Sport", "Musica", "Arte", "Cibo", "Natura", 
  "Feste", "Relax", "Avventura", "Social", "Casa", "Serata", "Weekend"
];

export function MomentEditModal({ open, onOpenChange, moment, onSuccess, onDelete }: MomentEditModalProps) {
  const { toast } = useToast();
  const updateMoment = useUpdateContent('moments');
  const { data: usersData } = useAllUsers(null);
  const { uploadGalleryImage } = useImageUpload();

  const users = usersData || [];
  
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

  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [transferUserId, setTransferUserId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let photoUrl = moment.photos?.[0];
      
      // Upload new photo if selected
      if (newPhoto) {
        setIsUploading(true);
        photoUrl = await uploadGalleryImage(newPhoto);
      }

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
        tags: formData.tags,
        photos: photoUrl ? [photoUrl] : moment.photos
      };

      await updateMoment.mutateAsync({ 
        id: moment.id, 
        data: updateData 
      });

      toast({
        title: "Momento aggiornato!",
        description: "Le modifiche sono state salvate con successo"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare il momento",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      console.log('Attempting to delete moment:', moment.id);
      await updateMoment.mutateAsync({ 
        id: moment.id, 
        data: { deleted_at: new Date().toISOString() }
      });

      toast({
        title: "Momento eliminato",
        description: "Il momento è stato eliminato con successo"
      });

      onDelete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting moment:', error);
      console.error('Moment ID:', moment.id);
      console.error('User ID should be:', moment.host_id);
      toast({
        title: "Errore",
        description: `Non è stato possibile eliminare il momento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive"
      });
    }
  };

  const handleTransfer = async () => {
    if (!transferUserId) return;
    
    try {
      await updateMoment.mutateAsync({ 
        id: moment.id, 
        data: { host_id: transferUserId }
      });

      toast({
        title: "Organizzazione trasferita",
        description: "L'organizzazione del momento è stata trasferita con successo"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error transferring moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile trasferire l'organizzazione",
        variant: "destructive"
      });
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
          {/* Photo Change */}
          <div>
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Cambia Anteprima
            </Label>
            <div className="mt-2 space-y-2">
              {(photoPreview || moment.photos?.[0]) && (
                <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-lg border">
                  <img 
                    src={photoPreview || moment.photos?.[0]} 
                    alt="Anteprima" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-input')?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Scegli Foto
                </Button>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

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

          {/* Transfer Organization */}
          <div className="border-t pt-4">
            <Label className="flex items-center gap-2 mb-2">
              <UserX className="h-4 w-4" />
              Trasferisci Organizzazione
            </Label>
            <div className="flex gap-2">
              <Select value={transferUserId} onValueChange={setTransferUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleziona nuovo organizzatore" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.id !== moment.host_id).map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.username || 'Utente'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={handleTransfer}
                disabled={!transferUserId || updateMoment.isPending}
              >
                Trasferisci
              </Button>
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
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Elimina Momento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler eliminare questo momento? Questa azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              type="submit" 
              disabled={updateMoment.isPending || isUploading}
              className="flex-1"
            >
              {(updateMoment.isPending || isUploading) ? 'Salvando...' : 'Salva modifiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}