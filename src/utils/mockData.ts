// Mock data utilities for populating the app with realistic content

export const generateUnsplashUrl = (query: string, width = 400, height = 400, seed?: string) => {
  const seedParam = seed ? `&sig=${seed}` : '';
  return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}${seedParam}`;
};

export const generatePersonPhotoUrl = (gender?: 'men' | 'women', id?: number) => {
  const genderPrefix = gender || (Math.random() > 0.5 ? 'men' : 'women');
  const photoId = id || Math.floor(Math.random() * 99) + 1;
  return `https://randomuser.me/api/portraits/${genderPrefix}/${photoId}.jpg`;
};

export const generateActivityPhotoUrl = (activity: string) => {
  const activityMap: Record<string, string> = {
    'sport': 'sports',
    'cibo': 'food',
    'musica': 'concert',
    'arte': 'art',
    'natura': 'nature',
    'festa': 'party',
    'viaggio': 'travel',
    'cultura': 'museum',
    'cinema': 'movie',
    'shopping': 'shopping'
  };
  
  const query = activityMap[activity] || activity;
  return generateUnsplashUrl(query, 600, 400);
};

export const italianNames = [
  'Alessandro', 'Francesca', 'Marco', 'Giulia', 'Luca', 'Chiara',
  'Andrea', 'Elena', 'Matteo', 'Sara', 'Lorenzo', 'Martina',
  'Davide', 'Alessia', 'Simone', 'Federica', 'Giuseppe', 'Valentina',
  'Antonio', 'Giorgia', 'Francesco', 'Alice', 'Roberto', 'Beatrice',
  'Michele', 'Silvia', 'Stefano', 'Elisa', 'Riccardo', 'Veronica'
];

export const italianSurnames = [
  'Rossi', 'Ferrari', 'Russo', 'Bianchi', 'Romano', 'Gallo',
  'Costa', 'Fontana', 'Ricci', 'Marino', 'Greco', 'Bruno',
  'Galli', 'Conti', 'De Luca', 'Mancini', 'Rizzo', 'Lombardi',
  'Moretti', 'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi',
  'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone', 'Longo'
];

export const moods = [
  'Rilassato', 'Energico', 'Creativo', 'Sociale', 
  'Avventuroso', 'Romantico', 'Divertente', 'Tranquillo'
];

export const interests = [
  'Sport', 'Musica', 'Cinema', 'Arte', 'Cucina', 'Viaggi',
  'Fotografia', 'Letteratura', 'Gaming', 'Fitness', 'Yoga',
  'Danza', 'Teatro', 'Moda', 'Tecnologia', 'Natura'
];

export const momentTypes = [
  'sport', 'cibo', 'musica', 'arte', 'natura', 'festa',
  'viaggio', 'cultura', 'cinema', 'shopping'
];

export const italianLocations = [
  'Milano Centro', 'Roma Trastevere', 'Firenze Centro', 'Napoli Chiaia',
  'Torino Centro', 'Bologna San Luca', 'Venezia San Marco', 'Palermo Centro',
  'Genova Porto Antico', 'Verona Arena', 'Padova Centro', 'Bari Vecchia',
  'Catania Centro', 'Perugia Centro', 'Pisa Torre', 'Rimini Marina'
];

export const generateMockUser = (id?: number) => {
  const gender = Math.random() > 0.5 ? 'men' : 'women';
  const firstName = italianNames[Math.floor(Math.random() * italianNames.length)];
  const lastName = italianSurnames[Math.floor(Math.random() * italianSurnames.length)];
  const age = Math.floor(Math.random() * 40) + 18;
  
  return {
    user_id: id || Math.random().toString(36).substr(2, 9),
    name: `${firstName} ${lastName}`,
    username: `${firstName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
    avatar_url: generatePersonPhotoUrl(gender, id),
    age,
    bio: `Ciao! Sono ${firstName}, ${age} anni. Amo ${interests[Math.floor(Math.random() * interests.length)].toLowerCase()} e ${interests[Math.floor(Math.random() * interests.length)].toLowerCase()}.`,
    mood: moods[Math.floor(Math.random() * moods.length)],
    interests: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, () => 
      interests[Math.floor(Math.random() * interests.length)]
    ),
    distance_km: Math.random() * 10 + 0.5,
    last_seen: new Date(Date.now() - Math.random() * 3600000 * 24).toISOString(),
    is_online: Math.random() > 0.7,
    location: italianLocations[Math.floor(Math.random() * italianLocations.length)]
  };
};

export const generateMockMoment = (id?: number) => {
  const type = momentTypes[Math.floor(Math.random() * momentTypes.length)];
  const organizer = generateMockUser();
  const participantCount = Math.floor(Math.random() * 15) + 1;
  const maxParticipants = participantCount + Math.floor(Math.random() * 10) + 5;
  
  const momentTitles: Record<string, string[]> = {
    sport: ['Partita di calcetto', 'Corsa al parco', 'Pallavolo in spiaggia', 'Tennis al circolo'],
    cibo: ['Aperitivo in centro', 'Cena sushi', 'Pizza e birra', 'Brunch domenicale'],
    musica: ['Concerto jazz', 'Serata karaoke', 'Festival indie', 'Live music pub'],
    arte: ['Mostra Palazzo Reale', 'Vernissage galleria', 'Workshop ceramica', 'Tour street art'],
    natura: ['Trekking in montagna', 'Picnic al lago', 'Birdwatching', 'Passeggiata botanico'],
    festa: ['Festa in terrazza', 'Pool party', 'Serata danzante', 'Happy hour rooftop'],
    viaggio: ['Gita a Como', 'Weekend Cinque Terre', 'Tour enogastronomico', 'Escursione laghi'],
    cultura: ['Visita museo', 'Tour centro storico', 'Lettura poetica', 'Conferenza arte'],
    cinema: ['Cinema all\'aperto', 'Cineforum indie', 'Maratona film cult', 'Documentario natura'],
    shopping: ['Vintage market', 'Outlet weekend', 'Mercatino antiquariato', 'Shopping sostenibile']
  };
  
  const titles = momentTitles[type] || ['Momento speciale'];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  return {
    id: id || Math.random().toString(36).substr(2, 9),
    title,
    description: `Un momento fantastico di ${type}! Unisciti a noi per vivere un'esperienza indimenticabile insieme.`,
    image_url: generateActivityPhotoUrl(type),
    category: type,
    mood: moods[Math.floor(Math.random() * moods.length)],
    location: italianLocations[Math.floor(Math.random() * italianLocations.length)],
    date: new Date(Date.now() + Math.random() * 7 * 24 * 3600000).toISOString(),
    organizer,
    participant_count: participantCount,
    max_participants: maxParticipants,
    reactions: {
      likes: Math.floor(Math.random() * 50),
      hearts: Math.floor(Math.random() * 30),
      wow: Math.floor(Math.random() * 20)
    },
    tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      `#${interests[Math.floor(Math.random() * interests.length)].toLowerCase()}`
    ),
    created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    is_featured: Math.random() > 0.8,
    photos: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => 
      generateActivityPhotoUrl(type)
    )
  };
};

export const generateMockUsers = (count: number) => {
  return Array.from({ length: count }, (_, i) => generateMockUser(i + 1));
};

export const generateMockMoments = (count: number) => {
  return Array.from({ length: count }, (_, i) => generateMockMoment(i + 1));
};