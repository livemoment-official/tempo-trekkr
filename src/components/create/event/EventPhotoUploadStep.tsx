import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";

interface EventPhotoUploadStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export default function EventPhotoUploadStep({ data, onChange, onNext }: EventPhotoUploadStepProps) {
  const { toast } = useToast();
  const { uploadImage, isUploading } = useImageUpload();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadedPhotos = [...(data.photos || [])];
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const photoUrl = await uploadImage(file, {
            bucket: 'galleries',
            folder: 'events',
            maxSizeMB: 10,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
          });
          
          if (photoUrl) {
            uploadedPhotos.push(photoUrl);
          }
        } catch (error) {
          toast({
            title: "Errore caricamento",
            description: `Errore nel caricamento di ${file.name}`,
            variant: "destructive"
          });
        }
      }
    }

    onChange({ ...data, photos: uploadedPhotos });
    toast({
      title: "Foto caricate",
      description: `${files.length} foto aggiunte all'evento`
    });
  }, [data, onChange, toast, uploadImage]);

  const removePhoto = (index: number) => {
    const updatedPhotos = (data.photos || []).filter((_: any, i: number) => i !== index);
    onChange({ ...data, photos: updatedPhotos });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="photo-upload" className="text-base font-medium">
              Aggiungi foto/grafica al tuo evento
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Carica immagini che rappresentano al meglio il tuo evento. Le prime immagini saranno utilizzate come anteprima.
            </p>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div className="mt-4">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild disabled={isUploading}>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? "Caricamento..." : "Seleziona foto"}
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
                  disabled={isUploading}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                PNG, JPG, WebP, GIF fino a 10MB ciascuna
              </p>
            </div>
          </div>

          {data.photos && data.photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Foto caricate ({data.photos.length})</h4>
                <p className="text-sm text-muted-foreground">
                  La prima foto sarà l'immagine principale
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.photos.map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <div className={`relative overflow-hidden rounded-lg border-2 ${
                      index === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-muted'
                    }`}>
                      <img
                        src={photo}
                        alt={`Foto evento ${index + 1}`}
                        className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Principale
                          </span>
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {data.photos?.length > 0 ? (
                `${data.photos.length} foto caricate`
              ) : (
                "Nessuna foto caricata (opzionale)"
              )}
            </p>
            <Button onClick={onNext}>
              Continua
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}