# ✅ RTK Query Base Layer + Auth State Wiring - COMPLETE

## 📦 All Deliverables

### Core Files (6 files) ✅
1. **app/api/baseApi.js** - Base API with multiple service support
2. **app/api/authHeader.js** - Auth header utilities (existing, verified)
3. **features/auth/authSlice.js** - Auth state management (existing, verified)
4. **features/auth/authApi.js** - All AuthController endpoints (existing, verified)
5. **app/store.js** - Redux store configuration (updated)
6. **app/rootReducer.js** - Root reducer (updated)

### Configuration Files (2 files) ✅
1. **.env.example** - Environment variable template (updated)
2. **.env** - Local development config (updated)

---

## 🏗️ Architecture

### Multiple Service Support

```
Frontend Application
    ↓
Redux Store
    ↓
Three API Instances:
    ├── baseApi (API Gateway - default)
    ├── userServiceApi (Direct to user_service)
    └── appointmentServiceApi (Direct to appointment_service)
```

### Service URL Configuration

**Priority**: Service-specific URL > API Gateway URL

```javascript
// Direct service URLs (if configured)
REACT_APP_USER_SERVICE_BASE_URL=http://localhost:8081/api/v1
REACT_APP_APPOINTMENT_SERVICE_BASE_URL=http://localhost:8082/api/v1

// Or use API Gateway for all
REACT_APP_API_GATEWAY_URL=http://localhost:8080
```

---

## 🔧 baseApi.js Implementation

### Key Features

1. **Multiple Service Support**
   - `baseApi` - Default (API Gateway)
   - `userServiceApi` - Direct to user_service
   - `appointmentServiceApi` - Direct to appointment_service

2. **Dynamic Base URL**
   ```javascript
   const getServiceUrl = (service) => {
     const urls = {
       user_service: process.env.REACT_APP_USER_SERVICE_BASE_URL,
       appointment_service: process.env.REACT_APP_APPOINTMENT_SERVICE_BASE_URL,
     };
     return urls[service] || env.apiGateway;
   };
   ```

3. **Auto-Authentication**
   - Reads token from Redux state
   - Injects `Authorization: Bearer <token>` header
   - Sets `Content-Type: application/json`

4. **401 Handling with Token Refresh**
   ```
   Request → 401 Error
      ↓
   Try refresh token
      ↓
   Success? → Retry original request
      ↓
   Failure? → Logout & redirect to /login
   ```

5. **Error Logging (Development)**
   - Logs API errors in console
   - Shows URL, status, message
   - Only in development mode

---

## 🔐 authHeader.js

### Utilities Available

```javascript
import { getAuthHeader, getToken, hasToken } from './app/api/authHeader';

// Get auth header object
const headers = getAuthHeader(getState);
// → { Authorization: 'Bearer <token>' }

// Get raw token
const token = getToken(getState);
// → 'eyJhbGc...'

// Check if token exists
const authenticated = hasToken(getState);
// → true/false
```

---

## 🔄 authSlice.js

### State Structure

```javascript
{
  accessToken: string | null,
  refreshToken: string | null,
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string,
    mustChangePassword: boolean,
  } | null,
  role: string | null,
  forcePasswordChange: boolean,
  isAuthenticated: boolean,
  sessionExpiry: number | null,
}
```

### Actions Available

1. **setCredentials(payload)**
   - Stores tokens, user, role
   - Sets forcePasswordChange flag
   - Persists to localStorage
   - Sets isAuthenticated = true

2. **updateUser(payload)**
   - Updates user info
   - Updates role if changed
   - Syncs to localStorage

3. **clearForcePasswordChange()**
   - Clears force password flag
   - Updates user object
   - Syncs to localStorage

4. **logout()**
   - Clears all auth state
   - Removes from localStorage
   - Resets to initial state

5. **restoreAuth()**
   - Restores from localStorage on app init
   - Called in AppRouter useEffect

### Selectors

