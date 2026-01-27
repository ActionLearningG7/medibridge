import { baseApi } from '../../app/api/baseApi';

export const sosApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // --- Patient Endpoints ---
        createSOS: builder.mutation({
            query: (data) => ({
                url: '/api/v1/sos/create',
                method: 'POST',
                body: data, // { latitude, longitude }
            }),
            transformResponse: (response) => response?.data || response,
            invalidatesTags: ['SOSRequest'],
        }),
        getSOSById: builder.query({
            query: (requestId) => `/api/v1/sos/${requestId}`,
            transformResponse: (response) => response?.data || response,
            providesTags: (result, error, id) => [{ type: 'SOSRequest', id }],
        }),
        cancelSOS: builder.mutation({
            query: (requestId) => ({
                url: `/api/v1/sos/${requestId}/cancel`,
                method: 'POST',
            }),
            transformResponse: (response) => response?.data || response,
            invalidatesTags: (result, error, id) => [{ type: 'SOSRequest', id }],
        }),
        listMySOS: builder.query({
            query: () => '/api/v1/sos/my-requests',
            transformResponse: (response) => response?.data || response,
            providesTags: ['SOSRequest'],
        }),

        // --- Driver Endpoints ---
        listOpenRequests: builder.query({
            query: () => '/api/v1/sos/driver/open-requests', // Assuming endpoint
            transformResponse: (response) => response?.data || response,
            providesTags: ['SOSRequest'],
        }),
        acceptRequest: builder.mutation({
            query: (requestId) => ({
                url: `/api/v1/sos/${requestId}/accept`,
                method: 'POST',
            }),
            transformResponse: (response) => response?.data || response,
            invalidatesTags: ['SOSRequest'],
        }),
        updateDriverLocation: builder.mutation({
            transformResponse: (response) => response?.data || response,
            query: ({ incidentId, ambulanceId, organizationId, latitude, longitude, accuracyMeters, speedKmh }) => ({
                url: '/api/v1/driver/incidents/location-ping',
                method: 'POST',
                body: {
                    incidentId,
                    ambulanceId,
                    organizationId,
                    latitude,
                    longitude,
                    accuracyMeters: accuracyMeters || 0,
                    speedKmh: speedKmh || 0,
                    provider: 'gps'
                },
            }),
        }),
        markArrived: builder.mutation({
            query: (requestId) => ({
                url: `/api/v1/sos/${requestId}/arrived`,
                method: 'POST',
            }),
            transformResponse: (response) => response?.data || response,
            invalidatesTags: ['SOSRequest'],
        }),
        pickupPatient: builder.mutation({
            query: (requestId) => ({
                url: `/api/v1/sos/${requestId}/pickup`,
                method: 'POST',
            }),
            transformResponse: (response) => response?.data || response,
            invalidatesTags: ['SOSRequest'],
        }),
        completeTrip: builder.mutation({
            query: (requestId) => ({
                url: `/api/v1/sos/${requestId}/complete`,
                method: 'POST',
            }),
            transformResponse: (response) => response?.data || response,
            invalidatesTags: ['SOSRequest'],
        }),
    }),
});

export const {
    useCreateSOSMutation,
    useGetSOSByIdQuery,
    useCancelSOSMutation,
    useListMySOSQuery,
    useListOpenRequestsQuery,
    useAcceptRequestMutation,
    useUpdateDriverLocationMutation,
    useMarkArrivedMutation,
    usePickupPatientMutation,
    useCompleteTripMutation,
} = sosApi;
