# API Testing Examples

## Using Postman

### 1. Register a New User

**Method:** POST
**URL:** `http://localhost:3000/api/auth/register`
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "phone_number": "+1234567890",
  "password": "Test1234"
}
```

### 2. Login

**Method:** POST
**URL:** `http://localhost:3000/api/auth/login`
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "Test1234"
}
```

**Response:** Save the `token` from the response for authenticated requests.

### 3. Get User Profile (Authenticated)

**Method:** GET
**URL:** `http://localhost:3000/api/auth/profile`
**Headers:**
```
Authorization: Bearer <paste-your-token-here>
Content-Type: application/json
```

## Using JavaScript Fetch

### Register
```javascript
const register = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        phone_number: '+1234567890',
        password: 'Test1234'
      })
    });

    const data = await response.json();
    console.log('Registration response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Login
```javascript
const login = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test1234'
      })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      console.log('Login successful:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Get Profile (Authenticated)
```javascript
const getProfile = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('Profile:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Using Axios

### Setup
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Register
```javascript
const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

await register({
  username: 'testuser',
  email: 'test@example.com',
  phone_number: '+1234567890',
  password: 'Test1234'
});
```

### Login
```javascript
const login = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

await login({
  email: 'test@example.com',
  password: 'Test1234'
});
```

### Get Profile
```javascript
const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error;
  }
};

const profile = await getProfile();
console.log(profile);
```

## Testing Flow

1. **Register** a new user
2. Check your email for verification link (in development, check Supabase dashboard)
3. Verify email using the verification token
4. **Login** with email and password
5. Save the JWT token received
6. Use the token in Authorization header for protected routes
7. **Get Profile** to verify authentication

## Common Issues

### Email Not Verified Error
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```
**Solution:** Check your email for verification link or verify through Supabase dashboard.

### Invalid Token Error
```json
{
  "success": false,
  "message": "Invalid token"
}
```
**Solution:** Token might be expired or malformed. Login again to get a new token.

### Username/Email Already Exists
```json
{
  "success": false,
  "message": "Email already exists"
}
```
**Solution:** Use a different email or username.
