# SOS Ambulance Service - Quick Reference Guide

## Running the Application

### Prerequisites
```bash
# Ensure Node.js 16+ is installed
node --version

# Install dependencies
npm install
```

### Environment Setup
```bash
# Copy and configure .env
cp .env.example .env

# Add your Google Maps API Key to .env:
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### Start Development Server
```bash
npm start
# Opens http://localhost:3000
```

## Testing the SOS Flow

### Patient Testing

1. **Access SOS Page**
   - Navigate to: `http://localhost:3000/patient/sos`
   - Expected: Large red SOS button loads

2. **Trigger SOS Request**
   - Allow geolocation permission in browser
   - Click the large SOS button
   - Confirm in modal (shows your GPS coordinates)
   - Expected: Auto-redirects to tracking page

3. **Tracking Page**
   - Shows "Finding Ambulance..." status
   - Map displays your location (blue pin)
   - Timeline shows "Request Sent" complete
   - Can call 102 or return to dashboard

### Driver Testing

1. **Access Driver Dashboard**
   - Navigate to: `http://localhost:3000/driver/dashboard`
   - Or: `http://localhost:3000/phlebotomist/driver/dashboard`
   - Expected: Shows list of open SOS requests (refreshes every 5s)

2. **Accept Request**
   - Click "Accept & Navigate" on a request
   - Expected: Auto-redirects to request detail page with map

3. **Complete Workflow**
   - Map shows patient (blue) and your location (red)
   - Click "Mark Arrived" when you reach patient
   - Click "Confirm Pickup" when patient is in ambulance
   - Click "Complete Trip" when at hospital
   - Expected: Auto-redirects back to dashboard

## Component API Reference

### Custom Hooks

#### useSosPinger(requestId, enabled = true)
Tracks driver GPS and auto-updates backend every 5 seconds.

```javascript
import { useSosPinger } from '../hooks/useSosPinger';

const { currentLocation, error } = useSosPinger(requestId, true);
// Returns: { currentLocation: {lat, lng, accuracy}, error: string }
```

### Redux Slices

#### sosSlice selectors
```javascript
import { 
  selectActiveRequestId,
  selectActiveRequest,
  selectDriverLocation,
  selectPatientLocation,
  selectStatusTimeline
} from '../features/sos/sosSlice';

// In component:
const requestId = useSelector(selectActiveRequestId);
```

#### sosSlice actions
```javascript
import { 
  setActiveRequestId,
  setActiveRequest,
  setDriverLocation,
  setPatientLocation,
  clearSOSState
} from '../features/sos/sosSlice';

dispatch(setActiveRequestId(id));
```

### API Hooks

```javascript
import {
  useCreateSOSMutation,
  useGetSOSByIdQuery,
  useCancelSOSMutation,
  useListMySOSQuery,
  useListOpenRequestsQuery,
  useAcceptRequestMutation,
  useUpdateDriverLocationMutation,
  useMarkArrivedMutation,
  usePickupPatientMutation,
  useCompleteTripMutation
} from '../features/sos/sosApi';

// Example: Create SOS
const [createSOS, { isLoading, error }] = useCreateSOSMutation();
await createSOS({ latitude: 28.6139, longitude: 77.2090 }).unwrap();

// Example: Get SOS by ID (polls every 5s)
const { data: sosRequest, error } = useGetSOSByIdQuery(requestId, {
  pollingInterval: 5000
});

// Example: List open requests (polls every 5s)
const { data: requests } = useListOpenRequestsQuery(undefined, {
  pollingInterval: 5000
});
```

### Map Component

```javascript
import { SOSMap } from '../components/sos/SOSMap';

<SOSMap
  patientLocation={{ lat: 28.6139, lng: 77.2090 }}
  ambulanceLocation={{ lat: 28.6140, lng: 77.2091 }}
  onRouteUpdate={(eta) => {
    console.log(eta); // { distance: "2.5 km", duration: "5 mins" }
  }}
/>
```

## Request/Response Format

### Create SOS Request
```javascript
POST /api/v1/sos/create
Body: {
  "latitude": 28.6139,
  "longitude": 77.2090
}

Response: {
  "id": "sos-123",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "status": "SEARCHING",
  "createdAt": "2024-01-27T10:30:00Z"
}
```

### Get SOS by ID
```javascript
GET /api/v1/sos/{id}

Response: {
  "id": "sos-123",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "status": "ASSIGNED",
  "driverId": "driver-456",
  "driverName": "Raj Kumar",
  "driverPhone": "+91-9876543210",
  "vehicleNumber": "AB12CD3456",
  "driverLatitude": 28.6140,
  "driverLongitude": 77.2091,
  "patientName": "John Doe",
  "patientPhone": "+91-8765432109",
  "createdAt": "2024-01-27T10:30:00Z"
}
```

### Update Driver Location
```javascript
POST /api/v1/sos/{id}/location
Body: {
  "latitude": 28.6140,
  "longitude": 77.2091
}

Response: {
  "success": true,
  "timestamp": "2024-01-27T10:35:00Z"
}
```

