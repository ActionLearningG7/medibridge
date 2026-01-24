# 🔍 PATIENT LOGIN REDIRECT ISSUE - TROUBLESHOOTING GUIDE

## 🎯 Problem

**Symptom**: PATIENT login succeeds but immediately redirects back to login page
**Working**: DOCTOR and ADMIN logins work fine
**Status**: Need to identify why PATIENT is different

---

## 🔧 Diagnostic Logging Added

### 1. Login.jsx - Enhanced Login Logging ✅

Added comprehensive logging to track the entire login flow:

```javascript
console.log('✓ Login successful, response:', response);
console.log('✓ Response structure:', {
  hasUser: !!response.user,
  hasAccessToken: !!response.accessToken,
  hasRefreshToken: !!response.refreshToken,
  userRole: response.user?.role || response.role,
  userEmail: response.user?.email || response.email
});
console.log('✓ Credentials stored in Redux');
console.log('✓ Stored in localStorage:', {
  hasToken: !!storedToken,
  tokenPreview: storedToken ? storedToken.substring(0, 30) + '...' : 'none',
  user: storedUser ? JSON.parse(storedUser) : null
});
console.log('✓ User details:', {
  role,
  mustChangePassword,
  userId: user.id,
  email: user.email
});
console.log(`✓ Navigating to: ${redirectPath}`);
console.log('✓ Navigate called successfully');
```

### 2. PatientDashboard.jsx - Dashboard Logging ✅

Added logging to track dashboard rendering and API calls:

```javascript
console.log('📊 PatientDashboard render:', {
  initialized,
  hasToken: !!accessToken,
  userRole: currentUser?.role,
  userId: currentUser?.id
});
console.log('📊 PatientDashboard shouldSkipQueries:', shouldSkipQueries);
console.error('📊 PatientDashboard: Profile fetch error:', profileError);
console.error('📊 PatientDashboard: Appointments fetch error:', appointmentsError);
console.error('📊 PatientDashboard: Queue fetch error:', queueError);
```

---

## 🧪 Testing Procedure

### Step 1: Clear Everything
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Step 3: Open Console and Network Tab
```
1. Open DevTools (F12)
2. Go to Console tab
3. Open Network tab in another DevTools panel
4. Keep both visible
```

### Step 4: Login as PATIENT
```
1. Navigate to /login
2. Enter PATIENT credentials
3. Click "Sign in"
4. IMMEDIATELY watch Console for logs
5. WATCH Network tab for API calls
```

---

## 📊 What to Look For

### In Console - Expected Good Sequence:

```
🔐 Attempting login...
✓ Login successful, response: { ... }
✓ Response structure: { hasUser: true, hasAccessToken: true, userRole: 'PATIENT' }
✓ Credentials stored in Redux
✓ Stored in localStorage: { hasToken: true, user: { role: 'PATIENT' } }
✓ User details: { role: 'PATIENT', mustChangePassword: false }
✓ Navigating to: /patient/dashboard
✓ Navigate called successfully
🔄 Initializing auth from localStorage...
✓ Auth restored from localStorage: { role: 'PATIENT' }
🛡️ ProtectedRoute check: { initialized: true, hasToken: true, userRole: 'PATIENT' }
✓ ProtectedRoute: Access granted
📊 PatientDashboard render: { initialized: true, hasToken: true, userRole: 'PATIENT' }
📊 PatientDashboard shouldSkipQueries: false
```

### In Console - Bad Sequence (Logout Triggered):

```
🔐 Attempting login...
✓ Login successful, response: { ... }
✓ Credentials stored in Redux
✓ Navigating to: /patient/dashboard
🛡️ ProtectedRoute check: { hasToken: true }
✓ ProtectedRoute: Access granted
📊 PatientDashboard render: { hasToken: true }
🔴 API Error: { url: '/api/v1/patients/me', status: 401 }
🔴 401 Unauthorized: { url: '/api/v1/patients/me' }
✗ No refresh token available, logging out  ← PROBLEM!
🚨 LOGOUT TRIGGERED
```

### In Network Tab - Watch For:

1. **POST /api/v1/auth/login**
   - Status: 200 OK ✅
   - Response has: accessToken, refreshToken, user
   - user.role = "PATIENT"

2. **GET /api/v1/patients/me** (after dashboard loads)
   - Status: Should be 200 OK ✅
   - Status: If 401 → Token invalid for patient
   - Status: If 403 → Role mismatch
   - Status: If 404 → Endpoint doesn't exist

3. **Look for unexpected logout call**
   - If you see redirect to /login immediately
   - Check what API call triggered it

---

## 🔍 Possible Root Causes

### 1. **Token Missing PATIENT Role** ⚠️

**Symptom**: Token is generated but doesn't include PATIENT role claim

**Check**:
```javascript
// In console after login:
const token = localStorage.getItem('accessToken');
// Decode JWT (paste token into jwt.io)
// Check if "role": "PATIENT" or "authorities": ["ROLE_PATIENT"]
```

