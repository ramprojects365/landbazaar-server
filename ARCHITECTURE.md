# Application Architecture

This document describes the layered architecture of the authentication API.

## Architecture Overview

The application follows a **3-layer architecture** pattern:

```
┌─────────────────────────────────────────────┐
│         HTTP Layer (Routes)                 │
│    Express Routes & Validation              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Controller Layer                    │
│    Request/Response Handling                │
│    Error Management                         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Service Layer                       │
│    Business Logic                           │
│    Authentication & Validation              │
│    Token Generation & Verification          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Repository Layer                    │
│    Database Operations                      │
│    Query Building & Execution               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Database Layer                      │
│    PostgreSQL                               │
│    Connection Pool                          │
└─────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. HTTP Layer (Routes)

**Location:** `src/routes/`

Responsibilities:
- Define API endpoints
- Input validation using express-validator
- Request parameter binding
- Route configuration

```javascript
// src/routes/authRoutes.js
router.post('/register', [validation rules], register);
```

### 2. Controller Layer

**Location:** `src/controllers/`

Responsibilities:
- Extract request parameters
- Call service layer functions
- Format responses
- Handle errors and return appropriate HTTP status codes
- Validation result processing

**Key Features:**
- Separation of HTTP concerns from business logic
- Consistent error handling
- Response formatting

```javascript
// src/controllers/authController.js
export const register = async (req, res) => {
  const result = await authService.registerUser({...});
  return res.status(201).json({...});
}
```

### 3. Service Layer

**Location:** `src/services/`

Responsibilities:
- Business logic implementation
- Authentication logic
- Password hashing & verification
- Token generation & validation
- Email verification logic
- Data transformation
- Error handling with proper status codes

**Key Features:**
- Contains all business rules
- Independent of HTTP framework
- Easily testable
- Reusable across different interfaces

```javascript
// src/services/authService.js
export const registerUser = async (registrationData) => {
  // Validate duplicate check
  // Hash password
  // Generate verification token
  // Create user
  // Return formatted user data
}
```

### 4. Repository Layer

**Location:** `src/repositories/`

Responsibilities:
- Database query execution
- Data access operations
- Query parameterization
- Database abstraction

**Key Features:**
- CRUD operations for database entities
- SQL injection prevention (parameterized queries)
- Database connection handling
- Single responsibility - only database operations

```javascript
// src/repositories/userRepository.js
export const createUser = async (userData) => {
  const result = await query(
    'INSERT INTO users (...) VALUES (...)',
    [userData.username, userData.email, ...]
  );
  return result.rows[0];
}
```

### 5. Middleware Layer

**Location:** `src/middleware/`

Responsibilities:
- Authentication token verification
- User context enrichment
- Request preprocessing

## Data Flow

### Registration Flow

```
POST /api/auth/register
    │
    ├─ Route Validation (express-validator)
    │
    ├─ Controller: register()
    │  ├─ Extract req.body
    │  └─ Call authService.registerUser()
    │
    ├─ Service: registerUser()
    │  ├─ Check duplicates via userRepository.checkUserExists()
    │  ├─ Hash password
    │  ├─ Generate verification token
    │  └─ Call userRepository.createUser()
    │
    ├─ Repository: createUser()
    │  ├─ Build INSERT query
    │  └─ Execute query
    │
    └─ Response: 201 with user data
```

### Login Flow

```
POST /api/auth/login
    │
    ├─ Route Validation
    │
    ├─ Controller: login()
    │  └─ Call authService.loginUser()
    │
    ├─ Service: loginUser()
    │  ├─ Call userRepository.findUserByEmail()
    │  ├─ Verify password with bcrypt
    │  ├─ Check email verification status
    │  ├─ Generate JWT token
    │  └─ Update last login
    │
    ├─ Repository: findUserByEmail() & updateLastLogin()
    │  └─ Execute queries
    │
    └─ Response: 200 with token & user
```

### Protected Request Flow

```
GET /api/auth/profile (with Authorization header)
    │
    ├─ Middleware: authenticateToken()
    │  ├─ Extract JWT from header
    │  ├─ Verify token signature
    │  ├─ Call authService.validateToken()
    │  └─ Attach user to req.user
    │
    ├─ Service: validateToken()
    │  └─ Call userRepository.findUserById()
    │
    ├─ Repository: findUserById()
    │  └─ Execute SELECT query
    │
    ├─ Controller: getProfile()
    │  └─ Return req.user
    │
    └─ Response: 200 with profile
```

## File Structure

```
src/
├── config/
│   └── database.js              # PostgreSQL connection pool
│
├── controllers/
│   └── authController.js        # HTTP request handlers
│
├── services/
│   └── authService.js           # Business logic
│
├── repositories/
│   └── userRepository.js        # Database operations
│
├── middleware/
│   └── auth.js                  # JWT verification
│
├── routes/
│   └── authRoutes.js            # API endpoint definitions
│
├── types/
│   └── user.js                  # Type definitions & classes
│
├── utils/
│   └── errors.js                # Custom error classes
│
└── server.js                    # Express app setup
```

## Key Design Patterns

### 1. Repository Pattern
Abstracts database operations from business logic, allowing:
- Easy testing with mocks
- Database implementation changes without affecting services
- Consistent data access interface

### 2. Service Pattern
Contains business logic separate from:
- HTTP concerns (controllers)
- Database concerns (repositories)
- Can be reused by different interfaces (REST, GraphQL, etc.)

### 3. Error Handling
Custom error classes with:
- Appropriate HTTP status codes
- Consistent error messages
- Proper error propagation

```javascript
throw {
  status: 400,
  message: 'Email already exists'
};
```

### 4. Dependency Injection (Implicit)
Services use repositories without tight coupling:
```javascript
// Service uses repository without direct instantiation
const user = await userRepository.findUserByEmail(email);
```

## Benefits of This Architecture

1. **Separation of Concerns**
   - Each layer has a single, well-defined responsibility
   - Changes in one layer don't affect others

2. **Testability**
   - Services can be tested independently
   - Repositories can be mocked for service tests
   - Controllers can be tested with mocked services

3. **Maintainability**
   - Clear structure makes code easy to navigate
   - Changes are localized to specific layers
   - New developers understand the codebase quickly

4. **Scalability**
   - Easy to add new features by extending services
   - Database changes only affect repositories
   - New endpoints follow the same pattern

5. **Reusability**
   - Services can be used by different controllers
   - Repositories can be reused across services
   - Utilities can be shared across the application

## Adding New Features

To add a new feature (e.g., password reset):

1. **Repository Layer**
   ```javascript
   // src/repositories/userRepository.js
   export const updateResetToken = async (userId, token, expiry) => { ... }
   ```

2. **Service Layer**
   ```javascript
   // src/services/authService.js
   export const initiatePasswordReset = async (email) => { ... }
   ```

3. **Controller Layer**
   ```javascript
   // src/controllers/authController.js
   export const resetPassword = async (req, res) => { ... }
   ```

4. **Routes**
   ```javascript
   // src/routes/authRoutes.js
   router.post('/reset-password', [...], resetPassword);
   ```

## Error Handling Strategy

The application uses consistent error handling:

```javascript
// In Service Layer
throw { status: 400, message: 'Error message' };

// In Controller Layer
catch (error) {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      message: error.message
    });
  }
  // Handle unexpected errors
}
```

## Environment Configuration

Database and JWT configurations are read from `.env`:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRY`

This allows different configurations for development, staging, and production without code changes.
