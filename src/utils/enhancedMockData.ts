// Enhanced mock data for a more populated app experience

export const mockUserProfiles = [
  {
    id: "user-1",
    name: "Sofia Romano",
    avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b4fd?w=400&h=400&fit=crop&crop=face",
    city: "Milano Centro",
    is_available: true,
    preferred_moments: ["Aperitivo", "Shopping", "Concerti"],
    age: 26,
    distance_km: 0.8
  },
  {
    id: "user-2", 
    name: "Marco Bianchi",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    city: "Milano Porta Nuova",
    is_available: false,
    preferred_moments: ["Calcio", "Palestra", "Birra"],
    age: 29,
    distance_km: 1.2
  },
  {
    id: "user-3",
    name: "Giulia Ferretti",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    city: "Milano Brera",
    is_available: true,
    preferred_moments: ["Arte", "Mostre", "Caffè"],
    age: 24,
    distance_km: 2.1
  },
  {
    id: "user-4",
    name: "Alessandro Rossi",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    city: "Milano Navigli",
    is_available: true,
    preferred_moments: ["Musica live", "Cocktail", "Cinema"],
    age: 31,
    distance_km: 2.8
  },
  {
    id: "user-5",
    name: "Francesca Martini",
    avatar_url: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
    city: "Milano Isola",
    is_available: false,
    preferred_moments: ["Yoga", "Brunch", "Lettura"],
    age: 27,
    distance_km: 3.2
  },
  {
    id: "user-6",
    name: "Luca Conti",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    city: "Milano Porta Romana",
    is_available: true,
    preferred_moments: ["Running", "Tennis", "Viaggi"],
    age: 33,
    distance_km: 4.1
  },
  {
    id: "user-7",
    name: "Chiara Santoro",
    avatar_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
    city: "Milano Sempione",
    is_available: true,
    preferred_moments: ["Food", "Cucina", "Wine tasting"],
    age: 28,
    distance_km: 1.9
  },
  {
    id: "user-8",
    name: "Davide Ferrari",
    avatar_url: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face",
    city: "Milano Lambrate",
    is_available: false,
    preferred_moments: ["Gaming", "Tech", "Startup"],
    age: 25,
    distance_km: 5.4
  },
  {
    id: "user-9",
    name: "Valentina Greco",
    avatar_url: "https://images.unsplash.com/photo-1464863979621-258859e62245?w=400&h=400&fit=crop&crop=face",
    city: "Milano Garibaldi",
    is_available: true,
    preferred_moments: ["Danza", "Teatro", "Fotografia"],
    age: 26,
    distance_km: 2.7
  },
  {
    id: "user-10",
    name: "Roberto Galli",
    avatar_url: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
    city: "Milano Città Studi",
    is_available: true,
    preferred_moments: ["Lettura", "Mostre", "Discussioni"],
    age: 30,
    distance_km: 6.2
  }
];

export const mockMomentPhotos = [
  {
    id: "moment-1",
    photos: [
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop", // Group dining
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop", // Friends laughing
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop"  // Outdoor gathering
    ]
  },
  {
    id: "moment-2", 
    photos: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", // Concert crowd
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop", // Live music
      "https://images.unsplash.com/photo-1471756576436-7bbeb95b8721?w=800&h=600&fit=crop"  // Festival
    ]
  },
  {
    id: "moment-3",
    photos: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop", // Sports activity  
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop", // Running group
      "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop"  // Outdoor workout
    ]
  }
];

export const mockInvites = [
  {
    id: "invite-1",
    title: "Aperitivo al Duomo",
    description: "Aperitivo con vista panoramica sui tetti di Milano. Ambiente rilassato e cocktail premium.",
    sender: mockUserProfiles[0], // Sofia Romano
    recipient_id: "current-user",
    status: "pending",
    when_at: "2024-08-22T18:30:00.000Z",
    place: {
      name: "Terrazza Duomo 21",
      address: "Via Giuseppe Mengoni, 4, Milano"
    },
    participants: [mockUserProfiles[0], mockUserProfiles[2]],
    created_at: "2024-08-21T10:30:00.000Z",
    type: "aperitivo"
  },
  {
    id: "invite-2", 
    title: "Calcetto serale ⚽",
    description: "Partita amichevole al tramonto. Livello principiante-intermedio, divertimento garantito!",
    sender: mockUserProfiles[1], // Marco Bianchi
    recipient_id: "current-user",
    status: "pending",
    when_at: "2024-08-23T19:00:00.000Z",
    place: {
      name: "Centro Sportivo Isola",
      address: "Via Borsieri, 12, Milano"
    },
    participants: [mockUserProfiles[1], mockUserProfiles[3], mockUserProfiles[5]],
    created_at: "2024-08-21T14:15:00.000Z",
    type: "sport"
  },
  {
    id: "invite-3",
    title: "Mostra d'arte contemporanea 🎨",
    description: "Visitiamo insieme l'ultima mostra di Palazzo Reale. Tour guidato e aperitivo culturale.",
    sender: mockUserProfiles[2], // Giulia Ferretti
    recipient_id: "current-user", 
    status: "pending",
    when_at: "2024-08-24T15:00:00.000Z",
    place: {
      name: "Palazzo Reale",
      address: "Piazza del Duomo, 12, Milano"
    },
    participants: [mockUserProfiles[2], mockUserProfiles[8]],
    created_at: "2024-08-21T09:45:00.000Z",
    type: "arte"
  },
  {
    id: "invite-4",
    title: "Jazz night al Blue Note 🎷",
    description: "Serata jazz con cocktail signature. Musica dal vivo e atmosfera unica.",
    sender: mockUserProfiles[3], // Alessandro Rossi
    recipient_id: "current-user",
    status: "pending", 
    when_at: "2024-08-25T21:00:00.000Z",
    place: {
      name: "Blue Note Milano",
      address: "Via Borsieri, 37, Milano"
    },
    participants: [mockUserProfiles[3], mockUserProfiles[6]],
    created_at: "2024-08-21T16:20:00.000Z",
    type: "musica"
  },
  {
    id: "invite-5",
    title: "Brunch domenicale 🥐",
    description: "Brunch gourmet in location trendy. Menù ricco e atmosfera rilassante per iniziare bene la domenica.",
    sender: mockUserProfiles[4], // Francesca Martini
    recipient_id: "current-user",
    status: "pending",
    when_at: "2024-08-25T11:30:00.000Z", 
    place: {
      name: "Pavé Milano",
      address: "Via Felice Casati, 27, Milano"
    },
    participants: [mockUserProfiles[4], mockUserProfiles[7], mockUserProfiles[9]],
    created_at: "2024-08-21T12:10:00.000Z",
    type: "cibo"
  }
];

export const getRandomUserProfiles = (count: number = 10) => {
  const shuffled = [...mockUserProfiles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getMockInvites = () => {
  return mockInvites;
};