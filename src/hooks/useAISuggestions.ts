import { useState, useCallback } from "react";
import { MOMENT_CATEGORIES } from "@/constants/unifiedTags";

interface GenerateSuggestionsParams {
  photo?: File;
  location?: string;
  time?: string;
}

export function useAISuggestions() {
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Predefined suggestions based on common patterns
  const getTimeBasedSuggestions = (location?: string): string[] => {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    const baseSuggestions = [];
    
    if (hour >= 6 && hour < 12) {
      baseSuggestions.push("Colazione insieme", "Corsa mattutina", "Mercato del sabato");
    } else if (hour >= 12 && hour < 17) {
      baseSuggestions.push("Pranzo spontaneo", "Passeggiata", "Aperitivo anticipato");
    } else if (hour >= 17 && hour < 21) {
      baseSuggestions.push("Aperitivo", "Cena fuori", "Cinema stasera");
    } else {
      baseSuggestions.push("Serata tra amici", "Drink notturno", "Party improvvisato");
    }

    if (isWeekend) {
      baseSuggestions.push("Weekend speciale", "Gita fuori porta", "Brunch domenicale");
    }

    if (location) {
      baseSuggestions.push(`Ci vediamo ${location}`, `Incontro ${location}`);
    }

    return baseSuggestions.slice(0, 5);
  };

  const getLocationBasedCategories = (location?: string): string[] => {
    const locationLower = location?.toLowerCase() || "";
    const suggestions = [];

    if (locationLower.includes("bar") || locationLower.includes("pub")) {
      suggestions.push("Aperitivi", "Socializzazione");
    } else if (locationLower.includes("ristorante") || locationLower.includes("pizza")) {
      suggestions.push("Cibo", "Cena");
    } else if (locationLower.includes("parco") || locationLower.includes("natura")) {
      suggestions.push("Outdoor", "Sport");
    } else if (locationLower.includes("cinema") || locationLower.includes("teatro")) {
      suggestions.push("Cultura", "Arte");
    } else if (locationLower.includes("spiaggia") || locationLower.includes("mare")) {
      suggestions.push("Spiaggia", "Outdoor");
    } else {
      suggestions.push("Socializzazione", "Spontaneo");
    }

    return suggestions.filter(cat => MOMENT_CATEGORIES.includes(cat)).slice(0, 3);
  };

  const generateSuggestions = useCallback(async (params: GenerateSuggestionsParams) => {
    setIsGenerating(true);
    
    try {
      // For now, use smart heuristics instead of AI API
      // This can be enhanced later with actual AI integration
      
      const titleSugs = getTimeBasedSuggestions(params.location);
      const categorySugs = getLocationBasedCategories(params.location);
      
      setTitleSuggestions(titleSugs);
      setCategorySuggestions(categorySugs);
      
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to basic suggestions
      setTitleSuggestions(["Momento speciale", "Incontro spontaneo", "Serata insieme"]);
      setCategorySuggestions(["Socializzazione", "Spontaneo"]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setTitleSuggestions([]);
    setCategorySuggestions([]);
  }, []);

  return {
    titleSuggestions,
    categorySuggestions,
    isGenerating,
    generateSuggestions,
    clearSuggestions
  };
}