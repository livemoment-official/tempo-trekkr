import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface MomentDetailsStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

const popularTags = [
  "Aperitivo", "Cena", "Caffè", "Sport", "Arte", "Musica", 
  "Cinema", "Teatro", "Shopping", "Natura", "Fotografia", "Viaggio"
];

export default function MomentDetailsStep({ data, onChange, onNext }: MomentDetailsStepProps) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (tag: string) => {
    if (tag && !data.tags.includes(tag)) {
      onChange({ ...data, tags: [...data.tags, tag] });
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ ...data, tags: data.tags.filter((tag: string) => tag !== tagToRemove) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.title.trim()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-base font-medium">
          Titolo del momento *
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Dai un titolo al tuo momento..."
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-base font-medium">
          Descrizione
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Racconta qualcosa in più su questo momento..."
          className="mt-2"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-base font-medium">Categorie</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Seleziona o aggiungi categorie per il tuo momento
        </p>
        
        {/* Popular tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Badge
              key={tag}
              variant={data.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleAddTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Custom tag input */}
        <div className="mt-3 flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Aggiungi categoria personalizzata..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(newTag);
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleAddTag(newTag)}
            disabled={!newTag.trim()}
          >
            Aggiungi
          </Button>
        </div>

        {/* Selected tags */}
        {data.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!data.title.trim()}>
          Continua
        </Button>
      </div>
    </form>
  );
}