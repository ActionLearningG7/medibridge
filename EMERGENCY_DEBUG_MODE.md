# 🚨 EMERGENCY DEBUG MODE - PATIENT LOGIN

## ⚠️ CRITICAL: Logout Happening Too Fast

**Problem**: Redirect happens so fast you can't see logs, localStorage gets cleared immediately

**Solution Applied**: Added emergency breakpoints and delays

---

## 🔧 Emergency Fixes Applied

### 1. **Logout Confirmation Dialog** ⚠️ (TEMPORARY)

**File**: `authSlice.js`

Added a confirmation dialog that PAUSES logout:

```javascript
logout: (state, action) => {
  // Shows confirmation dialog with current state
  const shouldLogout = window.confirm(
    '⚠️ LOGOUT DETECTED!\n\n' +
    'Role: ' + state.role + '\n' +
    'Has Token: ' + !!state.accessToken + '\n' +
    'Reason: ' + (action.payload?.reason || 'unknown') + '\n\n' +
    'Check console logs NOW!\n\n' +
    'Click OK to proceed\nClick Cancel to stay logged in'
  );
  
  if (!shouldLogout) {
    return; // Don't logout - DEBUG MODE
  }
  
  // ... proceed with logout
}
```

**What this does**:
- ✅ Stops execution when logout is triggered
- ✅ Shows you the current state (role, token)
- ✅ Shows you the reason for logout
- ✅ Gives you time to check console logs
- ✅ Lets you CANCEL logout to stay logged in

### 2. **3-Second Delay Before Logout** ⏸️

**File**: `baseApi.js`

Added delays in the error handling:

```javascript
console.error('✗ Token refresh failed, logging out');
console.error('⏸️ PAUSING 3 seconds - Check console logs!');

// Wait 3 seconds
await new Promise(resolve => setTimeout(resolve, 3000));

// Then logout
api.dispatch({ type: 'auth/logout', payload: { reason: 'refresh_failed' } });
```

**What this does**:
- ✅ Gives you 3 seconds to see console logs
- ✅ You can screenshot the logs
- ✅ You can check Network tab
- ✅ Time to understand what's happening

---

## 🧪 Testing with Emergency Mode

### Step 1: Clear and Refresh
```javascript
localStorage.clear();
// Ctrl + Shift + R
```

### Step 2: Open DevTools
```
F12 → Console tab → Network tab
```

### Step 3: Login as PATIENT

**What will happen**:

#### Scenario A: Logout Dialog Appears
```
1. Login succeeds
2. Navigation happens
3. ⚠️ Dialog appears: "LOGOUT DETECTED!"
4. Dialog shows:
   - Role: PATIENT
   - Has Token: true
   - Reason: refresh_failed (or no_refresh_token or unknown)
5. YOU HAVE TIME TO:
   - Read console logs
   - Check Network tab
   - Screenshot everything
6. Click "Cancel" to stay logged in
   OR
   Click "OK" to proceed with logout
```

#### Scenario B: 3-Second Pause
```
1. Login succeeds
2. Navigation happens
3. API error occurs
4. Console shows: "⏸️ PAUSING 3 seconds - Check console logs!"
5. YOU HAVE 3 SECONDS TO:
   - Read console logs
   - Check Network tab
   - Screenshot errors
6. After 3 seconds: Logout happens
```

---

## 📊 What to Check During the Pause

### In Console:
```
Look for:
1. "🔐 Attempting login..." - Login started
2. "✓ Login successful" - Login worked
3. "✓ Navigating to: /patient/dashboard" - Navigation attempted
4. "🛡️ ProtectedRoute check" - Route protection
5. "📊 PatientDashboard render" - Dashboard loading
6. "🔴 API Error" - What API call failed?
7. "✗ Token refresh failed" or "✗ No refresh token" - Why logout?
```

### In Network Tab:
```
Check these requests in order:
1. POST /api/v1/auth/login
   - Status: 200 OK?
   - Response has accessToken?

2. GET /api/v1/patients/me
   - Status: 200, 401, 403, 404?
   - Has Authorization header?

3. GET /api/v1/appointments/me
   - Status: 200, 401, 403, 404?
   - Has Authorization header?

4. POST /api/v1/auth/refresh (if 401 happened)
   - Status: 200, 401?
   - Response has new accessToken?
```

### In Confirmation Dialog:
```
MOST IMPORTANT INFO:
- Reason field shows why logout is triggered
  - "refresh_failed" = Refresh token API failed
  - "no_refresh_token" = No refresh token in state
  - "unknown" or undefined = Logout called from component
```

---

## 🔍 Diagnosis Based on Dialog

### If Dialog Shows: `Reason: refresh_failed`

**Meaning**: Token refresh API returned error

**Check**:
1. Network tab for `/api/v1/auth/refresh` request
2. What status code? (401, 404, 500?)
3. What's in response body?

**Likely Cause**:
- Refresh token is invalid
- Backend refresh endpoint not working
- Refresh token not being sent correctly

### If Dialog Shows: `Reason: no_refresh_token`

