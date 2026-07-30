# Property Amenities Guide

## Database Structure

Amenities are stored in a JSONB column with three categories:

```json
{
  "lifestyle": [],
  "facilities": [],
  "security": []
}
```

## Available Amenities by Category

### Lifestyle Amenities
- Swimming Pool
- Gymnasium
- Playground
- BBQ Area
- Function Room
- Games Room
- Sky Garden
- Reading Room
- Lounge

### Facilities Amenities
- Covered Parking
- Visitor Parking
- Service Lift
- Surau / Prayer Room
- Parcel Locker
- Laundry Room
- Cafeteria

### Security and Safety Amenities
- 24-hour Security
- CCTV Surveillance
- Access Card System
- Fire Alarm System
- Emergency Exit

## API Usage Examples

### Creating a Property with Amenities

```json
POST /api/properties
{
  "title": "Luxury Condo",
  "description": "Modern apartment with premium amenities",
  "listingType": "sale",
  "price": 850000,
  "amenities": {
    "lifestyle": ["Swimming Pool", "Gymnasium", "Sky Garden"],
    "facilities": ["Covered Parking", "Service Lift", "Cafeteria"],
    "security": ["24-hour Security", "CCTV Surveillance", "Access Card System"]
  }
}
```

### Updating Property Amenities

```json
PUT /api/properties/:id
{
  "amenities": {
    "lifestyle": ["Swimming Pool", "Gymnasium", "Playground", "BBQ Area"],
    "facilities": ["Covered Parking", "Visitor Parking"],
    "security": ["24-hour Security", "CCTV Surveillance"]
  }
}
```

### Filtering Properties by Amenities

**API Endpoint:**
```
GET /api/properties?amenities=Swimming Pool,Gymnasium,24-hour Security
```

**SQL Query Examples:**
```sql
-- Find properties with swimming pool
SELECT * FROM properties
WHERE amenities->'lifestyle' @> '["Swimming Pool"]';

-- Find properties with 24-hour security
SELECT * FROM properties
WHERE amenities->'security' @> '["24-hour Security"]';

-- Find properties with multiple amenities
SELECT * FROM properties
WHERE amenities->'lifestyle' @> '["Swimming Pool", "Gymnasium"]'
  AND amenities->'security' @> '["CCTV Surveillance"]';
```

## TypeScript Usage

```typescript
import { PropertyAmenities, ALL_AMENITIES } from './types/amenities';

// Create property with amenities
const property = {
  title: 'Modern Apartment',
  amenities: {
    lifestyle: ['Swimming Pool', 'Gymnasium'],
    facilities: ['Covered Parking'],
    security: ['24-hour Security']
  } as PropertyAmenities
};

// Access all available amenities
console.log(ALL_AMENITIES.lifestyle);
console.log(ALL_AMENITIES.facilities);
console.log(ALL_AMENITIES.security);
```

## Migration Notes

The new structure replaces individual boolean columns with a single JSONB column:

**Before:**
```sql
swimming_pool BOOLEAN
gymnasium BOOLEAN
covered_parking BOOLEAN
security_24h BOOLEAN
-- etc...
```

**After:**
```sql
amenities JSONB DEFAULT '{
  "lifestyle": [],
  "facilities": [],
  "security": []
}'
```

Run `npm run setup-db` to recreate tables with the new structure.