```javascript
import {
  selectAccessToken,
  selectRefreshToken,
  selectCurrentUser,
  selectUserRole,
  selectIsAuthenticated,
  selectForcePasswordChange,
} from './features/auth/authSlice';

// Usage
const token = useSelector(selectAccessToken);
const user = useSelector(selectCurrentUser);
const role = useSelector(selectUserRole);
const isAuth = useSelector(selectIsAuthenticated);
const mustChange = useSelector(selectForcePasswordChange);
```

---

## 🌐 authApi.js

### All 8 AuthController Endpoints Implemented

| Endpoint | Hook | Method | Purpose |
|----------|------|--------|---------|
| `/auth/register` | `useRegisterMutation` | POST | Register new patient |
| `/auth/login` | `useLoginMutation` | POST | User login |
| `/auth/refresh` | `useRefreshTokenMutation` | POST | Refresh access token |
| `/auth/logout` | `useLogoutMutation` | POST | Logout user |
| `/auth/verify-email` | `useVerifyEmailMutation` | GET | Verify email with token |
| `/auth/forgot-password` | `useForgotPasswordMutation` | POST | Send reset email |
| `/auth/reset-password` | `useResetPasswordMutation` | POST | Reset password |
| `/auth/change-password` | `useChangePasswordMutation` | POST | Change password |

### Usage Examples

#### Login
```javascript
import { useLoginMutation } from '../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';

function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = async (credentials) => {
    try {
      const response = await login(credentials).unwrap();
      
      // Store auth data in Redux
      dispatch(setCredentials(response));
      
      // Navigate based on role and forcePasswordChange
      if (response.user.mustChangePassword) {
        navigate('/force-password-change');
      } else {
        navigate(`/${response.user.role.toLowerCase()}/dashboard`);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

#### Register
```javascript
const [register, { isLoading }] = useRegisterMutation();

