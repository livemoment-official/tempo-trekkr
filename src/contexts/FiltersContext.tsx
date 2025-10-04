import { createContext, useContext, useState, ReactNode } from 'react';

interface FiltersState {
  category: string | null;
  subcategories: string[];
  ageRange: [number, number];
  maxDistance: number;
  mood: string | null;
}

interface FiltersContextType {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  view: 'list' | 'map';
  setView: (view: 'list' | 'map') => void;
}

const defaultFilters: FiltersState = {
  category: null,
  subcategories: [],
  ageRange: [18, 65],
  maxDistance: 50,
  mood: null
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [view, setView] = useState<'list' | 'map'>('list');

  return (
    <FiltersContext.Provider value={{ filters, setFilters, view, setView }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}
