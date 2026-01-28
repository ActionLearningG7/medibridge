import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orderId: null,
    taskId: null,
    taskStatus: 'PENDING', // PENDING, IN_PROGRESS, COMPLETED

    // Locations
    hospitalLocation: null, // Origin if phleb not moving
    patientLocation: null, // Destination
    phlebotomistLocation: null, // Live location

    // Route Info
    route: {
        distance: null,
        duration: null,
        polyline: null, // Encoded polyline or points
    },

    // Meta
    isTracking: false,
    lastUpdated: null,
};

const trackingSlice = createSlice({
    name: 'tracking',
    initialState,
    reducers: {
        // Initialize tracking for an order
        startTracking: (state, action) => {
            const { orderId, taskId, hospitalLocation, patientLocation } = action.payload;
            state.orderId = orderId;
            state.taskId = taskId;
            state.hospitalLocation = hospitalLocation;
            state.patientLocation = patientLocation;
            state.isTracking = true;
        },

        // Update live location of phlebotomist
        updatePhlebotomistLocation: (state, action) => {
            const { lat, lng } = action.payload;
            state.phlebotomistLocation = { lat, lng };
            state.lastUpdated = new Date().toISOString();
        },

        // Update route details (from Google Maps Directions API)
        updateRouteInfo: (state, action) => {
            const { distance, duration } = action.payload;
            state.route.distance = distance;
            state.route.duration = duration;
        },

        // End tracking
        stopTracking: (state) => {
            state.isTracking = false;
            // We might want to keep data for summary screen
        },

        resetTracking: () => initialState,
    },
});

export const {
    startTracking,
    updatePhlebotomistLocation,
    updateRouteInfo,
    stopTracking,
    resetTracking
} = trackingSlice.actions;

export const selectTrackingState = (state) => state.tracking;
export const selectPhlebotomistLocation = (state) => state.tracking.phlebotomistLocation;
export const selectPatientLocation = (state) => state.tracking.patientLocation;

export default trackingSlice.reducer;
