import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useDeleteAvailability, useMyAvailability, useUpdateAvailability } from "@/hooks/useAvailability";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

function fmt(dt?: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AvailabilityList() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data, isLoading, error } = useMyAvailability(userId);
  const updater = useUpdateAvailability(userId);
  const deleter = useDeleteAvailability(userId);

  const slots = useMemo(() => data ?? [], [data]);

  if (!userId) return <div className="text-sm text-muted-foreground">Accedi per gestire le tue disponibilità.</div>;
  if (isLoading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (error) return <div className="text-sm text-destructive">Errore nel caricamento.</div>;

  if (slots.length === 0) {
    return <div className="text-sm text-muted-foreground">Nessuna disponibilità inserita.</div>;
  }

  return (
    <div className="space-y-3">
      {slots.map((s) => (
        <div key={s.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{fmt(s.start_at)} → {fmt(s.end_at)}</div>
              <div className="text-xs text-muted-foreground">ID: {s.id.slice(0, 8)}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Visibile</span>
                <Switch
                  checked={!!s.shareable}
                  onCheckedChange={async (v) => {
                    try {
                      await updater.mutateAsync({ id: s.id, patch: { shareable: v } });
                    } catch (e: any) {
                      toast({ title: "Errore", description: e.message || "Impossibile aggiornare" });
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Attivo</span>
                <Switch
                  checked={!!s.is_on}
                  onCheckedChange={async (v) => {
                    try {
                      await updater.mutateAsync({ id: s.id, patch: { is_on: v } });
                    } catch (e: any) {
                      toast({ title: "Errore", description: e.message || "Impossibile aggiornare" });
                    }
                  }}
                />
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await deleter.mutateAsync(s.id);
                    toast({ title: "Eliminato", description: "Disponibilità rimossa" });
                  } catch (e: any) {
                    toast({ title: "Errore", description: e.message || "Impossibile eliminare" });
                  }
                }}
              >
                Elimina
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
