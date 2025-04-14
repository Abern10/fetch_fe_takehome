// src/components/DogCard.tsx

"use client";

import React from 'react';
import Image from 'next/image';
import { Dog } from '@/lib/types';
import { useFavorites } from '@/context/FavoritesContext';

interface DogCardProps {
  dog: Dog;
  brandColors: {
    purple: string;
    orange: string;
  };
}

const DogCard: React.FC<DogCardProps> = ({ dog, brandColors }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(dog.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="relative h-48 w-full">
          <Image
            src={dog.img}
            alt={`Photo of ${dog.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        <button
          onClick={() => toggleFavorite(dog)}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md text-lg"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          style={{ color: isFav ? brandColors.orange : '#9ca3af' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isFav ? "0" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{dog.name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            {dog.breed}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {dog.age} {dog.age === 1 ? 'year' : 'years'} old
          </span>
        </div>
        
        <div className="text-gray-600 flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {dog.zip_code}
        </div>
      </div>
    </div>
  );
};

export default DogCard;