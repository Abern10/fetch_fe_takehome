// types.ts

// This file defines the structure of our data

// Dog interface
export interface Dog {
    id: string;
    img: string;
    name: string;
    age: number;
    zip_code: string;
    breed: string;
}

// Location interface
export interface Location {
    zip_code: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
}

// Coordinates interface
export interface Coordinates {
    lat: number;
    long: number;
}

// Login interface
export interface LoginRequest {
    name: string;
    email: string;
}

// Dog search response interface
export interface DogSearchResponse {
    resultIds: string[];
    total: number;
    next?: string;
    prev?: string;
}

// Match response interface
export interface MatchResponse {
    match: string;
}

// Search parameters interface
export interface LocationSeachParams {
    city?: string;
    state?: string[];
    geoBoundingBox?: {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
        bottom_left?: Coordinates;
        top_right?: Coordinates;
        bottom_right?: Coordinates;
        top_left?: Coordinates;
    };
    size?: number;
    from?: number;
}

// Location search response interface
export interface LocationSerachResponse {
    results: Location[];
    total: number;
}

// Dog search parameters interface
export interface DogSerachParams {
    breeds?: string[];
    zipCodes?: string[];
    ageMin?: number;
    ageMax?: number;
    size?: number;
    from?: number;
    sort?: string; 
}

