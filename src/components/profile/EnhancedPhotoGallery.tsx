import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";

interface EnhancedPhotoGalleryProps {
  photos: string[];
  isOwnProfile?: boolean;
  onPhotosUpdate?: (photos: string[]) => void;
  className?: string;
}

export function EnhancedPhotoGallery({ 
  photos, 
  isOwnProfile = false, 
  onPhotosUpdate,
  className 
}: EnhancedPhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadGalleryImage, isUploading } = useImageUpload();

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleFileUpload = async (files: FileList) => {
    if (!onPhotosUpdate) return;

    const newPhotos = [...photos];
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const uploadedUrl = await uploadGalleryImage(file);
          if (uploadedUrl) {
            newPhotos.push(uploadedUrl);
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Errore nel caricamento della foto');
        }
      }
    }
    
    if (newPhotos.length > photos.length) {
      onPhotosUpdate(newPhotos);
      toast.success(`${newPhotos.length - photos.length} foto caricate`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragCounter(0);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragging(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    if (!onPhotosUpdate) return;
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    onPhotosUpdate(updatedPhotos);
    if (currentIndex >= updatedPhotos.length && updatedPhotos.length > 0) {
      setCurrentIndex(updatedPhotos.length - 1);
    }
    toast.success('Foto rimossa');
  };

  if (photos.length === 0 && !isOwnProfile) {
    return (
      <div className={cn("aspect-[1080/1320] bg-muted rounded-lg flex items-center justify-center", className)}>
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Nessuna foto</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0 && isOwnProfile) {
    return (
      <div 
        className={cn(
          "aspect-[1080/1320] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 p-6 transition-all cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5 border-solid" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
          className
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={cn("h-12 w-12 transition-colors", isDragging ? "text-primary" : "text-muted-foreground/50")} />
        <div className="text-center">
          <p className="text-sm font-medium mb-2">
            {isDragging ? "Rilascia le foto qui" : "Aggiungi le tue foto"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Trascina le foto o clicca per caricare
          </p>
          <Button variant="outline" size="sm" disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Caricamento...' : 'Carica foto'}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[1080/1320] rounded-lg overflow-hidden bg-muted group", className)}>
      {/* Main photo */}
      <div className="relative w-full h-full">
        <img
          src={photos[currentIndex]}
          alt={`Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Remove button for own profile */}
        {isOwnProfile && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>
          </>
        )}

        {/* Drag overlay for additional photos */}
        {isOwnProfile && isDragging && (
          <div 
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-10"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center text-white">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Aggiungi nuove foto</p>
            </div>
          </div>
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

      {/* Add more photos button - improved */}
      {isOwnProfile && photos.length > 0 && (
        <div 
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 border-0" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 text-white" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>
      )}

      {/* Photo count indicator */}
      {photos.length > 0 && (
        <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}