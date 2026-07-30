# Authentication API with Node.js and PostgreSQL

A complete registration and login system with JWT authentication, email verification, and password hashing using native PostgreSQL.

## Features 

- User registration with username, email, phone number, and password
- Password hashing using bcrypt
- Email verification requirement for login
- JWT token generation and authentication
- Native PostgreSQL database integration
- Input validation and error handling
- Protected routes with authentication middleware

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure PostgreSQL Database

Create a PostgreSQL database and update the `.env` file:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRY=7d

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=auth_db
DB_SSL=false
```

### 3. Initialize Database Schema

Run the database setup script to create tables:

```bash
npm run setup-db
```

This will create the `users` table with all necessary columns and indexes.

### 4. Run the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

## Architecture

This application follows a **3-layer architecture** pattern for clean, maintainable code:

- **Controller Layer** - Handles HTTP requests and responses
- **Service Layer** - Contains all business logic and authentication rules
- **Repository Layer** - Manages all database operations

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation on the application structure, data flow, and design patterns.

## Project Structure

```
src/
├── config/database.js           # PostgreSQL connection
├── controllers/authController.js # HTTP handlers
├── services/authService.js       # Business logic
├── repositories/userRepository.js # Database operations
├── middleware/auth.js            # JWT authentication
├── routes/authRoutes.js          # API endpoints
├── types/user.js                 # Type definitions
└── utils/errors.js               # Error classes
```

## API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- Username: 3-30 characters, letters, numbers, and underscores only
- Email: Valid email format
- Phone number: Optional, E.164 format
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "emailVerified": false
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "email_verified": true
    }
  }
}
```

**Error Responses:**

401 - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

403 - Email not verified:
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

### 3. Get User Profile (Protected)

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "phone_number": "+1234567890",
      "email_verified": true,
      "created_at": "2025-12-03T10:00:00Z",
      "updated_at": "2025-12-03T10:00:00Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 4. Verify Email

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "password": "SecurePass123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get profile (replace TOKEN with your JWT):
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Database Schema

### users Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(30) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone_number | VARCHAR(20) | UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| email_verified | BOOLEAN | DEFAULT false |
| verification_token | VARCHAR(255) | |
| verification_expiry | TIMESTAMP | |
| last_login | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- idx_users_email
- idx_users_username
- idx_users_phone_number
- idx_users_verification_token

## Security Features

- Passwords are hashed using bcrypt (salt rounds: 10)
- JWT tokens for secure authentication
- Email verification required before login
- Input validation on all endpoints
- Verification tokens with 24-hour expiry
- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- SQL parameterized queries to prevent SQL injection
- Unique constraints on username, email, and phone number

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

For validation errors:
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Username must be between 3 and 30 characters",
      "param": "username",
      "location": "body"
    }
  ]
}
```

## Complete Project Structure

```
.
├── src/
│   ├── config/
│   │   └── database.js                # PostgreSQL connection pool
│   ├── controllers/
│   │   └── authController.js          # HTTP request handlers
│   ├── services/
│   │   └── authService.js             # Business logic & authentication
│   ├── repositories/
│   │   └── userRepository.js          # Database operations
│   ├── middleware/
│   │   └── auth.js                    # JWT verification middleware
│   ├── routes/
│   │   └── authRoutes.js              # API endpoint definitions
│   ├── types/
│   │   └── user.js                    # Type definitions & classes
│   ├── utils/
│   │   └── errors.js                  # Custom error classes
│   └── server.js                      # Express app setup
├── sql/
│   └── init.sql                       # Database schema
├── scripts/
│   └── setup-db.js                    # Database initialization script
├── .env                               # Environment variables
├── .gitignore
├── package.json
├── README.md
├── ARCHITECTURE.md                    # Architecture documentation
├── API_EXAMPLES.md                    # API usage examples
└── POSTGRES_SETUP.md                  # PostgreSQL setup guide
```
