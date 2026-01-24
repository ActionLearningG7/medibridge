/**
 * Doctor API
 * RTK Query endpoints for DoctorController
 * Source: user_service_medibridge/api/controller/DoctorController.java
 */

import { baseApi } from '../../app/api/baseApi';

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/v1/doctors
     * Create new doctor (ADMIN role)
     */
    createDoctor: builder.mutation({
      query: (doctorData) => ({
        url: '/api/v1/doctors',
        method: 'POST',
        body: doctorData,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/doctors/me
     * Get current doctor's profile (DOCTOR role)
     */
    getMyDoctorProfile: builder.query({
      query: () => '/api/v1/doctors/me',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * GET /api/v1/doctors/{userId}
     * Get doctor by ID (PUBLIC for verified doctors)
     */
    getDoctorById: builder.query({
      query: (userId) => `/api/v1/doctors/${userId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, userId) => [{ type: 'Doctor', id: userId }],
    }),

    /**
     * GET /api/v1/doctors
     * Get all verified doctors (PUBLIC)
     */
    getVerifiedDoctors: builder.query({
      query: () => '/api/v1/doctors',
      transformResponse: (response) => response?.data || response,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Doctor', id })),
              { type: 'Doctor', id: 'LIST' },
            ]
          : [{ type: 'Doctor', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/doctors/specialization/{specialization}
     * Get doctors by specialization (PUBLIC)
     */
    getDoctorsBySpecialization: builder.query({
      query: (specialization) => `/api/v1/doctors/specialization/${specialization}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * GET /api/v1/doctors/department/{department}
     * Get doctors by department (ADMIN role)
     */
    getDoctorsByDepartment: builder.query({
      query: (department) => `/api/v1/doctors/department/${department}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * GET /api/v1/doctors/available
     * Get available doctors (PUBLIC)
     */
    getAvailableDoctors: builder.query({
      query: () => '/api/v1/doctors/available',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * GET /api/v1/doctors/emergency
     * Get emergency doctors (PUBLIC)
     */
    getEmergencyDoctors: builder.query({
      query: () => '/api/v1/doctors/emergency',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * GET /api/v1/doctors/pending-verification
     * Get doctors pending verification (ADMIN role)
     */
    getPendingVerifications: builder.query({
      query: () => '/api/v1/doctors/pending-verification',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * POST /api/v1/doctors/{doctorId}/verify
     * Verify doctor credentials (ADMIN role)
     */
    verifyDoctor: builder.mutation({
      query: ({ doctorId, verificationData }) => ({
        url: `/api/v1/doctors/${doctorId}/verify`,
        method: 'POST',
        body: verificationData,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (result, error, { doctorId }) => [
        { type: 'Doctor', id: doctorId },
        { type: 'Doctor', id: 'LIST' },
      ],
    }),

    /**
     * GET /api/v1/doctors/search?searchTerm=xxx
     * Search doctors by name or license (ADMIN role)
     */
    searchDoctors: builder.query({
      query: (searchTerm) => ({
        url: '/api/v1/doctors/search',
        params: { searchTerm },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * GET /api/v1/doctors/expiring-licenses?days=30
     * Get doctors with licenses expiring soon (ADMIN role)
     */
    getExpiringLicenses: builder.query({
      query: (days = 30) => ({
        url: '/api/v1/doctors/expiring-licenses',
        params: { days },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * DELETE /api/v1/doctors/{userId}
     * Soft delete doctor profile (ADMIN role)
     */
    deleteDoctor: builder.mutation({
      query: (userId) => ({
        url: `/api/v1/doctors/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Doctor', id: userId },
        { type: 'Doctor', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateDoctorMutation,
  useGetMyDoctorProfileQuery,
  useGetDoctorByIdQuery,
  useGetVerifiedDoctorsQuery,
  useGetDoctorsBySpecializationQuery,
  useGetDoctorsByDepartmentQuery,
  useGetAvailableDoctorsQuery,
  useGetEmergencyDoctorsQuery,
  useGetPendingVerificationsQuery,
  useVerifyDoctorMutation,
  useSearchDoctorsQuery,
  useLazySearchDoctorsQuery,
  useGetExpiringLicensesQuery,
  useDeleteDoctorMutation,
} = doctorApi;

export default doctorApi;
