/**
 * Patient API
 * RTK Query endpoints for PatientController
 * Source: user_service_medibridge/api/controller/PatientController.java
 */

import { baseApi } from '../../app/api/baseApi';

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/v1/patients/me
     * Get current patient's profile (PATIENT role)
     */
    getMyPatientProfile: builder.query({
      query: () => '/api/v1/patients/me',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Patient'],
    }),

    /**
     * PUT /api/v1/patients/me
     * Update current patient's profile (PATIENT role)
     */
    updateMyPatientProfile: builder.mutation({
      query: (profileData) => ({
        url: '/api/v1/patients/me',
        method: 'PUT',
        body: profileData,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Patient'],
    }),

    /**
     * GET /api/v1/patients/{userId}
     * Get patient by ID (ADMIN or DOCTOR role)
     */
    getPatientById: builder.query({
      query: (userId) => `/api/v1/patients/${userId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, userId) => [{ type: 'Patient', id: userId }],
    }),

    /**
     * GET /api/v1/patients
     * Get all patients (ADMIN role)
     */
    getAllPatients: builder.query({
      query: () => '/api/v1/patients',
      transformResponse: (response) => response?.data || response,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Patient', id })),
              { type: 'Patient', id: 'LIST' },
            ]
          : [{ type: 'Patient', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/patients/search?searchTerm=xxx
     * Search patients by name or phone (ADMIN role)
     */
    searchPatients: builder.query({
      query: (searchTerm) => ({
        url: '/api/v1/patients/search',
        params: { searchTerm },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Patient'],
    }),

    /**
     * GET /api/v1/patients/incomplete
     * Get patients with incomplete profiles (ADMIN role)
     */
    getIncompletePatientProfiles: builder.query({
      query: () => '/api/v1/patients/incomplete',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Patient'],
    }),

    /**
     * GET /api/v1/patients/without-consent
     * Get patients without treatment consent (ADMIN role)
     */
    getPatientsWithoutConsent: builder.query({
      query: () => '/api/v1/patients/without-consent',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Patient'],
    }),

    /**
     * DELETE /api/v1/patients/{userId}
     * Soft delete patient profile (ADMIN role)
     */
    deletePatient: builder.mutation({
      query: (userId) => ({
        url: `/api/v1/patients/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Patient', id: userId },
        { type: 'Patient', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMyPatientProfileQuery,
  useUpdateMyPatientProfileMutation,
  useGetPatientByIdQuery,
  useGetAllPatientsQuery,
  useSearchPatientsQuery,
  useLazySearchPatientsQuery,
  useGetIncompletePatientProfilesQuery,
  useGetPatientsWithoutConsentQuery,
  useDeletePatientMutation,
} = patientApi;

export default patientApi;
