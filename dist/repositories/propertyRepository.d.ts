import { Property } from '../entities/Property.js';
export interface PropertyFilters {
    listingType?: 'rent' | 'sale';
    propertyType?: string;
    tenure?: 'freehold' | 'leasehold';
    furnishing?: 'Fully' | 'Partially' | 'Unfurnished';
    availability?: 'Immediate' | 'Next month' | 'Under Construction';
    cityName?: string;
    state?: string;
    status?: string;
    userId?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    minArea?: number;
    negotiable?: boolean;
    swimmingPool?: boolean;
    gymnasium?: boolean;
    coveredParking?: boolean;
    security24h?: boolean;
}
export declare const createProperty: (propertyData: Partial<Property>) => Promise<Property>;
export interface DuplicatePropertyCheck {
    propertyName: string;
    streetName: string;
    cityName: string;
    state: string;
}
export declare const findDuplicateProperty: (match: DuplicatePropertyCheck) => Promise<Property | null>;
export declare const findPropertyById: (id: string) => Promise<Property | null>;
export declare const findAllProperties: (filters?: PropertyFilters) => Promise<Property[]>;
export declare const findPropertiesByUserId: (userId: string) => Promise<Property[]>;
export declare const updateProperty: (id: string, updates: Partial<Property>) => Promise<Property | null>;
export declare const deleteProperty: (id: string) => Promise<void>;
export interface SearchFilters {
    q?: string;
    type?: string;
    city?: string;
    propertyName?: string;
}
export declare const searchProperties: (filters: SearchFilters) => Promise<Property[]>;
export declare const countPropertiesByUser: (userId: string) => Promise<number>;
//# sourceMappingURL=propertyRepository.d.ts.map