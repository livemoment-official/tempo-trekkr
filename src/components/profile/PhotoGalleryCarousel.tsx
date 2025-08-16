import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryCarouselProps {
  photos: string[];
  isOwnProfile?: boolean;
  onPhotosUpdate?: (photos: string[]) => void;
  className?: string;
}

export const PhotoGalleryCarousel = ({ 
  photos, 
  isOwnProfile = false, 
  onPhotosUpdate,
  className 
}: PhotoGalleryCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !onPhotosUpdate) return;

    const newPhotos = [...photos];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const photoUrl = URL.createObjectURL(file);
        newPhotos.push(photoUrl);
      }
    }
    onPhotosUpdate(newPhotos);
  };

  const removePhoto = (indexToRemove: number) => {
    if (!onPhotosUpdate) return;
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    onPhotosUpdate(updatedPhotos);
    if (currentIndex >= updatedPhotos.length && updatedPhotos.length > 0) {
      setCurrentIndex(updatedPhotos.length - 1);
    }
  };

  if (photos.length === 0 && !isOwnProfile) {
    return (
      <div className={cn("aspect-[1080/1320] bg-muted rounded-lg flex items-center justify-center", className)}>
        <p className="text-muted-foreground text-sm">Nessuna foto</p>
      </div>
    );
  }

  if (photos.length === 0 && isOwnProfile) {
    return (
      <div className={cn("aspect-[1080/1320] border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-4 p-6", className)}>
        <Upload className="h-12 w-12 text-muted-foreground/50" />
        <div className="text-center">
          <p className="text-sm font-medium mb-2">Aggiungi le tue foto</p>
          <p className="text-xs text-muted-foreground mb-4">Formato ottimale: 1080x1320</p>
          <label htmlFor="gallery-upload">
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Carica foto
              </span>
            </Button>
          </label>
          <input
            id="gallery-upload"
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[1080/1320] rounded-lg overflow-hidden bg-muted", className)}>
      {/* Main photo */}
      <div className="relative w-full h-full">
        <img
          src={photos[currentIndex]}
          alt={`Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Remove button for own profile */}
        {isOwnProfile && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => removePhoto(currentIndex)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>
          </>
        )}
      </div>

      {/* Photo indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex ? "bg-white" : "bg-white/50"
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Add more photos button for own profile */}
      {isOwnProfile && photos.length > 0 && (
        <label htmlFor="gallery-upload-more" className="absolute bottom-2 right-2">
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0" asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 text-white" />
            </span>
          </Button>
          <input
            id="gallery-upload-more"
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>
      )}
    </div>
  );
};