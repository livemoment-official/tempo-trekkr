import React, { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';

interface QuickAvatarUploadProps {
  currentAvatarUrl?: string | null;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  onAvatarUpdate?: () => void;
}

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16', 
  lg: 'h-20 w-20'
};

export function QuickAvatarUpload({ 
  currentAvatarUrl, 
  fallbackText = 'LM',
  size = 'lg',
  onAvatarUpdate 
}: QuickAvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAvatar, isLoading } = useProfileAvatar();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const success = await updateAvatar(file);
    if (success && onAvatarUpdate) {
      onAvatarUpdate();
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      <Avatar className={cn(sizeClasses[size], "avatar-ring cursor-pointer transition-all duration-200 group-hover:scale-105")}>
        <AvatarImage src={currentAvatarUrl || undefined} />
        <AvatarFallback className="bg-gradient-brand text-white text-lg">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
      
      {/* Upload overlay */}
      <div 
        onClick={triggerFileSelect}
        className={cn(
          "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
          isLoading && "opacity-100"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
        <div className="h-2 w-2 bg-white rounded-full" />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />
    </div>
  );
}