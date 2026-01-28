/**
 * Lab API Quick Reference
 * Copy-paste examples for all workflows
 */

// ============================================================
// CATALOG - Browse Tests
// ============================================================

// Get all tests
import { useGetLabTestsQuery } from './src/features/lab/labApi';
const { data: tests, isLoading } = useGetLabTestsQuery({ page: 1, limit: 20 });

// Get single test
import { useGetLabTestDetailQuery } from './src/features/lab/labApi';
const { data: testDetail } = useGetLabTestDetailQuery('BLOOD-001');

// ============================================================
// PATIENT - Orders & Tracking
// ============================================================

// Create order
import { useCreatePatientOrderMutation } from './src/features/lab/labApi';
const [createOrder, { isLoading: creating }] = useCreatePatientOrderMutation();
await createOrder({
  tests: ['BLOOD-001', 'URINE-001'],
  address: '123 Main St',
  timeSlot: 'morning',
  paymentMethod: 'card'
});

// Get my orders
import { useGetPatientOrdersQuery } from './src/features/lab/labApi';
const { data: orders } = useGetPatientOrdersQuery({ page: 1 });

// Get order details
import { useGetPatientOrderDetailQuery } from './src/features/lab/labApi';
const { data: order } = useGetPatientOrderDetailQuery('ORD-001');

// Cancel order
import { useCancelPatientOrderMutation } from './src/features/lab/labApi';
const [cancel] = useCancelPatientOrderMutation();
await cancel('ORD-001');

// Get tracking (auto-polls every 15s)
import { useGetPatientOrderTrackingQuery } from './src/features/lab/labApi';
const { data: tracking } = useGetPatientOrderTrackingQuery('ORD-001');

// Get report
import { useGetPatientOrderReportQuery } from './src/features/lab/labApi';
const { data: report } = useGetPatientOrderReportQuery('ORD-001');

// Get collection task (phlebotomist info)
import { useGetPatientCollectionTaskQuery } from './src/features/lab/labApi';
const { data: task } = useGetPatientCollectionTaskQuery('ORD-001');

// ============================================================
// DOCTOR - Prescriptions
// ============================================================

// Prescribe tests to patient
import { useCreateDoctorOrderMutation } from './src/features/lab/labApi';
const [prescribe] = useCreateDoctorOrderMutation();
await prescribe({
  patientId: 'PAT-123',
  tests: ['BLOOD-001'],
  notes: 'Fasting required'
});

// Get prescription details
import { useGetDoctorOrderDetailQuery } from './src/features/lab/labApi';
const { data: prescription } = useGetDoctorOrderDetailQuery('ORD-456');

// Track patient tests
import { useGetDoctorOrderTrackingQuery } from './src/features/lab/labApi';
const { data: tracking } = useGetDoctorOrderTrackingQuery('ORD-456');

// Get patient report
import { useGetDoctorOrderReportQuery } from './src/features/lab/labApi';
const { data: report } = useGetDoctorOrderReportQuery('ORD-456');

// ============================================================
// ADMIN - Task Management
// ============================================================

// Get all tasks
import { useGetAdminLabTasksQuery } from './src/features/lab/labApi';
const { data: tasks } = useGetAdminLabTasksQuery({
  status: 'pending',
  page: 1
});

// Get task details
import { useGetAdminLabTaskDetailQuery } from './src/features/lab/labApi';
const { data: task } = useGetAdminLabTaskDetailQuery('TASK-001');

// Assign task
import { useAssignAdminLabTaskMutation } from './src/features/lab/labApi';
const [assign] = useAssignAdminLabTaskMutation();
await assign({
  taskId: 'TASK-001',
  phlebotomistId: 'PHEB-123'
});

// ============================================================
// PHLEBOTOMIST - Task Workflow
// ============================================================

// Get my tasks (auto-polls every 30s)
import { useGetPhlebotomistTasksQuery } from './src/features/lab/labApi';
const { data: myTasks } = useGetPhlebotomistTasksQuery({ status: 'assigned' });

// Accept task
import { useAcceptPhlebotomistTaskMutation } from './src/features/lab/labApi';
const [accept] = useAcceptPhlebotomistTaskMutation();
await accept('TASK-001');

// Mark en-route
import { useEnRoutePhlebotomistTaskMutation } from './src/features/lab/labApi';
const [enRoute] = useEnRoutePhlebotomistTaskMutation();
await enRoute('TASK-001');

// Mark arrived
import { useArrivePhlebotomistTaskMutation } from './src/features/lab/labApi';
const [arrive] = useArrivePhlebotomistTaskMutation();
await arrive('TASK-001');

// Complete task
import { useCompletePhlebotomistTaskMutation } from './src/features/lab/labApi';
const [complete] = useCompletePhlebotomistTaskMutation();
await complete('TASK-001');

// See docs/lab-api-coverage.md for complete endpoint list and details
