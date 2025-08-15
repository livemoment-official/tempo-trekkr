import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, List } from "lucide-react";
import { MomentCard } from "@/components/moments/MomentCard";
import { MomentFilters } from "@/components/moments/MomentFilters";
import { MomentsMap } from "@/components/moments/MomentsMap";
export default function MomentiEventi() {
  const location = useLocation();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/momenti";
  const [view, setView] = useState<'list' | 'map'>('list');

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Mock moments data - in real app, fetch from Supabase
  const mockMoments = [{
    id: '1',
    title: 'Aperitivo al tramonto sui Navigli',
    description: 'Unisciti a noi per un aperitivo rilassante mentre guardiamo il tramonto sui Navigli!',
    image: '/api/placeholder/400/600',
    category: 'aperitivo',
    time: 'Oggi 18:30',
    location: 'Navigli, Milano',
    organizer: {
      name: 'Marco R.',
      avatar: ''
    },
    participants: 12,
    maxParticipants: 20,
    reactions: {
      hearts: 24,
      likes: 18,
      stars: 15,
      fire: 8
    },
    mood: 'Rilassato'
  }, {
    id: '2',
    title: 'Calcetto nel parco',
    description: 'Partita di calcetto casual per tutti i livelli. Porta solo la voglia di divertirti!',
    image: '/api/placeholder/400/600',
    category: 'calcio',
    time: 'Oggi 20:00',
    location: 'Parco Sempione, Milano',
    organizer: {
      name: 'Luca M.',
      avatar: ''
    },
    participants: 14,
    maxParticipants: 22,
    reactions: {
      hearts: 12,
      likes: 28,
      stars: 9,
      fire: 15
    },
    mood: 'Energico'
  }, {
    id: '3',
    title: 'Festa in casa con DJ set',
    description: 'House party con musica elettronica, drinks e atmosfera fantastica!',
    image: '/api/placeholder/400/600',
    category: 'feste',
    time: 'Sabato 21:30',
    location: 'Brera, Milano',
    organizer: {
      name: 'Sofia B.',
      avatar: ''
    },
    participants: 25,
    maxParticipants: 30,
    reactions: {
      hearts: 45,
      likes: 33,
      stars: 28,
      fire: 52
    },
    mood: 'Divertente'
  }, {
    id: '4',
    title: 'Picnic & chitarra al parco',
    description: 'Pomeriggio rilassante con musica acustica, snacks e buona compagnia.',
    image: '/api/placeholder/400/600',
    category: 'natura',
    time: 'Domenica 16:00',
    location: 'Parco Lambro, Milano',
    organizer: {
      name: 'Emma T.',
      avatar: ''
    },
    participants: 8,
    maxParticipants: 15,
    reactions: {
      hearts: 18,
      likes: 12,
      stars: 20,
      fire: 5
    },
    mood: 'Tranquillo'
  }];

  // Filter moments based on selected filters
  const filteredMoments = mockMoments.filter(moment => {
    if (selectedCategory && moment.category !== selectedCategory) return false;
    if (selectedMood && moment.mood !== selectedMood) return false;
    // Add age and distance filtering logic when user data is available
    return true;
  });
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Momenti & Eventi</title>
        <meta name="description" content="Esplora Momenti ed Eventi in lista o su mappa. Filtra per categoria, età, posizione e mood." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      

      {/* Filters */}
      <MomentFilters 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory}
        selectedSubcategories={selectedSubcategories}
        onSubcategoriesChange={setSelectedSubcategories}
        ageRange={ageRange} 
        onAgeRangeChange={setAgeRange} 
        maxDistance={maxDistance} 
        onMaxDistanceChange={setMaxDistance} 
        selectedMood={selectedMood} 
        onMoodChange={setSelectedMood} 
      />

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button variant={view === 'list' ? 'default' : 'secondary'} size="sm" onClick={() => setView('list')}>
          <List className="h-4 w-4 mr-2" />
          Lista
        </Button>
        <Button variant={view === 'map' ? 'default' : 'secondary'} size="sm" onClick={() => setView('map')}>
          <MapPin className="h-4 w-4 mr-2" />
          Mappa
        </Button>
      </div>

      {/* Content */}
      {view === 'list' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMoments.map(moment => <MomentCard key={moment.id} {...moment} />)}
        </div> : <MomentsMap />}

      {filteredMoments.length === 0 && <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nessun momento trovato con questi filtri.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {
        setSelectedCategory(null);
        setSelectedMood(null);
        setAgeRange([18, 65]);
        setMaxDistance(50);
      }}>
            Reset Filtri
          </Button>
        </div>}
    </div>;
}