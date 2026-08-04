# LandBazar API Guide for Postman

This guide covers the changed backend APIs for the land-only flow and gives ready-to-use Postman request examples.

## Base URL

Use one of these depending on your environment:

- Local backend: `http://localhost:3008/api`
- Railway / public backend: `http://159.223.92.101:3008/api` if reachable

## Auth APIs

### 1) Register User

- Method: `POST`
- URL: `/auth/register`
- Auth: none
- Headers:
  - `Content-Type: application/json`

Example body:
```json
{
  "username": "postmanuser",
  "email": "postman.user@example.com",
  "phone_number": "+919900001111",
  "password": "ram123"
}
```

Notes:
- Password rule is now simple alphanumeric with minimum length 4.
- New users may need OTP/email verification before login.

### 2) Login

- Method: `POST`
- URL: `/auth/login`
- Auth: none
- Headers:
  - `Content-Type: application/json`

Example body:
```json
{
  "email": "landowner.hyd@example.com",
  "password": "ram123"
}
```

Success response returns a JWT token at `data.token`.

### 3) Verify OTP

- Method: `POST`
- URL: `/auth/verify-otp`
- Auth: none
- Headers:
  - `Content-Type: application/json`

Example body:
```json
{
  "user_id": "uuid-here",
  "otp": "123456"
}
```

### 4) Verify Email

- Method: `POST`
- URL: `/auth/verify-email`
- Auth: none
- Headers:
  - `Content-Type: application/json`

Example body:
```json
{
  "token": "verification-token-from-email"
}
```

### 5) Get Profile

- Method: `GET`
- URL: `/auth/profile`
- Auth: Bearer token

Headers:
- `Authorization: Bearer <your-token>`

### 6) Update Profile

- Method: `PUT`
- URL: `/auth/profile`
- Auth: Bearer token
- Headers:
  - `Authorization: Bearer <your-token>`
  - `Content-Type: application/json`

Example body:
```json
{
  "username": "landownerhyd",
  "phone_number": "+919900001111",
  "full_name": "Land Owner"
}
```

### 7) Change Password

- Method: `POST` or `PUT`
- URL: `/auth/change-password`
- Auth: Bearer token
- Headers:
  - `Authorization: Bearer <your-token>`
  - `Content-Type: application/json`

Example body:
```json
{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

## Property / Land APIs

### 1) Create Land Post

- Method: `POST`
- URL: `/properties`
- Auth: Bearer token
- Headers:
  - `Authorization: Bearer <your-token>`
  - `Content-Type: application/json`

Example body:
```json
{
  "listingType": "sale",
  "propertyType": "HMDA Approved Plot",
  "title": "Postman Test Land Plot",
  "description": "Created from Postman flow validation",
  "price": 1750000,
  "areaUnit": "Square Yard",
  "landSize": 150,
  "pricePerUnit": 11666,
  "totalPrice": 1750000,
  "cityName": "Hyderabad",
  "state": "Telangana",
  "pincode": "500072",
  "location": "Kukatpally, Hyderabad",
  "facingDirection": "North",
  "cornerPlot": "Yes",
  "roadWidth": "30 ft",
  "surveyNumber": "88/A",
  "approvalTypes": ["HMDA"],
  "clearTitle": "Yes",
  "registrationReady": "Yes",
  "contactPersonName": "Postman User",
  "contactNumber": "+919900001111",
  "amenities": {
    "lifestyle": [],
    "facilities": ["CC Road", "Street Lights"],
    "security": []
  }
}
```

Minimum required fields enforced by backend:
- `title`
- `description`
- `price`
- `listingType`
- `propertyType`

### 2) Update Land Post

- Method: `PUT`
- URL: `/properties/:id`
- Auth: Bearer token
- Headers:
  - `Authorization: Bearer <your-token>`
  - `Content-Type: application/json`

Use the same land body as create, changing only the fields you need.

### 3) Get Property by ID

- Method: `GET`
- URL: `/properties/:id`
- Auth: none

### 4) List Properties

- Method: `GET`
- URL: `/properties`
- Auth: none

Useful query params:
- `listingType=sale`
- `propertyType=HMDA Approved Plot`
- `cityName=Hyderabad`
- `minPrice=1000000`
- `maxPrice=5000000`

Example:
```http
GET /properties?listingType=sale&propertyType=HMDA%20Approved%20Plot&cityName=Hyderabad
```

### 5) Search Properties

- Method: `GET`
- URL: `/properties/search`
- Auth: none

Supported query params:
- `q`
- `type`
- `city`
- `propertyName`
- `propertyType`

Example:
```http
GET /properties/search?q=plot&city=Hyderabad&propertyType=HMDA%20Approved%20Plot
```

### 6) My Properties

- Method: `GET`
- URL: `/properties/my-properties`
- Auth: Bearer token

### 7) Record Property View

- Method: `POST`
- URL: `/properties/:id/view`
- Auth: none

Example body:
```json
{
  "propertyUrl": "http://localhost:3002/property-details/uuid-here"
}
```

## Property Fit / Advisor APIs

### 1) Match Properties

- Method: `POST`
- URL: `/properties/fit/matches`
- Auth: none

Example body:
```json
{
  "answers": {
    "budget": "5000000",
    "city": "Hyderabad",
    "propertyType": "HMDA Approved Plot"
  },
  "contact": {
    "name": "Postman User",
    "email": "postman.user@example.com",
    "phone": "+919900001111"
  }
}
```

### 2) Create / Login Lead

- Method: `POST`
- URL: `/properties/fit/lead`
- Auth: none

### 3) Track Advisor View

- Method: `POST`
- URL: `/properties/fit/view`
- Auth: none

## Notifications APIs

These are protected.

- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

Use:
- `Authorization: Bearer <your-token>`

## Recommended Postman Flow

1. Call `POST /auth/login` using the seeded user:
   - Email: `landowner.hyd@example.com`
   - Password: `ram123`
2. Copy `data.token` from the response.
3. Set Postman environment variable:
   - `token = <copied-token>`
4. Call `POST /properties` with `Authorization: Bearer {{token}}`.
5. Use `GET /properties/my-properties` to confirm the post was created.

## Quick Test Notes

- A brand new user created by `POST /auth/register` may need verification before login.
- For fastest testing, use the seeded verified user above.
- The browser address bar cannot send the JSON body for login; use Postman or the app form.
