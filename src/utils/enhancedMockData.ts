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

export const getRandomUserProfiles = (count: number = 10) => {
  const shuffled = [...mockUserProfiles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};