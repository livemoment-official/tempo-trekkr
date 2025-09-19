import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  Download,
  Image as ImageIcon,
  Video,
  Headphones
} from 'lucide-react';

interface MediaMessageProps {
  type: 'image' | 'video' | 'audio';
  url: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  isOwn?: boolean;
}

export function MediaMessage({ 
  type, 
  url, 
  fileName, 
  fileSize, 
  duration,
  isOwn 
}: MediaMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || `media.${type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (type === 'image') {
    return (
      <Card className={`overflow-hidden max-w-sm ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <div className="relative">
          <img 
            src={url} 
            alt={fileName || 'Immagine condivisa'} 
            className="w-full h-auto rounded-t-lg"
            loading="lazy"
          />
          {(fileName || fileSize) && (
            <div className="p-3 bg-background border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    {fileName && (
                      <p className="text-sm font-medium truncate max-w-40">
                        {fileName}
                      </p>
                    )}
                    {fileSize && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileSize)}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (type === 'video') {
    return (
      <Card className={`overflow-hidden max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <div className="relative">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={url}
            className="w-full h-auto"
            controls
            onTimeUpdate={handleTimeUpdate}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            preload="metadata"
          />
          
          {(fileName || fileSize || duration) && (
            <div className="p-3 bg-background border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <div>
                    {fileName && (
                      <p className="text-sm font-medium truncate max-w-40">
                        {fileName}
                      </p>
                    )}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {fileSize && <span>{formatFileSize(fileSize)}</span>}
                      {duration && <span>{formatDuration(duration)}</span>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (type === 'audio') {
    return (
      <Card className={`p-4 max-w-xs ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
          style={{ display: 'none' }}
        />
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                {fileName && (
                  <p className="text-sm font-medium truncate">{fileName}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {duration && <span>{formatDuration(currentTime)} / {formatDuration(duration)}</span>}
                  {fileSize && <span>{formatFileSize(fileSize)}</span>}
                </div>
              </div>
            </div>

            {/* Audio Progress Bar */}
            {duration && duration > 0 && (
              <div className="mt-2 bg-muted rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}