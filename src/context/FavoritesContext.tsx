// FavoritesContext.tsx

"use client";

import React, {createContext, useState, useContext, ReactNode} from 'react';
import { Dog } from '@/lib/types';

// Interface context for favorite dogs
interface FavoritesContextType {
    favorites: Dog[];
    favoriteIds: Set<string>;
    addFavorite: (dog: Dog) => void;
    removeFavorite: (dogId: string) => void;
    toggleFavorite: (dog: Dog) => void;
    isFavorite: (dogID: string) => boolean;
    clearFavorites: () => void;
}

// Context with default values
const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    favoriteIds: new Set<string>(),
    addFavorite: () => {},
    removeFavorite: () => {},
    toggleFavorite: () => {},
    isFavorite: () => false,
    clearFavorites: () => {},
});

// Provider component
export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<Dog[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set<string>());
  
    const addFavorite = (dog: Dog) => {
      if (!favoriteIds.has(dog.id)) {
        setFavorites(prev => [...prev, dog]);
        setFavoriteIds(prev => new Set(prev).add(dog.id));
      }
    };
  
    const removeFavorite = (dogId: string) => {
      setFavorites(prev => prev.filter(dog => dog.id !== dogId));
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(dogId);
        return newSet;
      });
    };
  
    const toggleFavorite = (dog: Dog) => {
      if (favoriteIds.has(dog.id)) {
        removeFavorite(dog.id);
      } else {
        addFavorite(dog);
      }
    };
  
    const isFavorite = (dogId: string) => favoriteIds.has(dogId);
  
    const clearFavorites = () => {
      setFavorites([]);
      setFavoriteIds(new Set<string>());
    };
  
    const value = {
      favorites,
      favoriteIds,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,
    };
  
    return (
      <FavoritesContext.Provider value={value}>
        {children}
      </FavoritesContext.Provider>
    );
};

// Custom hook for using the favorites context
export const useFavorites = () => useContext(FavoritesContext);

export default FavoritesContext;