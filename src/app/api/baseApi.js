/**
 * Base API configuration using RTK Query
 * Centralized API setup with JWT auth and 401 handling
 * Supports multiple microservices with dynamic base URLs
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthHeader } from './authHeader';
import env from '../../utils/env';

/**
 * Get base URL for specific service
 * Falls back to API Gateway if service URL not configured
 */
const getServiceUrl = (service) => {
  const urls = {
    user_service: process.env.REACT_APP_USER_SERVICE_BASE_URL,
    appointment_service: process.env.REACT_APP_APPOINTMENT_SERVICE_BASE_URL,
  };

  // Use service-specific URL if available, otherwise use API Gateway
  return urls[service] || env.apiGateway;
};

/**
 * Create base query for a specific service
 */
const createServiceBaseQuery = (service) => fetchBaseQuery({
  baseUrl: getServiceUrl(service),
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Get JWT token from Redux state
    const authHeaders = getAuthHeader(getState);

    // Add Authorization header if token exists
    if (authHeaders.Authorization) {
      headers.set('Authorization', authHeaders.Authorization);
    }

    // Add Content-Type if not already set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add X-Is-Admin header for Phlebotomists
    // This is required for PhlebotomistAdminController endpoints
    const state = getState();
    const user = state.auth?.user;
    // Fallback to localStorage if not in state yet
    const userFromStorage = !user && typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const currentUser = user || userFromStorage;

    if (currentUser && currentUser.role === 'PHLEBOTOMIST') {
      headers.set('X-Is-Admin', String(currentUser.isAdmin || false));
    }

    // Note: Cache-Control headers should be set by the SERVER in response headers,
    // not by the client in request headers. Setting them here causes CORS preflight issues.
    // Removed: Cache-Control, Pragma, Expires headers on auth endpoints

    return headers;
  },
});

/**
 * Base query with auth header injection (default to API Gateway)
 */
const baseQueryWithAuth = createServiceBaseQuery('api_gateway');

/**
 * Create appointment service base query with error handling
 * Used for consultation API - appointment_service is a RESOURCE SERVER
 *
 * CRITICAL: appointment_service does NOT have /auth/refresh endpoint
 * Only user_service has token refresh capability
 *
 * On 401 from appointment_service:
 * - Do NOT attempt refresh (wrong service)
 * - Return error and let component handle logout
 */
const appointmentServiceBaseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await createServiceBaseQuery('appointment_service')(args, api, extraOptions);

  // Handle 401 Unauthorized from appointment_service
  if (result.error && result.error.status === 401) {
    const requestUrl = typeof args === 'string' ? args : args.url;

    console.log('🔴 [appointmentService] 401 Unauthorized:', {
      url: requestUrl,
      message: 'Token invalid or expired - user must login again'
    });

    // CRITICAL: Do NOT attempt token refresh here
    // appointment_service is a resource server, not auth server
    // Token refresh is only available on user_service
    //
    // Return error and let component handle it
    // Component should redirect to login

    return result;
  }

  return result;
};

// Export base queries for use in other API slices
export { baseQueryWithAuth, createServiceBaseQuery, appointmentServiceBaseQueryWithReauth };

