import React, { useEffect, useRef, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, MessageCircle, Navigation, AlertCircle } from "lucide-react";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";
import { useAuth } from "@/contexts/AuthContext";

interface MomentMapProps {
  moments?: Array<{
    id: string;
    title: string;
    description?: string;
    when_at?: string;
    place?: {
      lat: number;
      lng: number;
      name: string;
      address?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    host?: {
      name: string;
      avatar_url?: string;
    };
    participants?: string[];
    max_participants?: number;
    mood_tag?: string;
  }>;
  onMomentClick?: (momentId: string) => void;
}

export function MomentsMap({ moments = [], onMomentClick }: MomentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { user } = useAuth();
  const { location, permission, requestLocation, updateLocationInProfile } = useUnifiedGeolocation();
  const [selectedMoment, setSelectedMoment] = useState<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Get Mapbox token from Edge Function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data.success && data.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        // Keep placeholder token to show configuration message
        setMapboxToken('pk.your_mapbox_token_here');
      }
    };

    fetchMapboxToken();
  }, []);

  // Request location permission if not granted
  useEffect(() => {
    if (permission === 'prompt') {
      // Auto-request location for better UX
      // requestLocation();
    }
  }, [permission, requestLocation]);

  // Save location to profile when obtained
  useEffect(() => {
    if (location && user) {
      updateLocationInProfile(location);
    }
  }, [location, user, updateLocationInProfile]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken || mapboxToken === 'pk.your_mapbox_token_here') return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: location ? [location.lng, location.lat] : [9.1900, 45.4642], // Default to Milan
      zoom: location ? 14 : 12,
      pitch: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add user location marker if available
    if (location) {
      new mapboxgl.Marker({
        color: '#3b82f6'
      })
      .setLngLat([location.lng, location.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML('<div class="text-sm font-medium">La tua posizione</div>')
      )
      .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, location]);

  // Add moment markers
  useEffect(() => {
    if (!map.current || !moments.length) return;

    // Clear existing markers (in real implementation, you'd manage markers better)
    const markers: mapboxgl.Marker[] = [];

    moments.forEach((moment) => {
      // Handle both coordinate formats: place.lat/lng and place.coordinates.lat/lng
      const lat = moment.place?.lat || moment.place?.coordinates?.lat;
      const lng = moment.place?.lng || moment.place?.coordinates?.lng;
      
      if (!lat || !lng) return;

      const markerEl = document.createElement('div');
      markerEl.className = 'moment-marker';
      markerEl.innerHTML = `
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-110 transition-transform shadow-lg">
          ${getMoodEmoji(moment.mood_tag)}
        </div>
      `;

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Add click handler
      markerEl.addEventListener('click', () => {
        setSelectedMoment(moment);
        onMomentClick?.(moment.id);
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [moments, onMomentClick]);

  const getMoodEmoji = (mood?: string) => {
    const moods: Record<string, string> = {
      'chill': '😌',
      'party': '🎉',
      'sport': '⚽',
      'cultura': '🎭',
      'aperitivo': '🍹',
      'musica': '🎵',
      'arte': '🎨',
      'cibo': '🍽️'
    };
    return moods[mood || 'chill'] || '📍';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (mapboxToken === 'pk.your_mapbox_token_here') {
    return (
      <div className="relative w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-2">Mapbox Token Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Per visualizzare la mappa è necessario configurare un token Mapbox. 
                Il token è stato aggiunto ai secrets di Supabase.
              </p>
              <p className="text-xs text-muted-foreground">
                Registrati su mapbox.com per ottenere un token gratuito e configuralo nei secrets di Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      {/* Location Permission Banner */}
      {permission === 'prompt' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="bg-background/95 backdrop-blur-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <Navigation className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Attiva la geolocalizzazione</p>
                <p className="text-xs text-muted-foreground">
                  Per vedere gli eventi vicini a te
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={requestLocation}
              >
                Attiva
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />

      {/* Selected Moment Popup */}
      {selectedMoment && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {getMoodEmoji(selectedMoment.mood_tag)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">
                    {selectedMoment.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    {selectedMoment.when_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(selectedMoment.when_at)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {selectedMoment.participants?.length || 0}
                        {selectedMoment.max_participants && `/${selectedMoment.max_participants}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedMoment.place?.name}</span>
                    </div>
                  </div>
                  {selectedMoment.host && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedMoment.host.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {selectedMoment.host.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        Organizzato da {selectedMoment.host.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => onMomentClick?.(selectedMoment.id)}>
                    Dettagli
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMoment(null)}
                  >
                    Chiudi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}