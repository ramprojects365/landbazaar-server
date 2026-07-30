export const LIFESTYLE_AMENITIES = [
  'Swimming Pool',
  'Gymnasium',
  'Playground',
  'BBQ Area',
  'Function Room',
  'Games Room',
  'Sky Garden',
  'Reading Room',
  'Lounge'
] as const;

export const FACILITIES_AMENITIES = [
  'Covered Parking',
  'Visitor Parking',
  'Service Lift',
  'Surau / Prayer Room',
  'Parcel Locker',
  'Laundry Room',
  'Cafeteria'
] as const;

export const SECURITY_AMENITIES = [
  '24-hour Security',
  'CCTV Surveillance',
  'Access Card System',
  'Fire Alarm System',
  'Emergency Exit'
] as const;

export type LifestyleAmenity = typeof LIFESTYLE_AMENITIES[number];
export type FacilitiesAmenity = typeof FACILITIES_AMENITIES[number];
export type SecurityAmenity = typeof SECURITY_AMENITIES[number];

export interface PropertyAmenities {
  lifestyle: string[];
  facilities: string[];
  security: string[];
}

export const ALL_AMENITIES = {
  lifestyle: LIFESTYLE_AMENITIES,
  facilities: FACILITIES_AMENITIES,
  security: SECURITY_AMENITIES
} as const;
