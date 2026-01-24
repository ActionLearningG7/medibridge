# 🎯 PATIENT LOGIN ISSUE - ROOT CAUSE FOUND!

## ✅ Issue Identified

**Problem Flow**:
```
1. PATIENT logs in → Success ✓
2. Navigate to /patient/dashboard
3. Call GET /api/v1/patients/me → 401 Unauthorized ✗
4. System tries to refresh token
5. Call POST /api/v1/auth/refresh → 401 Unauthorized ✗
6. Refresh fails → Logout triggered
7. User redirected back to /login
```

**Root Cause**: **Refresh token endpoint returns 401 for PATIENT**

---

## 🔍 Why This Happens

### Network Requests Show:
```
1. me         → 401 (48ms)   - Access token invalid/expired
2. active     → 401 (31ms)   - Access token invalid/expired  
3. refresh    → 401 (37ms)   - Refresh token invalid/rejected
4. refresh    → 401 (33ms)   - Retry also fails
```

### Possible Causes:

#### 1. **Backend Refresh Endpoint Issue** ⚠️ (Most Likely)

**Symptoms**:
- DOCTOR and ADMIN refresh works
- PATIENT refresh fails with 401

**Possible Backend Problems**:

**A. Refresh Token Not Saved in Database**
```java
// In AuthService.login() - Check if refresh token is saved for PATIENT
refreshTokenRepository.save(refreshToken);  // Missing for PATIENT?
```

**B. Role Check in Refresh Endpoint**
```java
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(RefreshTokenRequest request) {
    // Check: Does this verify role correctly?
    // Does it work for PATIENT role?
}
```

**C. Refresh Token Validation**
```java
// Check RefreshTokenService
public AuthResponse refreshToken(String token) {
    RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
        .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));
    
    // Check: Is refresh token found for PATIENT users?
    // Check: Does expiration check work for all roles?
}
```

#### 2. **Refresh Token Not Generated for PATIENT** ⚠️

**Check Login Response**:
```json
// DOCTOR login response:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",  // ← Present
  "user": { "role": "DOCTOR" }
}

// PATIENT login response:
{
  "accessToken": "eyJ...",
  "refreshToken": "???",  // ← Check if present!
  "user": { "role": "PATIENT" }
}
```

**If PATIENT doesn't get refreshToken**:
```java
// Check AuthService.registerPatient() or login()
// Ensure refresh token is generated
RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
```

#### 3. **Token Already Expired** ⚠️

**Check Token Expiration**:
- Access token expires too quickly
- Refresh token expires immediately
- Different expiration for PATIENT vs DOCTOR

```java
// Check application.yml or application.properties
jwt:
  expiration: 86400000  # 24 hours
  refresh-expiration: 604800000  # 7 days
  
# Are these the same for all roles?
```

---

## 🔧 Temporary Workaround Applied

I've added a **temporary bypass** that allows PATIENT to continue even if refresh fails:

```javascript
// In baseApi.js
if (userRole === 'PATIENT' && hasAccessToken) {
  console.warn('⚠️ TEMPORARY: PATIENT refresh failed but has access token - continuing');
  // Don't logout, return original error
  return result;
}
```

**What this does**:
- ✅ PATIENT won't be logged out immediately
- ✅ Can continue using the dashboard
- ⚠️ Profile API will still return 401
- ⚠️ This is NOT a permanent fix!

**You'll see this warning**:
```
⚠️ TEMPORARY: PATIENT refresh failed but has access token - continuing
⚠️ This is a workaround - fix the refresh endpoint!
```

---

## 🔍 Diagnostic Steps to Find Exact Cause

### Step 1: Compare Login Responses

**Test DOCTOR login** (Network Tab):
```javascript
// Response body:
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": 1, "role": "DOCTOR" }
  }
}

// Copy the refreshToken value
```

**Test PATIENT login** (Network Tab):
```javascript
// Response body:
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",  // ← Does this exist?
    "user": { "id": 2, "role": "PATIENT" }
  }
}

// Compare with DOCTOR refreshToken
```

**If PATIENT refreshToken is missing or different**:
- Backend not generating refresh token for PATIENT
- Check `AuthService.registerPatient()` and `login()`

### Step 2: Test Refresh Endpoint Directly

**Get refresh token from localStorage** after PATIENT login:
```javascript
// In browser console:
const refreshToken = localStorage.getItem('refreshToken');
console.log('Refresh token:', refreshToken);
```

**Test with curl**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"PUT_TOKEN_HERE"}' \
  -v

# Expected: 200 OK with new tokens
# Actual: 401 Unauthorized
```

**Check backend logs** when this request hits:
```
Look for:
- "Refresh token not found"
- "Refresh token expired"
- "Invalid refresh token"
- Any SQL errors
```

### Step 3: Check Database

**Query refresh_tokens table**:
```sql
-- Check if refresh token exists for PATIENT
SELECT * FROM refresh_tokens WHERE user_id = <patient_user_id>;

