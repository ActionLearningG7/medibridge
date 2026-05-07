/**
 * Lab Feature Constants
 * Global constants for lab module
 */

// Order Status
export const LAB_ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SAMPLE_COLLECTION_SCHEDULED: 'sample_collection_scheduled',
  SAMPLE_COLLECTED: 'sample_collected',
  IN_PROCESSING: 'in_processing',
  COMPLETED: 'completed',
  REPORT_READY: 'report_ready',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
};

export const LAB_ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  sample_collection_scheduled: 'Collection Scheduled',
  sample_collected: 'Sample Collected',
  in_processing: 'Processing',
  completed: 'Completed',
  report_ready: 'Report Ready',
  cancelled: 'Cancelled',
  failed: 'Failed',
  PAYMENT_PENDING: 'Confirming Payment...',
};

export const LAB_ORDER_STATUS_COLORS = {
  pending: '#FFC107',
  confirmed: '#2196F3',
  sample_collection_scheduled: '#9C27B0',
  sample_collected: '#3F51B5',
  in_processing: '#FF9800',
  completed: '#4CAF50',
  report_ready: '#4CAF50',
  cancelled: '#F44336',
  failed: '#F44336',
  PAYMENT_PENDING: '#FF9800',
};

// Task Status
export const LAB_TASK_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const LAB_TASK_STATUS_LABELS = {
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const LAB_TASK_STATUS_COLORS = {
  assigned: '#2196F3',
  in_progress: '#FF9800',
  completed: '#4CAF50',
  failed: '#F44336',
  cancelled: '#9E9E9E',
};

// Test Categories
export const LAB_TEST_CATEGORIES = {
  PATHOLOGY: 'pathology',
  RADIOLOGY: 'radiology',
  CARDIOLOGY: 'cardiology',
  ALLERGY: 'allergy',
  BLOOD: 'blood',
  URINE: 'urine',
  HORMONE: 'hormone',
};

export const LAB_TEST_CATEGORY_LABELS = {
  pathology: 'Pathology',
  radiology: 'Radiology',
  cardiology: 'Cardiology',
  allergy: 'Allergy Testing',
  blood: 'Blood Tests',
  urine: 'Urine Tests',
  hormone: 'Hormone Tests',
};

// Tracking Events
export const LAB_TRACKING_EVENTS = {
  ORDER_PLACED: 'order_placed',
  COLLECTION_SCHEDULED: 'collection_scheduled',
  PHLEBOTOMIST_ASSIGNED: 'phlebotomist_assigned',
  SAMPLE_COLLECTED: 'sample_collected',
  SAMPLE_IN_LAB: 'sample_in_lab',
  PROCESSING_STARTED: 'processing_started',
  PROCESSING_COMPLETE: 'processing_complete',
  REPORT_GENERATED: 'report_generated',
  REPORT_DELIVERED: 'report_delivered',
};

export const LAB_TRACKING_EVENT_LABELS = {
  order_placed: 'Order Placed',
  collection_scheduled: 'Collection Scheduled',
  phlebotomist_assigned: 'Phlebotomist Assigned',
  sample_collected: 'Sample Collected',
  sample_in_lab: 'Sample In Lab',
  processing_started: 'Processing Started',
  processing_complete: 'Processing Complete',
  report_generated: 'Report Generated',
  report_delivered: 'Report Delivered',
};

// Booking Steps
export const LAB_BOOKING_STEPS = {
  SELECT_TESTS: 0,
  SELECT_ADDRESS: 1,
  REVIEW: 2,
  PAYMENT: 3,
};

export const LAB_BOOKING_STEP_LABELS = {
  0: 'Select Tests',
  1: 'Select Address',
  2: 'Review Order',
  3: 'Payment',
};

// Sample Types
export const LAB_SAMPLE_TYPES = {
  BLOOD: 'blood',
  URINE: 'urine',
  SALIVA: 'saliva',
  SWAB: 'swab',
  STOOL: 'stool',
  CSF: 'csf',
};

export const LAB_SAMPLE_TYPE_LABELS = {
  blood: 'Blood',
  urine: 'Urine',
  saliva: 'Saliva',
  swab: 'Swab',
  stool: 'Stool',
  csf: 'Cerebrospinal Fluid (CSF)',
};

// Fasting Requirements
export const LAB_FASTING_REQUIREMENTS = {
  NO_FASTING: 'no_fasting',
  FASTING_6_HOURS: 'fasting_6h',
  FASTING_8_HOURS: 'fasting_8h',
  FASTING_12_HOURS: 'fasting_12h',
};

export const LAB_FASTING_LABELS = {
  no_fasting: 'No Fasting Required',
  fasting_6h: 'Fasting Required (6 hours)',
  fasting_8h: 'Fasting Required (8 hours)',
  fasting_12h: 'Fasting Required (12 hours)',
};

// Time Slots
export const LAB_COLLECTION_TIME_SLOTS = [
  { id: 'morning', label: '06:00 AM - 10:00 AM', value: 'morning' },
  { id: 'afternoon', label: '10:00 AM - 02:00 PM', value: 'afternoon' },
  { id: 'evening', label: '02:00 PM - 06:00 PM', value: 'evening' },
];

// Pagination
export const LAB_DEFAULT_PAGE_SIZE = 20;
export const LAB_MAX_PAGE_SIZE = 100;

// Cache Duration (ms)
export const LAB_CACHE_DURATION = {
  TESTS: 5 * 60 * 1000, // 5 minutes
  ORDERS: 2 * 60 * 1000, // 2 minutes
  TRACKING: 30 * 1000, // 30 seconds
  DASHBOARD: 1 * 60 * 1000, // 1 minute
};

// Error Messages
export const LAB_ERROR_MESSAGES = {
  ORDER_NOT_FOUND: 'Lab order not found',
  INVALID_TEST: 'Invalid test selection',
  INSUFFICIENT_BALANCE: 'Insufficient balance for booking',
  BOOKING_FAILED: 'Failed to create booking',
  TRACKING_UNAVAILABLE: 'Tracking information not available',
  WS_CONNECTION_FAILED: 'Failed to connect to tracking service',
};

// API Configuration
export const LAB_API_BASE_URL = process.env.REACT_APP_API_GATEWAY_BASE_URL || 'http://localhost:8080/api/v1';

// RTK Query Tags
export const LAB_TAGS = {
  // Catalog
  LAB_TESTS: 'labTests',
  LAB_TEST_DETAIL: 'labTestDetail',

  // Patient
  PATIENT_ORDERS: 'patientLabOrders',
  PATIENT_ORDER_DETAIL: 'patientLabOrderDetail',
  PATIENT_TRACKING: 'patientLabTracking',
  PATIENT_COLLECTION_TASK: 'patientCollectionTask',
  PATIENT_REPORT: 'patientLabReport',
  PATIENT_REPORTS: 'patientLabReports',

  // Doctor
  DOCTOR_ORDERS: 'doctorLabOrders',
  DOCTOR_ORDER_DETAIL: 'doctorLabOrderDetail',
  DOCTOR_TRACKING: 'doctorLabTracking',
  DOCTOR_REPORT: 'doctorLabReport',

  // Admin
  ADMIN_ORDERS: 'adminLabOrders',
  ADMIN_TASKS: 'adminLabTasks',
  ADMIN_TASK_DETAIL: 'adminLabTaskDetail',

  // Phlebotomist
  PHLEBOTOMIST_TASKS: 'phlebotomistTasks',
  PHLEBOTOMIST_TASK_DETAIL: 'phlebotomistTaskDetail',
  PHLEBOTOMIST_AVAILABILITY: 'phlebotomistAvailability',
};

// API Endpoints
export const LAB_ENDPOINTS = {
  // Catalog
  GET_TESTS: '/lab-tests',
  GET_TEST_DETAIL: (testCode) => `/lab-tests/${testCode}`,

  // Patient Orders
  CREATE_PATIENT_ORDER: '/lab-orders',
  GET_PATIENT_ORDERS: '/lab-orders/me',
  GET_PATIENT_ORDER_DETAIL: (orderId) => `/lab-orders/${orderId}`,
  CANCEL_PATIENT_ORDER: (orderId) => `/lab-orders/${orderId}/cancel`,
  GET_PATIENT_ORDER_REPORT: (orderId) => `/lab-orders/${orderId}/report`,
  GET_PATIENT_ORDER_TRACKING: (orderId) => `/lab-orders/${orderId}/tracking`,
  GET_PATIENT_COLLECTION_TASK: (orderId) => `/lab-orders/${orderId}/collection-task`,
  GET_PATIENT_REPORTS: '/lab-orders/reports/me',

  // Doctor Orders
  CREATE_DOCTOR_ORDER: '/doctors/lab-orders',
  GET_DOCTOR_ORDERS: '/doctors/lab-orders',
  GET_DOCTOR_ORDER_DETAIL: (orderId) => `/doctors/lab-orders/${orderId}`,
  GET_DOCTOR_ORDER_REPORT: (orderId) => `/doctors/lab-orders/${orderId}/report`,
  GET_DOCTOR_ORDER_TRACKING: (orderId) => `/doctors/lab-orders/${orderId}/tracking`,

  // Admin Tasks
  GET_ADMIN_TASKS: '/admin/lab/tasks',
  GET_ADMIN_TASK_DETAIL: (taskId) => `/admin/lab/tasks/${taskId}`,
  ASSIGN_ADMIN_TASK: (taskId) => `/admin/lab/tasks/${taskId}/assign`,
  REASSIGN_ADMIN_TASK: (taskId) => `/admin/lab/tasks/${taskId}/reassign`,
  CANCEL_ADMIN_TASK: (taskId) => `/admin/lab/tasks/${taskId}/cancel`,
  GET_ADMIN_ORDERS: '/admin/lab/orders',
  CREATE_COLLECTION_TASK: (orderId) => `/admin/lab/orders/${orderId}/create-collection-task`,

  // Phlebotomist Tasks
  GET_PHLEBOTOMIST_TASKS: '/phlebotomy/tasks/me',
  ACCEPT_PHLEBOTOMIST_TASK: (taskId) => `/phlebotomy/tasks/${taskId}/accept`,
  EN_ROUTE_PHLEBOTOMIST_TASK: (taskId) => `/phlebotomy/tasks/${taskId}/en-route`,
  ARRIVE_PHLEBOTOMIST_TASK: (taskId) => `/phlebotomy/tasks/${taskId}/arrive`,
  COLLECT_SAMPLES_PHLEBOTOMIST_TASK: (taskId) => `/phlebotomy/tasks/${taskId}/collect-samples`,
  DELIVER_TO_LAB_PHLEBOTOMIST_TASK: (taskId) => `/phlebotomy/tasks/${taskId}/deliver-to-lab`,
  COMPLETE_PHLEBOTOMIST_TASK: (taskId) => `/phlebotomy/tasks/${taskId}/complete`,
  UPDATE_LOCATION_PHLEBOTOMIST_TASK: (taskId) => `/phlebotomy/tasks/${taskId}/location`,
  SET_PHLEBOTOMIST_AVAILABILITY: '/phlebotomy/availability',
};

// Error Messages Mapping
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Please check your connection.',
  INVALID_REQUEST: 'Invalid request. Please check your input.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  CONFLICT: 'This resource already exists or there is a conflict.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Status Options for Filters
export const LAB_ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'sample_collection_scheduled', label: 'Collection Scheduled' },
  { value: 'sample_collected', label: 'Sample Collected' },
  { value: 'in_processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'report_ready', label: 'Report Ready' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
  { value: 'PAYMENT_PENDING', label: 'Confirming Payment' },
];
