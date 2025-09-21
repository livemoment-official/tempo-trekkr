import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Heart } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface MomentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  momentData: {
    title: string;
    description: string;
    moodTag: string;
    selectedCategory: string;
    location: { name: string; address?: string; coordinates: { lat: number; lng: number } } | null;
    selectedTime: string;
    customDateTime: string;
    customDate: Date | null;
    maxParticipants: number;
  };
  photoPreview?: string | null;
  userProfile?: {
    name: string;
    avatar_url?: string;
  };
  onConfirm?: () => void;
  isCreating?: boolean;
}

export default function MomentPreviewModal({ 
  open, 
  onOpenChange, 
  momentData, 
  photoPreview,
  userProfile,
  onConfirm,
  isCreating = false
}: MomentPreviewModalProps) {
  
  const getFormattedTime = () => {
    const now = new Date();
    switch (momentData.selectedTime) {
      case "now":
        return "Ora";
      case "tonight":
        const tonight = new Date(now);
        tonight.setHours(20, 0, 0, 0);
        if (tonight <= now) tonight.setDate(tonight.getDate() + 1);
        try {
          return format(tonight, "PPp", { locale: it });
        } catch {
          return "Stasera";
        }
      case "tomorrow":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(19, 0, 0, 0);
        try {
          return format(tomorrow, "PPp", { locale: it });
        } catch {
          return "Domani";
        }
      case "custom":
        try {
          if (momentData.customDate && momentData.customDateTime) {
            const [hours, minutes] = momentData.customDateTime.split(':');
            const customDate = new Date(momentData.customDate);
            customDate.setHours(parseInt(hours) || 19, parseInt(minutes) || 0, 0, 0);
            return format(customDate, "PPp", { locale: it });
          } else if (momentData.customDate) {
            return format(momentData.customDate, "PP", { locale: it }) + " - Orario da definire";
          } else if (momentData.customDateTime) {
            // Legacy support for old datetime-local format
            const customDate = new Date(momentData.customDateTime);
            if (!isNaN(customDate.getTime())) {
              return format(customDate, "PPp", { locale: it });
            }
          }
          return "Data da definire";
        } catch {
          return "Data da definire";
        }
      default:
        return "Ora";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Anteprima Momento</DialogTitle>
        </DialogHeader>
        
        {/* Moment Card Preview */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Photo */}
          {photoPreview && (
            <div className="aspect-video relative">
              <img 
                src={photoPreview} 
                alt="Momento" 
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 left-2 bg-black/50 text-white border-0">
                {momentData.moodTag}
              </Badge>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Host */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback>
                  {userProfile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {userProfile?.name || 'Tu'}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight">
              {momentData.title || "Titolo del momento"}
            </h3>

            {/* Description */}
            {momentData.description && (
              <p className="text-sm text-muted-foreground">
                {momentData.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {momentData.selectedCategory && (
                <Badge variant="secondary" className="text-xs">
                  {momentData.selectedCategory}
                </Badge>
              )}
            </div>

            {/* Time & Location */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{getFormattedTime()}</span>
              </div>
              
              {momentData.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{momentData.location.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Max {momentData.maxParticipants} persone</span>
              </div>
            </div>

            {/* Actions Preview */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">
                Partecipa
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Modifica
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isCreating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              'Pubblica'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}