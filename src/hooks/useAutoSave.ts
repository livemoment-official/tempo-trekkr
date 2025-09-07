import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ data, onSave, delay = 10000, enabled = true }: UseAutoSaveOptions) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>(JSON.stringify(data));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!enabled || isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentDataString = JSON.stringify(data);
    
    // Only auto-save if data has actually changed
    if (currentDataString === lastSavedRef.current) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new auto-save timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        lastSavedRef.current = currentDataString;
        toast({
          title: "Salvato automaticamente",
          description: "Le tue modifiche sono state salvate",
          duration: 2000,
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}