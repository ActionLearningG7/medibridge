# 🔧 Using Mock Data for Frontend Development

## Problem
The backend endpoints for lab tests and orders are returning 404 (Not Found).

## Solution: Enable Mock Data Mode

### Quick Fix (For Development Only)

Add this to your `.env` file:
```env
REACT_APP_USE_MOCK_LAB_DATA=true
```

Then restart the frontend:
```bash
npm start
```

---

## What Gets Mocked

When `REACT_APP_USE_MOCK_DATA=true`, these endpoints return mock data:

✅ **Lab Tests Catalog**
- `GET /lab-tests` - Returns 5 sample lab tests

✅ **Patient Orders**
- `GET /lab-orders/me` - Returns sample orders

---

## Mock Data Includes

### Lab Tests
```
1. CBC - Complete Blood Count (₹350)
2. THYROID - Thyroid Profile (₹850) - requires fasting
3. LIPID - Lipid Profile (₹600) - requires fasting
4. LFT - Liver Function Test (₹700)
5. KFT - Kidney Function Test (₹650)
```

### Patient Orders
```
- Order ID: ORD-001
- Status: Completed
- Tests: CBC + Thyroid Profile
- Total: ₹1,770 (including tax)
```

---

## How It Works

In `src/features/lab/labApi.js`:

```javascript
// This is the flag
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

// getLabTests endpoint checks this flag
getLabTests: builder.query({
  queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
    if (USE_MOCK_DATA) {
      console.log('📋 Using mock lab tests data');
      return { data: MOCK_LAB_TESTS };
    }
    // Otherwise use real API
    const result = await baseQuery({...});
    return result;
  },
})
```

---

## Next Steps

### Option 1: Keep Using Mock Data (Recommended for Testing)
```env
# .env
REACT_APP_USE_MOCK_LAB_DATA=true
```

Works for:
- ✅ Testing UI/UX
- ✅ Frontend development
- ✅ Testing without backend
- ✅ Demo purposes

Does NOT work for:
- ❌ Real data operations
- ❌ User authentication
- ❌ Advanced features

---

### Option 2: Implement Backend Endpoints (Production Ready)

Implement these endpoints in your backend:

**Catalog**
```
GET /lab-tests                  - List all tests
GET /lab-tests/{testCode}       - Get test details
```

**Patient Orders**
```
GET /lab-orders/me              - List user's orders
POST /lab-orders                - Create new order
GET /lab-orders/{id}            - Get order details
POST /lab-orders/{id}/cancel    - Cancel order
GET /lab-orders/{id}/report     - Get report
GET /lab-orders/{id}/tracking   - Get tracking info
```

See `docs/lab-api-coverage.md` for full specification.

Then disable mock mode:
```env
# .env
REACT_APP_USE_MOCK_LAB_DATA=false
# or just remove the line
```

---

## Console Messages

When using mock data, you'll see in browser console:
```
📋 Using mock lab tests data (backend endpoint not ready)
📋 Using mock patient orders data (backend endpoint not ready)
```

---

## Switching Between Mock and Real API

```bash
# Use mock data
echo "REACT_APP_USE_MOCK_LAB_DATA=true" >> .env
npm start

# Switch to real API
echo "REACT_APP_USE_MOCK_LAB_DATA=false" >> .env
npm start
```

---

## Files Modified

- `src/features/lab/labApi.js` - Added mock data logic
- `.env` - Add the flag

---

## Status

✅ Frontend is fully functional with mock data
✅ UI components work correctly
✅ Testing can proceed without backend
⏳ Waiting for backend endpoints to be implemented

---

**Timeline:**
- Now: Use mock data to test frontend
- Later: Implement backend endpoints (estimated 2-4 hours)
- Final: Switch to production API

**Ready to test the UI?** Enable mock mode and start testing!