**Meaning**: No refresh token found in Redux state

**Check**:
1. Console: "✓ Stored in localStorage" - was refreshToken stored?
2. Browser localStorage - does refreshToken exist?

**Likely Cause**:
- Login response doesn't include refreshToken
- Backend not returning refreshToken for PATIENT

### If Dialog Shows: `Reason: unknown` or `undefined`

**Meaning**: Logout called from a component, not baseApi

**Check**:
1. Stack trace in console log
2. Which component called logout?

**Likely Cause**:
- Topbar logout button clicked accidentally
- Some useEffect triggering logout
- Component cleanup calling logout

---

## 🎯 Common Issues & Quick Checks

### Issue 1: Patient Token Doesn't Include Refresh Token

**Check in Console** after login:
```javascript
// Look for this log:
✓ Response structure: {
  hasAccessToken: true,
  hasRefreshToken: true,  // ← Should be true!
  userRole: 'PATIENT'
}
```

**If `hasRefreshToken: false`**:
- Backend is not returning refreshToken for PATIENT
- Check AuthService in backend
- Compare DOCTOR login response structure

### Issue 2: Patient Endpoints Return 401

**Check Network Tab**:
```
GET /api/v1/patients/me → 401 Unauthorized
```

**Causes**:
- Token doesn't have PATIENT role/authority
- Backend expects "ROLE_PATIENT" but token has "PATIENT"
- Token expired immediately

**Fix**: Check JWT token contents at jwt.io

### Issue 3: Appointments Endpoint Triggers Logout

**Check Network Tab**:
```
GET /api/v1/appointments/me → 401 Unauthorized
```

**This could trigger the chain**:
1. Appointments API returns 401
2. baseApi tries to refresh token
3. Refresh fails (no refresh token?)
4. Logout triggered

---

## 🔧 Immediate Actions

### Action 1: Test with Dialog
1. Login as PATIENT
2. When dialog appears, **don't click anything yet**
3. Read the "Reason" field
4. Check console logs
5. Check Network tab
6. Screenshot everything
7. Click "Cancel" to stay logged in

### Action 2: Compare Tokens
```javascript
// After DOCTOR login (successful):
const doctorToken = localStorage.getItem('accessToken');
const doctorRefresh = localStorage.getItem('refreshToken');
console.log('Doctor tokens:', { 
  accessToken: doctorToken?.substring(0, 50),
  refreshToken: doctorRefresh?.substring(0, 50)
});

// After PATIENT login (before logout):
const patientToken = localStorage.getItem('accessToken');
const patientRefresh = localStorage.getItem('refreshToken');
console.log('Patient tokens:', {
  accessToken: patientToken?.substring(0, 50),
  refreshToken: patientRefresh?.substring(0, 50)
});

// Compare lengths and structure
```

### Action 3: Check Backend Response
In Network tab, check login response body:
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",  // ← Does this exist for PATIENT?
    "user": {
      "id": 1,
      "role": "PATIENT",  // ← Correct role?
      "email": "patient@test.com"
    }
  }
}
```

---

## 📝 What to Report

When the dialog appears, report:

1. **Reason field value**: refresh_failed / no_refresh_token / unknown
2. **Console logs**: Copy the entire sequence
3. **Network tab**: Screenshot showing all requests
4. **localStorage contents** (before dialog):
   ```javascript
   {
     accessToken: localStorage.getItem('accessToken')?.substring(0, 50),
     refreshToken: localStorage.getItem('refreshToken')?.substring(0, 50),
     user: localStorage.getItem('user')
   }
   ```

---

## 🔄 After Diagnosis

### To Remove Emergency Mode:

Once you've identified the issue, remove the confirmation dialog:

**In authSlice.js**, remove this block:
```javascript
// Remove this entire block:
if (typeof window !== 'undefined') {
  const shouldLogout = window.confirm(...);
  if (!shouldLogout) {
    return;
  }
}
```

**In baseApi.js**, remove the delays:
```javascript
// Remove these lines:
await new Promise(resolve => setTimeout(resolve, 3000));
```

---

## ✅ Expected Findings

Most likely, you'll discover:

1. **Dialog shows**: `Reason: no_refresh_token`
   - **Fix**: Backend not returning refreshToken for PATIENT

2. **Dialog shows**: `Reason: refresh_failed`
   - **Fix**: Check refresh token endpoint for PATIENT role

3. **Network shows**: `/api/v1/patients/me` returns 401
   - **Fix**: Token doesn't include PATIENT authority

4. **Console shows**: Different response structure for PATIENT
   - **Fix**: Backend AuthService treats PATIENT differently

---

## 🚨 EMERGENCY MODE ACTIVE

**Status**: ✅ Confirmation dialog and delays added  
**Action**: Login as PATIENT and **READ THE DIALOG**  
**Goal**: Identify the exact cause before logout happens  

**The dialog will tell you everything you need to know!**

---

**Date**: January 23, 2026  
**Mode**: 🚨 EMERGENCY DEBUG  
**Status**: Ready to capture logs