**Fix**: Backend needs to include role in JWT token

### 2. **Patient Endpoint Returns 401** ⚠️

**Symptom**: `/api/v1/patients/me` returns 401 Unauthorized

**Check Network Tab**: Look for 401 response

**Causes**:
- Token doesn't have PATIENT authority
- Backend endpoint requires different role
- Token expired immediately (unlikely)

**Fix**: Verify backend `@PreAuthorize("hasRole('PATIENT')")`

### 3. **Patient Endpoint Doesn't Exist** ⚠️

**Symptom**: `/api/v1/patients/me` returns 404

**Check Network Tab**: Look for 404 response

**Fix**: Verify backend PatientController has `/me` endpoint

### 4. **Role Name Mismatch** ⚠️

**Symptom**: Token has "ROLE_PATIENT" but frontend expects "PATIENT"

**Check**:
```javascript
// In console:
JSON.parse(localStorage.getItem('user')).role
// Should be: "PATIENT"
// NOT: "ROLE_PATIENT"
```

**Fix**: Backend should return normalized role name without "ROLE_" prefix

### 5. **CORS Issue for Patient Endpoints** ⚠️

**Symptom**: FETCH_ERROR on patient API calls

**Check Network Tab**: Look for CORS errors

**Fix**: Backend CORS configuration

### 6. **Patient Dashboard Triggers Immediate Logout** ⚠️

**Symptom**: Dashboard loads then immediately logs out

**Check Console**: Look for "🚨 LOGOUT TRIGGERED" with payload

**Common Causes**:
- API error triggers logout (should be fixed with our error handling)
- Component unmounts and triggers cleanup
- Old code still in browser cache

---

## 🔬 Compare DOCTOR vs PATIENT

### Run This Test:

1. **Login as DOCTOR**
   - Note the console logs
   - Note the API calls in Network tab
   - Note the response structure

2. **Logout**

3. **Login as PATIENT**
   - Compare console logs to DOCTOR
   - Compare API calls to DOCTOR
   - Look for differences

### Key Differences to Look For:

| Aspect | DOCTOR | PATIENT | Expected |
|--------|--------|---------|----------|
| Login response role | "DOCTOR" | "PATIENT" | Should match |
| Token structure | {...} | {...} | Should be same |
| Dashboard endpoint | `/api/v1/doctors/me` | `/api/v1/patients/me` | Different paths |
| Endpoint status | 200 OK | ??? | Should be 200 OK |
| ProtectedRoute | Allows | Redirects? | Should allow |

---

## 🎯 Immediate Actions

### Action 1: Check Console Logs
With the new logging, login as PATIENT and screenshot the console output.

### Action 2: Check Network Tab
Look for the `/api/v1/patients/me` request:
- What status code?
- What's in the response?
- Does it have Authorization header?

### Action 3: Check Token Contents
```javascript
// After patient login:
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Decode at jwt.io
// Check: Does it have role: "PATIENT" or authorities: ["ROLE_PATIENT"]?
```

### Action 4: Compare with Working Login
```javascript
// After DOCTOR login:
const doctorToken = localStorage.getItem('accessToken');
console.log('Doctor token:', doctorToken);

// After PATIENT login:
const patientToken = localStorage.getItem('accessToken');
console.log('Patient token:', patientToken);

// Compare structure
```

---

## 🔧 Quick Fixes to Try

### Fix 1: Verify Backend PatientController

Check if this endpoint exists:

```java
@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")  // ← Must be PATIENT, not ROLE_PATIENT
    public ResponseEntity<...> getMyProfile(Authentication auth) {
        // ...
    }
}
```

### Fix 2: Check Role Normalization

In backend AuthService, ensure role is normalized:

```java
// When creating auth response:
user.setRole("PATIENT");  // Not "ROLE_PATIENT"
```

### Fix 3: Verify Token Generation

Check if JWT token includes role claim:

```java
// In JWT generation:
claims.put("role", user.getRole());  // Should be "PATIENT"
```

---

## 📝 Information Needed

To diagnose further, provide:

1. **Console output** after PATIENT login (full sequence)
2. **Network tab screenshot** showing `/api/v1/patients/me` request
3. **Token contents** (decode at jwt.io - remove signature before sharing)
4. **Comparison** with DOCTOR login (does DOCTOR work smoothly?)

---

## ✅ Next Steps

1. ✅ **Test with new logging** - All diagnostic logging is now in place
2. ⚠️ **Login as PATIENT** - Watch console closely
3. ⚠️ **Screenshot console** - Capture the full sequence
4. ⚠️ **Check Network tab** - Look for 401/403/404 errors
5. ⚠️ **Compare with DOCTOR** - Identify the difference

---

**Date**: January 23, 2026  
**Issue**: PATIENT login redirects, DOCTOR/ADMIN work  
**Status**: 🔍 Diagnostic logging added - Ready to test  
**Action**: Login as PATIENT and check console logs