## State Flow Diagram

```
PATIENT:
┌──────────┐
│ SOS Page │──(click SOS)──→ Confirm Modal
└────┬─────┘                  │
     │                        └──→ Create SOS
     │                             │
     └──→ Tracking Page (polls every 5s)
          │
          ├─ Status: SEARCHING
          ├─ Status: ASSIGNED (driver appears)
          ├─ Status: ARRIVED
          ├─ Status: PICKED_UP
          └─ Status: COMPLETED

DRIVER:
┌───────────────┐
│   Dashboard   │──(polls every 5s)──→ Open Requests List
└────┬──────────┘
     │
     └──→ Click Accept
          │
          └──→ Request Detail Page (polls every 3s)
               │
               ├─ Status: ASSIGNED → Click "Mark Arrived"
               ├─ Status: ARRIVED → Click "Confirm Pickup"
               ├─ Status: PICKED_UP → Click "Complete Trip"
               └─ Status: COMPLETED → Return to Dashboard
                    (GPS pinged every 5s throughout)
```

## Debugging Tips

### GPS Issues
```javascript
// Check if geolocation is available
if (!navigator.geolocation) {
  console.error('Geolocation not available');
}

// Test geolocation in console
navigator.geolocation.getCurrentPosition(
  pos => console.log('GPS works:', pos.coords),
  err => console.error('GPS error:', err)
);
```

### Map Issues
```javascript
// Ensure Google Maps API key is set
console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

// Check for common errors in browser console
// - "Google Maps failed to load"
// - "This API project is not authorized"
```

### Redux State Debug
```javascript
// In browser DevTools (Redux DevTools Extension)
// Monitor sos reducer for state changes
// Watch for activeRequestId persistence

// In component:
const state = useSelector(state => state.sos);
console.log('SOS State:', state);
```

### Network Issues
```javascript
// Check API calls in Network tab
// Expected endpoints:
// - POST /api/v1/sos/create
// - GET /api/v1/sos/{id}
// - GET /api/v1/sos/driver/open-requests
// - POST /api/v1/sos/{id}/location (every 5s for drivers)

// Check for 401 (auth) errors
// Check for CORS errors (localhost usually OK)
```

## Common Issues & Solutions

### Issue: SOS button doesn't respond
**Solution**: Check if geolocation is enabled in browser settings

### Issue: Map doesn't load
**Solution**: Verify REACT_APP_GOOGLE_MAPS_API_KEY is set and valid

### Issue: Coordinates show as NaN
**Solution**: Ensure geolocation permission is granted before clicking SOS

### Issue: Driver location not updating on map
**Solution**: Check if GPS is enabled on driver's device and useSosPinger is running

### Issue: "Request not found" 404 error
**Solution**: Request may have been accepted by another driver or expired

### Issue: Status doesn't update in real-time
**Solution**: Check browser Network tab for polling requests to /api/v1/sos/{id}

## File Structure

```
src/
├── pages/
│   ├── patient/
│   │   ├── SOS.jsx                  # One-click emergency
│   │   └── SOSTracking.jsx          # Real-time tracking
│   └── driver/
│       ├── AmbulanceDashboard.jsx   # Request listing
│       └── AmbulanceRequest.jsx     # Navigation workflow
├── features/
│   └── sos/
│       ├── sosApi.js                # RTK Query endpoints
│       └── sosSlice.js              # Redux state
├── components/
│   └── sos/
│       └── SOSMap.jsx               # Google Maps integration
├── hooks/
│   └── useSosPinger.js              # GPS tracking hook
└── app/
    ├── store.js                     # Redux store config
    ├── rootReducer.js               # Combined reducers
    └── api/
        ├── baseApi.js               # Base API config
        └── authHeader.js             # JWT auth
```

## Performance Optimization

### Polling
- Patient tracking: 5 seconds (balance responsiveness vs load)
- Driver dashboard: 5 seconds (balance responsiveness vs load)
- Driver location: 5 seconds (balance accuracy vs bandwidth)

### Caching
- RTK Query auto-caches successful responses
- Invalidation tags clear cache on mutations
- No localStorage caching for request details (too volatile)

### Rendering
- Use `React.memo` for Map component to prevent unnecessary rerenders
- Use selectors to prevent cascade updates
- useCallback on event handlers

## Deployment Checklist

- [ ] Set REACT_APP_GOOGLE_MAPS_API_KEY in production env
- [ ] Enable Maps JavaScript API in Google Cloud
- [ ] Set allowed origins for Maps API key
- [ ] Test on mobile devices for touch and GPS
- [ ] Test with 4G/5G and WiFi networks
- [ ] Test GPS on Android and iOS
- [ ] Configure HTTPS for geolocation to work
- [ ] Test browser compatibility (Chrome, Safari, Firefox)
- [ ] Monitor performance metrics (page load time, polling overhead)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

## Support & Documentation

- Google Maps API: https://developers.google.com/maps/documentation/javascript
- Redux Toolkit: https://redux-toolkit.js.org
- RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
