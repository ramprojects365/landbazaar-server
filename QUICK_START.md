# Property Listing API - Quick Start Guide

## Get Started in 5 Minutes

### 1. Setup
```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Configure Environment
Ensure your `.env` file has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DO_SPACES_KEY=your-spaces-key
DO_SPACES_SECRET=your-spaces-secret
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=your-bucket
DO_SPACES_REGION=nyc3
```

### 3. Start the Server
```bash
# Start Supabase version (recommended)
npm start

# OR start TypeORM version
npm run start:typeorm
```

### 4. Test the API

**Create an account:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"testuser"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Save the token from the response.

**Create a property:**
```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Apartment",
    "description": "Beautiful 3BR apartment",
    "listing_type": "rent",
    "property_type": "Apartment",
    "tenure": "leasehold",
    "price": 3500,
    "bedrooms": 3,
    "bathrooms": 2,
    "city_name": "New York"
  }'
```

**Get all properties:**
```bash
curl http://localhost:3000/api/properties
```

## Property Fields

### Required
- `title` - Property title
- `description` - Detailed description
- `listing_type` - "rent" or "sale"
- `property_type` - e.g., "Apartment"
- `tenure` - "freehold" or "leasehold"
- `price` - Price or monthly rent

### Optional but Recommended
- `bedrooms`, `bathrooms` - Number of rooms
- `city_name`, `state` - Location details
- `furnishing` - "Fully", "Partially", "Unfurnished"
- `buildup_area` - Area in square feet

### Amenities (all optional booleans)
- `swimming_pool`, `gymnasium`, `playground`
- `bbq_area`, `function_room`, `games_room`
- `sky_garden`, `reading_room`, `lounge`

### Facilities (all optional booleans)
- `covered_parking`, `visitor_parking`
- `service_lift`, `prayer_room`
- `parcel_locker`, `laundry_room`, `cafeteria`

### Security (all optional booleans)
- `security_24h`, `cctv_surveillance`
- `access_card_system`, `fire_alarm_system`
- `emergency_exit`

### Media
- `images` - Array of image URLs (max 10)

## Filtering Properties

Get properties with specific features:

```bash
# Rent properties in New York with 3+ bedrooms
curl "http://localhost:3000/api/properties?listingType=rent&cityName=New%20York&minBedrooms=3"

# Properties with gym and pool
curl "http://localhost:3000/api/properties?gymnasium=true&swimmingPool=true"

# Price range $2000-$5000
curl "http://localhost:3000/api/properties?minPrice=2000&maxPrice=5000"
```

## Uploading Images

```bash
# Upload multiple images
curl -X POST http://localhost:3000/api/images/upload-multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg"

# Use returned URLs in property creation
```

## Common Operations

### Update a property
```bash
curl -X PUT http://localhost:3000/api/properties/PROPERTY_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 4000, "title": "Updated Title"}'
```

### Delete a property
```bash
curl -X DELETE http://localhost:3000/api/properties/PROPERTY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search properties
```bash
curl "http://localhost:3000/api/properties/search?q=luxury%20apartment"
```

### Get your properties
```bash
curl http://localhost:3000/api/properties/my-properties \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Architecture Overview

```
┌─────────────────┐
│   Client App    │
└────────┬────────┘
         │
         ├──── Auth: Supabase JWT
         │
         ├──── API: Express.js + TypeScript
         │     ├── Authentication
         │     ├── Property CRUD
         │     └── Image Upload
         │
         ├──── Database: Supabase (PostgreSQL)
         │     ├── Properties table
         │     └── RLS policies
         │
         └──── Storage: DigitalOcean Spaces
               └── Property images
```

## Next Steps

1. Read [SUPABASE_API_DOCUMENTATION.md](./SUPABASE_API_DOCUMENTATION.md) for complete API details
2. Configure DigitalOcean Spaces for image uploads
3. Customize property fields as needed
4. Implement pagination for large datasets
5. Add more validation rules if required

## Support

- API runs on: `http://localhost:3000`
- Main endpoint: `GET /` - Shows all available routes
- Documentation: See SUPABASE_API_DOCUMENTATION.md
- Database: Managed via Supabase dashboard
