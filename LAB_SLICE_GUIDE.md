# Lab Slice - UI State Management Guide

**Status**: ✅ Complete
**Date**: January 25, 2026
**Purpose**: Non-server UI state management for lab module

---

## 📋 Overview

`labSlice.js` manages **non-server UI state** for:
- Catalog filters (search, sample type, price range)
- Booking cart (selected tests, quantities)
- Booking draft (address, slot, instructions)
- Selected IDs for detail views (order, task)
- Map/tracking UI preferences

**Does NOT include**: Server business logic (RTK Query handles that)

---

## 🎯 State Structure

```javascript
{
  filters: {
    search: '',
    sampleType: null,
    priceRange: { min: 0, max: 10000 },
    category: null,
    sortBy: 'popularity',
    fastingRequired: null,
  },
  
  cart: {
    items: [],
    totalPrice: 0,
    totalQuantity: 0,
    lastAddedTestId: null,
    lastRemovedTestId: null,
  },
  
  bookingDraft: {
    address: { line1, line2, city, state, zipCode, coordinates },
    timeSlot: { date, time },
    instructions: { fastingInstructions, medicationsToAvoid, specialInstructions },
    paymentMethod: 'card',
    notes: '',
    currentStep: 0,
    errors: {},
    isSubmitting: false,
  },
  
  selectedOrderId: null,
  selectedTaskId: null,
  
  trackingUI: {
    mapZoomLevel: 15,
    mapCenter: null,
    showTrackingTimeline: true,
    showCollectionInfo: true,
    showReportSection: true,
    autoFollowLocation: false,
    refreshInterval: 15000,
    wsConnected: false,
  },
}
```

---

## 🔧 Actions

### Catalog Filters

```javascript
import { 
  setSearchFilter,
  setSampleTypeFilter,
  setPriceRangeFilter,
  setCategoryFilter,
  setSortByFilter,
  setFastingFilter,
  resetFilters,
} from '../features/lab/labSlice';

// Set search
dispatch(setSearchFilter('blood'));

// Set sample type
dispatch(setSampleTypeFilter('blood'));

// Set price range
dispatch(setPriceRangeFilter({ min: 100, max: 5000 }));

// Set category
dispatch(setCategoryFilter('pathology'));

// Set sort
dispatch(setSortByFilter('price-asc'));

// Set fasting filter
dispatch(setFastingFilter(true));

// Reset all filters
dispatch(resetFilters());
```

### Booking Cart

```javascript
import {
  addTestToCart,
  removeTestFromCart,
  updateTestQuantity,
  clearCart,
} from '../features/lab/labSlice';

// Add test to cart
dispatch(addTestToCart({
  testId: 'BLOOD-001',
  testCode: 'CBC',
  testName: 'Complete Blood Count',
  price: 299,
  sampleType: 'blood',
}));

// Remove test from cart
dispatch(removeTestFromCart('BLOOD-001'));

// Update quantity
dispatch(updateTestQuantity({
  testId: 'BLOOD-001',
  quantity: 3,
}));

// Clear entire cart
dispatch(clearCart());
```

### Booking Draft (Form State)

```javascript
import {
  setBookingStep,
  nextBookingStep,
  prevBookingStep,
  setBookingAddress,
  setBookingTimeSlot,
  setBookingInstructions,
  setPaymentMethod,
  setBookingNotes,
  setBookingErrors,
  clearBookingErrors,
  setBookingSubmitting,
  resetBookingDraft,
} from '../features/lab/labSlice';

// Set booking step (0, 1, 2, 3)
dispatch(setBookingStep(1));

// Navigate steps
dispatch(nextBookingStep());
dispatch(prevBookingStep());

// Set address
dispatch(setBookingAddress({
  line1: '123 Main St',
  line2: 'Apt 4B',
  city: 'Bangalore',
  state: 'KA',
  zipCode: '560001',
  coordinates: { lat: 13.0827, lng: 77.6063 },
}));

// Set time slot
dispatch(setBookingTimeSlot({
  date: '2026-02-15',
  time: 'morning',
}));

// Set instructions
dispatch(setBookingInstructions({
  fastingInstructions: 'Fast for 12 hours',
  medicationsToAvoid: ['Aspirin'],
  specialInstructions: 'Take with water',
}));

// Set payment method
dispatch(setPaymentMethod('card'));

// Set notes
dispatch(setBookingNotes('Please call before arrival'));

// Set validation errors
dispatch(setBookingErrors({
  address: 'Address is required',
  timeSlot: 'Please select a time slot',
}));

// Clear errors
dispatch(clearBookingErrors());

// Set submitting state
dispatch(setBookingSubmitting(true));

// Reset entire booking
dispatch(resetBookingDraft());
```

### Selected IDs

```javascript
import {
  setSelectedOrderId,
  setSelectedTaskId,
} from '../features/lab/labSlice';

// Set selected order for detail view
dispatch(setSelectedOrderId('ORD-123'));

// Set selected task for detail view
dispatch(setSelectedTaskId('TASK-456'));
```

### Tracking UI Preferences

