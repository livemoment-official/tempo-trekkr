import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Navigation } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";

interface MapPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
  };
}

export function MapPreviewDialog({ open, onOpenChange, location }: MapPreviewDialogProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");

  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error getting Mapbox token:', error);
      }
    };

    if (open) {
      getMapboxToken();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [location.lng, location.lat],
      zoom: 15,
    });

    // Add marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [open, mapboxToken, location.lat, location.lng]);

  const openInMaps = () => {
    // Open in Apple Maps on iOS, Google Maps elsewhere
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(`maps://?q=${location.lat},${location.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
    }
  };

  const getDirections = () => {
    // Get directions in Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {location.name || "Posizione"}
          </DialogTitle>
          {location.address && (
            <p className="text-sm text-muted-foreground">{location.address}</p>
          )}
        </DialogHeader>
        
        <div className="flex-1 rounded-lg overflow-hidden">
          <div ref={mapContainer} className="w-full h-full min-h-[400px]" />
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button onClick={openInMaps} variant="outline" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            Apri in Mappe
          </Button>
          <Button onClick={getDirections} className="flex-1">
            <Navigation className="h-4 w-4 mr-2" />
            Indicazioni
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}