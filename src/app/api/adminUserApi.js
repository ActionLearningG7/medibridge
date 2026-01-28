/**
 * Admin User Management API
 * RTK Query endpoints for managing users (doctors, phlebotomists, etc.)
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseApi';

const API_TAGS = {
  PHLEBOTOMISTS: 'Phlebotomists',
  PHLEBOTOMIST_DETAIL: 'PhlebotomistDetail',
  DOCTORS: 'Doctors',
  DOCTOR_DETAIL: 'DoctorDetail',
};

export const adminUserApi = createApi({
  reducerPath: 'adminUserApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: Object.values(API_TAGS),
  endpoints: (builder) => ({
    // ============================================================
    // PHLEBOTOMIST ENDPOINTS
    // ============================================================

    /**
     * POST /api/v1/admin/phlebotomists
     * Create a new phlebotomist
     */
    createPhlebotomist: builder.mutation({
      query: (data) => ({
        url: '/api/v1/admin/phlebotomists',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: [API_TAGS.PHLEBOTOMISTS],
    }),

    /**
     * GET /api/v1/admin/phlebotomists
     * Fetch all phlebotomists with filters
     */
    getPhlebotomists: builder.query({
      query: (params = {}) => ({
        url: '/api/v1/admin/phlebotomists',
        params: {
          page: params.page || 0,
          size: params.size || 20,
          search: params.search,
          status: params.status,
          sortBy: params.sortBy || 'createdAt',
          sortDirection: params.sortDirection || 'DESC',
        },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: [API_TAGS.PHLEBOTOMISTS],
    }),

    /**
     * GET /api/v1/admin/phlebotomists/{id}
     * Fetch phlebotomist details
     */
    getPhlebotomistDetail: builder.query({
      query: (id) => `/api/v1/admin/phlebotomists/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [
        { type: API_TAGS.PHLEBOTOMIST_DETAIL, id },
      ],
    }),

    /**
     * PUT /api/v1/admin/phlebotomists/{id}
     * Update phlebotomist details
     */
    updatePhlebotomist: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/admin/phlebotomists/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.PHLEBOTOMIST_DETAIL, id },
        API_TAGS.PHLEBOTOMISTS,
      ],
    }),

    /**
     * PATCH /api/v1/admin/phlebotomists/{id}/status
     * Update phlebotomist status (ACTIVE/INACTIVE)
     */
    updatePhlebotomistStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/v1/admin/phlebotomists/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.PHLEBOTOMIST_DETAIL, id },
        API_TAGS.PHLEBOTOMISTS,
      ],
    }),

    /**
     * POST /api/v1/admin/phlebotomists/{id}/reset-credentials
     * Reset phlebotomist password and credentials
     */
    resetPhlebotomistCredentials: builder.mutation({
      query: (id) => ({
        url: `/api/v1/admin/phlebotomists/${id}/reset-credentials`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, id) => [
        { type: API_TAGS.PHLEBOTOMIST_DETAIL, id },
      ],
    }),

    /**
     * GET /api/v1/admin/phlebotomists/available
     * Get list of available phlebotomists for task assignment
     */
    getAvailablePhlebotomists: builder.query({
      query: (params = {}) => ({
        url: '/api/v1/admin/phlebotomists/available',
        params: {
          ...params,
        },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: [API_TAGS.PHLEBOTOMISTS],
    }),

    /**
     * DELETE /api/v1/admin/phlebotomists/{id}
     * Soft delete phlebotomist
     */
    deletePhlebotomist: builder.mutation({
      query: (id) => ({
        url: `/api/v1/admin/phlebotomists/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: [API_TAGS.PHLEBOTOMISTS],
    }),
  }),
});

export const {
  useCreatePhlebotomistMutation,
  useGetPhlebotomistsQuery,
  useGetPhlebotomistDetailQuery,
  useUpdatePhlebotomistMutation,
  useUpdatePhlebotomistStatusMutation,
  useResetPhlebotomistCredentialsMutation,
  useGetAvailablePhlebotomistsQuery,
  useDeletePhlebotomistMutation,
} = adminUserApi;
