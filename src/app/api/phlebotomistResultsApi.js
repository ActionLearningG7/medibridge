/**
 * Phlebotomist Results API
 * RTK Query endpoints for uploading and managing lab results
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseApi';

export const phlebotomistResultsApi = createApi({
  reducerPath: 'phlebotomistResultsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['LabResults', 'EligibleOrders'],
  endpoints: (builder) => ({
    /**
     * Get eligible orders for result upload
     * Orders with status: COLLECTED, IN_TRANSIT, AT_LAB, TESTING
     */
    getEligibleOrders: builder.query({
      query: (params = {}) => ({
        url: '/api/v1/phlebotomy-admin/eligible-orders',
        params: {
          page: params.page || 0,
          size: params.size || 20,
          search: params.search,
          status: params.status,
        },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['EligibleOrders'],
    }),

    /**
     * Upload lab result file
     * POST /api/v1/phlebotomy-admin/orders/{orderId}/results
     */
    uploadLabResult: builder.mutation({
      query: ({ orderId, file, notes }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (notes) {
          formData.append('notes', notes);
        }

        return {
          url: `/api/v1/phlebotomy-admin/orders/${orderId}/results`,
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - browser will set it with boundary
        };
      },
      invalidatesTags: ['LabResults', 'EligibleOrders'],
    }),

    /**
     * Get lab results for an order
     * GET /api/v1/lab-orders/{orderId}/results
     */
    getLabResults: builder.query({
      query: (orderId) => `/api/v1/lab-orders/${orderId}/results`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, orderId) => [
        { type: 'LabResults', id: orderId },
      ],
    }),

    /**
     * Delete a lab result
     * DELETE /api/v1/phlebotomy-admin/results/{resultId}
     */
    deleteLabResult: builder.mutation({
      query: (resultId) => ({
        url: `/api/v1/phlebotomy-admin/results/${resultId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LabResults', 'EligibleOrders'],
    }),
  }),
});

export const {
  useGetEligibleOrdersQuery,
  useUploadLabResultMutation,
  useGetLabResultsQuery,
  useDeleteLabResultMutation,
} = phlebotomistResultsApi;
