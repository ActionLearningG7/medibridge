/**
 * Lab Feature Selectors
 * Memoized selectors for lab state
 *
 * Selectors for:
 * - Catalog filters
 * - Booking cart
 * - Booking draft
 * - Selected IDs
 * - Tracking UI preferences
 */

import { createSelector } from '@reduxjs/toolkit';

// ============================================================
// BASE SELECTORS
// ============================================================

const selectLabState = (state) => state?.lab ?? {
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
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: null,
    },
    timeSlot: {
      date: null,
      time: null,
    },
    instructions: {
      fastingInstructions: '',
      medicationsToAvoid: [],
      specialInstructions: '',
    },
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
};

// ============================================================
// CATALOG FILTER SELECTORS
// ============================================================

export const selectFilters = createSelector([selectLabState], (lab) => lab?.filters ?? {});

export const selectSearchFilter = createSelector([selectFilters], (filters) => filters.search);

export const selectSampleTypeFilter = createSelector(
  [selectFilters],
  (filters) => filters.sampleType
);

export const selectPriceRangeFilter = createSelector(
  [selectFilters],
  (filters) => filters.priceRange
);

export const selectCategoryFilter = createSelector([selectFilters], (filters) => filters.category);

export const selectSortByFilter = createSelector([selectFilters], (filters) => filters.sortBy);

export const selectFastingFilter = createSelector(
  [selectFilters],
  (filters) => filters.fastingRequired
);

export const selectHasActiveFilters = createSelector([selectFilters], (filters) => {
  return (
    filters.search ||
    filters.sampleType ||
    filters.category ||
    filters.fastingRequired !== null ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 10000 ||
    filters.sortBy !== 'popularity'
  );
});

// ============================================================
// BOOKING CART SELECTORS
// ============================================================

export const selectCart = createSelector([selectLabState], (lab) => lab.cart);

export const selectCartItems = createSelector([selectCart], (cart) => cart.items);

export const selectCartTotalPrice = createSelector([selectCart], (cart) => cart.totalPrice);

export const selectCartTotalQuantity = createSelector([selectCart], (cart) => cart.totalQuantity);

export const selectLastAddedTestId = createSelector([selectCart], (cart) => cart.lastAddedTestId);

export const selectLastRemovedTestId = createSelector(
  [selectCart],
  (cart) => cart.lastRemovedTestId
);

export const selectIsCartEmpty = createSelector([selectCartItems], (items) => items.length === 0);

export const selectCartTestIds = createSelector([selectCartItems], (items) =>
  items.map((item) => item.testId)
);

// ============================================================
// BOOKING DRAFT SELECTORS
// ============================================================

export const selectBookingDraft = createSelector([selectLabState], (lab) => lab.bookingDraft);

export const selectBookingStep = createSelector(
  [selectBookingDraft],
  (draft) => draft?.currentStep ?? 0
);

export const selectBookingAddress = createSelector(
  [selectBookingDraft],
  (draft) => draft?.address ?? { line1: '', line2: '', city: '', state: '', zipCode: '', coordinates: null }
);

export const selectBookingTimeSlot = createSelector(
  [selectBookingDraft],
  (draft) => draft?.timeSlot ?? { date: null, time: null }
);

export const selectBookingInstructions = createSelector(
  [selectBookingDraft],
  (draft) => draft?.instructions ?? { fastingInstructions: '', medicationsToAvoid: [], specialInstructions: '' }
);

export const selectPaymentMethod = createSelector(
  [selectBookingDraft],
  (draft) => draft?.paymentMethod ?? 'card'
);

export const selectBookingNotes = createSelector([selectBookingDraft], (draft) => draft?.notes ?? '');

export const selectBookingErrors = createSelector(
  [selectBookingDraft],
  (draft) => draft?.errors ?? {}
);

export const selectIsBookingSubmitting = createSelector(
  [selectBookingDraft],
  (draft) => draft?.isSubmitting ?? false
);

export const selectIsAddressComplete = createSelector([selectBookingAddress], (address) => {
  return !!(
    address.line1 &&
    address.city &&
    address.state &&
    address.zipCode &&
    address.coordinates
  );
});

