# MediBridge Frontend - Lab Feature Architecture

## 📁 Directory Structure

```
src/
├── app/
│   ├── store.js                 # Redux store configuration (UPDATED)
│   ├── rootReducer.js           # Root reducer combining all reducers (UPDATED)
│   └── api/
│       └── baseApi.js           # Base RTK Query API
│
├── features/
│   ├── auth/
│   │   ├── authSlice.js
│   │   └── authApi.js
│   ├── lab/                     # NEW LAB FEATURE MODULE
│   │   ├── labApi.js            # RTK Query endpoints for lab service
│   │   ├── labSlice.js          # Redux slice for lab state management
│   │   ├── labTrackingWsClient.js # WebSocket client for real-time tracking
│   │   ├── selectors.js         # Memoized selectors for lab state
│   │   ├── constants.js         # Lab feature constants
│   │   └── index.js             # Feature export barrel
│   ├── appointment/
│   ├── prescription/
│   └── user/
│
├── pages/
│   ├── patient/
│   │   ├── LabCatalog.jsx       # Browse available lab tests
│   │   ├── LabBooking.jsx       # Multi-step lab booking flow
│   │   ├── LabOrders.jsx        # View patient's lab orders
│   │   ├── LabOrderDetails.jsx  # Detailed view of single order
│   │   └── LabTracking.jsx      # Real-time tracking of lab order
│   ├── doctor/
│   │   ├── LabBooking.jsx       # Prescribe lab tests
│   │   ├── LabOrders.jsx        # View prescribed tests
│   │   ├── LabOrderDetails.jsx  # Monitor test results
│   │   └── LabTracking.jsx      # Track order progress
│   ├── admin/
│   │   ├── LabDashboard.jsx     # Lab management overview
│   │   ├── LabTasks.jsx         # Manage lab tasks
│   │   └── LabTaskDetails.jsx   # Task assignment & monitoring
│   ├── phlebotomist/
│   │   ├── Tasks.jsx            # View assigned tasks
│   │   ├── TaskDetails.jsx      # Task details & sample collection
│   │   └── LiveTracking.jsx     # Track deliveries in real-time
│   └── (other roles)
│
├── components/
│   ├── lab/
│   │   ├── TestCard.jsx         # Reusable test card component
│   │   ├── TestFilters.jsx      # Filter tests by category, price, etc
│   │   ├── CartSummary.jsx      # Shopping cart summary
│   │   ├── AddressForm.jsx      # Address selection/form
│   │   ├── BookingStepper.jsx   # Multi-step booking stepper
│   │   ├── OrderCard.jsx        # Lab order display card
│   │   ├── OrderStatusBadge.jsx # Status badge component
│   │   ├── ReportViewer.jsx     # PDF report viewer
│   │   ├── TrackingMap.jsx      # Map component for phlebotomist tracking
│   │   ├── TrackingTimeline.jsx # Timeline of order events
│   │   ├── TaskStatusStepper.jsx # Task status stepper
│   │   └── TaskActionPanel.jsx  # Admin task actions
│   ├── ui/                      # Global UI components
│   ├── common/
│   ├── (other feature components)
│
├── hooks/
│   └── (custom React hooks)
│
├── utils/
│   ├── money.js                 # Money formatting utilities
│   ├── datetime.js              # DateTime utilities
│   ├── validators.js            # Form validators
│   └── maps.js                  # Maps API utilities
│
└── (other app files)
```

---

## 🎯 Lab Feature Module Overview

### Core Files

#### 1. **labApi.js** - RTK Query API Endpoints
Defines all API endpoints for lab service operations:

**Lab Catalog & Tests:**
- `getLabTests()` - Fetch paginated list of available tests
- `getLabTestById()` - Get single test details
- `getLabTestCategories()` - Get test categories

**Lab Bookings:**
- `createLabBooking()` - Create new booking
- `getLabBookingQuote()` - Get price quote for tests

**Lab Orders (Patient & Doctor views):**
- `getLabOrders()` - List orders with filtering
- `getLabOrderById()` - Get order details
- `updateLabOrder()` - Update order status
- `cancelLabOrder()` - Cancel order

**Lab Reports:**
- `getLabReport()` - Fetch report by ID
- `downloadLabReport()` - Download report as file

**Real-time Tracking:**
- `getLabOrderTracking()` - Get tracking info with polling fallback

**Admin APIs:**
- `getLabTasks()` - List admin tasks
- `getLabTaskById()` - Get task details
- `updateLabTask()` - Update task
- `assignLabTask()` - Assign to phlebotomist

**Phlebotomist APIs:**
- `getPhlebotomistTasks()` - Get assigned tasks
- `updatePhlebotomistTask()` - Update task status
- `uploadLabResult()` - Upload test results

**Dashboard:**
- `getLabDashboard()` - Get admin dashboard data

#### 2. **labSlice.js** - Redux State Management
Manages local state for lab features:

