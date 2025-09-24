import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useCreateInvite } from "@/hooks/useInvites";

interface NearbyUser {
  id: string; // Changed from user_id to id for consistency
  name: string;
  username: string;
  avatar_url: string;
  mood: string;
  distance_km: number;
  availability_id: string;
  job_title: string;
  interests: string[];
}

interface QuickInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: NearbyUser;
}

export default function QuickInviteModal({ 
  open, 
  onOpenChange, 
  targetUser 
}: QuickInviteModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  
  const createInvite = useCreateInvite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    let when_at: Date | undefined;
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number);
      when_at = new Date(date);
      when_at.setHours(hours, minutes, 0, 0);
    }

    await createInvite.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      participants: [targetUser.id], // Changed from user_id to id
      when_at,
      place: location.trim() ? { name: location.trim() } : undefined
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDate(undefined);
    setTime("");
    setLocation("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invita {targetUser.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Cosa vuoi fare? *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es: Aperitivo, Caffè, Passeggiata..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Dettagli (opzionale)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aggiungi qualche dettaglio..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data (opzionale)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {date ? format(date, "dd MMM", { locale: it }) : "Oggi"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time">Ora (opzionale)</Label>
              <div className="relative">
                <Clock className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Luogo (opzionale)</Label>
            <div className="relative">
              <MapPin className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Dove vi incontrate?"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2">
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
              disabled={!title.trim() || createInvite.isPending}
              className="flex-1"
            >
              {createInvite.isPending ? "Invio..." : "Invia Invito"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}