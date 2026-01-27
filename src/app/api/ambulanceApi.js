/**
 * Ambulance & Driver Management API
 * RTK Query endpoints for managing ambulance drivers and ambulances
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseApi';

const API_TAGS = {
  DRIVERS: 'AmbulanceDrivers',
  DRIVER_DETAIL: 'AmbulanceDriverDetail',
  AMBULANCES: 'Ambulances',
  AMBULANCE_DETAIL: 'AmbulanceDetail',
  SOS_INCIDENTS: 'SosIncidents',
  SOS_INCIDENT_DETAIL: 'SosIncidentDetail',
};

export const ambulanceApi = createApi({
  reducerPath: 'ambulanceApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: Object.values(API_TAGS),
  endpoints: (builder) => ({
    // ============================================================
    // AMBULANCE DRIVER ENDPOINTS
    // ============================================================

    /**
     * GET /api/v1/admin/ambulance-drivers
     * Fetch all ambulance drivers with pagination
     */
    getAmbulanceDrivers: builder.query({
      query: (params = {}) => ({
        url: '/api/v1/admin/ambulance-drivers',
        params: {
          page: params.page || 0,
          size: params.size || 10,
          search: params.search,
          status: params.status,
        },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: [API_TAGS.DRIVERS],
    }),

    /**
     * GET /api/v1/admin/ambulance-drivers/{id}
     * Fetch ambulance driver details
     */
    getAmbulanceDriverDetail: builder.query({
      query: (id) => `/api/v1/admin/ambulance-drivers/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [
        { type: API_TAGS.DRIVER_DETAIL, id },
      ],
    }),

    /**
     * POST /api/v1/admin/ambulance-drivers
     * Create a new ambulance driver
     */
    createAmbulanceDriver: builder.mutation({
      query: (data) => ({
        url: '/api/v1/admin/ambulance-drivers',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: [API_TAGS.DRIVERS],
    }),

    /**
     * PUT /api/v1/admin/ambulance-drivers/{id}
     * Update ambulance driver details
     */
    updateAmbulanceDriver: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/admin/ambulance-drivers/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.DRIVER_DETAIL, id },
        API_TAGS.DRIVERS,
      ],
    }),

    /**
     * DELETE /api/v1/admin/ambulance-drivers/{id}
     * Delete ambulance driver
     */
    deleteAmbulanceDriver: builder.mutation({
      query: (id) => ({
        url: `/api/v1/admin/ambulance-drivers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.DRIVERS],
    }),

    /**
     * PATCH /api/v1/admin/ambulance-drivers/{id}/reset-credentials
     * Reset driver credentials
     */
    resetDriverCredentials: builder.mutation({
      query: (id) => ({
        url: `/api/v1/admin/ambulance-drivers/${id}/reset-credentials`,
        method: 'PATCH',
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, id) => [
        { type: API_TAGS.DRIVER_DETAIL, id },
      ],
    }),

    // ============================================================
    // AMBULANCE ENDPOINTS
    // ============================================================

    /**
     * GET /api/v1/admin/ambulances
     * Fetch all ambulances with pagination
     */
    getAmbulances: builder.query({
      query: (params = {}) => ({
        url: '/api/v1/admin/ambulances',
        params: {
          page: params.page || 0,
          size: params.size || 10,
          search: params.search,
          status: params.status,
        },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: [API_TAGS.AMBULANCES],
    }),

    /**
     * GET /api/v1/admin/ambulances/{id}
     * Fetch ambulance details
     */
    getAmbulanceDetail: builder.query({
      query: (id) => `/api/v1/admin/ambulances/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [
        { type: API_TAGS.AMBULANCE_DETAIL, id },
      ],
    }),

    /**
     * POST /api/v1/admin/ambulances
     * Create a new ambulance
     */
    createAmbulance: builder.mutation({
      query: (data) => ({
        url: '/api/v1/admin/ambulances',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: [API_TAGS.AMBULANCES],
    }),

    /**
     * PUT /api/v1/admin/ambulances/{id}
     * Update ambulance details
     */
    updateAmbulance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/admin/ambulances/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.AMBULANCE_DETAIL, id },
        API_TAGS.AMBULANCES,
      ],
    }),

    /**
     * DELETE /api/v1/admin/ambulances/{id}
     * Delete ambulance
     */
    deleteAmbulance: builder.mutation({
      query: (id) => ({
        url: `/api/v1/admin/ambulances/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.AMBULANCES],
    }),

    /**
     * PATCH /api/v1/admin/ambulances/{id}/status
     * Update ambulance status (AVAILABLE/BUSY/MAINTENANCE)
     */
    updateAmbulanceStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/v1/admin/ambulances/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.AMBULANCE_DETAIL, id },
        API_TAGS.AMBULANCES,
      ],
    }),

    /**
     * POST /api/v1/admin/ambulances/{id}/assign-driver
     * Assign driver to ambulance
     */
    assignAmbulanceDriver: builder.mutation({
      query: ({ ambulanceId, driverUserId }) => ({
        url: `/api/v1/admin/ambulances/${ambulanceId}/assign-driver`,
        method: 'PATCH',
        body: { driverUserId },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { ambulanceId }) => [
        { type: API_TAGS.AMBULANCE_DETAIL, id: ambulanceId },
        API_TAGS.AMBULANCES,
      ],
    }),

    // ============================================================
    // SOS INCIDENT ENDPOINTS
    // ============================================================

    /**
     * GET /api/v1/admin/sos-incidents
     * Fetch all SOS incidents with pagination
     */
    getSosIncidents: builder.query({
      query: (params = {}) => ({
        url: '/api/v1/admin/sos-incidents',
        params: {
          page: params.page || 0,
          size: params.size || 10,
          search: params.search,
          status: params.status,
        },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: [API_TAGS.SOS_INCIDENTS],
    }),

    /**
     * GET /api/v1/admin/sos-incidents/{id}
     * Fetch SOS incident details
     */
    getSosIncidentDetail: builder.query({
      query: (id) => `/api/v1/admin/sos-incidents/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [
        { type: API_TAGS.SOS_INCIDENT_DETAIL, id },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Drivers
  useGetAmbulanceDriversQuery,
  useGetAmbulanceDriverDetailQuery,
  useCreateAmbulanceDriverMutation,
  useUpdateAmbulanceDriverMutation,
  useDeleteAmbulanceDriverMutation,
  useResetDriverCredentialsMutation,

  // Ambulances
  useGetAmbulancesQuery,
  useGetAmbulanceDetailQuery,
  useCreateAmbulanceMutation,
  useUpdateAmbulanceMutation,
  useDeleteAmbulanceMutation,
  useUpdateAmbulanceStatusMutation,
  useAssignAmbulanceDriverMutation,

  // SOS Incidents
  useGetSosIncidentsQuery,
  useGetSosIncidentDetailQuery,
} = ambulanceApi;