**State Structure:**
```javascript
{
  cart: {
    items: [],           // Shopping cart items
    totalPrice: 0,       // Total amount
    selectedAddress: null // Delivery address
  },
  booking: {
    currentStep: 0,      // Booking wizard step
    selectedTests: [],   // Selected tests
    bookingData: null,   // Booking form data
    isProcessing: false  // Submission state
  },
  tracking: {
    activeOrderId: null, // Currently tracking order
    trackingUpdates: {}, // WebSocket updates cache
    wsConnected: false   // Connection status
  },
  filters: {
    search: '',          // Search query
    category: null,      // Selected category
    priceRange: [0, 10000], // Price filter
    sortBy: 'popularity' // Sort option
  },
  ui: {
    selectedOrderId: null, // Selected order in list
    expandedTask: null,    // Expanded task details
    viewMode: 'grid'       // View mode (grid/list)
  }
}
```

**Actions:**
- Cart: `addToCart`, `removeFromCart`, `updateCartItemQuantity`, `clearCart`, `setSelectedAddress`
- Booking: `setBookingStep`, `setSelectedTests`, `setBookingData`, `setBookingProcessing`, `resetBooking`
- Tracking: `setActiveOrderId`, `updateTrackingData`, `setWebSocketConnected`
- Filters: `setSearchQuery`, `setCategory`, `setPriceRange`, `setSortBy`, `resetFilters`
- UI: `setSelectedOrderId`, `setExpandedTask`, `setViewMode`

#### 3. **labTrackingWsClient.js** - WebSocket Client
Handles real-time order tracking via WebSocket:

**Features:**
- Auto-reconnection with exponential backoff
- Order subscription/unsubscription
- Message parsing and distribution
- Connection status tracking
- Fallback to polling if WS fails

**Methods:**
```javascript
client.connect(userId)           // Connect to WebSocket
client.disconnect()              // Disconnect gracefully
client.subscribeToOrder(orderId, handler) // Start tracking
client.unsubscribeFromOrder(orderId, handler) // Stop tracking
client.requestStatus(orderId)    // Request current status
client.isConnected()             // Get connection status
client.onConnectionChange(handler) // Listen to connection changes
```

#### 4. **selectors.js** - Memoized Selectors
Optimized Redux selectors using `createSelector`:

**Cart Selectors:**
- `selectCart` - Full cart state
- `selectCartItems` - Array of items
- `selectCartTotal` - Total price
- `selectCartItemCount` - Total items count

**Booking Selectors:**
- `selectBooking` - Full booking state
- `selectBookingStep` - Current step
- `selectSelectedTests` - Selected tests
- `selectBookingData` - Form data

**Tracking Selectors:**
- `selectTracking` - Full tracking state
- `selectActiveOrderId` - Current tracking order
- `selectIsWebSocketConnected` - Connection status
- `selectActiveOrderTracking` - Tracking data for active order

**Filter Selectors:**
- `selectFilters` - All filters
- `selectSearchQuery` - Search term
- `selectSelectedCategory` - Category filter
- `selectPriceRange` - Price range
- `selectSortBy` - Sort method

**Computed Selectors:**
- `selectCanProceedToCheckout` - Validation selector
- `selectFilteredTests` - Merged filter state
- `selectBookingSummary` - Booking overview

#### 5. **constants.js** - Feature Constants
All constants used throughout the lab module:

**Order Status:**
- Status values: `PENDING`, `CONFIRMED`, `SAMPLE_COLLECTION_SCHEDULED`, etc.
- Status labels and colors for UI

**Task Status:**
- `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`

**Test Categories:**
- `PATHOLOGY`, `RADIOLOGY`, `CARDIOLOGY`, etc.

**Tracking Events:**
- Timeline events from order placement to report delivery

**Sample Types:**
- `BLOOD`, `URINE`, `SALIVA`, `SWAB`, `STOOL`, `CSF`

**Time Slots:**
- Collection time slots (morning, afternoon, evening)

---

## 🔄 Data Flow Architecture

### 1. **Patient Booking Flow**
```
LabCatalog.jsx
  ↓ (selects tests)
LabBooking.jsx (multi-step)
  ↓ Step 1: Select Tests
  → dispatch: addToCart, setBookingStep
  → selector: selectCartItems
  
  ↓ Step 2: Select Address
  → dispatch: setSelectedAddress, setBookingStep
  → selector: selectSelectedAddress
  
  ↓ Step 3: Review Order
  → selector: selectBookingSummary
  → useGetLabBookingQuoteQuery (API)
  
  ↓ Step 4: Payment
  → createLabBookingMutation (API)
  → dispatch: resetBooking
  → navigate to LabOrders.jsx
```

### 2. **Real-time Tracking Flow**
```
LabTracking.jsx
  ↓ useEffect
  → labTrackingWsClient.connect(userId)
  → labTrackingWsClient.subscribeToOrder(orderId)
  
  ↓ WebSocket message received
  → dispatch: updateTrackingData
  → useSelector: selectActiveOrderTracking
  
  ↓ Render TrackingTimeline.jsx
  → Display events and progress
  
  ↓ On unmount
  → labTrackingWsClient.unsubscribeFromOrder(orderId)
  → labTrackingWsClient.disconnect()
```

