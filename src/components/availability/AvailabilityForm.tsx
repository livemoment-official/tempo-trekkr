import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useCreateAvailability } from "@/hooks/useAvailability";
import { supabase } from "@/integrations/supabase/client";

function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const out = new Date(date);
  out.setHours(h ?? 0, m ?? 0, 0, 0);
  return out;
}

export function AvailabilityForm() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [shareable, setShareable] = useState(true);
  const createMutation = useCreateAvailability();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const onSubmit = async () => {
    if (!userId) {
      toast({ title: "Accedi per continuare", description: "Devi effettuare l'accesso per salvare le disponibilità." });
      return;
    }
    if (!date) {
      toast({ title: "Scegli una data", description: "Seleziona un giorno dal calendario." });
      return;
    }

    const startAt = combineDateAndTime(date, startTime);
    const endAt = combineDateAndTime(date, endTime);

    try {
      await createMutation.mutateAsync({
        user_id: userId,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        is_on: true,
        shareable,
      });
      toast({ title: "Disponibilità aggiunta", description: "Lo slot è stato salvato." });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message || "Impossibile salvare" });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label className="mb-2 block">Giorno</Label>
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startTime">Inizio</Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endTime">Fine</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Rendi visibile a tutti</div>
            <div className="text-xs text-muted-foreground">Se attivo, gli altri potranno vederti disponibile.</div>
          </div>
          <Switch checked={shareable} onCheckedChange={setShareable} />
        </div>
        <Button onClick={onSubmit} className="w-full">Aggiungi disponibilità</Button>
      </div>
    </div>
  );
}