/**
 * Base query with 401 error handling
 *
 * Flow:
 * 1. Execute request with current JWT
 * 2. If 401 and not an auth endpoint: try refresh token
 * 3. If refresh succeeds: retry original request
 * 4. If refresh fails: logout + redirect to /login
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  // LOG: All errors with details (except expected 404s)
  if (result.error) {
    const requestUrl = typeof args === 'string' ? args : args.url;
    const errorDetails = {
      url: requestUrl,
      status: result.error.status,
      error: result.error.error,
      data: result.error.data,
      originalStatus: result.error.originalStatus,
    };

    // Don't log 404 for endpoints where it's a valid empty state
    const is404ValidState = result.error.status === 404 && (
      requestUrl?.includes('/queues/me/active') ||
      requestUrl?.includes('/queues/today') ||
      requestUrl?.includes('/settings/me')
    );


    if (!is404ValidState) {
      console.error('🔴 API Error:', errorDetails);

      // Check error type
      if (result.error.status === 'FETCH_ERROR') {
        console.error('🔴 FETCH_ERROR detected - likely CORS or network issue - DO NOT LOGOUT');
      }
      if (result.error.status === 'PARSING_ERROR') {
        console.error('🔴 PARSING_ERROR detected - bad response format - DO NOT LOGOUT');
      }
    }
  }

  // Handle 401 Unauthorized globally - ONLY on actual 401, not FETCH_ERROR
  if (result.error && result.error.status === 401) {
    const requestUrl = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint = requestUrl?.includes('/auth/login') ||
      requestUrl?.includes('/auth/register') ||
      requestUrl?.includes('/auth/refresh') ||
      requestUrl?.includes('/auth/forgot-password') ||
      requestUrl?.includes('/auth/reset-password');

    console.log('🔴 401 Unauthorized:', { url: requestUrl, isAuthEndpoint });

    // Don't try to refresh on auth endpoints - just return error
    if (isAuthEndpoint) {
      console.log('ℹ️ 401 on auth endpoint, not attempting refresh');
      return result;
    }

    // Try to refresh token
    const refreshToken = api.getState()?.auth?.refreshToken;

    if (refreshToken) {
      console.log('🔄 Token expired, attempting refresh...');
      console.log('🔄 Refresh token:', refreshToken?.substring(0, 30) + '...');

      const refreshResult = await baseQueryWithAuth(
        {
          url: '/api/v1/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      console.log('🔄 Refresh result:', {
        hasData: !!refreshResult.data,
        hasError: !!refreshResult.error,
        errorStatus: refreshResult.error?.status,
        errorData: refreshResult.error?.data
      });

      // Check if refresh was successful
      const refreshData = refreshResult.data?.data || refreshResult.data;

      if (refreshData && refreshData.accessToken) {
        console.log('✓ Token refreshed successfully');

        // Update tokens in Redux state
        api.dispatch({
          type: 'auth/setCredentials',
          payload: refreshData
        });

        // Retry original request with new token
        result = await baseQueryWithAuth(args, api, extraOptions);
      } else {
        console.error('✗ Token refresh failed');
        console.error('✗ Refresh error details:', {
          status: refreshResult.error?.status,
          data: refreshResult.error?.data,
          error: refreshResult.error
        });


        // Logout user
        api.dispatch({ type: 'auth/logout', payload: { reason: 'refresh_failed' } });

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } else {
      console.error('✗ No refresh token available, logging out');

      // Logout user
      api.dispatch({ type: 'auth/logout', payload: { reason: 'no_refresh_token' } });

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  } else if (result.error && result.error.status === 403) {
    // 403 Forbidden - user is authenticated but not authorized
    console.error('🔴 403 Forbidden - User not authorized for this resource');

    // Optional: Logout on 403 (depends on your requirements)
    // For now, just log and return error - don't logout
  } else if (result.error) {
    // ANY OTHER ERROR (FETCH_ERROR, PARSING_ERROR, 404, 500, etc.)
    // DO NOT LOGOUT - just return the error

    // Don't log 404 for endpoints where it's a valid empty state
    const requestUrl = typeof args === 'string' ? args : args.url;
    const is404ValidState = result.error.status === 404 && (
      requestUrl?.includes('/queues/me/active') ||
      requestUrl?.includes('/queues/today') ||
      requestUrl?.includes('/settings/me')
    );

    if (!is404ValidState) {
      console.warn('⚠️ Non-auth error occurred, NOT triggering logout:', {
        status: result.error.status,
        url: requestUrl
      });
    }
  }

  return result;
};

/**
 * Base API slice (uses API Gateway)
 * All feature APIs inject endpoints into this
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Patient',
    'Doctor',
    'Admin',
    'Appointment',
    'Prescription',
    'LabOrder',
    'LabReport',
    'Queue',
    'SOSRequest',
  ],
  endpoints: () => ({}),
});

/**
 * User Service API (direct connection if needed)
 * For user management and authentication
 */
export const userServiceApi = createApi({
  reducerPath: 'userServiceApi',
  baseQuery: async (args, api, extraOptions) => {
    const serviceBaseQuery = createServiceBaseQuery('user_service');
    return baseQueryWithReauth(args, api, extraOptions, serviceBaseQuery);
  },
  tagTypes: ['User', 'Patient', 'Doctor', 'Admin', 'Auth'],
  endpoints: () => ({}),
});

/**
 * Appointment Service API (direct connection if needed)
 * For appointments and queue management
 */
export const appointmentServiceApi = createApi({
  reducerPath: 'appointmentServiceApi',
  baseQuery: async (args, api, extraOptions) => {
    const serviceBaseQuery = createServiceBaseQuery('appointment_service');
    return baseQueryWithReauth(args, api, extraOptions, serviceBaseQuery);
  },
  tagTypes: ['Appointment', 'Queue', 'QueueEntry'],
  endpoints: () => ({}),
});

export default baseApi;
