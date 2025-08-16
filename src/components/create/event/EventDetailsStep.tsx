import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { useState } from "react";
interface EventDetailsStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
const eventCategories = ["Concerto", "Festival", "Teatro", "Arte", "Sport", "Conferenza", "Workshop", "Networking", "Food & Drink", "Danza", "Cinema", "Moda"];
export default function EventDetailsStep({
  data,
  onChange,
  onNext
}: EventDetailsStepProps) {
  const [newTag, setNewTag] = useState("");
  const [hasTicketing, setHasTicketing] = useState(false);
  const handleAddTag = (tag: string) => {
    if (tag && !data.tags.includes(tag)) {
      onChange({
        ...data,
        tags: [...data.tags, tag]
      });
    }
    setNewTag("");
  };
  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...data,
      tags: data.tags.filter((tag: string) => tag !== tagToRemove)
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.title.trim()) {
      onNext();
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-base font-medium">
          Titolo dell'evento *
        </Label>
        <Input id="title" value={data.title} onChange={e => onChange({
        ...data,
        title: e.target.value
      })} placeholder="Nome del tuo evento..." className="mt-2" required />
      </div>

      <div>
        <Label htmlFor="description" className="text-base font-medium">
          Descrizione
        </Label>
        <Textarea id="description" value={data.description} onChange={e => onChange({
        ...data,
        description: e.target.value
      })} placeholder="Descrivi il tuo evento..." className="mt-2" rows={4} />
      </div>

      <div>
        <Label className="text-base font-medium">Categorie evento</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {eventCategories.map(tag => <Badge key={tag} variant={data.tags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => handleAddTag(tag)}>
              {tag}
            </Badge>)}
        </div>

        <div className="mt-3 flex gap-2">
          <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Categoria personalizzata..." onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(newTag);
          }
        }} />
          <Button type="button" variant="outline" onClick={() => handleAddTag(newTag)} disabled={!newTag.trim()}>
            Aggiungi
          </Button>
        </div>

        {data.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
            {data.tags.map((tag: string) => <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
              </Badge>)}
          </div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity" className="text-base font-medium">
            Capacità massima
          </Label>
          <Input id="capacity" type="number" value={data.capacity || ""} onChange={e => onChange({
          ...data,
          capacity: parseInt(e.target.value) || null
        })} placeholder="Es. 100" className="mt-2" min="1" />
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <Switch id="ticketing" checked={hasTicketing} onCheckedChange={checked => {
          setHasTicketing(checked);
          if (!checked) {
            onChange({
              ...data,
              ticketing: null
            });
          }
        }} />
          <Label htmlFor="ticketing">Evento a pagamento</Label>
        </div>
      </div>

      {hasTicketing && <div>
          <Label htmlFor="price" className="text-base font-medium">
            Prezzo del biglietto (€)
          </Label>
          <Input id="price" type="number" value={data.ticketing?.price || ""} onChange={e => onChange({
        ...data,
        ticketing: {
          ...data.ticketing,
          price: parseFloat(e.target.value) || 0
        }
      })} placeholder="Es. 25.00" className="mt-2" min="0" step="0.01" />
        </div>}

      <div className="flex justify-end">
        
      </div>
    </form>;
}