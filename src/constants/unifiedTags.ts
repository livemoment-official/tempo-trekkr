// Unified tag system for moments and profiles
// This ensures consistency across the app for AI recommendations

export const MOMENT_CATEGORIES = [
  "🍽️ Aperitivo", "🍷 Cena", "☕ Caffè", "⚽ Sport", "🎨 Arte", "🎵 Musica", 
  "🎬 Cinema", "🎭 Teatro", "🛍️ Shopping", "🌳 Natura", "📸 Fotografia", "✈️ Viaggio",
  "📚 Studio", "💼 Lavoro", "😌 Relax", "🎉 Festa", "🏛️ Cultura", "🎮 Gaming"
] as const;

export const MOOD_TAGS = [
  "Chill", "Energico", "Avventuroso", "Creativo", "Romantico", 
  "Divertente", "Rilassato", "Determinato", "Curioso", "Spontaneo",
  "Introspettivo", "Sociale", "Felice", "Motivato"
] as const;

export const JOB_CATEGORIES = [
  "Studente", "Freelancer", "Designer", "Sviluppatore", "Manager",
  "Artista", "Insegnante", "Medico", "Avvocato", "Ingegnere",
  "Marketing", "Vendite", "Finanza", "HR", "Consulente",
  "Imprenditore", "Personal Trainer", "Chef", "Fotografo", "Musicista"
] as const;

export const INTERESTS_TAGS = [
  // Sport & Fitness
  "Calcio", "Tennis", "Palestra", "Running", "Yoga", "Nuoto", "Ciclismo",
  "Arrampicata", "Surf", "Sci", "Basket", "Pallavolo",
  
  // Arte & Cultura
  "Pittura", "Scultura", "Disegno", "Musei", "Storia", "Architettura",
  "Design", "Moda", "Letteratura", "Poesia", "Scrittura",
  
  // Musica & Spettacolo
  "Rock", "Pop", "Jazz", "Classica", "Elettronica", "Hip Hop",
  "Concerti", "DJ", "Karaoke", "Ballo", "Teatro", "Stand-up",
  
  // Tecnologia
  "AI", "Programmazione", "Startup", "Gaming", "Tech", "Crypto",
  "Social Media", "App Development", "Data Science",
  
  // Food & Drink
  "Cucina", "Vino", "Birra", "Cocktail", "Street Food", "Vegano",
  "Pasticceria", "Sushi", "Pizza", "Aperitivi",
  
  // Lifestyle
  "Meditation", "Mindfulness", "Sostenibilità", "Minimal", "DIY",
  "Giardinaggio", "Animali", "Volontariato", "Charity",
  
  // Hobby
  "Fotografia", "Video", "Podcast", "Blog", "Collezionismo",
  "Giochi da tavolo", "Puzzle", "Lettura", "Fumetti", "Anime"
] as const;

export type MomentCategory = typeof MOMENT_CATEGORIES[number];
export type MoodTag = typeof MOOD_TAGS[number];
export type JobCategory = typeof JOB_CATEGORIES[number];
export type InterestTag = typeof INTERESTS_TAGS[number];

// Helper functions
export const getAllTags = () => [
  ...MOMENT_CATEGORIES,
  ...MOOD_TAGS,
  ...JOB_CATEGORIES,
  ...INTERESTS_TAGS
];

export const getTagsByCategory = () => ({
  moments: MOMENT_CATEGORIES,
  moods: MOOD_TAGS,
  jobs: JOB_CATEGORIES,
  interests: INTERESTS_TAGS
});

export const isValidTag = (tag: string): boolean => {
  return getAllTags().includes(tag as any);
};