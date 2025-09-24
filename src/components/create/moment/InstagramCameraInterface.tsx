import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InstagramCameraInterfaceProps {
  onPhotoCapture: (file: File) => void;
  onCancel: () => void;
}

interface MediaItem {
  file: File;
  url: string;
  type: 'image' | 'video';
}

export default function InstagramCameraInterface({ onPhotoCapture, onCancel }: InstagramCameraInterfaceProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1080 },
            height: { ideal: 1350 }
          }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Camera access error:", error);
        toast({
          title: "Errore camera",
          description: "Impossibile accedere alla camera. Usa la galleria per selezionare una foto.",
          variant: "destructive"
        });
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Load recent media from gallery
  useEffect(() => {
    const loadGalleryItems = async () => {
      if (fileInputRef.current) {
        // Trigger file input to get recent photos
        fileInputRef.current.click();
      }
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Set canvas to 1080x1350 aspect ratio
      canvas.width = 1080;
      canvas.height = 1350;
      
      // Calculate crop area to maintain aspect ratio
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = 1080 / 1350;
      
      let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight;
      
      if (videoRatio > targetRatio) {
        // Video is wider, crop sides
        sourceWidth = video.videoHeight * targetRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
      } else {
        // Video is taller, crop top/bottom
        sourceHeight = video.videoWidth / targetRatio;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }

      context.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );

      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `moment-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const url = URL.createObjectURL(file);
          const mediaItem: MediaItem = { file, url, type: 'image' };
          setSelectedMedia(mediaItem);
        }
        setIsCapturing(false);
      }, 'image/jpeg', 0.9);
    }
  }, []);

  const handleGallerySelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newItems: MediaItem[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        newItems.push({ file, url, type });
      }
    });

    setGalleryItems(newItems);
    if (newItems.length > 0) {
      setSelectedMedia(newItems[0]);
    }
  }, []);

  const selectMedia = useCallback((item: MediaItem) => {
    setSelectedMedia(item);
  }, []);

  const confirmSelection = useCallback(() => {
    if (selectedMedia) {
      onPhotoCapture(selectedMedia.file);
    }
  }, [selectedMedia, onPhotoCapture]);

  const cleanup = useCallback(() => {
    galleryItems.forEach(item => URL.revokeObjectURL(item.url));
    if (selectedMedia) URL.revokeObjectURL(selectedMedia.url);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onCancel();
  }, [galleryItems, selectedMedia, stream, onCancel]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={cleanup}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold">Nuovo Momento</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={confirmSelection}
          disabled={!selectedMedia}
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Preview Area - 60% */}
        <div className="flex-[3] relative bg-black">
          {selectedMedia ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="aspect-[1080/1350] max-h-full max-w-full relative">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt="Selected"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-full object-cover rounded-lg"
                    controls
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Camera Capture Button */}
          {!selectedMedia && stream && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={isCapturing}
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-100"
              >
                <Camera className="h-8 w-8 text-black" />
              </Button>
            </div>
          )}
        </div>

        {/* Gallery Area - 40% */}
        <div className="flex-[2] bg-muted/5 border-t">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Galleria</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                Seleziona
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {galleryItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => selectMedia(item)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedMedia?.url === item.url 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-muted-foreground/20'
                  }`}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={`Gallery item ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </button>
              ))}
              
              {galleryItems.length === 0 && (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nessuna foto nella galleria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleGallerySelect}
      />
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}