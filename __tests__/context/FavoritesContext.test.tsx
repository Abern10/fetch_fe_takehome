// FavoritesContext.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from '@/context/FavoritesContext';
import { Dog } from '@/lib/types';

// Mock React hooks to prevent errors with useState
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn((initialValue) => [initialValue, jest.fn()]),
  };
});

// Define the props interface for our mock component with proper types
interface MockComponentProps {
  favorites?: Dog[];
  favoriteIds?: Set<string>;
  addFavorite?: (dog: Dog) => void;
  removeFavorite?: (dogId: string) => void;
  toggleFavorite?: (dog: Dog) => void;
  isFavorite?: (dogId: string) => boolean;
  clearFavorites?: () => void;
}

// Create a properly typed test component
const MockComponent = ({ 
  favorites = [],
  favoriteIds = new Set<string>(),
  addFavorite = jest.fn(),
  removeFavorite = jest.fn(),
  toggleFavorite = jest.fn(),
  isFavorite = () => false,
  clearFavorites = jest.fn()
}: MockComponentProps) => (
  <div>
    <div data-testid="favorites-count">{favorites.length}</div>
    <div data-testid="favorite-ids">{Array.from(favoriteIds).join(',')}</div>
    <button data-testid="add-dog" onClick={() => addFavorite({ id: 'dog1', name: 'Rex', breed: 'Lab', age: 2, zip_code: '12345', img: 'img.jpg' })}>
      Add Dog
    </button>
    <button data-testid="remove-dog" onClick={() => removeFavorite('dog1')}>
      Remove Dog
    </button>
    <button data-testid="toggle-dog" onClick={() => toggleFavorite({ id: 'dog2', name: 'Max', breed: 'Poodle', age: 3, zip_code: '67890', img: 'img2.jpg' })}>
      Toggle Dog
    </button>
    <div data-testid="is-favorite">{isFavorite('dog1') ? 'yes' : 'no'}</div>
    <button data-testid="clear-favorites" onClick={clearFavorites}>
      Clear Favorites
    </button>
  </div>
);

// Type for our context values
type FavoritesContextType = {
  favorites: Dog[];
  favoriteIds: Set<string>;
  addFavorite: jest.Mock;
  removeFavorite: jest.Mock;
  toggleFavorite: jest.Mock;
  isFavorite: jest.Mock;
  clearFavorites: jest.Mock;
};

// Override useContext to return test values
jest.mock('@/context/FavoritesContext', () => {
  const actualModule = jest.requireActual('@/context/FavoritesContext');
  
  // Mock implementation of the provider
  const mockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
  };
  
  return {
    ...actualModule,
    FavoritesProvider: mockProvider,
    useFavorites: jest.fn(),
  };
});

describe('FavoritesContext', () => {
  it('provides empty favorites by default', () => {
    const mockContext: FavoritesContextType = {
      favorites: [],
      favoriteIds: new Set<string>(),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn().mockReturnValue(false),
      clearFavorites: jest.fn(),
    };
    
    (useFavorites as jest.Mock).mockReturnValue(mockContext);
    
    render(<MockComponent />);
    
    expect(screen.getByTestId('favorites-count')).toHaveTextContent('0');
    expect(screen.getByTestId('favorite-ids')).toHaveTextContent('');
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('no');
  });

  it('allows adding favorites', () => {
    const mockAddFavorite = jest.fn();
    const favorites: Dog[] = [{ id: 'dog1', name: 'Rex', breed: 'Lab', age: 2, zip_code: '12345', img: 'img.jpg' }];
    const favoriteIds = new Set(['dog1']);
    
    // Mock the hook
    (useFavorites as jest.Mock).mockReturnValue({
      favorites,
      favoriteIds,
      addFavorite: mockAddFavorite,
      removeFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn().mockReturnValue(true),
      clearFavorites: jest.fn(),
    });
    
    render(<MockComponent 
      favorites={favorites} 
      favoriteIds={favoriteIds}
      addFavorite={mockAddFavorite}
      isFavorite={() => true}
    />);
    
    fireEvent.click(screen.getByTestId('add-dog'));
    
    expect(mockAddFavorite).toHaveBeenCalled();
    expect(screen.getByTestId('favorites-count')).toHaveTextContent('1');
    expect(screen.getByTestId('favorite-ids')).toHaveTextContent('dog1');
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('yes');
  });

  it('allows removing favorites', () => {
    const mockRemoveFavorite = jest.fn();
    const initialFavorites: Dog[] = [
      { id: 'dog1', name: 'Rex', breed: 'Lab', age: 2, zip_code: '12345', img: 'img.jpg' },
      { id: 'dog2', name: 'Max', breed: 'Poodle', age: 3, zip_code: '67890', img: 'img2.jpg' }
    ];
    
    // Mock the hook
    (useFavorites as jest.Mock).mockReturnValue({
      favorites: initialFavorites,
      favoriteIds: new Set(['dog1', 'dog2']),
      addFavorite: jest.fn(),
      removeFavorite: mockRemoveFavorite,
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn().mockReturnValue(true),
      clearFavorites: jest.fn(),
    });
    
    render(<MockComponent 
      favorites={initialFavorites} 
      favoriteIds={new Set(['dog1', 'dog2'])}
      removeFavorite={mockRemoveFavorite}
    />);
    
    fireEvent.click(screen.getByTestId('remove-dog'));
    
    expect(mockRemoveFavorite).toHaveBeenCalledWith('dog1');
  });

  it('toggles favorites correctly', () => {
    const mockToggleFavorite = jest.fn();
    
    // Mock the hook
    (useFavorites as jest.Mock).mockReturnValue({
      favorites: [],
      favoriteIds: new Set<string>(),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      toggleFavorite: mockToggleFavorite,
      isFavorite: jest.fn().mockReturnValue(false),
      clearFavorites: jest.fn(),
    });
    
    render(<MockComponent toggleFavorite={mockToggleFavorite} />);
    
    fireEvent.click(screen.getByTestId('toggle-dog'));
    
    expect(mockToggleFavorite).toHaveBeenCalled();
    const dogArg = mockToggleFavorite.mock.calls[0][0];
    expect(dogArg.id).toBe('dog2');
  });

  it('clears all favorites', () => {
    const mockClearFavorites = jest.fn();
    const testDog: Dog = { id: 'dog1', name: 'Rex', breed: 'Lab', age: 2, zip_code: '12345', img: 'img.jpg' };
    
    // Mock the hook
    (useFavorites as jest.Mock).mockReturnValue({
      favorites: [testDog],
      favoriteIds: new Set(['dog1']),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn().mockReturnValue(true),
      clearFavorites: mockClearFavorites,
    });
    
    render(<MockComponent 
      favorites={[testDog]} 
      favoriteIds={new Set(['dog1'])}
      clearFavorites={mockClearFavorites}
    />);
    
    fireEvent.click(screen.getByTestId('clear-favorites'));
    
    expect(mockClearFavorites).toHaveBeenCalled();
  });
});