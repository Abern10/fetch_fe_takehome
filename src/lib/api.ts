// api.ts

import {
    Dog,
    LoginRequest,
    DogSerachParams,
    DogSearchResponse,
    MatchResponse,
    Location,
    LocationSeachParams,
    LocationSerachResponse
} from './types'

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

// Function to handle fetch errors
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        // Try to parse the error message
        try {
            const errorData = await response.json()
            throw new Error(errorData.message || `API error: ${response.status}`);

        } catch (e) {
            throw new Error(`API error: ${response.status}`);
        }
    }

    // 204 No Content error
    if(response.status == 204) {
        return null;
    }
    return response.json();

};

// Auth functions
export const login = async (loginData: LoginRequest): Promise<void> =>{
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'applications/json'
        },
        body: JSON.stringify(loginData),
        credentials: 'include',
    });

    return handleResponse(response)
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
    const response = await fetch(`${API_BASE_URL}/dog/breeds`, {
        credentials: 'include'
    });

    return handleResponse(response)
};

export const searchDogs =  async (params: DogSerachParams): Promise<DogSearchResponse> => {
    const searchParams = new URLSearchParams();

    // Handle array parameters diffferently
    if (params.breeds && params.breeds.length > 0) {
        params.breeds.forEach(zipCode => searchParams.append('sipCodes', zipCode));
    }

    // Handle other parameters
    if (params.ageMin !== undefined) searchParams.append('ageMin', params.ageMin.toString());
    if (params.ageMax !== undefined) searchParams.append('ageMax', params.ageMax.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.from !== undefined) searchParams.append('from', params.from.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/dogs/search?${searchParams.toString()}`, {
        credentials: 'include',
    });

    return handleResponse(response)
}

export const getDogs = async (dogIds: string[]) : Promise<Dog[]> => {
    const response = await fetch(`${API_BASE_URL}/dogs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'applications/json',
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
            'Content-Type': 'applications/json',
        },
        body: JSON.stringify(zipCodes),
        credentials: 'include',
    });

    return handleResponse(response);
}

export const searchLocations = async (params: LocationSeachParams): Promise<LocationSerachResponse> => {
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