export const selectIsTimeSlotComplete = createSelector([selectBookingTimeSlot], (slot) => {
  return !!(slot.date && slot.time);
});

export const selectIsBookingReadyToSubmit = createSelector(
  [selectIsAddressComplete, selectIsTimeSlotComplete, selectCartItems, selectBookingErrors],
  (addressComplete, timeComplete, cartItems, errors) => {
    return (
      addressComplete &&
      timeComplete &&
      cartItems.length > 0 &&
      Object.keys(errors).length === 0
    );
  }
);

// ============================================================
// SELECTED ID SELECTORS
// ============================================================

export const selectSelectedOrderId = createSelector(
  [selectLabState],
  (lab) => lab.selectedOrderId
);

export const selectSelectedTaskId = createSelector([selectLabState], (lab) => lab.selectedTaskId);

// ============================================================
// TRACKING UI PREFERENCES SELECTORS
// ============================================================

export const selectTrackingUI = createSelector(
  [selectLabState],
  (lab) => lab?.trackingUI ?? {
    mapZoomLevel: 15,
    mapCenter: null,
    showTrackingTimeline: true,
    showCollectionInfo: true,
    showReportSection: true,
    autoFollowLocation: false,
    refreshInterval: 15000,
    wsConnected: false,
  }
);

export const selectMapZoomLevel = createSelector([selectTrackingUI], (ui) => ui?.mapZoomLevel ?? 15);

export const selectMapCenter = createSelector([selectTrackingUI], (ui) => ui?.mapCenter ?? null);

export const selectShowTrackingTimeline = createSelector(
  [selectTrackingUI],
  (ui) => ui?.showTrackingTimeline ?? true
);

export const selectShowCollectionInfo = createSelector(
  [selectTrackingUI],
  (ui) => ui?.showCollectionInfo ?? true
);

export const selectShowReportSection = createSelector(
  [selectTrackingUI],
  (ui) => ui?.showReportSection ?? true
);

export const selectAutoFollowLocation = createSelector(
  [selectTrackingUI],
  (ui) => ui?.autoFollowLocation ?? false
);

export const selectRefreshInterval = createSelector(
  [selectTrackingUI],
  (ui) => ui?.refreshInterval ?? 15000
);

export const selectWSConnected = createSelector([selectTrackingUI], (ui) => ui?.wsConnected ?? false);

export const selectVisibleTrackingSections = createSelector(
  [selectShowTrackingTimeline, selectShowCollectionInfo, selectShowReportSection],
  (timeline, collection, report) => ({
    timeline,
    collection,
    report,
  })
);

// ============================================================
// COMPUTED SELECTORS
// ============================================================

export const selectBookingSummary = createSelector(
  [selectCartItems, selectCartTotalPrice, selectBookingAddress, selectBookingTimeSlot],
  (items, total, address, timeSlot) => ({
    testCount: items.length,
    tests: items,
    totalPrice: total,
    address,
    timeSlot,
    deliveryAddress: address.line1 ? `${address.line1}, ${address.city}` : null,
    formattedDate: timeSlot.date,
    formattedTime: timeSlot.time,
  })
);

export const selectBookingFormData = createSelector(
  [
    selectCartItems,
    selectCartTotalPrice,
    selectBookingAddress,
    selectBookingTimeSlot,
    selectBookingInstructions,
    selectPaymentMethod,
    selectBookingNotes,
  ],
  (items, total, address, timeSlot, instructions, paymentMethod, notes) => ({
    tests: items.map((item) => ({
      testId: item.testId,
      quantity: item.quantity,
    })),
    totalPrice: total,
    address,
    timeSlot,
    instructions,
    paymentMethod,
    notes,
  })
);

export const selectCatalogFiltersForAPI = createSelector(
  [selectFilters],
  (filters) => ({
    search: filters.search || undefined,
    sampleType: filters.sampleType || undefined,
    minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
    maxPrice: filters.priceRange.max < 10000 ? filters.priceRange.max : undefined,
    category: filters.category || undefined,
    fastingRequired: filters.fastingRequired !== null ? filters.fastingRequired : undefined,
    sortBy: filters.sortBy,
  })
);
