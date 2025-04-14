// src/components/FavoritesList.tsx

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useFavorites } from '@/context/FavoritesContext';
import { matchDog } from '@/lib/api';

interface FavoritesListProps {
  onMatchGenerated: (matchedDogId: string) => void;
  brandColors: {
    purple: string;
    orange: string;
  };
}

const FavoritesList: React.FC<FavoritesListProps> = ({ 
  onMatchGenerated,
  brandColors
}) => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMatch = async () => {
    if (favorites.length === 0) {
      setError('Please add at least one dog to your favorites before generating a match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const favoriteIds = favorites.map(dog => dog.id);
      const matchResult = await matchDog(favoriteIds);
      onMatchGenerated(matchResult.match);
    } catch (err) {
      console.error('Error generating match:', err);
      setError('Failed to generate a match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="mb-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">
          You haven't added any dogs to your favorites yet.
        </p>
        <p className="text-gray-500 text-sm">
          Click the heart icon on any dog card to add it to your favorites.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4 flex justify-between">
        <button
          onClick={clearFavorites}
          className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Clear All
        </button>
        
        <button
          onClick={handleGenerateMatch}
          disabled={isLoading}
          className="px-3 py-1 text-sm rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            backgroundColor: isLoading ? `${brandColors.orange}80` : brandColors.orange
          }}
        >
          {isLoading ? 'Generating...' : 'Find My Match!'}
        </button>
      </div>
      
      <div className="space-y-3">
        {favorites.map(dog => (
          <div 
            key={dog.id} 
            className="bg-white rounded-lg shadow-sm p-2 flex items-center"
          >
            <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={dog.img}
                alt={`Photo of ${dog.name}`}
                fill
                sizes="48px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            <div className="ml-3 flex-grow min-w-0">
              <p className="font-medium text-gray-800 truncate">{dog.name}</p>
              <p className="text-xs text-gray-500 truncate">{dog.breed}</p>
            </div>
            
            <button
              onClick={() => removeFavorite(dog.id)}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label={`Remove ${dog.name} from favorites`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;