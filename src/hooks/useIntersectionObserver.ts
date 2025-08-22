import { useEffect, useRef, useCallback } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  enabled?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.5,
  rootMargin = "0px",
  onIntersect,
  enabled = true
}: UseIntersectionObserverOptions) {
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(() => {
    if (!targetRef.current || !enabled) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        onIntersect?.(entry);
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(targetRef.current);
  }, [threshold, rootMargin, onIntersect, enabled]);

  const unobserve = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      observe();
    } else {
      unobserve();
    }

    return unobserve;
  }, [observe, unobserve, enabled]);

  return {
    targetRef,
    observe,
    unobserve
  };
}