// src/app/search/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getBreeds, searchDogs, getDogs, logout, extractCursor } from '@/lib/api';
import { Dog, DogSearchParams } from '@/lib/types';
import { useFavorites } from '@/context/FavoritesContext';
import DogCard from '@/components/DogCard';
import SearchFilters from '@/components/SearchFilters';
import Pagination from '@/components/Pagination';
import FavoritesList from '@/components/FavoritesList';
import MatchDisplay from '@/components/MatchDisplay';

// Fetch brand colors
const FETCH_PURPLE = '#2e0d36';
const FETCH_ORANGE = '#ffa726';

export default function SearchPage() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const isInitialMount = useRef(true);

  // State for search results
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [totalDogs, setTotalDogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for search parameters
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<number | undefined>(undefined);
  const [ageMax, setAgeMax] = useState<number | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [prevCursor, setPrevCursor] = useState<string | undefined>(undefined);
  const [cursorsCache, setCursorsCache] = useState<Map<number, string | undefined>>(new Map());

  // Match state
  const [matchedDogId, setMatchedDogId] = useState<string | null>(null);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // Add retryCount state
  const [retryCount, setRetryCount] = useState(0);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, redirect to login
      router.push('/');
    }
  };

  const fetchDogs = useCallback(async (cursor?: string, size? : number) => {
    setIsLoading(true);
    setError(null);

    try {

      const effectiveSize = size !== undefined ? size : resultsPerPage;

      console.log('Fetching dogs with params:', {
        breeds: selectedBreeds,
        ageMin,
        ageMax,
        sort: `breed:${sortOrder}`,
        from: cursor,
        size: effectiveSize
      });

      // Create search parameters
      const searchParams: DogSearchParams = {
        breeds: selectedBreeds.length > 0 ? selectedBreeds : undefined,
        ageMin,
        ageMax,
        size: effectiveSize,
        from: cursor,
        sort: `breed:${sortOrder}`,
      };

      // Search for dog IDs
      const searchResults = await searchDogs(searchParams);
      console.log('Search results:', searchResults);

      setTotalDogs(searchResults.total);

      // Extract the cursor from the next URL
      const nextPageCursor = searchResults.next ? extractCursor(searchResults.next) : undefined;
      const prevPageCursor = searchResults.prev ? extractCursor(searchResults.prev) : undefined;

      setNextCursor(nextPageCursor);
      setPrevCursor(prevPageCursor);

      // If we have a next cursor, store it in our cache for the next page
      if (nextPageCursor) {
        const nextPage = currentPage + 1;
        const updatedCache = new Map(cursorsCache);
        updatedCache.set(nextPage, nextPageCursor);
        setCursorsCache(updatedCache);
      }

      // If we have a prev cursor, store it in our cache for the previous page
      if (prevPageCursor && currentPage > 1) {
        const prevPage = currentPage - 1;
        const updatedCache = new Map(cursorsCache);
        updatedCache.set(prevPage, prevPageCursor);
        setCursorsCache(updatedCache);
      }

      // If we have results, fetch the dog details
      if (searchResults.resultIds && searchResults.resultIds.length > 0) {
        const dogsData = await getDogs(searchResults.resultIds);
        console.log('Fetched dog details:', dogsData.length);
        setDogs(dogsData);
      } else {
        setDogs([]);
      }
    } catch (err) {
      console.error('Error fetching dogs:', err);

      // If we get a 401 error, redirect to login
      if (err instanceof Error && err.message.includes('401')) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError('Failed to fetch dogs. Please try again later.');
      }

      setDogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBreeds, ageMin, ageMax, sortOrder, resultsPerPage, router, currentPage, cursorsCache]);

  // Effect for initial fetch only
  useEffect(() => {
    console.log('Initial fetch effect running');
    fetchDogs(undefined);

    // Initialize the cursor cache with page 1
    const initialCache = new Map<number, string | undefined>();
    initialCache.set(1, undefined);
    setCursorsCache(initialCache);
  }, []);

  // Effect for retries
  useEffect(() => {
    if (!isInitialMount.current && retryCount > 0) {
      fetchDogs(undefined);
    }
  }, [retryCount, fetchDogs]);

  // Handler for retrying failed requests
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Handler for applying filters
  const handleApplyFilters = () => {
    setNextCursor(undefined);
    setPrevCursor(undefined);
    setCurrentPage(1);
    setShowFilters(false);

    // Reset the cursor cache when filters are changed
    const newCache = new Map<number, string | undefined>();
    newCache.set(1, undefined);
    setCursorsCache(newCache);

    fetchDogs(undefined);
  };

  // Pagination handlers
  const handlePageChange = async (page: number) => {
    console.log(`Changing to page ${page}`);

    // Don't do anything if we're already on this page
    if (page === currentPage) return;

    setIsLoading(true);

    // If we have the cursor for this page in our cache, use it directly
    if (cursorsCache.has(page)) {
      const cursor = cursorsCache.get(page);
      setCurrentPage(page);
      await fetchDogs(cursor);
      return;
    }

    // If we're moving to the next page and we have a nextCursor
    if (page === currentPage + 1 && nextCursor) {
      // Store the next cursor in our cache
      const updatedCache = new Map(cursorsCache);
      updatedCache.set(page, nextCursor);
      setCursorsCache(updatedCache);

      setCurrentPage(page);
      await fetchDogs(nextCursor);
      return;
    }

    // If we're moving to the previous page and we have a prevCursor
    if (page === currentPage - 1 && prevCursor) {
      // Store the previous cursor in our cache
      const updatedCache = new Map(cursorsCache);
      updatedCache.set(page, prevCursor);
      setCursorsCache(updatedCache);

      setCurrentPage(page);
      await fetchDogs(prevCursor);
      return;
    }

    // For jumps to pages we don't have cursors for, we need to fetch page 1 and then navigate forward
    // Start from the beginning if we're going to a page we don't have a cursor for
    setCurrentPage(1);

    // First, get page 1 (no cursor needed)
    const updatedCache = new Map(cursorsCache);
    updatedCache.set(1, undefined);
    setCursorsCache(updatedCache);

    await fetchDogs(undefined);

    if (page === 1) {
      setIsLoading(false);
      return; // We're already on page 1
    }

    // Now navigate to subsequent pages and build up our cursor cache
    for (let i = 2; i <= page; i++) {
      // If we already have the cursor for the current target page, use it
      if (nextCursor) {
        // Store this cursor for this page
        const updatedCache = new Map(cursorsCache);
        updatedCache.set(i, nextCursor);
        setCursorsCache(updatedCache);

        // Fetch the next page
        await fetchDogs(nextCursor);
        setCurrentPage(i);

        // If we've reached our target page, stop
        if (i === page) break;
      } else {
        // If we don't have a next cursor, we can't proceed further
        console.error('No next cursor available to reach page', page);
        break;
      }
    }

    setIsLoading(false);
  };

  const handleNextPage = () => {
    if (nextCursor) {
      setCurrentPage(currentPage + 1);
      fetchDogs(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (prevCursor) {
      setCurrentPage(currentPage - 1);
      fetchDogs(prevCursor);
    }
  };

  // Handler for match generation
  const handleMatchGenerated = (dogId: string) => {
    setMatchedDogId(dogId);
  };

  // Handler for closing the match display
  const handleCloseMatch = () => {
    setMatchedDogId(null);
  };

  // Function to handle number of results dsiplayed
  const handleResultsPerPageChange = (newSize: number) => {
    // Base case
    if (newSize === resultsPerPage) return;

    setIsLoading(true);

    // Reset pagination state
    setCurrentPage(1);
    setNextCursor(undefined);
    setPrevCursor(undefined);

    // Reset the cursor cache
    const newCache = new Map<number, string | undefined>();
    newCache.set(1, undefined);
    setCursorsCache(newCache);

    // Update the results per page
    setResultsPerPage(newSize);

    // Fetch dogs with the new size
    fetchDogs(undefined, newSize);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/Fetch_Logo_Primary_Stacked.png"
              alt="Fetch Logo"
              width={100}
              height={32}
              priority
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/3 bg-orange-500 rounded-full">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Mobile filter button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-4 py-2 bg-white text-gray-700 rounded-md shadow flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters {selectedBreeds.length > 0 && `(${selectedBreeds.length})`}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Filter Dogs</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <SearchFilters
                selectedBreeds={selectedBreeds}
                onBreedsChange={setSelectedBreeds}
                ageMin={ageMin}
                ageMax={ageMax}
                onAgeMinChange={setAgeMin}
                onAgeMaxChange={setAgeMax}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onApplyFilters={handleApplyFilters}
                brandColors={{ purple: FETCH_PURPLE, orange: FETCH_ORANGE }}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="md:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="mb-2">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : dogs.length === 0 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                No dogs found matching your criteria. Try adjusting your filters.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">
                      {totalDogs} Dogs Found
                    </h2>
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {Math.ceil(totalDogs / resultsPerPage)}
                    </div>
                  </div>
                </div>

                {/* Dogs grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {dogs.map(dog => (
                    <DogCard
                      key={dog.id}
                      dog={dog}
                      brandColors={{ purple: FETCH_PURPLE, orange: FETCH_ORANGE }}
                    />
                  ))}
                </div>

                {/* # results controller */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Results per page:</span>
                    <select
                      value={resultsPerPage}
                      onChange={(e) => handleResultsPerPageChange(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>

                {/* Pagination */}
                <Pagination
                  totalResults={totalDogs}
                  resultsPerPage={resultsPerPage}
                  currentPage={currentPage}
                  hasNextPage={!!nextCursor}
                  hasPreviousPage={!!prevCursor}
                  onPageChange={handlePageChange}
                  onNextPage={handleNextPage}
                  onPreviousPage={handlePreviousPage}
                  brandColors={{ purple: FETCH_PURPLE, orange: FETCH_ORANGE }}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Favorites slide-in panel */}
      <div
        className={`fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl transform ${showFavorites ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Your Favorites</h2>
            <button
              onClick={() => setShowFavorites(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto">
            <FavoritesList
              onMatchGenerated={handleMatchGenerated}
              brandColors={{ purple: FETCH_PURPLE, orange: FETCH_ORANGE }}
            />
          </div>
        </div>
      </div>

      {/* Match display */}
      {matchedDogId && (
        <MatchDisplay
          matchedDogId={matchedDogId}
          onClose={handleCloseMatch}
          brandColors={{ purple: FETCH_PURPLE, orange: FETCH_ORANGE }}
        />
      )}
    </div>
  );
}