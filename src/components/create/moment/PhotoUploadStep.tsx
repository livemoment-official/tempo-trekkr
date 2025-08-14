import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export default function PhotoUploadStep({ data, onChange, onNext }: PhotoUploadStepProps) {
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadedPhotos = [...data.photos];
    
    // Simulate upload process
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const photoUrl = URL.createObjectURL(file);
        uploadedPhotos.push(photoUrl);
      }
    }

    onChange({ ...data, photos: uploadedPhotos });
    toast({
      title: "Foto caricate",
      description: `${files.length} foto aggiunte al momento`
    });
  }, [data, onChange, toast]);

  const removePhoto = (index: number) => {
    const updatedPhotos = data.photos.filter((_: any, i: number) => i !== index);
    onChange({ ...data, photos: updatedPhotos });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="photo-upload" className="text-base font-medium">
          Aggiungi foto al tuo momento
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Carica le foto che rappresentano il tuo momento speciale
        </p>
      </div>

      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <div className="mt-4">
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
          <p className="mt-2 text-sm text-muted-foreground">
            PNG, JPG, GIF fino a 10MB ciascuna
          </p>
        </div>
      </div>

      {data.photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.photos.map((photo: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={data.photos.length === 0}>
          Continua
        </Button>
      </div>
    </div>
  );
}