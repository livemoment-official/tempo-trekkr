import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

export function EnhancedImage({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/placeholder.svg',
  showSkeleton = true,
  skeletonClassName,
  ...props 
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="relative">
      {isLoading && showSkeleton && (
        <Skeleton className={cn("absolute inset-0", skeletonClassName)} />
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
}