### 3. **Admin Task Management Flow**
```
LabDashboard.jsx
  ↓ useGetLabTasksQuery
  → SELECT * FROM tasks
  
  ↓ useSelector: selectExpandedTask
  → LabTaskDetails.jsx
  
  ↓ useAssignLabTaskMutation
  → PATCH /labs/admin/tasks/{id}/assign
  → invalidates LabTasks cache
  
  ↓ useUpdateLabTaskMutation
  → PATCH /labs/admin/tasks/{id}
  → dispatch: setExpandedTask
```

---

## 🎨 Component Hierarchy

```
LabBooking (Page)
├── BookingStepper
│   ├── Step 1: Test Selection
│   │   └── TestFilters
│   │       ├── TestCard (multiple)
│   │       └── CartSummary
│   ├── Step 2: Address Selection
│   │   └── AddressForm
│   ├── Step 3: Review
│   │   └── OrderCard
│   └── Step 4: Payment
│       └── PaymentForm

LabTracking (Page)
└── TrackingMap (or timeline view)
    ├── TrackingTimeline
    │   ├── TrackingEvent
    │   ├── TrackingEvent
    │   └── TrackingEvent
    └── OrderStatusBadge

LabDashboard (Page)
├── StatsCard (multiple)
├── LabTasks
│   ├── TaskCard (multiple)
│   └── LabTaskDetails
│       ├── TaskStatusStepper
│       └── TaskActionPanel
```

---

## 📡 API Integration

### Endpoints Used
- `GET /labs/tests` - List tests
- `GET /labs/tests/{id}` - Test details
- `GET /labs/tests/categories` - Categories
- `POST /labs/bookings` - Create booking
- `GET /labs/bookings/quote` - Price quote
- `GET /labs/orders` - List orders
- `GET /labs/orders/{id}` - Order details
- `GET /labs/orders/{id}/tracking` - Real-time tracking
- `GET /labs/admin/dashboard` - Dashboard data
- `GET /labs/admin/tasks` - Admin tasks
- `POST /labs/admin/tasks/{id}/assign` - Assign task
- `GET /labs/phlebotomist/tasks` - Phlebotomist tasks
- `POST /labs/phlebotomist/tasks/{id}/results` - Upload results

### WebSocket Endpoints
- `WS /labs/tracking?userId={id}` - Real-time order tracking
  - Actions: `subscribe`, `unsubscribe`, `getStatus`
  - Events: Order status updates, events, ETA changes

---

## 🔐 State Management Best Practices

1. **Normalized State**: Use RTK Query for async data (automatic normalization)
2. **Local State**: Use Redux slice for UI state (filters, cart, booking steps)
3. **Memoization**: Use selectors for derived state to prevent unnecessary re-renders
4. **Invalidation**: Proper cache invalidation on mutations
5. **Polling**: Fallback polling when WebSocket unavailable

---

## 🚀 Usage Examples

### In Components

**Using API Query:**
```javascript
import { useGetLabTestsQuery } from '../features/lab/labApi';

function LabCatalog() {
  const { data, isLoading } = useGetLabTestsQuery({ page: 1, limit: 20 });
  // ...
}
```

**Using State Actions:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartItems } from '../features/lab';

function TestCard({ test }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  
  const handleAdd = () => {
    dispatch(addToCart(test));
  };
}
```

**Using Selectors:**
```javascript
import { selectCanProceedToCheckout, selectBookingSummary } from '../features/lab';

function BookingReview() {
  const canProceed = useSelector(selectCanProceedToCheckout);
  const summary = useSelector(selectBookingSummary);
}
```

**Using WebSocket:**
```javascript
import { labTrackingWsClient } from '../features/lab';

function LabTracking({ orderId, userId }) {
  useEffect(() => {
    labTrackingWsClient.connect(userId).then(() => {
      labTrackingWsClient.subscribeToOrder(orderId, (update) => {
        dispatch(updateTrackingData({ orderId, trackingData: update }));
      });
    });
    
    return () => {
      labTrackingWsClient.unsubscribeFromOrder(orderId);
    };
  }, [orderId, userId]);
}
```

---

## 📊 Performance Optimizations

1. **Redux Selectors**: Memoized to prevent unnecessary renders
2. **RTK Query Cache**: Automatic normalization and deduplication
3. **Polling Fallback**: Configurable via `REACT_APP_TRACKING_POLL_MS`
4. **WebSocket Subscriptions**: Only active orders tracked
5. **Code Splitting**: Lab feature loaded on demand

---

## 🧪 Testing Structure

- `labSlice.test.js` - Redux reducer tests
- `labApi.test.js` - API endpoint mocks
- `labTrackingWsClient.test.js` - WebSocket client tests
- Component tests in respective page/component directories

---

## 📝 Summary

This architecture provides:
- ✅ Scalable state management with Redux + RTK Query
- ✅ Real-time updates via WebSocket
- ✅ Fallback polling mechanism
- ✅ Optimized performance with selectors
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Type-safe API integration
- ✅ Easy to test and maintain