```javascript
import {
  setMapZoomLevel,
  setMapCenter,
  toggleTimelineVisibility,
  toggleCollectionInfoVisibility,
  toggleReportSectionVisibility,
  setAutoFollowLocation,
  setRefreshInterval,
  setWSConnected,
  resetTrackingUI,
} from '../features/lab/labSlice';

// Set map zoom
dispatch(setMapZoomLevel(17));

// Set map center
dispatch(setMapCenter({ lat: 13.0827, lng: 77.6063 }));

// Toggle timeline visibility
dispatch(toggleTimelineVisibility());

// Toggle collection info
dispatch(toggleCollectionInfoVisibility());

// Toggle report section
dispatch(toggleReportSectionVisibility());

// Set auto-follow location
dispatch(setAutoFollowLocation(true));

// Set refresh interval (ms)
dispatch(setRefreshInterval(10000));

// Set WS connection status
dispatch(setWSConnected(true));

// Reset tracking UI
dispatch(resetTrackingUI());
```

---

## 🔍 Selectors

### Catalog Filters

```javascript
import {
  selectSearchFilter,
  selectSampleTypeFilter,
  selectPriceRangeFilter,
  selectCategoryFilter,
  selectSortByFilter,
  selectFastingFilter,
  selectHasActiveFilters,
  selectCatalogFiltersForAPI,
} from '../features/lab/selectors';

// Get individual filters
const search = useSelector(selectSearchFilter);
const sampleType = useSelector(selectSampleTypeFilter);
const priceRange = useSelector(selectPriceRangeFilter);

// Check if any filter is active
const hasFilters = useSelector(selectHasActiveFilters);

// Get filters formatted for API call
const apiFilters = useSelector(selectCatalogFiltersForAPI);
```

### Booking Cart

```javascript
import {
  selectCartItems,
  selectCartTotalPrice,
  selectCartTotalQuantity,
  selectIsCartEmpty,
  selectCartTestIds,
  selectLastAddedTestId,
  selectLastRemovedTestId,
} from '../features/lab/selectors';

// Get cart items
const items = useSelector(selectCartItems);

// Get totals
const total = useSelector(selectCartTotalPrice);
const quantity = useSelector(selectCartTotalQuantity);

// Check if cart is empty
const isEmpty = useSelector(selectIsCartEmpty);

// Get test IDs in cart
const testIds = useSelector(selectCartTestIds);

// Track last added/removed for UI feedback
const lastAdded = useSelector(selectLastAddedTestId);
const lastRemoved = useSelector(selectLastRemovedTestId);
```

### Booking Draft

```javascript
import {
  selectBookingStep,
  selectBookingAddress,
  selectBookingTimeSlot,
  selectBookingInstructions,
  selectPaymentMethod,
  selectBookingNotes,
  selectBookingErrors,
  selectIsBookingSubmitting,
  selectIsAddressComplete,
  selectIsTimeSlotComplete,
  selectIsBookingReadyToSubmit,
  selectBookingSummary,
  selectBookingFormData,
} from '../features/lab/selectors';

// Get current step
const step = useSelector(selectBookingStep);

// Get form sections
const address = useSelector(selectBookingAddress);
const timeSlot = useSelector(selectBookingTimeSlot);
const instructions = useSelector(selectBookingInstructions);
const payment = useSelector(selectPaymentMethod);
const notes = useSelector(selectBookingNotes);

// Get validation
const errors = useSelector(selectBookingErrors);
const isSubmitting = useSelector(selectIsBookingSubmitting);

// Check completion
const addressComplete = useSelector(selectIsAddressComplete);
const timeComplete = useSelector(selectIsTimeSlotComplete);
const readyToSubmit = useSelector(selectIsBookingReadyToSubmit);

// Get summary for review
const summary = useSelector(selectBookingSummary);

// Get full form data for submission
const formData = useSelector(selectBookingFormData);
```

### Selected IDs

```javascript
import {
  selectSelectedOrderId,
  selectSelectedTaskId,
} from '../features/lab/selectors';

const orderId = useSelector(selectSelectedOrderId);
const taskId = useSelector(selectSelectedTaskId);
```

### Tracking UI

```javascript
import {
  selectMapZoomLevel,
  selectMapCenter,
  selectShowTrackingTimeline,
  selectShowCollectionInfo,
  selectShowReportSection,
  selectAutoFollowLocation,
  selectRefreshInterval,
  selectWSConnected,
  selectVisibleTrackingSections,
} from '../features/lab/selectors';

// Get individual preferences
const zoom = useSelector(selectMapZoomLevel);
const center = useSelector(selectMapCenter);
const showTimeline = useSelector(selectShowTrackingTimeline);
const autoFollow = useSelector(selectAutoFollowLocation);

// Get all visible sections
const sections = useSelector(selectVisibleTrackingSections);
// { timeline: true, collection: true, report: false }
```

---

## 💻 Usage Examples

### Patient LabCatalog Page

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { useGetLabTestsQuery } from '../features/lab/labApi';
import {
  setSearchFilter,
  setSampleTypeFilter,
  setPriceRangeFilter,
  addTestToCart,
} from '../features/lab/labSlice';
import {
  selectSearchFilter,
  selectPriceRangeFilter,
  selectCartTestIds,
  selectCatalogFiltersForAPI,
} from '../features/lab/selectors';