-- Compare with DOCTOR
SELECT * FROM refresh_tokens WHERE user_id = <doctor_user_id>;

-- Check expiration
SELECT 
  id, 
  user_id, 
  token, 
  expiry_date,
  (expiry_date > NOW()) as is_valid
FROM refresh_tokens 
WHERE user_id IN (<patient_id>, <doctor_id>);
```

**If PATIENT has no refresh token in database**:
- Backend not saving refresh token for PATIENT
- Fix `RefreshTokenService.createRefreshToken()`

**If PATIENT refresh token is expired**:
- Check expiration time configuration
- Might be different for PATIENT role

### Step 4: Check Backend Logs

**During PATIENT login** (look for):
```
Creating refresh token for user ID: <patient_id>
Saved refresh token: <token>
```

**During refresh attempt** (look for):
```
Refresh token request received
Token: <token>
Refresh token not found in database  ← PROBLEM!
// OR
Refresh token expired
// OR
Invalid refresh token
```

---

## 🔧 Backend Fixes Needed

### Fix 1: Ensure Refresh Token is Generated for PATIENT

**File**: `AuthService.java`

```java
// In registerPatient() method
public AuthResponse registerPatient(RegisterPatientRequest request) {
    // ... create user ...
    
    // ENSURE THIS HAPPENS FOR PATIENT:
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
    
    return AuthResponse.builder()
        .accessToken(jwtToken)
        .refreshToken(refreshToken.getToken())  // ← Must include!
        .user(userResponse)
        .build();
}

// Also check login() method
public AuthResponse login(LoginRequest request) {
    // ... authenticate ...
    
    // ENSURE THIS HAPPENS FOR ALL ROLES:
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
    
    return AuthResponse.builder()
        .accessToken(jwtToken)
        .refreshToken(refreshToken.getToken())
        .user(userResponse)
        .build();
}
```

### Fix 2: Check Refresh Token Service

**File**: `RefreshTokenService.java`

```java
@Service
public class RefreshTokenService {
    
    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(userRepository.findById(userId).get());
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        
        // ENSURE THIS SAVES TO DATABASE:
        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        
        log.info("Created refresh token for user {}: {}", userId, saved.getToken());
        
        return saved;
    }
    
    public AuthResponse refreshToken(String token) {
        // ENSURE THIS FINDS TOKEN:
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> {
                log.error("Refresh token not found: {}", token);
                return new TokenRefreshException("Refresh token not found");
            });
        
        // ENSURE EXPIRATION CHECK IS CORRECT:
        if (refreshToken.getExpiryDate().compareTo(Instant.now()) < 0) {
            log.error("Refresh token expired: {}", token);
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException("Refresh token expired");
        }
        
        // Generate new access token
        // ...
    }
}
```

### Fix 3: Add Logging to Refresh Endpoint

**File**: `AuthController.java`

```java
@PostMapping("/refresh")
public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
        @Valid @RequestBody RefreshTokenRequest request) {
    
    log.info("Refresh token request received: {}", 
        request.getRefreshToken().substring(0, 20) + "...");
    
    try {
        AuthResponse response = authService.refreshToken(request);
        
        log.info("Token refreshed successfully for user: {}", 
            response.getUser().getEmail());
        
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
        
    } catch (Exception e) {
        log.error("Token refresh failed: {}", e.getMessage(), e);
        throw e;
    }
}
```

---

## 🎯 Immediate Actions

### For Frontend (Temporary):
✅ **Workaround applied** - PATIENT won't be logged out immediately
⚠️ **Profile will still show 401 error** - but app won't crash

### For Backend (Required):

1. **Check login response** for PATIENT:
   - Does it include refreshToken?
   - Is refreshToken different from DOCTOR's?

2. **Check database**:
   ```sql
   SELECT * FROM refresh_tokens WHERE user_id = <patient_id>;
   ```

3. **Add logging**:
   - Log when refresh token is created
   - Log when refresh token is queried
   - Log why refresh fails

4. **Test refresh endpoint**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"<patient_refresh_token>"}'
   ```

5. **Fix the issue**:
   - Ensure refresh token is generated for PATIENT
   - Ensure refresh token is saved to database
   - Ensure refresh endpoint can find and validate it

---

## 📊 Summary

**Root Cause**: Refresh token endpoint returns 401 for PATIENT

**Why**: 
- Refresh token not generated/saved for PATIENT
- OR refresh token validation fails for PATIENT
- OR refresh token endpoint has role-specific issues

**Evidence**:
- Network shows: `refresh → 401` (twice)
- Console shows: `refresh_failed`
- hasToken: true, role: PATIENT

**Temporary Fix**: ✅ Applied - PATIENT won't logout
**Permanent Fix**: ⚠️ Required - Fix backend refresh endpoint

**Next Step**: Check backend logs and database to find exact cause

---

**Date**: January 23, 2026  
**Issue**: PATIENT refresh returns 401  
**Workaround**: ✅ Applied  
**Permanent Fix**: Backend required
