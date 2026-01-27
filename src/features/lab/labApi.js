/**
 * Lab Service API
 * RTK Query endpoints for lab tests, orders, tracking, tasks
 * Covers: Catalog, Patient, Doctor, Admin, Phlebotomist workflows
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectAccessToken } from '../auth/authSlice';
import { LAB_TAGS, LAB_ENDPOINTS, API_ERROR_MESSAGES } from './constants';

const baseUrl = process.env.REACT_APP_API_GATEWAY_BASE_URL || 'http://localhost:8080/api/v1';
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_LAB_DATA === 'true';

console.log(`🔧 Lab API Config - Base URL: ${baseUrl}, Mock Data: ${USE_MOCK_DATA}`);

/**
 * Mock data for development when backend endpoints are not ready
 */
const MOCK_LAB_TESTS = [
  {
    id: '1',
    testCode: 'CBC',
    testName: 'Complete Blood Count',
    name: 'Complete Blood Count', // Keep for backward compat
    code: 'CBC', // Keep for backward compat
    category: 'blood',
    sampleType: 'blood',
    price: 350,
    fastingRequired: false,
    homeCollectionSupported: true,
    description: 'Comprehensive blood test',
  },
  {
    id: '2',
    testCode: 'THYROID',
    testName: 'Thyroid Profile',
    name: 'Thyroid Profile',
    code: 'THYROID',
    category: 'hormone',
    sampleType: 'blood',
    price: 850,
    fastingRequired: true,
    homeCollectionSupported: true,
    description: 'TSH, T3, T4 levels',
  },
  {
    id: '3',
    testCode: 'LIPID',
    testName: 'Lipid Profile',
    name: 'Lipid Profile',
    code: 'LIPID',
    category: 'blood',
    sampleType: 'blood',
    price: 600,
    fastingRequired: true,
    homeCollectionSupported: true,
    description: 'Cholesterol and triglycerides',
  },
  {
    id: '4',
    testCode: 'LFT',
    testName: 'Liver Function Test',
    name: 'Liver Function Test',
    code: 'LFT',
    category: 'blood',
    sampleType: 'blood',
    price: 700,
    fastingRequired: false,
    homeCollectionSupported: true,
    description: 'Liver enzyme levels',
  },
  {
    id: '5',
    testCode: 'KFT',
    testName: 'Kidney Function Test',
    name: 'Kidney Function Test',
    code: 'KFT',
    category: 'blood',
    sampleType: 'blood',
    price: 650,
    fastingRequired: false,
    homeCollectionSupported: true,
    description: 'Creatinine and BUN levels',
  },
];

const MOCK_PATIENT_ORDERS = [
  {
    id: 'ORD-001',
    status: 'completed',
    totalPrice: 1500,
    tax: 270,
    createdAt: '2026-01-20T10:30:00Z',
    tests: [
      { id: '1', name: 'CBC', code: 'CBC', price: 350 },
      { id: '2', name: 'Thyroid Profile', code: 'THYROID', price: 850 },
    ],
    address: {
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
    },
  },
];

/**
 * Transform error response to user-friendly messages
 */
const transformErrorResponse = (response) => {
  if (!response) {
    console.error('❌ API Error: No response received');
    return {
      status: 'error',
      message: API_ERROR_MESSAGES.UNKNOWN_ERROR,
      data: null,
    };
  }

  const status = response.status;
  const data = response.data;

  let message = data?.message || data?.error || API_ERROR_MESSAGES.UNKNOWN_ERROR;

  console.error(`❌ API Error [${status}]:`, message, 'Data:', data);

  if (status === 0) {
    message = API_ERROR_MESSAGES.NETWORK_ERROR;
  } else if (status === 400) {
    message = data?.message || API_ERROR_MESSAGES.INVALID_REQUEST;
  } else if (status === 401) {
    message = API_ERROR_MESSAGES.UNAUTHORIZED;
  } else if (status === 403) {
    message = API_ERROR_MESSAGES.FORBIDDEN;
  } else if (status === 404) {
    message = API_ERROR_MESSAGES.NOT_FOUND + ` (Endpoint not found on backend)`;
  } else if (status === 409) {
    message = API_ERROR_MESSAGES.CONFLICT;
  } else if (status >= 500) {
    message = API_ERROR_MESSAGES.SERVER_ERROR;
  }

  return {
    status: 'error',
    message,
    data: data?.data || null,
  };
};

