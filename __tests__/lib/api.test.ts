// __tests__/lib/api.test.ts
import {
  login,
  logout,
  getBreeds,
  searchDogs,
  getDogs,
  matchDog,
  parseCursor,
  getLocations,
  searchLocations
} from '@/lib/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock implementation for fetch
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  describe('login', () => {
    it('calls the correct endpoint with the right parameters', async () => {
      const loginData = { name: 'Test User', email: 'test@example.com' };

      await login(loginData);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://frontend-take-home-service.fetch.com/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
          credentials: 'include',
        }
      );
    });

    it('handles API errors correctly', async () => {
      // Mock a failed response
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          // Don't try to return a proper JSON response
          json: () => Promise.reject(new Error('Failed to parse JSON'))
        })
      );

      await expect(login({ name: 'Test', email: 'test@example.com' }))
        .rejects
        .toThrow();
    });
  });

  describe('getBreeds', () => {
    it('calls the correct endpoint with credentials', async () => {
      const mockBreeds = ['Labrador', 'Poodle', 'Bulldog'];
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBreeds),
        })
      );

      const result = await getBreeds();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://frontend-take-home-service.fetch.com/dogs/breeds',
        {
          credentials: 'include',
        }
      );
      expect(result).toEqual(mockBreeds);
    });
  });

  describe('searchDogs', () => {
    it('formats query parameters correctly', async () => {
      const searchParams = {
        breeds: ['Labrador', 'Poodle'],
        ageMin: 1,
        ageMax: 5,
        sort: 'breed:asc',
      };

      const mockResponse = {
        resultIds: ['dog1', 'dog2'],
        total: 2,
        next: 'from=dog3',
      };

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await searchDogs(searchParams);

      // Check that URL includes the correct query parameters
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('dogs/search?');
      expect(fetchCall).toContain('breeds=Labrador');
      expect(fetchCall).toContain('breeds=Poodle');
      expect(fetchCall).toContain('ageMin=1');
      expect(fetchCall).toContain('ageMax=5');
      expect(fetchCall).toContain('sort=breed%3Aasc');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('parseCursor', () => {
    it('extracts the "from" parameter from cursor strings', () => {
      expect(parseCursor('from=dog123')).toBe('dog123');
      expect(parseCursor('from=dog123&other=param')).toBe('dog123');
      expect(parseCursor(undefined)).toBeUndefined();
      expect(parseCursor('')).toBeUndefined();
      expect(parseCursor('other=param')).toBeUndefined();
    });
  });
});

// Logout Tests
describe('logout', () => {
  it('calls the correct logout endpoint', async () => {
    await logout();
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/auth/logout',
      {
        method: 'POST',
        credentials: 'include',
      }
    );
  });
  
  it('handles successful logout with 204 status', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 204,
      })
    );
    
    const result = await logout();
    expect(result).toBeNull();
  });
});

// GetDogs Tests
describe('getDogs', () => {
  it('sends dog IDs correctly to fetch specific dogs', async () => {
    const dogIds = ['dog1', 'dog2', 'dog3'];
    const mockDogs = [
      { id: 'dog1', name: 'Rex', breed: 'Labrador', age: 3, zip_code: '12345', img: 'img1.jpg' },
      { id: 'dog2', name: 'Max', breed: 'Poodle', age: 2, zip_code: '54321', img: 'img2.jpg' },
      { id: 'dog3', name: 'Bella', breed: 'Beagle', age: 4, zip_code: '67890', img: 'img3.jpg' }
    ];
    
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDogs),
      })
    );
    
    const result = await getDogs(dogIds);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/dogs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogIds),
        credentials: 'include',
      }
    );
    
    expect(result).toEqual(mockDogs);
  });
  
  it('handles empty dog IDs array', async () => {
    const dogIds: string[] = [];
    
    await getDogs(dogIds);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/dogs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogIds),
        credentials: 'include',
      }
    );
  });
});

