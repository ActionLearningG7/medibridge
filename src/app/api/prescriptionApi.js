import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthHeader } from './authHeader';

/**
 * Prescription Service API
 * Uses REACT_APP_PRESCRIPTION_SERVICE_BASE_URL
 * Attaches Authorization: Bearer token
 */
export const prescriptionApi = createApi({
    reducerPath: 'prescriptionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_PRESCRIPTION_SERVICE_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const authHeaders = getAuthHeader(getState);

            if (authHeaders.Authorization) {
                headers.set('Authorization', authHeaders.Authorization);
            }

            return headers;
        },
    }),
    // Tag types for caching and invalidation
    tagTypes: ['Prescription'],
    endpoints: (builder) => ({
        // Patient: Get My Prescriptions
        getMyPrescriptions: builder.query({
            query: (params) => ({
                url: '/api/v1/prescriptions/me',
                params: {
                    page: params?.page || 0,
                    size: params?.size || 10,
                    sort: params?.sort || 'issuedAt,desc',
                    ...params
                },
            }),
            providesTags: ['Prescription'],
        }),

        // Joint: Get Single Prescription
        getPrescription: builder.query({
            query: (id) => `/api/v1/prescriptions/${id}`,
            providesTags: (result, error, id) => [{ type: 'Prescription', id }],
        }),

        // Doctor: Get My Prescriptions
        getDoctorPrescriptions: builder.query({
            query: (params) => ({
                url: '/api/v1/prescriptions/doctor/me',
                params: {
                    page: params?.page || 0,
                    size: params?.size || 10,
                    sort: params?.sort || 'updatedAt,desc',
                    ...params
                },
            }),
            providesTags: ['Prescription'],
        }),

        // Doctor: Create Prescription (Placeholder for future)
        createPrescription: builder.mutation({
            query: (body) => ({
                url: '/api/v1/prescriptions',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Prescription'],
        }),

        // Doctor: Update Prescription
        updatePrescription: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/api/v1/prescriptions/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => ['Prescription', { type: 'Prescription', id }],
        }),

        // Doctor: Issue Prescription (Placeholder for future)
        issuePrescription: builder.mutation({
            query: (id) => ({
                url: `/api/v1/prescriptions/${id}/issue`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Prescription', id }],
        }),
    }),
});

export const {
    useGetMyPrescriptionsQuery,
    useGetPrescriptionQuery,
    useGetDoctorPrescriptionsQuery,
    useCreatePrescriptionMutation,
    useUpdatePrescriptionMutation,
    useIssuePrescriptionMutation,
} = prescriptionApi;

export default prescriptionApi;
