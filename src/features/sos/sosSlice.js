import { createSlice } from '@reduxjs/toolkit';

// Try to load persisted state
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('sosActiveRequest');
        if (serializedState === null) {
            return null;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return null;
    }
};

const initialState = {
    activeRequestId: loadState() || null,
    activeRequest: null, // Full object details
    driverLocation: null, // { lat, lng }
    patientLocation: null, // { lat, lng }
    statusTimeline: [], // [{status, timestamp}, ...]
};

const sosSlice = createSlice({
    name: 'sos',
    initialState,
    reducers: {
        setActiveRequestId: (state, action) => {
            state.activeRequestId = action.payload;
            if (action.payload) {
                localStorage.setItem('sosActiveRequest', JSON.stringify(action.payload));
            } else {
                localStorage.removeItem('sosActiveRequest');
            }
        },
        setActiveRequest: (state, action) => {
            state.activeRequest = action.payload;
            // Track status changes in timeline
            if (action.payload?.status && (!state.statusTimeline.length || state.statusTimeline[state.statusTimeline.length - 1].status !== action.payload.status)) {
                state.statusTimeline.push({
                    status: action.payload.status,
                    timestamp: new Date().toISOString()
                });
            }
        },
        setDriverLocation: (state, action) => {
            state.driverLocation = action.payload;
        },
        setPatientLocation: (state, action) => {
            state.patientLocation = action.payload;
        },
        addStatusToTimeline: (state, action) => {
            state.statusTimeline.push({
                status: action.payload,
                timestamp: new Date().toISOString()
            });
        },
        clearSOSState: (state) => {
            state.activeRequestId = null;
            state.activeRequest = null;
            state.driverLocation = null;
            state.patientLocation = null;
            state.statusTimeline = [];
            localStorage.removeItem('sosActiveRequest');
        },
    },
});

export const {
    setActiveRequestId,
    setActiveRequest,
    setDriverLocation,
    setPatientLocation,
    addStatusToTimeline,
    clearSOSState,
} = sosSlice.actions;

export const selectActiveRequestId = (state) => state.sos.activeRequestId;
export const selectActiveRequest = (state) => state.sos.activeRequest;
export const selectDriverLocation = (state) => state.sos.driverLocation;
export const selectPatientLocation = (state) => state.sos.patientLocation;
export const selectStatusTimeline = (state) => state.sos.statusTimeline;

export default sosSlice.reducer;
