// api.ts

import {
    Dog,
    LoginRequest,
    DogSearchParams,
    DogSearchResponse,
    MatchResponse,
    Location,
    LocationSearchParams,
    LocationSearchResponse
} from './types'

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

// Function to handle fetch errors
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        try {
            const errorData = await response.json();
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(errorData.message || `API error: ${response.status}`);
        } catch (e) {
            console.error('API Error (parsing failed):', {
                status: response.status,
                statusText: response.statusText
            });
            throw new Error(`API error: ${response.status}`);
        }
    }

    // For 204 No Content responses
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

// Auth functions
export const login = async (loginData: LoginRequest): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Login failed with status: ${response.status}`);
        }
        return;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    return handleResponse(response);
};

// Dog related functions
export const getBreeds = async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/dogs/breeds`, {
        credentials: 'include',
    });

    return handleResponse(response);
};

export const searchDogs = async (params: DogSearchParams): Promise<DogSearchResponse> => {
    try {
        const searchParams = new URLSearchParams();

        // Handle array parameters differently
        if (params.breeds && params.breeds.length > 0) {
            params.breeds.forEach(breed => searchParams.append('breeds', breed));
        }

        if (params.zipCodes && params.zipCodes.length > 0) {
            params.zipCodes.forEach(zipCode => searchParams.append('zipCodes', zipCode));
        }

        // Handle other parameters
        if (params.ageMin !== undefined) searchParams.append('ageMin', params.ageMin.toString());
        if (params.ageMax !== undefined) searchParams.append('ageMax', params.ageMax.toString());
        if (params.size !== undefined) searchParams.append('size', params.size.toString());
        if (params.from !== undefined) searchParams.append('from', params.from.toString());
        if (params.sort) searchParams.append('sort', params.sort);

        const url = `${API_BASE_URL}/dogs/search?${searchParams.toString()}`;
        console.log('Making search request to:', url);

        const response = await fetch(url, {
            credentials: 'include',
        });

        return handleResponse(response);
    } catch (error) {
        console.error('Error in searchDogs:', error);
        throw error;
    }
};

export const getDogs = async (dogIds: string[]): Promise<Dog[]> => {
    const response = await fetch(`${API_BASE_URL}/dogs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogIds),
        credentials: 'include',
    });

    return handleResponse(response)
}

export const matchDog = async (favoriteIds: string[]): Promise<MatchResponse> => {
    const response = await fetch(`${API_BASE_URL}/dogs/match`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(favoriteIds),
        credentials: 'include',
    });

    return handleResponse(response)
}

export const getLocations = async (zipCodes: string[]): Promise<Location[]> => {
    const response = await fetch(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(zipCodes),
        credentials: 'include',
    });

    return handleResponse(response);
}

export const searchLocations = async (params: LocationSearchParams): Promise<LocationSearchResponse> => {
    const response = await fetch(`${API_BASE_URL}/locations/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        credentials: 'include',
    });

    return handleResponse(response)
}

// Helper function to parse the "next" and "prev" cursor values
export const parseCursor = (cursorString: string | undefined): string | undefined => {
    if (!cursorString) return undefined;

    const params = new URLSearchParams(cursorString);
    return params.get('from') || undefined;
};

export const extractCursor = (nextUrl: string | undefined): string | undefined => {
    if (!nextUrl) return undefined;

    try {
        const urlParams = new URLSearchParams(nextUrl.split('?')[1]);
        return urlParams.get('from') || undefined;
    } catch (e) {
        console.error('Error parsing cursor:', e);
        return undefined;
    }
};