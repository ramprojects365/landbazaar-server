import { Property } from '../entities/Property.js';
import { PropertyFilters } from '../repositories/propertyRepository.js';
export declare const createProperty: (propertyData: Partial<Property>) => Promise<Property>;
export declare const getPropertyById: (id: string) => Promise<Property>;
export declare const getAllProperties: (filters?: PropertyFilters) => Promise<Property[]>;
export declare const getUserProperties: (userId: string) => Promise<Property[]>;
export declare const updateProperty: (propertyId: string, userId: string, updates: Partial<Property>) => Promise<Property>;
export declare const deleteProperty: (propertyId: string, userId: string) => Promise<Property>;
export declare const searchProperties: (filters: {
    q?: string;
    type?: string;
    city?: string;
    propertyName?: string;
}) => Promise<Property[]>;
//# sourceMappingURL=propertyService.d.ts.map