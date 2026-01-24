# 🔧 API 401 Error - Troubleshooting Guide

## Issue
Login request to `http://localhost:8080/api/v1/auth/login` returns **401 Unauthorized**

---

## What I Fixed in the Frontend

### 1. ✅ Updated Auth API Response Handling
**File**: `src/features/auth/authApi.js`

Changed response transformation to handle both formats:
```javascript
transformResponse: (response) => {
  // Handle both: direct data or wrapped in data field
  return response?.data || response;
}
```

### 2. ✅ Added Error Logging
**File**: `src/app/api/baseApi.js`

- Added detailed error logging in development mode
- Prevents token refresh attempts on login failures
- Better debugging information

### 3. ✅ Enhanced Login Component
**File**: `src/pages/auth/Login.jsx`

- Added console logging for login attempts
- Better error details in console
- Shows what's being sent and received

---

## Root Causes of 401 Error

The 401 error can happen for several reasons:

### 1. ❌ Backend Not Running
**Check**: Is the User Service running on port 8081?
```bash
# Check if service is running
curl http://localhost:8081/actuator/health
```

### 2. ❌ API Gateway Not Running
**Check**: Is the API Gateway running on port 8080?
```bash
# Check if gateway is running
curl http://localhost:8080/actuator/health
```

### 3. ❌ Invalid Credentials
**Check**: Are you using correct username/password?

The backend expects:
```json
{
  "emailOrUsername": "admin@medibridge.com",  // or username
  "password": "your_password"
}
```

### 4. ❌ CORS Not Configured
**Check**: Backend CORS settings

The backend must allow requests from `http://localhost:3000`

**Fix in User Service** (`application.yml`):
```yaml
cors:
  allowed-origins: http://localhost:3000,http://localhost:8080
```

### 5. ❌ Backend Response Format Mismatch
**Check**: What does the backend return?

Expected response format:
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "role": "ADMIN",
    "mustChangePassword": false
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "expiresIn": 86400000
}
```

Or wrapped:
```json
{
  "data": {
    "user": {...},
    "accessToken": "...",
    ...
  }
}
```

---

## How to Debug

### Step 1: Open Browser DevTools
Press `F12` and go to **Network** tab

### Step 2: Attempt Login
Try to log in and watch the network request

### Step 3: Check Request Details

#### Request Headers
```
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json
```

#### Request Payload
```json
{
  "emailOrUsername": "your_input",
  "password": "your_password"
}
```

#### Response Status
- **401** = Invalid credentials or authentication failure
- **404** = Endpoint not found (wrong URL)
- **500** = Server error
- **200** = Success

### Step 4: Check Console
Look for these logs:
```javascript
Attempting login with: { emailOrUsername: '...' }

API Error: {
  url: '/api/v1/auth/login',
  status: 401,
  data: { message: '...' }
}

Login failed: {
  status: 401,
  message: '...',
  data: {...}
}
```

---

## Solutions

### Solution 1: Use Direct User Service URL (Bypass Gateway)

If API Gateway is causing issues, temporarily use direct service URL:

**Update `.env`**:
```env
# Change this:
REACT_APP_API_GATEWAY_URL=http://localhost:8080

# To this (direct to user service):
REACT_APP_API_GATEWAY_URL=http://localhost:8081
```

Then restart the React app:
```bash
npm start
```

### Solution 2: Test Backend Directly

Use curl or Postman to test the backend:

```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "admin",
    "password": "admin123"
  }'
```

If this works but frontend doesn't, it's a CORS issue.

### Solution 3: Fix CORS in Backend

**In User Service** - `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",  // React app
        "http://localhost:8080"   // API Gateway
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Solution 4: Create Test User

If you don't have a user yet, create one via backend:

```bash
# Create admin user
curl -X POST http://localhost:8081/api/v1/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@medibridge.com",
    "role": "ADMIN"
  }'
```

### Solution 5: Check Backend Logs

Look at User Service logs for:
```
Authentication failed for user: ...
Invalid credentials
JWT token expired
```

---

## Verification Steps

### 1. ✅ Backend is Running
```bash
curl http://localhost:8081/actuator/health
# Should return: {"status":"UP"}
```

### 2. ✅ API Gateway is Running
```bash
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}
```

### 3. ✅ Login Endpoint Exists
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test","password":"test"}'
# Should return 401 with error message, not 404
```

### 4. ✅ CORS is Configured
Check browser console for CORS errors:
```
Access to fetch at 'http://localhost:8080/api/v1/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

If you see this, CORS is NOT configured properly.

### 5. ✅ Credentials are Valid
Try logging in with known credentials from your database.

---

## Quick Fix Checklist

- [ ] Backend services are running
- [ ] API Gateway is routing correctly
- [ ] CORS is configured to allow `http://localhost:3000`
- [ ] Test user exists in database
- [ ] Credentials are correct
- [ ] Response format matches expected structure
- [ ] Browser console shows detailed error logs
- [ ] Network tab shows request/response details

---

## Frontend Changes Summary

All changes maintain centralization:

1. ✅ **baseApi.js** - Added error logging, improved 401 handling
2. ✅ **authApi.js** - Flexible response handling (data or direct)
3. ✅ **Login.jsx** - Better error logging
4. ✅ **No changes to base URL** - Still using `env.apiGateway`
5. ✅ **Centralized configuration** - All APIs use baseApi

---

## Next Steps

1. **Check backend logs** for the actual error
2. **Test with curl** to verify backend works
3. **Check browser console** for detailed error info
4. **Verify CORS** configuration in backend
5. **Use correct credentials** for testing

---

**Most Common Fix**: 
Configure CORS in backend to allow `http://localhost:3000` and restart the backend service.

**Alternative**: 
Temporarily bypass API Gateway by setting `REACT_APP_API_GATEWAY_URL=http://localhost:8081` in `.env`
