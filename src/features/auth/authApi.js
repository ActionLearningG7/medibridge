/**
 * Auth API
 * All authentication endpoints from AuthController
 * Source of truth: user_service_medibridge/api/controller/AuthController.java
 */

import { baseApi } from '../../app/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/v1/auth/register
     * Register new patient (self-registration)
     */
    register: builder.mutation({
      query: (patientData) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body: patientData,
      }),
      transformResponse: (response) => response?.data || response,
    }),

    /**
     * POST /api/v1/auth/login
     * Login user with email/username and password
     */
    login: builder.mutation({
      query: (credentials) => ({
        url: `/api/v1/auth/login?_t=${Date.now()}`, // Cache buster
        method: 'POST',
        body: credentials,
        // Prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }),
      transformResponse: (response) => response?.data || response,
      // Don't cache login responses
      keepUnusedDataFor: 0,
    }),

    /**
     * POST /api/v1/auth/refresh
     * Refresh access token using refresh token
     */
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => response?.data || response,
    }),

    /**
     * POST /api/v1/auth/logout
     * Logout user and revoke refresh token
     * Requires authentication
     */
    logout: builder.mutation({
      query: (refreshToken) => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    /**
     * GET /api/v1/auth/verify-email?token=xxx
     * Verify user email using token from email
     */
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/api/v1/auth/verify-email?token=${token}`,
        method: 'GET',
      }),
      transformResponse: (response) => response?.data || response,
    }),

    /**
     * POST /api/v1/auth/forgot-password
     * Send password reset email
     */
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/api/v1/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),

    /**
     * POST /api/v1/auth/reset-password
     * Reset password using token from email
     */
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: '/api/v1/auth/reset-password',
        method: 'POST',
        body: { token, newPassword },
      }),
    }),

    /**
     * POST /api/v1/auth/change-password
     * Change password for authenticated user
     * Requires authentication
     */
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/api/v1/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;

export default authApi;
