# Property Listing API with Supabase - Complete Documentation

## Overview
Full-featured property listing management system built with Supabase for authentication and database, Express.js for the API, and DigitalOcean Spaces for image storage.

## Key Features
- Supabase authentication with JWT tokens
- Comprehensive property listings with 40+ fields
- Advanced filtering and search capabilities
- Image upload to DigitalOcean Spaces (max 10 images per property)
- Row Level Security (RLS) for data protection
- RESTful API design

## Architecture
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Express.js + TypeScript
- **Image Storage**: DigitalOcean Spaces (S3-compatible)
- **Security**: RLS policies, JWT token verification

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Your `.env` file should contain:

```env
# Server
PORT=3000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# DigitalOcean Spaces
DO_SPACES_KEY=your-spaces-access-key
DO_SPACES_SECRET=your-spaces-secret-key
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=your-bucket-name
DO_SPACES_REGION=nyc3
```

### 3. Database Migration
The properties table has been automatically created in your Supabase database with:
- All required fields and constraints
- Proper indexes for performance
- Row Level Security policies
- Automatic timestamp triggers

### 4. Build and Run
```bash
# Build the project
npm run build

# Start the server (Supabase version)
npm start

# Development mode with auto-reload
npm run dev
```

### 5. Alternative: TypeORM Version
If you prefer to use the TypeORM version:
```bash
npm run start:typeorm
npm run dev:typeorm
```

---

## Authentication Endpoints

### 1. Register
**POST** `/api/auth/register`

Create a new user account with Supabase Auth.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "username": "john_doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "john_doe"
    }
  }
}
```

**Validation:**
- Email is required and must be valid
- Password must be at least 6 characters
- Username is optional (defaults to email prefix)

---

### 2. Login
**POST** `/api/auth/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "john_doe"
    }
  }
}
```

**Usage:**
Save the `token` and include it in subsequent API requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. Get Profile 🔒
**GET** `/api/auth/profile`

Get authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "john_doe",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Logout 🔒
**POST** `/api/auth/logout`

Log out the current user session.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Property Listing Endpoints

### 1. Create Property 🔒
**POST** `/api/properties`

Create a comprehensive property listing with all details.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Luxury 3BR Apartment with Stunning City Views",
  "description": "Beautiful modern apartment featuring premium finishes, floor-to-ceiling windows, and world-class amenities in a prime location.",

  "listing_type": "rent",
  "property_type": "Apartment",
  "tenure": "leasehold",

  "property_name": "Skyline Residences Tower A",
  "street_name": "123 Main Street",
  "city_name": "New York",
  "state": "New York",
  "county": "Manhattan",
  "pincode": "10001",
  "landmark": "Near Central Park",

  "price": 4500.00,
  "buildup_area": 1800.50,
  "furnishing": "Fully",
  "bedrooms": 3,
  "bathrooms": 2,
  "availability": "Immediate",
  "floor_level": "15th Floor",
  "year_of_build": 2020,
  "negotiable": true,

  "swimming_pool": true,
  "gymnasium": true,
  "playground": true,
  "bbq_area": false,
  "function_room": true,
  "games_room": true,
  "sky_garden": true,
  "reading_room": false,
  "lounge": true,

  "covered_parking": true,
  "visitor_parking": true,
  "service_lift": true,
  "prayer_room": false,
  "parcel_locker": true,
  "laundry_room": true,
  "cafeteria": false,

  "security_24h": true,
  "cctv_surveillance": true,
  "access_card_system": true,
  "fire_alarm_system": true,
  "emergency_exit": true,

  "images": [
    "https://your-bucket.nyc3.digitaloceanspaces.com/properties/1703456789-living-room.jpg",
    "https://your-bucket.nyc3.digitaloceanspaces.com/properties/1703456790-bedroom.jpg",
    "https://your-bucket.nyc3.digitaloceanspaces.com/properties/1703456791-kitchen.jpg"
  ]
}
```

**Field Details:**

**Required Fields:**
- `title` (string, max 255 chars)
- `description` (text)
- `listing_type` ("rent" or "sale")
- `property_type` (string, e.g., "Apartment", "House", "Condo")
- `tenure` ("freehold" or "leasehold")
- `price` (number, must be positive)

**Optional Location Fields:**
- `property_name`, `street_name`, `city_name`, `state`, `county`, `pincode`, `landmark`

**Optional Property Details:**
- `buildup_area` (number in square feet)
- `furnishing` ("Fully", "Partially", "Unfurnished")
- `bedrooms` (integer ≥ 0)
- `bathrooms` (integer ≥ 0)
- `availability` ("Immediate", "Next month", "Under Construction")
- `floor_level` (string)
- `year_of_build` (integer, 1800-2100)
- `negotiable` (boolean)

**Optional Amenities, Facilities & Security** (all boolean):
- See full list in request body above

