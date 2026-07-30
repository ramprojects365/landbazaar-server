export declare const LIFESTYLE_AMENITIES: readonly ["Swimming Pool", "Gymnasium", "Playground", "BBQ Area", "Function Room", "Games Room", "Sky Garden", "Reading Room", "Lounge"];
export declare const FACILITIES_AMENITIES: readonly ["Covered Parking", "Visitor Parking", "Service Lift", "Surau / Prayer Room", "Parcel Locker", "Laundry Room", "Cafeteria"];
export declare const SECURITY_AMENITIES: readonly ["24-hour Security", "CCTV Surveillance", "Access Card System", "Fire Alarm System", "Emergency Exit"];
export type LifestyleAmenity = typeof LIFESTYLE_AMENITIES[number];
export type FacilitiesAmenity = typeof FACILITIES_AMENITIES[number];
export type SecurityAmenity = typeof SECURITY_AMENITIES[number];
export interface PropertyAmenities {
    lifestyle: string[];
    facilities: string[];
    security: string[];
}
export declare const ALL_AMENITIES: {
    readonly lifestyle: readonly ["Swimming Pool", "Gymnasium", "Playground", "BBQ Area", "Function Room", "Games Room", "Sky Garden", "Reading Room", "Lounge"];
    readonly facilities: readonly ["Covered Parking", "Visitor Parking", "Service Lift", "Surau / Prayer Room", "Parcel Locker", "Laundry Room", "Cafeteria"];
    readonly security: readonly ["24-hour Security", "CCTV Surveillance", "Access Card System", "Fire Alarm System", "Emergency Exit"];
};
//# sourceMappingURL=amenities.d.ts.map