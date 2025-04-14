// src/components/SearchFilters.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { getBreeds } from '@/lib/api';

interface SearchFiltersProps {
  selectedBreeds: string[];
  onBreedsChange: (breeds: string[]) => void;
  ageMin: number | undefined;
  ageMax: number | undefined;
  onAgeMinChange: (age: number | undefined) => void;
  onAgeMaxChange: (age: number | undefined) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onApplyFilters: () => void;
  brandColors: {
    purple: string;
    orange: string;
  };
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedBreeds,
  onBreedsChange,
  ageMin,
  ageMax,
  onAgeMinChange,
  onAgeMaxChange,
  sortOrder,
  onSortOrderChange,
  onApplyFilters,
  brandColors,
}) => {
  // State to store all available breeds
  const [breeds, setBreeds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the multi-select dropdown
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch breeds on component mount
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const breedsData = await getBreeds();
        setBreeds(breedsData);
      } catch (err) {
        console.error('Error fetching breeds:', err);
        setError('Failed to load dog breeds. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBreeds();
  }, []);
  
  // Filter breeds based on search term
  const filteredBreeds = breeds.filter(breed => 
    breed.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Toggle breed selection
  const toggleBreed = (breed: string) => {
    if (selectedBreeds.includes(breed)) {
      onBreedsChange(selectedBreeds.filter(b => b !== breed));
    } else {
      onBreedsChange([...selectedBreeds, breed]);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {/* Breed Filter */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Breed
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full p-2 border border-gray-300 rounded-md bg-white flex justify-between items-center text-sm"
            onClick={() => setIsBreedDropdownOpen(!isBreedDropdownOpen)}
          >
            <span className="truncate">
              {selectedBreeds.length === 0
                ? 'Select breeds'
                : `${selectedBreeds.length} breed${selectedBreeds.length === 1 ? '' : 's'} selected`}
            </span>
            <span>{isBreedDropdownOpen ? '▲' : '▼'}</span>
          </button>
          
          {isBreedDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {/* Search input */}
              <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search breeds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              {/* Loading state */}
              {isLoading && (
                <div className="p-3 text-center text-gray-500">Loading breeds...</div>
              )}
              
              {/* Breed options */}
              {!isLoading && filteredBreeds.length === 0 && (
                <div className="p-3 text-center text-gray-500">No breeds found</div>
              )}
              
              {!isLoading &&
                filteredBreeds.map((breed) => (
                  <div
                    key={breed}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleBreed(breed)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBreeds.includes(breed)}
                      onChange={() => {}}
                      className="mr-2"
                      style={{ 
                        accentColor: brandColors.purple 
                      }}
                    />
                    <span className="text-sm">{breed}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
        
        {selectedBreeds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedBreeds.map(breed => (
              <span 
                key={breed} 
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {breed}
                <button
                  type="button"
                  className="ml-1 text-purple-600 hover:text-purple-900"
                  onClick={() => onBreedsChange(selectedBreeds.filter(b => b !== breed))}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Age Range Filter */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Age Range
        </label>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <input
              type="number"
              placeholder="Min Age"
              value={ageMin === undefined ? '' : ageMin}
              onChange={(e) => onAgeMinChange(e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="w-1/2">
            <input
              type="number"
              placeholder="Max Age"
              value={ageMax === undefined ? '' : ageMax}
              onChange={(e) => onAgeMaxChange(e.target.value ? parseInt(e.target.value) : undefined)}
              min={ageMin || 0}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Sort Order */}
      <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
          Sort by Breed
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={sortOrder === 'asc'}
              onChange={() => onSortOrderChange('asc')}
              className="form-radio h-4 w-4"
              style={{ 
                accentColor: brandColors.purple 
              }}
            />
            <span className="ml-2 text-sm">A-Z</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={sortOrder === 'desc'}
              onChange={() => onSortOrderChange('desc')}
              className="form-radio h-4 w-4"
              style={{ 
                accentColor: brandColors.purple 
              }}
            />
            <span className="ml-2 text-sm">Z-A</span>
          </label>
        </div>
      </div>
      
      {/* Apply Filters Button */}
      <button
        type="submit"
        className="w-full py-2 px-4 text-white font-medium rounded-md hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
        style={{ 
          backgroundColor: brandColors.orange,
          color: 'white'
        }}
      >
        Apply Filters
      </button>
    </form>
  );
};

export default SearchFilters;