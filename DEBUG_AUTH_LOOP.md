# 🔧 AUTH LOOP DEBUGGING GUIDE

## 🔍 Latest Fixes Applied

### Critical Change: Auth Initialization Moved to App.js

**Previous issue**: Auth was being restored in AppRouter but routing happened before restoration completed  
**New approach**: Auth restored in App.js wrapper BEFORE any routing occurs

---

## 📋 Files Just Modified

1. **App.js** - Added AuthInitializer wrapper that blocks rendering until auth is restored
2. **AppRouter.jsx** - Removed duplicate restoreAuth call
3. **RoleRedirect.jsx** - Added initialization check
4. **Login.jsx** - Restored useEffect for "already authenticated" check

---

## 🔄 New Initialization Flow

```
1. App.js renders
   ↓
2. AuthInitializer mounts
   ↓
3. dispatch(restoreAuth()) immediately
   ↓
4. Show loading screen while initialized === false
   ↓
5. authSlice restores from localStorage
   ↓
6. initialized = true
   ↓
7. AuthInitializer renders children (AppRouter)
   ↓
8. All routes now have access to restored auth state
```

---

## 🧪 Debug Steps

### Step 1: Clear Everything and Start Fresh

```bash
# In browser console:
localStorage.clear()
sessionStorage.clear()

# Hard refresh:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Step 2: Check Console Logs

Open DevTools Console and look for these logs in order:

#### On App Load:
```
🔄 Initializing auth from localStorage...
✓ Auth restored from localStorage: { role: 'PATIENT' }
```

#### On Login:
```
🔐 Attempting login...
✓ Login successful, response: {...}
✓ Credentials stored in Redux
✓ Navigating to: /patient/dashboard
✓ ProtectedRoute: Access granted
```

#### If You See Loop (BAD):
```
❌ ProtectedRoute: No token, redirecting to login
📍 RoleRedirect: Not authenticated, redirecting to /login
(repeating)
```

### Step 3: Check localStorage

Open DevTools → Application → Local Storage → localhost:3000

**Should see**:
- `accessToken`: "eyJhbGc..."
- `refreshToken`: "eyJhbGc..."
- `user`: "{\"id\":1,\"email\":\"...\",\"role\":\"PATIENT\"}"

**If missing**: Login is not saving to localStorage

### Step 4: Check Redux State

If you have Redux DevTools installed:

1. Open Redux DevTools
2. Check state → auth

**Should see**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { "id": 1, "role": "PATIENT", ... },
  "role": "PATIENT",
  "isAuthenticated": true,
  "initialized": true
}
```

**If initialized is false**: Auth initialization didn't complete

### Step 5: Check Network Tab

1. Open DevTools → Network
2. Clear network log
3. Attempt login
4. Look for `/api/v1/auth/login` request

**Should see**:
- Status: 200 OK
- Response body has `accessToken` and `user`

**Then check subsequent requests**:
- Should have `Authorization: Bearer ...` header

---

## 🐛 Common Issues and Fixes

### Issue 1: "initialized stays false"

**Symptom**: App shows loading screen forever

**Fix**:
```javascript
// Check authSlice.js restoreAuth action
// Make sure it ALWAYS sets initialized = true at the end
state.initialized = true; // This line must execute
```

### Issue 2: "Token in localStorage but not in Redux"

**Symptom**: localStorage has token but Redux state is empty

**Cause**: restoreAuth not being called or failing silently

**Debug**:
```javascript
// Add console.log in authSlice.js restoreAuth
console.log('restoreAuth called');
console.log('accessToken:', accessToken);
console.log('refreshToken:', refreshToken);
console.log('userStr:', userStr);
```

### Issue 3: "Redirect loop even with token"

**Symptom**: Has token but still redirects to /login

**Possible causes**:
1. ProtectedRoute checks `user` instead of just `token`
2. `isAuthenticated` selector returns false
3. Role doesn't match required role

**Fix**: Check ProtectedRoute.jsx line that checks auth:
```javascript
const authenticated = !!accessToken; // Should be this
// NOT: const authenticated = isAuthenticated(accessToken, user);
```

### Issue 4: "Login successful but immediate redirect back"

