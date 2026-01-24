/**
 * Admin API
 * RTK Query endpoints for AdminController
 * Source: user_service_medibridge/api/controller/AdminController.java
 */

import { baseApi } from '../../app/api/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/v1/admin/me
     * Get current admin's profile (ADMIN role)
     */
    getMyAdminProfile: builder.query({
      query: () => '/api/v1/admin/me',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Admin'],
    }),

    /**
     * GET /api/v1/admin
     * Get all admins (SUPER_ADMIN role)
     */
    getAllAdmins: builder.query({
      query: () => '/api/v1/admin',
      transformResponse: (response) => response?.data || response,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Admin', id })),
              { type: 'Admin', id: 'LIST' },
            ]
          : [{ type: 'Admin', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/admin/level/{level}
     * Get admins by level (SUPER_ADMIN role)
     */
    getAdminsByLevel: builder.query({
      query: (level) => `/api/v1/admin/level/${level}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Admin'],
    }),

    /**
     * GET /api/v1/admin/verifiers
     * Get admins who can verify doctors (ADMIN role)
     */
    getDoctorVerifiers: builder.query({
      query: () => '/api/v1/admin/verifiers',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Admin'],
    }),

    /**
     * GET /api/v1/admin/non-compliant
     * Get non-compliant admins (ADMIN role)
     */
    getNonCompliantAdmins: builder.query({
      query: () => '/api/v1/admin/non-compliant',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Admin'],
    }),

    /**
     * PUT /api/v1/admin/users/{userId}/status?status=xxx
     * Update user status (ADMIN role)
     */
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/api/v1/admin/users/${userId}/status`,
        method: 'PUT',
        params: { status },
      }),
      invalidatesTags: ['User', 'Patient', 'Doctor', 'Admin'],
    }),

    /**
     * POST /api/v1/admin/{adminId}/suspend?reason=xxx
     * Suspend admin account (SUPER_ADMIN role)
     */
    suspendAdmin: builder.mutation({
      query: ({ adminId, reason }) => ({
        url: `/api/v1/admin/${adminId}/suspend`,
        method: 'POST',
        params: { reason },
      }),
      invalidatesTags: (result, error, { adminId }) => [
        { type: 'Admin', id: adminId },
        { type: 'Admin', id: 'LIST' },
      ],
    }),

    /**
     * POST /api/v1/admin/{adminId}/unsuspend
     * Unsuspend admin account (SUPER_ADMIN role)
     */
    unsuspendAdmin: builder.mutation({
      query: (adminId) => ({
        url: `/api/v1/admin/${adminId}/unsuspend`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, adminId) => [
        { type: 'Admin', id: adminId },
        { type: 'Admin', id: 'LIST' },
      ],
    }),

    /**
     * GET /api/v1/admin/statistics
     * Get system statistics (ADMIN role)
     */
    getSystemStatistics: builder.query({
      query: () => '/api/v1/admin/statistics',
      transformResponse: (response) => response?.data || response,
    }),

    /**
     * GET /api/v1/admin/doctors
     * Get all doctors for admin management (ADMIN role)
     */
    getAllDoctorsAdmin: builder.query({
      query: () => '/api/v1/admin/doctors',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Doctor'],
    }),

    /**
     * GET /api/v1/admin/phlebotomists
     * Get all phlebotomists for admin management (ADMIN role)
     */
    getAllPhlebotomists: builder.query({
      query: () => '/api/v1/admin/phlebotomists',
      transformResponse: (response) => response?.data || response,
      providesTags: ['User'],
    }),

    /**
     * DELETE /api/v1/admin/{userId}
     * Soft delete admin profile (SUPER_ADMIN role)
     */
    deleteAdmin: builder.mutation({
      query: (userId) => ({
        url: `/api/v1/admin/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Admin', id: userId },
        { type: 'Admin', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMyAdminProfileQuery,
  useGetAllAdminsQuery,
  useGetAdminsByLevelQuery,
  useGetDoctorVerifiersQuery,
  useGetNonCompliantAdminsQuery,
  useUpdateUserStatusMutation,
  useSuspendAdminMutation,
  useUnsuspendAdminMutation,
  useGetSystemStatisticsQuery,
  useGetAllDoctorsAdminQuery,
  useGetAllPhlebotomistsQuery,
  useDeleteAdminMutation,
} = adminApi;

export default adminApi;
