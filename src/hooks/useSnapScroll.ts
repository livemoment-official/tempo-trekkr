import { useCallback, useEffect, useRef } from "react";
import { useIsMobile } from "./use-mobile";

interface UseSnapScrollOptions {
  enabled?: boolean;
  onSnapChange?: (index: number) => void;
}

export function useSnapScroll({ enabled = true, onSnapChange }: UseSnapScrollOptions = {}) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSnapIndex = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isMobile || !enabled) return;

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Set a timeout to determine when scrolling has stopped
    scrollTimeout.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const cards = container.querySelectorAll('[data-snap-card]');
      if (cards.length === 0) return;

      // Find which card is most visible
      let mostVisibleIndex = 0;
      let maxVisibleArea = 0;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const visibleArea = Math.max(0, visibleHeight) * rect.width;

        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          mostVisibleIndex = index;
        }
      });

      if (mostVisibleIndex !== currentSnapIndex.current) {
        currentSnapIndex.current = mostVisibleIndex;
        onSnapChange?.(mostVisibleIndex);
      }
    }, 150);
  }, [isMobile, enabled, onSnapChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobile || !enabled) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll, isMobile, enabled]);

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current || !isMobile) return;

    const cards = containerRef.current.querySelectorAll('[data-snap-card]');
    const targetCard = cards[index] as HTMLElement;
    
    if (targetCard) {
      targetCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [isMobile]);

  return {
    containerRef,
    scrollToIndex,
    currentIndex: currentSnapIndex.current,
    isSnapEnabled: isMobile && enabled
  };
}