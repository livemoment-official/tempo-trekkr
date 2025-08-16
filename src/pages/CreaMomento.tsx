
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

interface SimpleMomentData {
  photos: string[];
  title: string;
  description: string;
  location: string;
}

const popularTags = [
  "Aperitivo", "Cena", "Caffè", "Sport", "Arte", "Musica", 
  "Cinema", "Teatro", "Shopping", "Natura", "Fotografia", "Viaggio"
];

export default function CreaMomento() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea/momento";
  const { toast } = useToast();
  
  const [momentData, setMomentData] = useState<SimpleMomentData>({
    photos: [],
    title: "",
    description: "",
    location: ""
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadedPhotos = [...momentData.photos];
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const photoUrl = URL.createObjectURL(file);
        uploadedPhotos.push(photoUrl);
      }
    }

    setMomentData({ ...momentData, photos: uploadedPhotos });
    toast({
      title: "Foto caricate",
      description: `${files.length} foto aggiunte al momento`
    });
  }, [momentData, toast]);

  const removePhoto = (index: number) => {
    const updatedPhotos = momentData.photos.filter((_: any, i: number) => i !== index);
    setMomentData({ ...momentData, photos: updatedPhotos });
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePublish = async () => {
    if (!momentData.title.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo per il momento",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Implement moment creation API call
      toast({
        title: "Momento creato!",
        description: "Il tuo momento è stato pubblicato con successo"
      });
      
      navigate("/momenti");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il momento",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea Momento</title>
        <meta name="description" content="Crea un nuovo momento condiviso su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/crea")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Crea Momento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condividi il tuo momento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div>
            <Label className="text-base font-medium">Aggiungi foto</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 mt-2">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <div className="mt-2">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Seleziona foto
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            {momentData.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {momentData.photos.map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-medium">
              Titolo *
            </Label>
            <Input
              id="title"
              value={momentData.title}
              onChange={(e) => setMomentData({ ...momentData, title: e.target.value })}
              placeholder="Dai un titolo al tuo momento..."
              className="mt-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-medium">
              Descrizione
            </Label>
            <Textarea
              id="description"
              value={momentData.description}
              onChange={(e) => setMomentData({ ...momentData, description: e.target.value })}
              placeholder="Racconta qualcosa in più..."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-base font-medium">
              Dove
            </Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={momentData.location}
                onChange={(e) => setMomentData({ ...momentData, location: e.target.value })}
                placeholder="Bar Central, Milano..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-base font-medium">Categorie</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/crea")}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={!momentData.title.trim()}
              className="flex-1"
            >
              Pubblica
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
