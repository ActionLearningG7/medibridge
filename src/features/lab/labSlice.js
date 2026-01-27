/**
 * Lab Feature Slice
 * Manages non-server UI state:
 * - Catalog filters (search, sample type, price range)
 * - Booking cart (selected tests, quantities)
 * - Booking draft (address, slot, instructions)
 * - Selected IDs for detail views
 * - Map/tracking UI preferences
 *
 * Note: Does not duplicate RTK Query business logic
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // ============================================================
  // CATALOG FILTERS
  // ============================================================
  filters: {
    search: '', // Text search query
    sampleType: null, // blood, urine, saliva, etc.
    priceRange: { min: 0, max: 10000 }, // Price filter
    category: null, // Pathology, radiology, etc.
    sortBy: 'popularity', // popularity, price-asc, price-desc, rating
    fastingRequired: null, // true, false, null (all)
  },

  // ============================================================
  // BOOKING CART (Shopping Cart)
  // ============================================================
  cart: {
    items: [], // [{ testId, testCode, testName, price, quantity, sampleType }]
    totalPrice: 0,
    totalQuantity: 0,
    lastAddedTestId: null, // For UI feedback
    lastRemovedTestId: null,
  },

  // ============================================================
  // BOOKING DRAFT (Form State)
  // ============================================================
  bookingDraft: {
    // Address/Location
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: null, // { lat, lng }
    },
    // Collection time slot
    timeSlot: {
      date: null, // ISO date string
      time: null, // morning, afternoon, evening
    },
    // Patient instructions
    instructions: {
      fastingInstructions: '', // Notes about fasting
      medicationsToAvoid: [],
      specialInstructions: '',
    },
    // Payment method
    paymentMethod: 'card', // card, wallet, insurance
    // Notes
    notes: '',
    // Current step
    currentStep: 0, // 0: Tests, 1: Address, 2: Review, 3: Payment
    // Validation errors
    errors: {}, // { fieldName: 'Error message' }
    // Submission state
    isSubmitting: false,
  },

  // ============================================================
  // SELECTED IDs FOR DETAIL VIEWS
  // ============================================================
  selectedOrderId: null, // Currently viewed order
  selectedTaskId: null, // Currently viewed task

  // ============================================================
  // MAP & TRACKING UI PREFERENCES
  // ============================================================
  trackingUI: {
    mapZoomLevel: 15,
    mapCenter: null, // { lat, lng }
    showTrackingTimeline: true,
    showCollectionInfo: true,
    showReportSection: true,
    autoFollowLocation: false, // Auto-pan to updated location
    refreshInterval: 15000, // ms
    wsConnected: false, // WebSocket connection status
  },
};

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    // ============================================================
    // CATALOG FILTER ACTIONS
    // ============================================================

    /**
     * Set search filter
     */
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },

    /**
     * Set sample type filter
     */
    setSampleTypeFilter: (state, action) => {
      state.filters.sampleType = action.payload; // null, 'blood', 'urine', etc.
    },

    /**
     * Set price range filter
     */
    setPriceRangeFilter: (state, action) => {
      const { min, max } = action.payload;
      state.filters.priceRange = { min, max };
    },

    /**
     * Set category filter
     */
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload; // null or category name
    },

    /**
     * Set sort by
     */
    setSortByFilter: (state, action) => {
      state.filters.sortBy = action.payload;
    },

    /**
     * Set fasting requirement filter
     */
    setFastingFilter: (state, action) => {
      state.filters.fastingRequired = action.payload; // true, false, null
    },

    /**
     * Reset all filters to defaults
     */
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // ============================================================
    // BOOKING CART ACTIONS
    // ============================================================

    /**
     * Add test to cart
     * Payload: { testId, testCode, testName, price, sampleType }
     */
    addTestToCart: (state, action) => {
      const { testId, testCode, testName, price, sampleType } = action.payload;
      const existing = state.cart.items.find((item) => item.testId === testId);

      if (existing) {
        // Increase quantity if already in cart
        existing.quantity += 1;
      } else {
        // Add new item
        state.cart.items.push({
          testId,
          testCode,
          testName,
          price,
          sampleType,
          quantity: 1,
        });
      }

      // Recalculate totals
      state.cart.totalPrice = state.cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.cart.totalQuantity = state.cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.cart.lastAddedTestId = testId;
    },

    /**
     * Remove test from cart
     * Payload: testId
     */
    removeTestFromCart: (state, action) => {
      const testId = action.payload;
      const removed = state.cart.items.find((item) => item.testId === testId);

      state.cart.items = state.cart.items.filter((item) => item.testId !== testId);

      // Recalculate totals
      state.cart.totalPrice = state.cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.cart.totalQuantity = state.cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.cart.lastRemovedTestId = testId;
    },

    /**
     * Update quantity of test in cart
     * Payload: { testId, quantity }
     */
    updateTestQuantity: (state, action) => {
      const { testId, quantity } = action.payload;
      const item = state.cart.items.find((i) => i.testId === testId);

      if (item) {
        if (quantity <= 0) {
          // Remove if quantity is 0 or less
          state.cart.items = state.cart.items.filter((i) => i.testId !== testId);
        } else {
          item.quantity = quantity;
        }
      }

      // Recalculate totals
      state.cart.totalPrice = state.cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.cart.totalQuantity = state.cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    },

    /**
     * Clear entire cart
     */
    clearCart: (state) => {
      state.cart = initialState.cart;
    },

    // ============================================================
    // BOOKING DRAFT ACTIONS
    // ============================================================

    /**
     * Set booking step
     * Payload: 0, 1, 2, or 3
     */
    setBookingStep: (state, action) => {
      state.bookingDraft.currentStep = action.payload;
    },

    /**
     * Move to next booking step
     */
    nextBookingStep: (state) => {
      if (state.bookingDraft.currentStep < 4) {
        state.bookingDraft.currentStep += 1;
      }
    },

    /**
     * Move to previous booking step
     */
    prevBookingStep: (state) => {
      if (state.bookingDraft.currentStep > 0) {
        state.bookingDraft.currentStep -= 1;
      }
    },

    /**
     * Update address in booking draft
     * Payload: { line1, line2, city, state, zipCode, coordinates }
     */
    setBookingAddress: (state, action) => {
      state.bookingDraft.address = {
        ...state.bookingDraft.address,
        ...action.payload,
      };
    },

    /**
     * Update time slot in booking draft
     * Payload: { date, time }
     */
    setBookingTimeSlot: (state, action) => {
      state.bookingDraft.timeSlot = {
        ...state.bookingDraft.timeSlot,
        ...action.payload,
      };
    },

    /**
     * Update patient instructions in booking draft
     * Payload: { fastingInstructions, medicationsToAvoid, specialInstructions }
     */
    setBookingInstructions: (state, action) => {
      state.bookingDraft.instructions = {
        ...state.bookingDraft.instructions,
        ...action.payload,
      };
    },

    /**
     * Set payment method
     * Payload: 'card', 'wallet', or 'insurance'
     */
    setPaymentMethod: (state, action) => {
      state.bookingDraft.paymentMethod = action.payload;
    },

    /**
     * Set booking notes
     * Payload: notes string
     */
    setBookingNotes: (state, action) => {
      state.bookingDraft.notes = action.payload;
    },

    /**
     * Set validation errors
     * Payload: { fieldName: 'Error message' }
     */
    setBookingErrors: (state, action) => {
      state.bookingDraft.errors = action.payload;
    },

    /**
     * Clear validation errors
     */
    clearBookingErrors: (state) => {
      state.bookingDraft.errors = {};
    },

    /**
     * Set submission state
     * Payload: boolean
     */
    setBookingSubmitting: (state, action) => {
      state.bookingDraft.isSubmitting = action.payload;
    },

    /**
     * Reset entire booking draft to initial state
     */
    resetBookingDraft: (state) => {
      state.bookingDraft = initialState.bookingDraft;
    },

    // ============================================================
    // SELECTED ID ACTIONS
    // ============================================================

    /**
     * Set selected order ID for detail view
     */
    setSelectedOrderId: (state, action) => {
      state.selectedOrderId = action.payload;
    },

    /**
     * Set selected task ID for detail view
     */
    setSelectedTaskId: (state, action) => {
      state.selectedTaskId = action.payload;
    },

    // ============================================================
    // TRACKING UI PREFERENCES ACTIONS
    // ============================================================

    /**
     * Set map zoom level
     */
    setMapZoomLevel: (state, action) => {
      state.trackingUI.mapZoomLevel = action.payload;
    },

    /**
     * Set map center coordinates
     * Payload: { lat, lng }
     */
    setMapCenter: (state, action) => {
      state.trackingUI.mapCenter = action.payload;
    },

    /**
     * Toggle timeline visibility
     */
    toggleTimelineVisibility: (state) => {
      state.trackingUI.showTrackingTimeline = !state.trackingUI.showTrackingTimeline;
    },

    /**
     * Toggle collection info visibility
     */
    toggleCollectionInfoVisibility: (state) => {
      state.trackingUI.showCollectionInfo = !state.trackingUI.showCollectionInfo;
    },

    /**
     * Toggle report section visibility
     */
    toggleReportSectionVisibility: (state) => {
      state.trackingUI.showReportSection = !state.trackingUI.showReportSection;
    },

    /**
     * Set auto-follow location
     */
    setAutoFollowLocation: (state, action) => {
      state.trackingUI.autoFollowLocation = action.payload;
    },

    /**
     * Set refresh interval (ms)
     */
    setRefreshInterval: (state, action) => {
      state.trackingUI.refreshInterval = action.payload;
    },

    /**
     * Set WebSocket connection status
     */
    setWSConnected: (state, action) => {
      state.trackingUI.wsConnected = action.payload;
    },

    /**
     * Reset tracking UI to defaults
     */
    resetTrackingUI: (state) => {
      state.trackingUI = initialState.trackingUI;
    },
  },
});

export const {
  // Filters
  setSearchFilter,
  setSampleTypeFilter,
  setPriceRangeFilter,
  setCategoryFilter,
  setSortByFilter,
  setFastingFilter,
  resetFilters,

  // Cart
  addTestToCart,
  removeTestFromCart,
  updateTestQuantity,
  clearCart,

  // Booking Draft
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

  // Selected IDs
  setSelectedOrderId,
  setSelectedTaskId,

  // Tracking UI
  setMapZoomLevel,
  setMapCenter,
  toggleTimelineVisibility,
  toggleCollectionInfoVisibility,
  toggleReportSectionVisibility,
  setAutoFollowLocation,
  setRefreshInterval,
  setWSConnected,
  resetTrackingUI,
} = labSlice.actions;

// Selectors
export const selectBookingStep = (state) => state.lab.booking.currentStep;
export const selectCart = (state) => state.lab.cart;
export const selectBookingDraft = (state) => state.lab.bookingDraft;
export const selectFilters = (state) => state.lab.filters;

export default labSlice.reducer;
