// Mock data utilities for populating the app with realistic content

export const generateUnsplashUrl = (query: string, width = 400, height = 400, seed?: string) => {
  // Use working Unsplash Source API format
  const randomSeed = seed || Math.random().toString(36).substr(2, 9);
  const categoryUrls: Record<string, string> = {
    'sports': `https://picsum.photos/seed/sports-${randomSeed}/${width}/${height}`,
    'food': `https://picsum.photos/seed/food-${randomSeed}/${width}/${height}`,
    'concert': `https://picsum.photos/seed/music-${randomSeed}/${width}/${height}`,
    'art': `https://picsum.photos/seed/art-${randomSeed}/${width}/${height}`,
    'nature': `https://picsum.photos/seed/nature-${randomSeed}/${width}/${height}`,
    'party': `https://picsum.photos/seed/party-${randomSeed}/${width}/${height}`,
    'travel': `https://picsum.photos/seed/travel-${randomSeed}/${width}/${height}`,
    'museum': `https://picsum.photos/seed/museum-${randomSeed}/${width}/${height}`,
    'movie': `https://picsum.photos/seed/cinema-${randomSeed}/${width}/${height}`,
    'shopping': `https://picsum.photos/seed/shopping-${randomSeed}/${width}/${height}`
  };
  
  return categoryUrls[query] || `https://picsum.photos/seed/${query}-${randomSeed}/${width}/${height}`;
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
  const participantCount = Math.floor(Math.random() * 15) + 3; // Minimum 3 participants
  const maxParticipants = participantCount + Math.floor(Math.random() * 15) + 5;
  
  const momentTitles: Record<string, string[]> = {
    sport: ['Calcetto serale ⚽', 'Corsa mattutina al parco 🏃‍♀️', 'Beach volley al tramonto 🏐', 'Tennis doppio al circolo 🎾', 'Padel con aperitivo 🥂', 'Yoga all\'alba in spiaggia 🧘‍♀️'],
    cibo: ['Aperitivo vista duomo 🥂', 'Cena sushi & sake 🍣', 'Pizza napoletana autentica 🍕', 'Brunch domenicale gourmet 🥐', 'Degustazione vini naturali 🍷', 'Cooking class pasta fresca 👨‍🍳'],
    musica: ['Jazz live al Blue Note 🎷', 'Karaoke night & cocktails 🎤', 'Festival indie underground 🎸', 'Serata vinili vintage 📀', 'Concerto in Villa San Martino 🎼', 'Jam session spontanea 🥁'],
    arte: ['Mostra Palazzo Reale 🏛️', 'Vernissage Brera district 🖼️', 'Workshop ceramica creativa 🏺', 'Street art tour Isola 🎨', 'Laboratorio stampa artistica 🖨️', 'Performance art contemporanea 🎭'],
    natura: ['Trekking Cinque Terre 🥾', 'Picnic botanico Parco Lambro 🌳', 'Birdwatching delta del Po 🦅', 'Fotosafari Alba in montagna 📸', 'Foraging erbe spontanee 🌿', 'Gita in barca sul lago 🚤'],
    festa: ['Rooftop party Milano skyline 🌃', 'Pool party villa privata 🏊‍♀️', 'Silent disco Parco Sempione 🎧', 'Festa anni \'80 vintage 💿', 'Beach party Riviera 🏖️', 'Aperitivo in terrazza 🥂'],
    viaggio: ['Weekend Como & Bellagio ⛵', 'Gita Cinque Terre express 🚂', 'Tour enogastronomico Langhe 🍇', 'Escursione laghi bergamaschi 🏔️', 'Road trip costa ligure 🚗', 'Gita Venezia in giornata 🚤'],
    cultura: ['Visita Pinacoteca Brera 🏛️', 'Tour centro storico Milano 🚶‍♀️', 'Lettura poetica Navigli 📚', 'Conferenza design week 🏗️', 'Teatro alla Scala 🎭', 'Mostra Leonardo da Vinci 🎨'],
    cinema: ['Cinema all\'aperto Porta Venezia 🎬', 'Cineforum d\'autore 🎞️', 'Maratona Tarantino 🍿', 'Documentario natura IMAX 🌍', 'Film festival cortometraggi 🏆', 'Drive-in vintage 🚗'],
    shopping: ['Vintage market Navigli 👗', 'Outlet Serravalle weekend 🛍️', 'Mercatino Brera antiques 🕰️', 'Shopping sostenibile Isola ♻️', 'Fashion week showroom 👔', 'Artigianato locale San Lorenzo 🎨']
  };

  const momentDescriptions: Record<string, string[]> = {
    sport: [
      'Unisciti per una partita amichevole! Livello principiante-intermedio, divertimento garantito.',
      'Allenamento cardio in gruppo con vista panoramica. Porta solo la voglia di muoverti!',
      'Torneo amichevole con premiazione simbolica. Ambiente rilassato e socializzazione post-partita.',
      'Lezione di gruppo seguita da aperitivo. Perfetto per principianti e esperti.'
    ],
    cibo: [
      'Scopriamo insieme i sapori autentici della tradizione italiana con chef stellato.',
      'Degustazione guidata con sommelier qualificato. Include antipasti e finger food.',
      'Corso di cucina hands-on seguito da cena conviviale. Ricette da portare a casa!',
      'Menu degustazione in location esclusiva. Atmosfera intima e rilassante.'
    ],
    musica: [
      'Serata musicale con artisti emergenti e cocktail signature. Vibes uniche garantite.',
      'Concerto acustico in location storica. Atmosfera magica e suoni d\'autore.',
      'Live session con possibilità di jam. Porta il tuo strumento se ne hai uno!',
      'Festival di musica indipendente con food truck e artigianato locale.'
    ],
    arte: [
      'Visita guidata da esperto d\'arte con focus su opere contemporanee.',
      'Workshop creativo seguito da aperitivo in galleria. Materiali inclusi.',
      'Tour esclusivo con accesso a opere private. Gruppi limitati per esperienza intima.',
      'Laboratorio artistico con tecniche tradizionali. Porta a casa la tua opera!'
    ],
    natura: [
      'Escursione panoramica con guida naturalistica. Difficoltà media, pranzo al sacco.',
      'Esperienza immersiva nella natura con attività di mindfulness e relax.',
      'Trekking fotografico con workshop tecnico. Perfetto per immortalare paesaggi unici.',
      'Gita ecologica con focus su sostenibilità e biodiversità locale.'
    ],
    festa: [
      'Festa esclusiva con DJ set, cocktail premium e vista mozzafiato sulla città.',
      'Pool party in villa privata con catering gourmet e animazione.',
      'Serata tematica con dress code vintage. Premi per i migliori outfit!',
      'Party in location unica con sorprese durante la serata. Divertimento assicurato!'
    ],
    viaggio: [
      'Gita organizzata con trasporto incluso e guida locale esperta.',
      'Weekend rilassante con pernottamento in location suggestiva.',
      'Tour enogastronomico con degustazioni presso produttori locali.',
      'Escursione giornaliera con attività outdoor e pranzo tipico.'
    ],
    cultura: [
      'Visita culturale con accesso esclusivo e guida specializzata.',
      'Evento culturale con dibattito e networking post-visita.',
      'Esperienza immersiva nella storia e tradizioni locali.',
      'Tour tematico con focus su aspetti poco conosciuti della città.'
    ],
    cinema: [
      'Proiezione all\'aperto con popcorn gourmet e atmosfera magica.',
      'Cineforum con discussione post-film e aperitivo tematico.',
      'Maratona cinematografica con pause pranzo e cena incluse.',
      'Esperienza cinematografica immersiva con tecnologia all\'avanguardia.'
    ],
    shopping: [
      'Tour dello shopping con personal shopper e sconti esclusivi.',
      'Mercato vintage con pezzi unici e prezzi accessibili.',
      'Shopping experience con focus su brand sostenibili e locali.',
      'Caccia al tesoro negli outlet con premi per i migliori affari!'
    ]
  };
  
  const titles = momentTitles[type] || ['Momento speciale ✨'];
  const descriptions = momentDescriptions[type] || ['Un\'esperienza indimenticabile ti aspetta!'];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // Generate time (next 7 days, realistic hours)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 7) + 1);
  futureDate.setHours(Math.floor(Math.random() * 12) + 10); // Between 10:00 and 22:00
  futureDate.setMinutes([0, 15, 30, 45][Math.floor(Math.random() * 4)]);
  
  return {
    id: id || Math.random().toString(36).substr(2, 9),
    title,
    description,
    image_url: generateActivityPhotoUrl(type),
    category: type.charAt(0).toUpperCase() + type.slice(1),
    mood: moods[Math.floor(Math.random() * moods.length)],
    location: italianLocations[Math.floor(Math.random() * italianLocations.length)],
    date: futureDate.toISOString(),
    organizer,
    participant_count: participantCount,
    max_participants: maxParticipants,
    reactions: {
      likes: Math.floor(Math.random() * 25) + 5,
      hearts: Math.floor(Math.random() * 18) + 3,
      fire: Math.floor(Math.random() * 12) + 1,
      stars: Math.floor(Math.random() * 8) + 1
    },
    tags: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => 
      interests[Math.floor(Math.random() * interests.length)]
    ),
    created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    is_featured: Math.random() > 0.7,
    photos: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => 
      generateActivityPhotoUrl(type)
    ),
    price: Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 10 : 0,
    duration_hours: Math.floor(Math.random() * 4) + 1
  };
};

export const generateMockUsers = (count: number) => {
  return Array.from({ length: count }, (_, i) => generateMockUser(i + 1));
};

export const generateMockMoments = (count: number) => {
  return Array.from({ length: count }, (_, i) => generateMockMoment(i + 1));
};