// MatchDog Tests
describe('matchDog', () => {
  it('sends favorite IDs correctly and returns a match', async () => {
    const favoriteIds = ['dog1', 'dog2', 'dog3'];
    const mockMatch = { match: 'dog2' };
    
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMatch),
      })
    );
    
    const result = await matchDog(favoriteIds);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/dogs/match',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(favoriteIds),
        credentials: 'include',
      }
    );
    
    expect(result).toEqual(mockMatch);
  });
  
  it('handles empty favorites array', async () => {
    const favoriteIds: string[] = [];
    
    await matchDog(favoriteIds);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/dogs/match',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(favoriteIds),
        credentials: 'include',
      }
    );
  });
});

// Location Tests
describe('getLocations', () => {
  it('sends zip codes correctly and returns location data', async () => {
    const zipCodes = ['12345', '54321'];
    const mockLocations = [
      { zip_code: '12345', latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY', county: 'New York' },
      { zip_code: '54321', latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', state: 'CA', county: 'Los Angeles' }
    ];
    
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLocations),
      })
    );
    
    const result = await getLocations(zipCodes);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/locations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zipCodes),
        credentials: 'include',
      }
    );
    
    expect(result).toEqual(mockLocations);
  });
});

describe('searchLocations', () => {
  it('sends search parameters correctly', async () => {
    const searchParams = {
      city: 'New York',
      states: ['NY', 'NJ'],
      size: 25
    };
    
    const mockResponse = {
      results: [
        { zip_code: '10001', latitude: 40.7503, longitude: -73.9970, city: 'New York', state: 'NY', county: 'New York' }
      ],
      total: 1
    };
    
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );
    
    const result = await searchLocations(searchParams);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/locations/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
        credentials: 'include',
      }
    );
    
    expect(result).toEqual(mockResponse);
  });
  
  it('handles geoBoundingBox parameter', async () => {
    const searchParams = {
      geoBoundingBox: {
        top: 42.0,
        left: -76.0,
        bottom: 40.0,
        right: -74.0
      }
    };
    
    await searchLocations(searchParams);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://frontend-take-home-service.fetch.com/locations/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
        credentials: 'include',
      }
    );
  });
});

// Edge Cases and Error Handling Tests
describe('Edge Cases and Error Handling', () => {
  it('handles network errors', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
    
    await expect(getBreeds()).rejects.toThrow('Network error');
  });
  
  it('handles invalid JSON responses', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })
    );
    
    await expect(getBreeds()).rejects.toThrow('Invalid JSON');
  });
  
  it('handles different HTTP error status codes', async () => {
    // Test 401 Unauthorized
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.reject(new Error('JSON parse failed'))
      })
    );
    
    await expect(login({ name: 'test', email: 'test@example.com' }))
      .rejects
      .toThrow('API error: 401');
    
    // Test 404 Not Found
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.reject(new Error('JSON parse failed'))
      })
    );
    
    await expect(getBreeds())
      .rejects
      .toThrow('API error: 404');
    
    // Test 500 Server Error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('JSON parse failed'))
      })
    );
    
    await expect(getDogs(['dog1']))
      .rejects
      .toThrow('API error: 500');
  });
  
  it('handles SearchDogs pagination parameters correctly', async () => {
    jest.clearAllMocks();
    
    // Test with 'from' parameter for pagination
    const searchParams = {
      breeds: ['Labrador'],
      from: 'nextPageCursor',
      size: 10
    };
    
    await searchDogs(searchParams);
    
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('from=nextPageCursor');
    expect(fetchCall).toContain('size=10');
  });
  
  it('handles empty response from search', async () => {
    const emptyResponse = {
      resultIds: [],
      total: 0
    };
    
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(emptyResponse)
      })
    );
    
    const result = await searchDogs({ breeds: ['NonExistentBreed'] });
    
    expect(result.resultIds).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});