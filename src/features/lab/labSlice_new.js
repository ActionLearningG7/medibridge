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
    search: '',
    sampleType: null,
    priceRange: { min: 0, max: 10000 },
    category: null,
    sortBy: 'popularity',
    fastingRequired: null,
  },

  // ============================================================
  // BOOKING CART (Shopping Cart)
  // ============================================================
  cart: {
    items: [],
    totalPrice: 0,
    totalQuantity: 0,
    lastAddedTestId: null,
    lastRemovedTestId: null,
  },

  // ============================================================
  // BOOKING DRAFT (Form State)
  // ============================================================
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

  // ============================================================
  // SELECTED IDs FOR DETAIL VIEWS
  // ============================================================
  selectedOrderId: null,
  selectedTaskId: null,

  // ============================================================
  // MAP & TRACKING UI PREFERENCES
  // ============================================================
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

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    // ============================================================
    // CATALOG FILTER ACTIONS
    // ============================================================

    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },

    setSampleTypeFilter: (state, action) => {
      state.filters.sampleType = action.payload;
    },

    setPriceRangeFilter: (state, action) => {
      const { min, max } = action.payload;
      state.filters.priceRange = { min, max };
    },

    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },

    setSortByFilter: (state, action) => {
      state.filters.sortBy = action.payload;
    },

    setFastingFilter: (state, action) => {
      state.filters.fastingRequired = action.payload;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // ============================================================
    // BOOKING CART ACTIONS
    // ============================================================

    addTestToCart: (state, action) => {
      const { testId, testCode, testName, price, sampleType } = action.payload;
      const existing = state.cart.items.find((item) => item.testId === testId);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.items.push({
          testId,
          testCode,
          testName,
          price,
          sampleType,
          quantity: 1,
        });
      }

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

    removeTestFromCart: (state, action) => {
      const testId = action.payload;
      state.cart.items = state.cart.items.filter((item) => item.testId !== testId);
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

    updateTestQuantity: (state, action) => {
      const { testId, quantity } = action.payload;
      const item = state.cart.items.find((i) => i.testId === testId);

      if (item) {
        if (quantity <= 0) {
          state.cart.items = state.cart.items.filter((i) => i.testId !== testId);
        } else {
          item.quantity = quantity;
        }
      }

      state.cart.totalPrice = state.cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.cart.totalQuantity = state.cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    },

    clearCart: (state) => {
      state.cart = initialState.cart;
    },

    // ============================================================
    // BOOKING DRAFT ACTIONS
    // ============================================================

    setBookingStep: (state, action) => {
      state.bookingDraft.currentStep = action.payload;
    },

    nextBookingStep: (state) => {
      if (state.bookingDraft.currentStep < 3) {
        state.bookingDraft.currentStep += 1;
      }
    },

    prevBookingStep: (state) => {
      if (state.bookingDraft.currentStep > 0) {
        state.bookingDraft.currentStep -= 1;
      }
    },

    setBookingAddress: (state, action) => {
      state.bookingDraft.address = {
        ...state.bookingDraft.address,
        ...action.payload,
      };
    },

    setBookingTimeSlot: (state, action) => {
      state.bookingDraft.timeSlot = {
        ...state.bookingDraft.timeSlot,
        ...action.payload,
      };
    },

    setBookingInstructions: (state, action) => {
      state.bookingDraft.instructions = {
        ...state.bookingDraft.instructions,
        ...action.payload,
      };
    },

    setPaymentMethod: (state, action) => {
      state.bookingDraft.paymentMethod = action.payload;
    },

    setBookingNotes: (state, action) => {
      state.bookingDraft.notes = action.payload;
    },

    setBookingErrors: (state, action) => {
      state.bookingDraft.errors = action.payload;
    },

    clearBookingErrors: (state) => {
      state.bookingDraft.errors = {};
    },

    setBookingSubmitting: (state, action) => {
      state.bookingDraft.isSubmitting = action.payload;
    },

    resetBookingDraft: (state) => {
      state.bookingDraft = initialState.bookingDraft;
    },

    // ============================================================
    // SELECTED ID ACTIONS
    // ============================================================

    setSelectedOrderId: (state, action) => {
      state.selectedOrderId = action.payload;
    },

    setSelectedTaskId: (state, action) => {
      state.selectedTaskId = action.payload;
    },

    // ============================================================
    // TRACKING UI PREFERENCES ACTIONS
    // ============================================================

    setMapZoomLevel: (state, action) => {
      state.trackingUI.mapZoomLevel = action.payload;
    },

    setMapCenter: (state, action) => {
      state.trackingUI.mapCenter = action.payload;
    },

    toggleTimelineVisibility: (state) => {
      state.trackingUI.showTrackingTimeline = !state.trackingUI.showTrackingTimeline;
    },

    toggleCollectionInfoVisibility: (state) => {
      state.trackingUI.showCollectionInfo = !state.trackingUI.showCollectionInfo;
    },

    toggleReportSectionVisibility: (state) => {
      state.trackingUI.showReportSection = !state.trackingUI.showReportSection;
    },

    setAutoFollowLocation: (state, action) => {
      state.trackingUI.autoFollowLocation = action.payload;
    },

    setRefreshInterval: (state, action) => {
      state.trackingUI.refreshInterval = action.payload;
    },

    setWSConnected: (state, action) => {
      state.trackingUI.wsConnected = action.payload;
    },

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

export default labSlice.reducer;