**Optional Media:**
- `images` (array of strings, max 10 URLs)

**Response (201):**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": "uuid-property-id",
    "title": "Luxury 3BR Apartment with Stunning City Views",
    "listing_type": "rent",
    "price": 4500.00,
    "status": "active",
    "user_id": "uuid-user-id",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Get All Properties
**GET** `/api/properties`

Retrieve all property listings with powerful filtering options.

**Query Parameters:**

**Basic Filters:**
- `listingType` - "rent" or "sale"
- `propertyType` - e.g., "Apartment", "House"
- `tenure` - "freehold" or "leasehold"
- `furnishing` - "Fully", "Partially", "Unfurnished"
- `availability` - "Immediate", "Next month", "Under Construction"
- `status` - default is "active"

**Location Filters:**
- `cityName` - partial match, case-insensitive
- `state` - partial match, case-insensitive

**Price & Size Filters:**
- `minPrice` - minimum price
- `maxPrice` - maximum price
- `minBedrooms` - minimum number of bedrooms
- `maxBedrooms` - maximum number of bedrooms
- `minBathrooms` - minimum number of bathrooms
- `minArea` - minimum buildup area

**Feature Filters:**
- `negotiable` - true/false
- `swimmingPool` - true/false
- `gymnasium` - true/false
- `coveredParking` - true/false
- `security24h` - true/false

**Example Requests:**

1. All apartments for rent in New York:
```
GET /api/properties?listingType=rent&propertyType=Apartment&cityName=New York
```

2. Properties with 3+ bedrooms, pool, and gym, price $2000-$5000:
```
GET /api/properties?minBedrooms=3&swimmingPool=true&gymnasium=true&minPrice=2000&maxPrice=5000
```

3. Fully furnished properties with covered parking:
```
GET /api/properties?furnishing=Fully&coveredParking=true
```

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "uuid-1",
      "title": "Luxury 3BR Apartment",
      "description": "Beautiful apartment...",
      "listing_type": "rent",
      "property_type": "Apartment",
      "city_name": "New York",
      "price": 4500.00,
      "bedrooms": 3,
      "bathrooms": 2,
      "swimming_pool": true,
      "gymnasium": true,
      "images": ["url1", "url2"],
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Property by ID
**GET** `/api/properties/:id`

Retrieve complete details of a specific property.

**Example:**
```
GET /api/properties/uuid-property-id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-property-id",
    "title": "Luxury 3BR Apartment with Stunning City Views",
    "description": "Beautiful modern apartment...",
    "listing_type": "rent",
    "property_type": "Apartment",
    "tenure": "leasehold",
    "price": 4500.00,
    "bedrooms": 3,
    "bathrooms": 2,
    "swimming_pool": true,
    "gymnasium": true,
    "security_24h": true,
    "images": ["url1", "url2", "url3"],
    "user_id": "uuid-user-id",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Get My Properties 🔒
**GET** `/api/properties/my-properties`

Retrieve all properties created by the authenticated user.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid-1",
      "title": "My Property 1",
      "listing_type": "rent",
      "price": 4500.00,
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 5. Update Property 🔒
**PUT** `/api/properties/:id`

Update an existing property. Only the property owner can update.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "price": 5000.00,
  "bedrooms": 4,
  "status": "inactive",
  "images": ["new-url1", "new-url2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "id": "uuid-property-id",
    "title": "Updated Title",
    "price": 5000.00,
    "updated_at": "2024-01-16T14:20:00.000Z"
  }
}
```

---

### 6. Delete Property 🔒
**DELETE** `/api/properties/:id`

Delete a property. Only the property owner can delete.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
```

**Example:**
```
DELETE /api/properties/uuid-property-id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### 7. Search Properties
**GET** `/api/properties/search`

Full-text search across title, description, city, street, and landmark.

**Query Parameters:**
- `q` (required) - search term

**Example:**
```
GET /api/properties/search?q=luxury apartment city view
```

**Response (200):**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "uuid-1",
      "title": "Luxury Apartment with City View",
      "city_name": "New York",
      "price": 4500.00
    }
  ]
}
```

---

## Image Upload Endpoints

### 1. Upload Multiple Images 🔒
**POST** `/api/images/upload-multiple`

Upload up to 10 images to DigitalOcean Spaces.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images` - Multiple image files (max 10)