const handleRegister = async (patientData) => {
  try {
    const response = await register(patientData).unwrap();
    dispatch(setCredentials(response));
    navigate('/patient/dashboard');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

#### Logout
```javascript
const [logoutUser] = useLogoutMutation();
const dispatch = useDispatch();
const refreshToken = useSelector(selectRefreshToken);

const handleLogout = async () => {
  try {
    await logoutUser(refreshToken).unwrap();
  } catch (error) {
    console.error('Logout API failed:', error);
  } finally {
    // Clear state regardless of API result
    dispatch(logout());
    navigate('/login');
  }
};
```

#### Change Password
```javascript
const [changePassword, { isLoading }] = useChangePasswordMutation();
const dispatch = useDispatch();

const handleChangePassword = async (passwordData) => {
  try {
    await changePassword({
      currentPassword: passwordData.current,
      newPassword: passwordData.new,
    }).unwrap();
    
    // Clear force password flag
    dispatch(clearForcePasswordChange());
    
    // Navigate to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Password change failed:', error);
  }
};
```

---

## 🏪 Store Configuration

### Reducers

```javascript
{
  api: baseApi.reducer,                      // Main API
  userServiceApi: userServiceApi.reducer,    // User service
  appointmentServiceApi: appointmentServiceApi.reducer, // Appointment service
  auth: authReducer,                         // Auth state
}
```

### Middleware

All three API middlewares are included:
```javascript
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .concat(
      baseApi.middleware,
      userServiceApi.middleware,
      appointmentServiceApi.middleware
    )
```

### DevTools

Enabled in development mode:
```javascript
devTools: process.env.NODE_ENV !== 'production'
```

---

## 🔄 Token Refresh Flow

### Automatic Refresh on 401

```
1. User makes API request
    ↓
2. Server responds 401 (token expired)
    ↓
3. baseQueryWithReauth intercepts
    ↓
4. Calls POST /auth/refresh with refreshToken
    ↓
5a. Refresh Success:
    - Update tokens in Redux
    - Retry original request
    - Return result
    ↓
5b. Refresh Failure:
    - Dispatch logout()
    - Clear localStorage
    - Redirect to /login
```

### Manual Refresh

```javascript
const [refreshToken] = useRefreshTokenMutation();
const dispatch = useDispatch();

const handleRefresh = async () => {
  try {
    const response = await refreshToken(currentRefreshToken).unwrap();
    dispatch(setCredentials(response));
  } catch (error) {
    dispatch(logout());
    navigate('/login');
  }
};
```

---

## 🌍 Environment Variables

### .env.example

```bash
# API Gateway (default for all services)
REACT_APP_API_GATEWAY_URL=http://localhost:8080

# Direct service URLs (optional)
REACT_APP_USER_SERVICE_BASE_URL=http://localhost:8081/api/v1
REACT_APP_APPOINTMENT_SERVICE_BASE_URL=http://localhost:8082/api/v1

# WebSocket
REACT_APP_APPOINTMENT_WS_URL=http://localhost:8080/ws
```

### Usage Priority

1. **Service-specific URL** (if set)
2. **API Gateway URL** (fallback)

### Production Setup

**Option A: Use API Gateway for everything**
```bash
REACT_APP_API_GATEWAY_URL=https://api.medibridge.com
# Leave service URLs empty
```

**Option B: Direct service connections**
```bash
REACT_APP_USER_SERVICE_BASE_URL=https://users.medibridge.com/api/v1
REACT_APP_APPOINTMENT_SERVICE_BASE_URL=https://appointments.medibridge.com/api/v1
```

---

## 🎯 Integration Checklist

### Login Flow
- [x] Login endpoint implemented
- [x] Stores tokens in Redux
- [x] Stores user info in Redux
- [x] Sets role
- [x] Sets forcePasswordChange flag
- [x] Persists to localStorage
- [x] Handles forced password change redirect

### Logout Flow
- [x] Logout endpoint implemented
- [x] Calls backend to revoke token
- [x] Clears Redux state
- [x] Clears localStorage
- [x] Redirects to login

### Token Refresh
- [x] Auto-refresh on 401
- [x] Updates tokens in Redux
- [x] Retries failed request
- [x] Handles refresh failure (logout)

### Password Management
- [x] Change password endpoint
- [x] Forgot password endpoint
- [x] Reset password endpoint
- [x] Clears forcePasswordChange flag after change

### Registration
- [x] Register endpoint implemented
- [x] Stores tokens after registration
- [x] Redirects to patient dashboard

### Email Verification
- [x] Verify email endpoint
- [x] Accepts token from URL
- [x] Updates user status

---

## 🚀 Usage Examples

### In Components

```javascript
// Get auth state
const user = useSelector(selectCurrentUser);
const role = useSelector(selectUserRole);
const isAuthenticated = useSelector(selectIsAuthenticated);

// Use auth API
const [login, { isLoading, error }] = useLoginMutation();
const [logout] = useLogoutMutation();
const [changePassword] = useChangePasswordMutation();
```

### In API Definitions

```javascript
// Use baseApi for general endpoints (via API Gateway)
export const myApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getData: builder.query({
      query: () => '/my-endpoint',
    }),
  }),
});

// Or use service-specific API
export const userApi = userServiceApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/patients/me',
    }),
  }),
});
```

---

## ✅ Verification

### All Requirements Met

1. **baseApi** ✅
   - Multiple service support (baseApi, userServiceApi, appointmentServiceApi)
   - Dynamic baseUrl from environment
   - Auto-inject auth headers
   - 401 handling with auto-refresh

2. **authHeader** ✅
   - Utility functions for auth headers
   - Token extraction from Redux
   - Existing implementation verified

3. **authApi** ✅
   - All 8 AuthController endpoints implemented
   - Login stores token + role + user
   - Forced password change support
   - All hooks exported

4. **.env.example** ✅
   - USER_SERVICE_BASE_URL
   - APPOINTMENT_SERVICE_BASE_URL
   - WS_URL
   - API_GATEWAY_URL (fallback)

---

## 🎉 Status: PRODUCTION READY

**Complete RTK Query Layer**:
- ✅ Multi-service base API
- ✅ Auth header injection
- ✅ Auto token refresh
- ✅ 401 global handling
- ✅ All auth endpoints
- ✅ Redux state wiring
- ✅ Store configuration
- ✅ Environment setup
- ✅ Zero compilation errors

**Ready for API integration across all features!**

---

**Date**: January 23, 2026  
**Status**: ✅ Complete