**Symptom**: Login works, dashboard flashes, then back to login

**Cause**: Login.jsx useEffect triggers before navigation completes

**Current code should prevent this** - the useEffect should only run when ALREADY authenticated, not after fresh login

---

## 🔬 Advanced Debugging

### Add Detailed Logging

#### In authSlice.js restoreAuth:
```javascript
restoreAuth: (state) => {
  console.log('🔄 restoreAuth START');
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userStr = localStorage.getItem('user');
  
  console.log('📦 Found in localStorage:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasUser: !!userStr
  });

  if (accessToken && refreshToken && userStr) {
    try {
      const user = JSON.parse(userStr);
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.role = user?.role || null;
      state.isAuthenticated = true;
      
      console.log('✅ Auth restored successfully:', {
        role: state.role,
        isAuthenticated: state.isAuthenticated
      });
    } catch (error) {
      console.error('❌ Failed to restore auth:', error);
    }
  }
  
  state.initialized = true;
  console.log('✅ Auth initialized:', state.initialized);
}
```

#### In ProtectedRoute.jsx:
```javascript
// At the start of the component
console.log('🛡️ ProtectedRoute render:', {
  initialized,
  hasToken: !!accessToken,
  userRole,
  allowedRoles,
  pathname: location.pathname
});
```

#### In Login.jsx onSubmit:
```javascript
console.log('1️⃣ Login response received');
console.log('2️⃣ Dispatching setCredentials');
dispatch(setCredentials(response));
console.log('3️⃣ Credentials dispatched');
console.log('4️⃣ Navigating to:', redirectPath);
navigate(redirectPath, { replace: true });
console.log('5️⃣ Navigate called');
```

---

## 📊 Expected Console Output (Success)

### On Fresh Load (Not Logged In):
```
🔄 Initializing auth from localStorage...
ℹ️ No auth data in localStorage
✅ Auth initialized: true
📍 RoleRedirect: Not authenticated, redirecting to /login
```

### On Fresh Load (Logged In):
```
🔄 Initializing auth from localStorage...
📦 Found in localStorage: { hasAccessToken: true, hasRefreshToken: true, hasUser: true }
✅ Auth restored successfully: { role: 'PATIENT', isAuthenticated: true }
✅ Auth initialized: true
🛡️ ProtectedRoute render: { initialized: true, hasToken: true, userRole: 'PATIENT' }
✓ ProtectedRoute: Access granted
```

### On Login:
```
🔐 Attempting login...
✓ Login successful, response: {...}
✓ Credentials stored in Redux
✓ Navigating to: /patient/dashboard
🛡️ ProtectedRoute render: { initialized: true, hasToken: true, userRole: 'PATIENT' }
✓ ProtectedRoute: Access granted
```

---

## 🚨 If Still Seeing Loop

### Nuclear Option: Complete Reset

1. **Clear browser cache completely**
   ```
   Chrome: Settings → Privacy → Clear browsing data → All time
   ```

2. **Restart React app**
   ```bash
   # Kill the process
   Ctrl+C
   
   # Clear node_modules/.cache
   rm -rf node_modules/.cache
   
   # Restart
   npm start
   ```

3. **Check backend is running**
   ```bash
   cd user_service_medibridge
   ./mvnw spring-boot:run
   ```

4. **Try incognito mode**
   - No extensions, no cache, clean slate

---

## ✅ Success Indicators

When it's working correctly:

1. ✅ App loads → shows "Loading MediBridge..." for < 1 second
2. ✅ Login page loads
3. ✅ Login succeeds → navigates to dashboard
4. ✅ Dashboard loads and stays
5. ✅ F5 refresh → brief loading → dashboard loads again
6. ✅ No console errors about redirecting to login

---

## 📞 Still Not Working?

If after all this it still loops:

1. Share the **complete console log** from page load through login
2. Share the **localStorage contents** after login
3. Share the **Redux state** after login (Redux DevTools)
4. Share the **Network tab** showing the login request/response

This will help identify the exact point where it's breaking.

---

**Updated**: January 23, 2026  
**Latest Changes**: Auth initialization moved to App.js wrapper
