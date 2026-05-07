/**
 * Appointment API
 * RTK Query endpoints for AppointmentController and PatientController
 * Source: appointment_service_medibridge controllers
 */

import { baseApi } from '../../app/api/baseApi';

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/v1/appointments
     * Create new appointment (PATIENT role)
     */
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: '/api/v1/appointments',
        method: 'POST',
        body: appointmentData,
      }),
      transformResponse: (response) => {
        console.log('📝 createAppointment raw response:', response);

        // Backend returns AppointmentResponse directly
        if (response?.id) {
          console.log('✅ Response has id, returning directly');
          return response;
        }

        // If wrapped in data field
        if (response?.data?.id) {
          console.log('✅ Response wrapped in data field, extracting');
          return response.data;
        }

        console.log('✅ Returning response as-is');
        return response;
      },
      invalidatesTags: ['Appointment'],
    }),

    /**
     * GET /api/v1/appointments/me
     * Get current patient's appointments (PATIENT role)
     */
    getMyAppointments: builder.query({
      query: () => '/api/v1/appointments/me',
      transformResponse: (response) => {
        console.log('📋 getMyAppointments raw response:', response);

        // Backend returns array directly, not wrapped in {data: [...]}
        if (Array.isArray(response)) {
          console.log('✅ Response is array, returning directly. Count:', response.length);
          return response;
        }

        // If wrapped in data field, extract it
        if (response?.data && Array.isArray(response.data)) {
          console.log('✅ Response wrapped in data field, extracting. Count:', response.data.length);
          return response.data;
        }

        // Fallback: return empty array
        console.warn('⚠️ Unexpected response format, returning empty array');
        return [];
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Appointment', id })),
            { type: 'Appointment', id: 'LIST' },
          ]
          : [{ type: 'Appointment', id: 'LIST' }],
    }),

    /**
     * GET /api/v1/appointments/{appointmentId}
     * Get specific appointment details (PATIENT role)
     */
    getAppointmentById: builder.query({
      query: (appointmentId) => `/api/v1/appointments/${appointmentId}`,
      transformResponse: (response) => {
        console.log('🔍 getAppointmentById raw response:', response);

        // Backend returns AppointmentResponse directly
        if (response?.id) {
          return response;
        }

        // If wrapped in data field
        if (response?.data?.id) {
          return response.data;
        }

        return response;
      },
      providesTags: (result, error, appointmentId) => [
        { type: 'Appointment', id: appointmentId },
      ],
    }),

    /**
     * POST /api/v1/queues/join
     * Join queue for appointment (PATIENT role)
     */
    joinQueue: builder.mutation({
      query: (queueData) => ({
        url: '/api/v1/queues/join',
        method: 'POST',
        body: queueData,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Queue'],
    }),

    /**
     * POST /api/v1/queues/{queueId}/leave
     * Leave queue (PATIENT role)
     */
    leaveQueue: builder.mutation({
      query: (queueId) => ({
        url: `/api/v1/queues/${queueId}/leave`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Queue'],
    }),

    /**
     * GET /api/v1/queues/me/active
     * Get patient's active queue entry (PATIENT role)
     * Returns 404 if no active queue (this is normal, not an error)
     */
    getMyActiveQueue: builder.query({
      providesTags: ['Queue'],
      // Handle 404 as valid "no active queue" state
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const result = await baseQuery('/api/v1/queues/me/active');

        // 404 is expected when patient has no active queue - return null
        if (result.error && result.error.status === 404) {
          console.log('ℹ️ No active queue found (404) - this is normal');
          return { data: null };
        }

        // Other errors should be treated as errors
        if (result.error) {
          console.error('❌ Queue API error:', result.error);
          return { error: result.error };
        }

        // Success case - extract data if wrapped
        const responseData = result.data?.data || result.data;
        console.log('✅ Active queue found:', responseData);
        return { data: responseData };
      },
    }),

    // ========== Doctor Queue Management Endpoints ==========

    /**
     * POST /api/v1/doctors/queues/open
     * Open queue for today (DOCTOR role)
     */
    openDoctorQueue: builder.mutation({
      query: () => ({
        url: '/api/v1/doctors/queues/open',
        method: 'POST',
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Queue', 'DoctorQueue'],
    }),

    /**
     * GET /api/v1/doctors/queues/today
     * Get today's queue for current doctor (DOCTOR role)
     * Returns 404 if no queue exists for today (this is normal, not an error)
     */
    getTodayQueue: builder.query({
      providesTags: ['DoctorQueue'],
      // Handle 404 as valid "no queue today" state
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const result = await baseQuery('/api/v1/doctors/queues/today');

        // 404 is expected when doctor hasn't opened queue today yet
        if (result.error && result.error.status === 404) {
          console.log('ℹ️ No queue found for today (404) - this is normal');
          return { data: null };
        }

        // Other errors should be treated as errors
        if (result.error) {
          console.error('❌ Today queue API error:', result.error);
          return { error: result.error };
        }

        // Success case - extract data if wrapped
        const responseData = result.data?.data || result.data;
        console.log('✅ Today queue found:', responseData);
        return { data: responseData };
      },
    }),

    /**
     * GET /api/v1/doctors/queues/{queueId}/entries
     * Get all queue entries for a queue (DOCTOR role)
     */
    getQueueEntries: builder.query({
      query: (queueId) => `/api/v1/doctors/queues/${queueId}/entries`,
      transformResponse: (response) => {
        // Import dynamically to avoid circular dependencies
        const { normalizeQueueEntries } = require('./normalize');

        const data = response?.data || response;

        console.log('📋 Raw queue entries from API:', {
          isArray: Array.isArray(data),
          count: Array.isArray(data) ? data.length : 0,
          sample: Array.isArray(data) && data.length > 0 ? data[0] : null,
          sampleKeys: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [],
        });

        // Log each entry to see what fields are missing
        if (Array.isArray(data) && data.length > 0) {
          console.log('🔍 First entry detailed:', {
            hasId: !!data[0].id,
            hasPatientId: !!data[0].patientId,
            hasPatientName: !!data[0].patientName,
            hasPriority: !!data[0].priority,
            hasJoinedAt: !!data[0].joinedAt,
            hasTokenNumber: !!data[0].tokenNumber,
            patientId: data[0].patientId,
            patientName: data[0].patientName,
            priority: data[0].priority,
          });
        }

        // Normalize all entries
        const normalized = normalizeQueueEntries(data);

        console.log('✅ Normalized queue entries:', {
          count: normalized.length,
          sample: normalized.length > 0 ? normalized[0] : null,
        });

        return normalized;
      },
      providesTags: (result, error, queueId) =>
        result
          ? [...result.map(({ id }) => ({ type: 'QueueEntry', id })), { type: 'QueueEntry', id: 'LIST' }]
          : [{ type: 'QueueEntry', id: 'LIST' }],
    }),

    /**
     * POST /api/v1/doctors/queues/{queueId}/call-next
     * Call next patient in queue (DOCTOR role)
     */
    callNextPatient: builder.mutation({
      query: (queueId) => ({
        url: `/api/v1/doctors/queues/${queueId}/call-next`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Queue', 'DoctorQueue', { type: 'QueueEntry', id: 'LIST' }],
    }),

    /**
     * POST /api/v1/doctors/queues/{queueId}/pause
     */
    pauseQueue: builder.mutation({
      query: (queueId) => ({
        url: `/api/v1/doctors/queues/${queueId}/pause`,
        method: 'POST',
      }),
      invalidatesTags: ['DoctorQueue'],
    }),

    /**
     * POST /api/v1/doctors/queues/{queueId}/resume
     */
    resumeQueue: builder.mutation({
      query: (queueId) => ({
        url: `/api/v1/doctors/queues/${queueId}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['DoctorQueue'],
    }),

    /**
     * POST /api/v1/doctors/queues/{queueId}/close
     */
    closeQueue: builder.mutation({
      query: (queueId) => ({
        url: `/api/v1/doctors/queues/${queueId}/close`,
        method: 'POST',
      }),
      invalidatesTags: ['Queue', 'DoctorQueue'],
    }),

    /**
     * POST /api/v1/doctors/queues/entries/{entryId}/complete
     */
    completeQueueEntry: builder.mutation({
      query: (entryId) => ({
        url: `/api/v1/doctors/queues/entries/${entryId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'QueueEntry', id: 'LIST' }, 'DoctorQueue'],
    }),

    /**
     * POST /api/v1/doctors/queues/entries/{entryId}/no-show
     */
    markNoShow: builder.mutation({
      query: (entryId) => ({
        url: `/api/v1/doctors/queues/entries/${entryId}/no-show`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'QueueEntry', id: 'LIST' }, 'DoctorQueue'],
    }),

    /**
     * POST /api/v1/doctors/queues/entries/{entryId}/skip
     */
    skipPatient: builder.mutation({
      query: (entryId) => ({
        url: `/api/v1/doctors/queues/entries/${entryId}/skip`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'QueueEntry', id: 'LIST' }, 'DoctorQueue'],
    }),

    /**
     * GET /api/v1/appointments/doctor
     * Get appointments for current doctor (DOCTOR role)
     */
    getDoctorAppointments: builder.query({
      query: ({ date, status } = {}) => {
        let url = '/api/v1/appointments/doctor';
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (status) params.append('status', status);
        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Appointment', id })),
            { type: 'Appointment', id: 'LIST' },
          ]
          : [{ type: 'Appointment', id: 'LIST' }],
    }),

    /**
     * POST /api/v1/doctors/queues/{queueId}/settings
     */
    updateQueueSettings: builder.mutation({
      query: ({ queueId, settings }) => ({
        url: `/api/v1/doctors/queues/${queueId}/settings`,
        method: 'POST',
        body: settings,
      }),
      invalidatesTags: ['DoctorQueue'],
    }),
  }),
});

export const {
  useCreateAppointmentMutation,
  useGetMyAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useLazyGetAppointmentByIdQuery,
  useJoinQueueMutation,
  useLeaveQueueMutation,
  useGetMyActiveQueueQuery,
  useLazyGetMyActiveQueueQuery,
  // Doctor endpoints
  useOpenDoctorQueueMutation,
  useGetTodayQueueQuery,
  useLazyGetTodayQueueQuery,
  useGetQueueEntriesQuery,
  useLazyGetQueueEntriesQuery,
  useGetDoctorAppointmentsQuery,
  useLazyGetDoctorAppointmentsQuery,
  useCallNextPatientMutation,
  usePauseQueueMutation,
  useResumeQueueMutation,
  useCloseQueueMutation,
  useCompleteQueueEntryMutation,
  useMarkNoShowMutation,
  useSkipPatientMutation,
  useUpdateQueueSettingsMutation,
} = appointmentApi;

export default appointmentApi;
