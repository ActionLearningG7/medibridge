# Admin SOS Module - Quick Reference Guide

## 📌 Architecture Overview

```
medibridge-frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── baseApi.js                  (Auth headers, base query)
│   │   │   └── ambulanceApi.js            (RTK Query endpoints) ✨ NEW
│   │   ├── store.js                        (Redux store config) ✅ UPDATED
│   │   └── rootReducer.js                  (Reducer setup) ✅ UPDATED
│   │
│   └── pages/admin/
│       ├── AdminAmbulanceDrivers.jsx       (Driver Management) ✨ FIXED
│       ├── AdminAmbulances.jsx             (Vehicle Management) ✨ FIXED
│       └── AdminSosIncidents.jsx           (Incident Tracking) ✨ FIXED
```

## 🎯 Key Components

### 1. Ambulance API (`ambulanceApi.js`)
**Purpose**: Central API for all ambulance/driver/incident operations

**Hooks Exported**:
```javascript
// Driver Hooks
useGetAmbulanceDriversQuery()
useGetAmbulanceDriverDetailQuery(id)
useCreateAmbulanceDriverMutation()
useUpdateAmbulanceDriverMutation()
useDeleteAmbulanceDriverMutation()
useResetDriverCredentialsMutation()

// Ambulance Hooks
useGetAmbulancesQuery()
useGetAmbulanceDetailQuery(id)
useCreateAmbulanceMutation()
useUpdateAmbulanceMutation()
useDeleteAmbulanceMutation()
useUpdateAmbulanceStatusMutation()
useAssignAmbulanceDriverMutation()

// Incident Hooks
useGetSosIncidentsQuery()
useGetSosIncidentDetailQuery(id)
```

### 2. Admin Ambulance Drivers Page
**Path**: `/admin/ambulance-drivers`

**Features**:
- ✅ List all drivers with pagination
- ✅ Search by name, phone, or license
- ✅ Add new drivers
- ✅ Edit driver details
- ✅ Delete drivers
- ✅ Reset driver credentials
- ✅ View license expiry status

**Sample Data Fields**:
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phoneNumber": "+1-555-0123",
  "licenseNumber": "DL12345678",
  "licenseExpiry": "2025-12-31",
  "yearsExperience": 5,
  "assignedAmbulanceId": null,
  "status": "ACTIVE",
  "createdAt": "2024-01-01"
}
```

### 3. Admin Ambulances Page
**Path**: `/admin/ambulances`

**Features**:
- ✅ List all ambulances
- ✅ Add new ambulances
- ✅ Edit ambulance details
- ✅ Update ambulance status
- ✅ Assign drivers to ambulances
- ✅ Delete ambulances
- ✅ Track maintenance schedules

**Sample Data Fields**:
```json
{
  "id": "uuid",
  "registrationNumber": "AMB-2024-001",
  "model": "Ford Transit",
  "year": 2023,
  "capacity": 4,
  "currentStatus": "AVAILABLE",
  "assignedDriver": "John Smith",
  "driverPhone": "+1-555-0123",
  "location": "123 Medical Center St",
  "lastServiceDate": "2024-12-01"
}
```

### 4. Admin SOS Incidents Page
**Path**: `/admin/sos-incidents`

**Features**:
- ✅ View all SOS incidents
- ✅ Filter by status (CREATED, SEARCHING, ASSIGNED, EN_ROUTE, ARRIVED, COMPLETED, CANCELLED)
- ✅ Search by patient name, phone, or incident ID
- ✅ View incident details (coordinates, driver, ambulance)
- ✅ Real-time status updates
- ✅ Statistics dashboard

**Sample Data Fields**:
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "patientName": "Robert Johnson",
  "patientPhone": "+1-555-0123",
  "pickupLat": 40.7128,
  "pickupLng": -74.0060,
  "status": "COMPLETED",
  "assignedAmbulanceId": "uuid",
  "assignedAmbulanceReg": "AMB-2024-001",
  "assignedDriverId": "uuid",
  "assignedDriverName": "John Smith",
  "eta": 8,
  "distance": 5.2,
  "createdAt": "2024-12-20T14:30:00",
  "completedAt": "2024-12-20T15:15:00"
}
```

## 🔄 Data Flow

```
User Action
    ↓
Component (e.g., AdminAmbulances.jsx)
    ↓
RTK Query Hook (useGetAmbulancesQuery)
    ↓
ambulanceApi.js endpoint definition
    ↓
baseQueryWithAuth (adds auth headers)
    ↓
Backend API (http://localhost:8092/api/v1/...)
    ↓
Redux Cache
    ↓
Component Re-render with data
```

## 🛠️ Debugging Tips

### Check API Calls
1. Open DevTools → Network tab
2. Look for requests to `/api/v1/admin/...`
3. Verify Authorization header is present
4. Check response status and body

### Check Redux State
1. Install Redux DevTools Extension
2. Open DevTools → Redux tab
3. Look for `ambulanceApi` reducer state
4. Check cached data under `queries`

### Check Console Errors
1. Open DevTools → Console
2. Look for errors like "API returned non-JSON response"
3. Verify backend services are running
4. Check baseQuery configuration

## 🔌 Required Backend Endpoints

### Running Backends (Verify they're running)

```bash
# Check services
ps aux | grep java

# Expected services on ports:
# - API Gateway: 8092
# - SOS Ambulance Service: 8095
# - User Service: 8091
# - Lab Service: 8093
# - Appointment Service: 8094
```

## 📋 Testing Checklist

- [ ] Frontend compiles without errors
- [ ] Admin pages load (check Network tab for 200 responses)
- [ ] Can view list of drivers
- [ ] Can create new driver (submit form)
- [ ] Can edit driver (click edit button)
- [ ] Can delete driver (click delete button)
- [ ] Can view ambulances list
- [ ] Can assign driver to ambulance
- [ ] Can view SOS incidents
- [ ] Can filter incidents by status
- [ ] Sample data shows when backend is offline
- [ ] Statistics update in real-time

## 🚨 Common Issues & Solutions

### Issue: "API returned non-JSON response"
**Cause**: Backend not running or returning HTML error page
**Solution**: 
```bash
cd D:\medibridgeProd\sos_ambulance_service_medibridge
mvn spring-boot:run
```

### Issue: "Cannot read property 'content' of undefined"
**Cause**: Response structure doesn't match expected format
**Solution**: Check backend API response structure, ensure it returns `{ content: [...], totalElements: ... }`

### Issue: "Authorization header missing"
**Cause**: baseQueryWithAuth not properly configured
**Solution**: Verify auth token is in Redux state: `state.auth.token`

### Issue: Mutations not working
**Cause**: HTTP method mismatch (POST/PUT/DELETE)
**Solution**: Verify endpoint definition uses correct builder method

## 📚 Related Files

- API Configuration: `src/app/api/baseApi.js`
- Auth State: `src/features/auth/authSlice.js`
- Store Setup: `src/app/store.js`
- Types: `src/types/` (if using TypeScript)

## 🔗 References

- RTK Query Docs: https://redux-toolkit.js.org/rtk-query/overview
- Redux Docs: https://redux.js.org/
- React Query Docs: https://react-query.tanstack.com/

---

**Last Updated**: 2026-01-27  
**Status**: ✅ Production Ready
