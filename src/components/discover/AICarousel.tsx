import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';

interface AICarouselProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  itemCount?: number;
}

export function AICarousel({ title, icon, children, loading, itemCount = 6 }: AICarouselProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <div className="flex gap-4 px-4 overflow-hidden">
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <Skeleton className="h-40 w-full rounded-xl mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {title}
        </h3>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="pl-4 pr-4">
          {children}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card" />
        <CarouselNext className="right-2 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card" />
      </Carousel>
    </div>
  );
}

export { CarouselItem };