import { createApi } from '@reduxjs/toolkit/query/react';
import { appointmentServiceBaseQueryWithReauth } from '../../app/api/baseApi';

/**
 * Consultation API
 *
 * Handles video consultation session lifecycle:
 * - Start video session (Doctor)
 * - Get active video session (Doctor/Patient)
 * - End video session (Doctor/Patient)
 * - Get consultation context (appointment/patient info during call)
 */
export const consultationApi = createApi({
  reducerPath: 'consultationApi',
  baseQuery: appointmentServiceBaseQueryWithReauth,
  tagTypes: ['VideoSession', 'ActiveSession', 'ConsultationContext'],
  endpoints: (builder) => ({
    /**
     * Start video consultation session (Doctor only)
     * POST /api/v1/doctors/consultations/start-video
     */
    startVideoSession: builder.mutation({
      query: ({ queueEntryId, consultationId }) => ({
        url: '/api/v1/doctors/consultations/start-video',
        method: 'POST',
        body: {
          queueEntryId,
          consultationId,
        },
      }),
      invalidatesTags: ['ActiveSession', 'VideoSession'],
      transformResponse: (response) => {
        console.log('✅ Video session started:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Failed to start video session:', error);
        return error;
      },
    }),

    /**
     * Get active video session for doctor
     * GET /api/v1/doctors/consultations/active-video
     */
    getDoctorActiveVideo: builder.query({
      query: () => '/api/v1/doctors/consultations/active-video',
      providesTags: ['ActiveSession'],
      transformResponse: (response) => {
        console.log('📹 Doctor active video session:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        // 204 No Content is valid (no active session)
        if (error.status === 204 || error.originalStatus === 204) {
          console.log('ℹ️ No active video session for doctor');
          return null;
        }
        console.error('❌ Error fetching doctor active video:', error);
        return error;
      },
    }),

    /**
     * Get active video session for patient
     * GET /api/v1/patients/consultations/active-video
     */
    getPatientActiveVideo: builder.query({
      query: () => '/api/v1/patients/consultations/active-video',
      providesTags: ['ActiveSession'],
      transformResponse: (response) => {
        console.log('📹 Patient active video session:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        // 204 No Content is valid (no active session)
        if (error.status === 204 || error.originalStatus === 204) {
          console.log('ℹ️ No active video session for patient');
          return null;
        }
        console.error('❌ Error fetching patient active video:', error);
        return error;
      },
    }),

    /**
     * End video consultation session
     * POST /api/v1/doctors/consultations/sessions/{sessionId}/end
     */
    endVideoSession: builder.mutation({
      query: ({ sessionId, reason, notes }) => ({
        url: `/api/v1/doctors/consultations/sessions/${sessionId}/end`,
        method: 'POST',
        body: {
          reason,
          notes,
        },
      }),
      invalidatesTags: ['ActiveSession', 'VideoSession'],
      transformResponse: (response) => {
        console.log('✅ Video session ended:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Failed to end video session:', error);
        return error;
      },
    }),

    /**
     * Get consultation context (appointment, patient, doctor info)
     * GET /api/v1/doctors/consultations/{consultationId}/context
     * Used during video call to fetch context for prescriptions/lab orders
     */
    getConsultationContext: builder.query({
      query: (consultationId) => ({
        url: `/api/v1/doctors/consultations/${consultationId}/context`,
      }),
      providesTags: (result, error, consultationId) => [
        { type: 'ConsultationContext', id: consultationId },
      ],
      transformResponse: (response) => {
        console.log('📋 Consultation context fetched:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Failed to fetch consultation context:', error);
        return error;
      },
    }),
  }),
});

// Export hooks for usage in components
export const {
  useStartVideoSessionMutation,
  useGetDoctorActiveVideoQuery,
  useGetPatientActiveVideoQuery,
  useEndVideoSessionMutation,
  useGetConsultationContextQuery,
} = consultationApi;

// Export reducer
export default consultationApi.reducer;