function LabCatalog() {
  const dispatch = useDispatch();
  
  // Get filters from Redux
  const search = useSelector(selectSearchFilter);
  const priceRange = useSelector(selectPriceRangeFilter);
  const cartTestIds = useSelector(selectCartTestIds);
  const apiFilters = useSelector(selectCatalogFiltersForAPI);
  
  // Fetch tests with filters
  const { data: tests } = useGetLabTestsQuery(apiFilters);
  
  const handleSearch = (query) => {
    dispatch(setSearchFilter(query));
  };
  
  const handleAddCart = (test) => {
    dispatch(addTestToCart({
      testId: test.id,
      testCode: test.code,
      testName: test.name,
      price: test.price,
      sampleType: test.sampleType,
    }));
  };
  
  return (
    <div>
      {/* Search input */}
      <input onChange={(e) => handleSearch(e.target.value)} value={search} />
      
      {/* Tests grid */}
      {tests?.map(test => (
        <div key={test.id}>
          <h3>{test.name}</h3>
          <p>₹{test.price}</p>
          <button 
            onClick={() => handleAddCart(test)}
            disabled={cartTestIds.includes(test.id)}
          >
            {cartTestIds.includes(test.id) ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Patient LabBooking Page

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { useCreatePatientOrderMutation } from '../features/lab/labApi';
import {
  nextBookingStep,
  setBookingAddress,
  setBookingTimeSlot,
  setBookingErrors,
  clearBookingErrors,
  setBookingSubmitting,
} from '../features/lab/labSlice';
import {
  selectBookingStep,
  selectIsBookingReadyToSubmit,
  selectBookingFormData,
} from '../features/lab/selectors';

function LabBooking() {
  const dispatch = useDispatch();
  const step = useSelector(selectBookingStep);
  const readyToSubmit = useSelector(selectIsBookingReadyToSubmit);
  const formData = useSelector(selectBookingFormData);
  
  const [createOrder] = useCreatePatientOrderMutation();
  
  const handleSubmit = async () => {
    // Validate
    const errors = {};
    if (!formData.address.line1) errors.address = 'Address required';
    if (!formData.timeSlot.date) errors.timeSlot = 'Date required';
    
    if (Object.keys(errors).length > 0) {
      dispatch(setBookingErrors(errors));
      return;
    }
    
    dispatch(clearBookingErrors());
    dispatch(setBookingSubmitting(true));
    
    try {
      await createOrder(formData);
      // Success - order created
    } catch (error) {
      dispatch(setBookingErrors({ submit: error.message }));
    } finally {
      dispatch(setBookingSubmitting(false));
    }
  };
  
  return (
    <div>
      {step === 0 && <div>Select Tests</div>}
      {step === 1 && (
        <div>
          <input 
            onChange={(e) => dispatch(setBookingAddress({ line1: e.target.value }))}
            placeholder="Address"
          />
        </div>
      )}
      {step === 2 && <div>Review Order</div>}
      {step === 3 && (
        <button onClick={handleSubmit} disabled={!readyToSubmit}>
          Place Order
        </button>
      )}
    </div>
  );
}
```

### Patient LabTracking Page

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { useGetPatientOrderTrackingQuery } from '../features/lab/labApi';
import {
  setSelectedOrderId,
  setAutoFollowLocation,
  toggleTimelineVisibility,
} from '../features/lab/labSlice';
import {
  selectSelectedOrderId,
  selectVisibleTrackingSections,
  selectAutoFollowLocation,
} from '../features/lab/selectors';

function LabTracking({ orderId }) {
  const dispatch = useDispatch();
  
  // Load tracking data
  const { data: tracking } = useGetPatientOrderTrackingQuery(orderId);
  
  // Get UI preferences
  const sections = useSelector(selectVisibleTrackingSections);
  const autoFollow = useSelector(selectAutoFollowLocation);
  
  return (
    <div>
      <button 
        onClick={() => dispatch(toggleTimelineVisibility())}
      >
        {sections.timeline ? 'Hide' : 'Show'} Timeline
      </button>
      
      <button 
        onClick={() => dispatch(setAutoFollowLocation(!autoFollow))}
      >
        {autoFollow ? 'Stop' : 'Start'} Following
      </button>
      
      {sections.timeline && (
        <div>
          {/* Timeline events */}
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Key Features

✅ **No Duplication**: API logic in RTK Query, UI state here
✅ **Memoized Selectors**: Efficient re-renders
✅ **Computed Selectors**: Derived state (e.g., isReadyToSubmit)
✅ **Validation**: Errors tracked in state
✅ **Form State**: Draft state persists through steps
✅ **UI Preferences**: Map zoom, visibility toggles
✅ **Cart Tracking**: Last added/removed for feedback

---

## 📊 State Sizes

- Filters: ~30 bytes
- Cart (10 items): ~500 bytes
- Booking Draft: ~400 bytes
- Tracking UI: ~150 bytes
- **Total**: ~1 KB

---

**Status**: ✅ Complete & Ready
