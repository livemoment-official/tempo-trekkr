import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, MessageCircle, Navigation } from "lucide-react";

// Temporary component until Mapbox is properly configured
export function MomentsMap() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);

  // Mock moments data for map
  const mockMoments = [
    {
      id: '1',
      title: 'Aperitivo al tramonto',
      category: 'aperitivo',
      location: { lat: 45.4642, lng: 9.1900, name: 'Navigli, Milano' },
      time: '18:30',
      organizer: { name: 'Marco R.', avatar: '' },
      participants: 8,
      maxParticipants: 15
    },
    {
      id: '2', 
      title: 'Calcetto nel parco',
      category: 'calcio',
      location: { lat: 45.4722, lng: 9.1815, name: 'Parco Sempione' },
      time: '20:00',
      organizer: { name: 'Luca M.', avatar: '' },
      participants: 12,
      maxParticipants: 22
    },
    {
      id: '3',
      title: 'Festa in casa',
      category: 'feste',
      location: { lat: 45.4545, lng: 9.1696, name: 'Brera' },
      time: '21:30',
      organizer: { name: 'Sofia B.', avatar: '' },
      participants: 25,
      maxParticipants: 30
    }
  ];

  const [selectedMoment, setSelectedMoment] = useState<typeof mockMoments[0] | null>(null);

  const getCategoryEmoji = (cat: string) => {
    const categories: Record<string, string> = {
      'calcio': '⚽',
      'aperitivo': '🍺',
      'feste': '🎉',
      'casa': '🏠',
      'sport': '🏃',
      'musica': '🎵',
      'arte': '🎨',
      'cibo': '🍕',
      'natura': '🌿'
    };
    return categories[cat.toLowerCase()] || '✨';
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setShowLocationPrompt(false);
        },
        (error) => {
          console.error('Errore geolocalizzazione:', error);
          setShowLocationPrompt(false);
        }
      );
    }
  };

  return (
    <div className="relative h-[70vh] w-full">
      {/* Temporary Map Placeholder */}
      <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-sky-50">
          {/* Grid lines to simulate map */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(10)].map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-gray-300" style={{ top: `${i * 10}%` }} />
            ))}
            {[...Array(10)].map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-gray-300" style={{ left: `${i * 10}%` }} />
            ))}
          </div>
          
          {/* Location markers */}
          {mockMoments.map((moment, index) => (
            <div
              key={moment.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ 
                left: `${30 + index * 20}%`, 
                top: `${40 + index * 15}%` 
              }}
              onClick={() => setSelectedMoment(moment)}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                  <span className="text-lg">{getCategoryEmoji(moment.category)}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
                
                {/* Pulse animation */}
                <div className="absolute inset-0 w-12 h-12 bg-primary rounded-full animate-ping opacity-30"></div>
              </div>
            </div>
          ))}

          {/* User location */}
          {userLocation && (
            <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '50%' }}>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
                <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Location Permission Prompt */}
        {showLocationPrompt && (
          <div className="absolute top-4 left-4 right-4">
            <Card className="bg-background/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Navigation className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Attiva la posizione</p>
                    <p className="text-xs text-muted-foreground">Per vedere i momenti più vicini a te</p>
                  </div>
                  <Button size="sm" onClick={requestLocation}>
                    Attiva
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map Info Popup */}
        {selectedMoment && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-background/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{getCategoryEmoji(selectedMoment.category)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{selectedMoment.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{selectedMoment.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{selectedMoment.participants}/{selectedMoment.maxParticipants}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">{selectedMoment.location.name}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedMoment(null)}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedMoment.organizer.avatar} />
                          <AvatarFallback className="text-xs">{selectedMoment.organizer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{selectedMoment.organizer.name}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" className="h-8 px-3 text-xs">
                          Partecipa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map Notice */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 max-w-xs">
            <p className="text-sm text-muted-foreground">
              Mappa interattiva in arrivo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Clicca sui pin per vedere i dettagli
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}