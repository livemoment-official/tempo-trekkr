import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, MapPin, Clock, Zap, Sparkles } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useQuickCreate } from "@/hooks/useQuickCreate";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { MOMENT_CATEGORIES } from "@/constants/unifiedTags";

interface QuickCreateMomentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickCreateMomentModal({ open, onOpenChange, onSuccess }: QuickCreateMomentModalProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedTime, setSelectedTime] = useState<"now" | "tonight" | "tomorrow" | "custom">("now");
  const [customDateTime, setCustomDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { uploadGalleryImage, isUploading } = useImageUpload();
  const { createQuickMoment, isCreating } = useQuickCreate();
  const { titleSuggestions, categorySuggestions, generateSuggestions } = useAISuggestions();

  const timeOptions = [
    { value: "now", label: "Ora", icon: Clock },
    { value: "tonight", label: "Stasera", icon: Clock },
    { value: "tomorrow", label: "Domani", icon: Clock },
    { value: "custom", label: "Personalizza", icon: Clock }
  ];

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    
    // Generate AI suggestions based on photo
    await generateSuggestions({ photo: file, location });
  };

  const handleCreate = async () => {
    if (!title || !photo) return;

    try {
      await createQuickMoment({
        title,
        photo,
        timeOption: selectedTime,
        customDateTime: selectedTime === "custom" ? customDateTime : undefined,
        location,
        category: selectedCategory
      });
      
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setPhoto(null);
      setPhotoPreview(null);
      setTitle("");
      setSelectedTime("now");
      setLocation("");
      setSelectedCategory("");
    } catch (error) {
      console.error("Error creating quick moment:", error);
    }
  };

  const isValid = title.trim() && photo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Crea Momento Veloce
            <Badge variant="secondary" className="text-xs">30 sec</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Foto *</Label>
            {!photoPreview ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <div className="mt-2">
                    <Label htmlFor="quick-photo-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Carica foto</span>
                      </Button>
                    </Label>
                    <Input 
                      id="quick-photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                >
                  Cambia
                </Button>
              </div>
            )}
          </div>

          {/* Title with AI Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Titolo *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Che cosa stai organizzando?"
              className="text-base"
            />
            {titleSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <Sparkles className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                {titleSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setTitle(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Time Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quando</Label>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTime === option.value ? "default" : "outline"}
                  size="sm"
                  className="h-10 justify-start"
                  onClick={() => setSelectedTime(option.value as any)}
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>
            {selectedTime === "custom" && (
              <Input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dove</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Aggiungi una posizione..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Categoria</Label>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {MOMENT_CATEGORIES.slice(0, 8).map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer text-xs hover-scale"
                  onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            {categorySuggestions.length > 0 && (
              <div className="flex gap-1 pt-1">
                <Sparkles className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                {categorySuggestions.slice(0, 2).map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedCategory(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="pt-4">
            <Button 
              onClick={handleCreate}
              disabled={!isValid || isCreating || isUploading}
              className="w-full h-12 text-base font-medium gradient-brand shadow-brand hover-scale"
            >
              {isCreating || isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Crea in 30 secondi
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}