export const labApi = createApi({
  reducerPath: 'labApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = selectAccessToken(getState());
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: Object.values(LAB_TAGS),
  endpoints: (builder) => ({
    // ============================================================
    // CATALOG ENDPOINTS
    // ============================================================

    /**
     * GET /lab-tests
     * Fetch all available lab tests
     * Used in: Patient LabCatalog page
     */
    getLabTests: builder.query({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          console.log('📋 Using mock lab tests data (backend endpoint not ready)');
          return { data: MOCK_LAB_TESTS };
        }
        const result = await baseQuery({
          url: LAB_ENDPOINTS.GET_TESTS,
          params,
        });
        return result;
      },
      providesTags: [LAB_TAGS.LAB_TESTS],
    }),

    /**
     * GET /lab-tests/{testCode}
     * Fetch specific test details
     * Used in: LabCatalog detail view
     */
    getLabTestDetail: builder.query({
      query: (testCode) => LAB_ENDPOINTS.GET_TEST_DETAIL(testCode),
      providesTags: (result, error, testCode) => [
        { type: LAB_TAGS.LAB_TEST_DETAIL, id: testCode },
      ],
    }),

    // ============================================================
    // PATIENT ORDER ENDPOINTS
    // ============================================================

    /**
     * POST /lab-orders
     * Create a new lab order
     * Used in: Patient LabBooking (step 4 - payment)
     */
    createPatientOrder: builder.mutation({
      query: (orderData) => ({
        url: LAB_ENDPOINTS.CREATE_PATIENT_ORDER,
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: [LAB_TAGS.PATIENT_ORDERS],
    }),

    /**
     * GET /lab-orders/me
     * Fetch all patient's lab orders
     * Used in: Patient LabOrders page
     */
    getPatientOrders: builder.query({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          console.log('📋 Using mock patient orders data (backend endpoint not ready)');
          return { data: MOCK_PATIENT_ORDERS };
        }
        const result = await baseQuery({
          url: LAB_ENDPOINTS.GET_PATIENT_ORDERS,
          params,
        });
        return result;
      },
      providesTags: [LAB_TAGS.PATIENT_ORDERS],
    }),

    /**
     * GET /lab-orders/{orderId}
     * Fetch specific order details
     * Used in: Patient LabOrderDetails page
     */
    getPatientOrderDetail: builder.query({
      query: (orderId) => LAB_ENDPOINTS.GET_PATIENT_ORDER_DETAIL(orderId),
      providesTags: (result, error, orderId) => [
        { type: LAB_TAGS.PATIENT_ORDER_DETAIL, id: orderId },
      ],
    }),

    /**
     * POST /lab-orders/{orderId}/cancel
     * Cancel a patient's lab order
     * Used in: Patient LabOrderDetails (action button)
     */
    cancelPatientOrder: builder.mutation({
      query: (orderId) => ({
        url: LAB_ENDPOINTS.CANCEL_PATIENT_ORDER(orderId),
        method: 'POST',
      }),
      invalidatesTags: [LAB_TAGS.PATIENT_ORDERS, LAB_TAGS.PATIENT_ORDER_DETAIL],
    }),

    /**
     * GET /lab-orders/{orderId}/report
     * Fetch lab test report
     * Used in: Patient LabOrderDetails (report section)
     */
    getPatientOrderReport: builder.query({
      query: (orderId) => LAB_ENDPOINTS.GET_PATIENT_ORDER_REPORT(orderId),
      providesTags: (result, error, orderId) => [
        { type: LAB_TAGS.PATIENT_REPORT, id: orderId },
      ],
    }),

    /**
     * GET /reports/{orderId}/download
     * Download lab report file to local system
     * Returns file as binary blob instead of redirecting to Cloudinary
     * Used in: Patient LabOrderDetails (download button)
     */
    downloadPatientOrderReport: builder.query({
      query: (orderId) => ({
        url: `/reports/${orderId}/download`,
        responseHandler: async (response) => {
          // Handle file download as blob
          if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
          }

          const blob = await response.blob();
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'lab-report.pdf';

          // Extract filename from Content-Disposition header
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
              filename = match[1];
            }
          }

          return { blob, filename };
        },
      }),
    }),

    /**
     * GET /reports/doctor/{orderId}/download
     * Download lab report for doctor (if doctor created the order)
     * Used in: Doctor LabOrderDetails (download button)
     */
    downloadDoctorOrderReport: builder.query({
      query: (orderId) => ({
        url: `/reports/doctor/${orderId}/download`,
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
          }

          const blob = await response.blob();
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'lab-report.pdf';

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
              filename = match[1];
            }
          }

          return { blob, filename };
        },
      }),
    }),

    /**
     * GET /lab-orders/{orderId}/tracking
     * Fetch real-time order tracking
     * Used in: Patient LabTracking page (WebSocket fallback polling)
     */
    getPatientOrderTracking: builder.query({
      query: (orderId) => LAB_ENDPOINTS.GET_PATIENT_ORDER_TRACKING(orderId),
      providesTags: (result, error, orderId) => [
        { type: LAB_TAGS.PATIENT_TRACKING, id: orderId },
      ],
      pollingInterval: parseInt(process.env.REACT_APP_TRACKING_POLL_MS || '15000'),
    }),

    /**
     * GET /lab-orders/{orderId}/collection-task
     * Fetch collection task details for order
     * Used in: Patient LabTracking (phlebotomist info)
     */
    getPatientCollectionTask: builder.query({
      query: (orderId) => LAB_ENDPOINTS.GET_PATIENT_COLLECTION_TASK(orderId),
      providesTags: (result, error, orderId) => [
        { type: LAB_TAGS.PATIENT_COLLECTION_TASK, id: orderId },
      ],
    }),

    /**
     * GET /lab-orders/reports/me
     * Fetch all patient's lab reports
     * Used in: Patient MyReports page
     */
    getPatientReports: builder.query({
      query: (params = {}) => ({
        url: LAB_ENDPOINTS.GET_PATIENT_REPORTS,
        params,
      }),
      providesTags: [LAB_TAGS.PATIENT_REPORTS],
    }),

    // ============================================================
    // DOCTOR ORDER ENDPOINTS
    // ============================================================

    /**
     * POST /doctors/lab-orders
     * Doctor prescribes lab tests to patient
     * Used in: Doctor LabBooking page
     */
    createDoctorOrder: builder.mutation({
      query: (orderData) => ({
        url: LAB_ENDPOINTS.CREATE_DOCTOR_ORDER,
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: [LAB_TAGS.DOCTOR_ORDERS],
    }),

    /**
     * GET /api/v1/doctors/lab-orders
     * Fetch all doctor's lab orders
     * Used in: Doctor LabOrders page
     */
    getDoctorOrders: builder.query({
      query: (params = {}) => ({
        url: LAB_ENDPOINTS.GET_DOCTOR_ORDERS,
        params,
      }),
      providesTags: [LAB_TAGS.DOCTOR_ORDERS],
    }),

    /**
     * GET /doctors/lab-orders/{orderId}
     * Fetch order prescribed by doctor
     * Used in: Doctor LabOrderDetails page
     */
    getDoctorOrderDetail: builder.query({
      query: (orderId) => LAB_ENDPOINTS.GET_DOCTOR_ORDER_DETAIL(orderId),
      providesTags: (result, error, orderId) => [
        { type: LAB_TAGS.DOCTOR_ORDER_DETAIL, id: orderId },
      ],
    }),

    /**
     * GET /doctors/lab-orders/{orderId}/report
     * Fetch report for prescribed tests
     * Used in: Doctor LabOrderDetails (report view)
     */
    getDoctorOrderReport: builder.query({
      query: (orderId) => LAB_ENDPOINTS.GET_DOCTOR_ORDER_REPORT(orderId),
      providesTags: (result, error, orderId) => [
        { type: LAB_TAGS.DOCTOR_REPORT, id: orderId },
      ],
    }),

    /**
     * GET /doctors/lab-orders/{orderId}/tracking
     * Track test status for prescribed tests
     * Used in: Doctor LabTracking page
     */
    getDoctorOrderTracking: builder.query({
      query: (orderId) => LAB_ENDPOINTS.GET_DOCTOR_ORDER_TRACKING(orderId),
      providesTags: (result, error, orderId) => [
        { type: LAB_TAGS.DOCTOR_TRACKING, id: orderId },
      ],
      pollingInterval: parseInt(process.env.REACT_APP_TRACKING_POLL_MS || '15000'),
    }),

    // ============================================================
    // ADMIN TASK ENDPOINTS
    // ============================================================

    /**
     * GET /admin/lab/orders
     * Fetch all lab orders (paginated)
     * Used in: Admin LabDashboard to show unassigned orders
     */
    getAdminLabOrders: builder.query({
      query: (params = {}) => ({
        url: LAB_ENDPOINTS.GET_ADMIN_ORDERS,
        params,
      }),
      providesTags: [LAB_TAGS.ADMIN_ORDERS],
    }),

    /**
     * GET /admin/lab/tasks
     * Fetch all lab collection tasks
     * Used in: Admin LabTasks page
     */
    getAdminLabTasks: builder.query({
      query: (params = {}) => ({
        url: LAB_ENDPOINTS.GET_ADMIN_TASKS,
        params,
      }),
      providesTags: [LAB_TAGS.ADMIN_TASKS],
    }),

    /**
     * GET /admin/lab/tasks/{taskId}
     * Fetch specific task details
     * Used in: Admin LabTaskDetails page
     */
    getAdminLabTaskDetail: builder.query({
      query: (taskId) => LAB_ENDPOINTS.GET_ADMIN_TASK_DETAIL(taskId),
      providesTags: (result, error, taskId) => [
        { type: LAB_TAGS.ADMIN_TASK_DETAIL, id: taskId },
      ],
    }),

    /**
     * POST /admin/lab/tasks/{taskId}/assign
     * Assign task to phlebotomist
     * Used in: Admin LabTaskDetails (assign button)
     */
    assignAdminLabTask: builder.mutation({
      query: ({ taskId, ...data }) => ({
        url: LAB_ENDPOINTS.ASSIGN_ADMIN_TASK(taskId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [LAB_TAGS.ADMIN_TASKS, LAB_TAGS.ADMIN_TASK_DETAIL],
    }),

    /**
     * POST /admin/lab/tasks/{taskId}/reassign
     * Reassign task to different phlebotomist
     * Used in: Admin LabTaskDetails (reassign button)
     */
    reassignAdminLabTask: builder.mutation({
      query: ({ taskId, ...data }) => ({
        url: LAB_ENDPOINTS.REASSIGN_ADMIN_TASK(taskId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [LAB_TAGS.ADMIN_TASKS, LAB_TAGS.ADMIN_TASK_DETAIL],
    }),

    /**
     * POST /admin/lab/tasks/{taskId}/cancel
     * Cancel collection task (optional auto-assign)
     * Used in: Admin LabTaskDetails (cancel button)
     */
    cancelAdminLabTask: builder.mutation({
      query: ({ taskId, ...data }) => ({
        url: LAB_ENDPOINTS.CANCEL_ADMIN_TASK(taskId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [LAB_TAGS.ADMIN_TASKS, LAB_TAGS.ADMIN_TASK_DETAIL],
    }),

    /**
     * POST /admin/lab/orders/{orderId}/create-collection-task
     * Create and assign collection task from unassigned lab order
     * Used in: Admin LabDashboard (create task from unassigned order)
     */
    createCollectionTask: builder.mutation({
      query: ({ orderId, phlebotomistId }) => ({
        url: LAB_ENDPOINTS.CREATE_COLLECTION_TASK(orderId),
        method: 'POST',
        params: { phlebotomistId },
      }),
      invalidatesTags: [LAB_TAGS.ADMIN_ORDERS, LAB_TAGS.ADMIN_TASKS],
    }),

    // ============================================================
    // PHLEBOTOMIST TASK ENDPOINTS
    // ============================================================

    /**
     * GET /phlebotomy/tasks/me
     * Fetch phlebotomist's assigned tasks
     * Used in: Phlebotomist Tasks page
     */
    getPhlebotomistTasks: builder.query({
      query: (params = {}) => ({
        url: LAB_ENDPOINTS.GET_PHLEBOTOMIST_TASKS,
        params,
      }),
      providesTags: [LAB_TAGS.PHLEBOTOMIST_TASKS],
      pollingInterval: 30000, // Poll every 30 seconds
    }),

    /**
     * POST /phlebotomy/tasks/{taskId}/accept
     * Accept assigned task
     * Used in: Phlebotomist Tasks (accept action)
     */
    acceptPhlebotomistTask: builder.mutation({
      query: (taskId) => ({
        url: LAB_ENDPOINTS.ACCEPT_PHLEBOTOMIST_TASK(taskId),
        method: 'POST',
      }),
      invalidatesTags: [LAB_TAGS.PHLEBOTOMIST_TASKS, LAB_TAGS.PHLEBOTOMIST_TASK_DETAIL],
    }),

    /**
     * POST /phlebotomy/tasks/{taskId}/en-route
     * Mark task as en-route to patient location
     * Used in: Phlebotomist TaskDetails (en-route action)
     */
    enRoutePhlebotomistTask: builder.mutation({
      query: (taskId) => ({
        url: LAB_ENDPOINTS.EN_ROUTE_PHLEBOTOMIST_TASK(taskId),
        method: 'POST',
      }),
      invalidatesTags: [LAB_TAGS.PHLEBOTOMIST_TASKS, LAB_TAGS.PHLEBOTOMIST_TASK_DETAIL],
    }),

    /**
     * POST /phlebotomy/tasks/{taskId}/arrive
     * Mark task as arrived at patient location
     * Used in: Phlebotomist TaskDetails (arrive action)
     */
    arrivePhlebotomistTask: builder.mutation({
      query: (taskId) => ({
        url: LAB_ENDPOINTS.ARRIVE_PHLEBOTOMIST_TASK(taskId),
        method: 'POST',
      }),
      invalidatesTags: [LAB_TAGS.PHLEBOTOMIST_TASKS, LAB_TAGS.PHLEBOTOMIST_TASK_DETAIL],
    }),

    /**
     * POST /phlebotomy/tasks/{taskId}/collect-samples
     * Mark samples as collected
     * Used in: Phlebotomist TaskDetails (collect samples action)
     */
    collectSamplesPhlebotomistTask: builder.mutation({
      query: ({ taskId, ...data }) => ({
        url: LAB_ENDPOINTS.COLLECT_SAMPLES_PHLEBOTOMIST_TASK(taskId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [LAB_TAGS.PHLEBOTOMIST_TASKS, LAB_TAGS.PHLEBOTOMIST_TASK_DETAIL],
    }),

    /**
     * POST /phlebotomy/tasks/{taskId}/deliver-to-lab
     * Mark samples as delivered to lab
     * Used in: Phlebotomist TaskDetails (deliver action)
     */
    deliverToLabPhlebotomistTask: builder.mutation({
      query: (taskId) => ({
        url: LAB_ENDPOINTS.DELIVER_TO_LAB_PHLEBOTOMIST_TASK(taskId),
        method: 'POST',
      }),
      invalidatesTags: [LAB_TAGS.PHLEBOTOMIST_TASKS, LAB_TAGS.PHLEBOTOMIST_TASK_DETAIL],
    }),

    /**
     * POST /phlebotomy/tasks/{taskId}/complete
     * Mark task as complete
     * Used in: Phlebotomist TaskDetails (complete action)
     */
    completePhlebotomistTask: builder.mutation({
      query: (taskId) => ({
        url: LAB_ENDPOINTS.COMPLETE_PHLEBOTOMIST_TASK(taskId),
        method: 'POST',
      }),
      invalidatesTags: [LAB_TAGS.PHLEBOTOMIST_TASKS, LAB_TAGS.PHLEBOTOMIST_TASK_DETAIL],
    }),

    /**
     * POST /phlebotomy/tasks/{taskId}/location
     * Update phlebotomist location
     * Used in: Phlebotomist LiveTracking (real-time location updates)
     */
    updatePhlebotomistLocation: builder.mutation({
      query: ({ taskId, ...data }) => ({
        url: LAB_ENDPOINTS.UPDATE_LOCATION_PHLEBOTOMIST_TASK(taskId),
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * POST /phlebotomy/availability
     * Set phlebotomist availability status
     * Used in: Phlebotomist availability settings
     */
    setPhlebotomistAvailability: builder.mutation({
      query: (data) => ({
        url: LAB_ENDPOINTS.SET_PHLEBOTOMIST_AVAILABILITY,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [LAB_TAGS.PHLEBOTOMIST_AVAILABILITY],
    }),

    /**
     * GET /phlebotomy/tasks/{taskId}
     * Fetch specific task details for phlebotomist
     * Used in: Phlebotomist TaskDetails page
     */
    /**
     * GET /phlebotomy/tasks/{taskId}
     * Fetch specific task details for phlebotomist
     * Used in: Phlebotomist TaskDetails page
     */
    getPhlebotomistTaskDetail: builder.query({
      query: (taskId) => `/phlebotomy/tasks/${taskId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, taskId) => [
        { type: LAB_TAGS.PHLEBOTOMIST_TASK_DETAIL, id: taskId },
      ],
    }),


    /**
     * POST /phlebotomy/tasks/{taskId}/location
     * Send location ping (for tracking)
     * Used in: Phlebotomist LiveTracking page
     */
    updatePhlebotomyLocationPing: builder.mutation({
      query: (data) => ({
        url: LAB_ENDPOINTS.UPDATE_LOCATION_PHLEBOTOMIST_TASK(data.taskId),
        method: 'POST',
        body: { latitude: data.latitude, longitude: data.longitude, accuracy: data.accuracy, timestamp: data.timestamp },
      }),
    }),
  }),
});

// Export hooks
export const {
  // Catalog
  useGetLabTestsQuery,
  useGetLabTestDetailQuery,

  // Patient
  useCreatePatientOrderMutation,
  useGetPatientOrdersQuery,
  useGetPatientOrderDetailQuery,
  useCancelPatientOrderMutation,
  useGetPatientOrderReportQuery,
  useDownloadPatientOrderReportQuery,
  useGetPatientOrderTrackingQuery,
  useGetPatientCollectionTaskQuery,
  useGetPatientReportsQuery,

  // Doctor
  useCreateDoctorOrderMutation,
  useGetDoctorOrdersQuery,
  useGetDoctorOrderDetailQuery,
  useGetDoctorOrderReportQuery,
  useDownloadDoctorOrderReportQuery,
  useGetDoctorOrderTrackingQuery,

  // Admin
  useGetAdminLabOrdersQuery,
  useGetAdminLabTasksQuery,
  useGetAdminLabTaskDetailQuery,
  useAssignAdminLabTaskMutation,
  useReassignAdminLabTaskMutation,
  useCancelAdminLabTaskMutation,
  useCreateCollectionTaskMutation,

  // Phlebotomist
  useGetPhlebotomistTasksQuery,
  useGetPhlebotomistTaskDetailQuery,
  useAcceptPhlebotomistTaskMutation,
  useEnRoutePhlebotomistTaskMutation,
  useArrivePhlebotomistTaskMutation,
  useCollectSamplesPhlebotomistTaskMutation,
  useDeliverToLabPhlebotomistTaskMutation,
  useCompletePhlebotomistTaskMutation,
  useUpdatePhlebotomyLocationPingMutation,
  useUpdatePhlebotomistLocationMutation,
  useSetPhlebotomistAvailabilityMutation,
} = labApi;