**File Requirements:**
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max size**: 5MB per image
- **Max count**: 10 images

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/api/images/upload-multiple \
  -H "Authorization: Bearer your-token" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "images=@photo3.jpg"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "imageUrls": [
      "https://bucket.nyc3.digitaloceanspaces.com/properties/1703456789-photo1.jpg",
      "https://bucket.nyc3.digitaloceanspaces.com/properties/1703456790-photo2.jpg",
      "https://bucket.nyc3.digitaloceanspaces.com/properties/1703456791-photo3.jpg"
    ]
  }
}
```

---

### 2. Upload Single Image 🔒
**POST** `/api/images/upload-single`

Upload a single image to DigitalOcean Spaces.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image` - Single image file

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/api/images/upload-single \
  -H "Authorization: Bearer your-token" \
  -F "image=@photo.jpg"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://bucket.nyc3.digitaloceanspaces.com/properties/1703456789-photo.jpg"
  }
}
```

---

### 3. Delete Image 🔒
**DELETE** `/api/images/delete`

Delete an image from DigitalOcean Spaces.

**Headers:**
```
Authorization: Bearer <your-supabase-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "imageUrl": "https://bucket.nyc3.digitaloceanspaces.com/properties/1703456789-photo.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## Complete Workflow Example

### Creating a Property Listing with Images

```javascript
// 1. Register/Login to get token
const loginRes = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { data: { token } } = await loginRes.json();

// 2. Upload images first
const formData = new FormData();
formData.append('images', imageFile1);
formData.append('images', imageFile2);
formData.append('images', imageFile3);

const uploadRes = await fetch('http://localhost:3000/api/images/upload-multiple', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const { data: { imageUrls } } = await uploadRes.json();

// 3. Create property listing with uploaded image URLs
const propertyRes = await fetch('http://localhost:3000/api/properties', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Luxury 3BR Apartment',
    description: 'Beautiful apartment with all amenities',
    listing_type: 'rent',
    property_type: 'Apartment',
    tenure: 'leasehold',
    price: 4500,
    bedrooms: 3,
    bathrooms: 2,
    city_name: 'New York',
    state: 'New York',
    furnishing: 'Fully',
    swimming_pool: true,
    gymnasium: true,
    covered_parking: true,
    security_24h: true,
    images: imageUrls
  })
});

const { data: property } = await propertyRes.json();
console.log('Property created:', property);
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to update this property"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Property not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to upload image"
}
```

---

## Security Features

### Row Level Security (RLS)
The properties table has RLS enabled with the following policies:

1. **SELECT**: Users can view:
   - All properties with `status = 'active'`
   - Their own properties regardless of status

2. **INSERT**: Authenticated users can create properties linked to their user_id

3. **UPDATE**: Users can only update their own properties

4. **DELETE**: Users can only delete their own properties

### Authentication
- All protected endpoints require a valid Supabase JWT token
- Tokens are verified on each request
- User identity is extracted from the token

---

## Database Schema

### Properties Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| title | VARCHAR(255) | Yes | Property title |
| description | TEXT | Yes | Property description |
| listing_type | VARCHAR(20) | Yes | "rent" or "sale" |
| property_type | VARCHAR(50) | Yes | Type of property |
| tenure | VARCHAR(50) | Yes | "freehold" or "leasehold" |
| price | NUMERIC(15,2) | Yes | Price/rent amount |
| bedrooms | INTEGER | No | Number of bedrooms |
| bathrooms | INTEGER | No | Number of bathrooms |
| ... (40+ more fields) | ... | ... | ... |
| images | JSONB | No | Array of image URLs |
| user_id | UUID | Yes | Owner's user ID (FK) |
| created_at | TIMESTAMPTZ | Yes | Creation time |
| updated_at | TIMESTAMPTZ | Yes | Last update time |

### Indexes
- `idx_properties_user_id` - Fast user-specific queries
- `idx_properties_listing_type` - Filter by rent/sale
- `idx_properties_city_name` - Location-based searches
- `idx_properties_price` - Price range queries
- `idx_properties_status` - Active listing queries
- `idx_properties_composite` - Combined filters

---

## Testing the API

### Using cURL

```bash
# Check server status
curl http://localhost:3000

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all properties
curl http://localhost:3000/api/properties

# Create property (requires token)
curl -X POST http://localhost:3000/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Property","description":"Test","listing_type":"rent","property_type":"Apartment","tenure":"leasehold","price":3000}'
```

---

## Troubleshooting

### Common Issues

**1. "Missing Supabase environment variables"**
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`

**2. "Failed to upload image"**
- Verify DigitalOcean Spaces credentials
- Check bucket permissions (must allow public read)
- Ensure file size is under 5MB

**3. "Invalid or expired token"**
- Token may have expired (check Supabase settings)
- Ensure token is included in Authorization header
- Try logging in again to get a fresh token

**4. "You are not authorized to update this property"**
- You can only update/delete your own properties
- Verify you're logged in as the correct user

---

## Performance Tips

1. **Use specific filters** instead of fetching all properties
2. **Implement pagination** for large result sets (add limit/offset to queries)
3. **Cache image URLs** on the client side
4. **Compress images** before uploading (max 5MB per image)
5. **Use indexes** - the table has optimized indexes for common queries

---

## Support

For issues or questions:
1. Check the error message in the API response
2. Verify your environment variables
3. Ensure Supabase project is active
4. Check DigitalOcean Spaces configuration

---

## License

ISC
