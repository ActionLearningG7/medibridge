/**
 * Admin Lab Dashboard Page
 * Dashboard for lab task management with KPIs and task table
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAdminLabOrdersQuery, useGetAdminLabTasksQuery, useAssignAdminLabTaskMutation, useReassignAdminLabTaskMutation, useCancelAdminLabTaskMutation, useCreateCollectionTaskMutation } from '../../features/lab/labApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Input, Select, Button, Badge, Toast } from '../../ui';
import { KPICard } from '../../components/lab/KPICard';
import CreateCollectionTaskModal from '../../components/lab/CreateCollectionTaskModal';
import { CheckCircle, Clock, Navigation, AlertCircle, Edit2, XCircle, Eye } from 'lucide-react';

const TASK_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'en_route', label: 'En Route' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'collect_samples', label: 'Collecting Samples' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const STATUS_LABELS = {
  assigned: 'Assigned',
  en_route: 'En Route',
  arrived: 'Arrived',
  collect_samples: 'Collecting',
  in_transit: 'In Transit',
  completed: 'Completed',
  failed: 'Failed',
};

export default function AdminLabDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, taskId: null, mode: 'assign' });
  const [createTaskModal, setCreateTaskModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: '',
    testCount: 0
  });
  const [toastState, setToastState] = useState({ isOpen: false, type: 'info', message: '' });

  // Build query params - memoized to prevent constant refetches
  const queryParams = useMemo(() => ({
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [statusFilter, dateFrom, dateTo]);

  // Fetch tasks
  const { data: tasksResponse = { tasks: [], stats: {} }, isLoading, error, refetch } = useGetAdminLabTasksQuery(queryParams);
  const tasks = tasksResponse.tasks || [];
  const stats = tasksResponse.stats || {};

  // Fetch orders (to show unassigned orders that don't have tasks yet)
  const { data: ordersResponse = { content: [] }, isLoading: ordersLoading } = useGetAdminLabOrdersQuery({ page: 0, size: 20 });
  const orders = ordersResponse.content || [];

  // Count unassigned orders (orders without tasks)
  const unassignedOrdersCount = orders.filter(order => order.status === 'SCHEDULED').length;

  // Mutations
  const [assignTask, { isLoading: isAssigning }] = useAssignAdminLabTaskMutation();
  const [reassignTask, { isLoading: isReassigning }] = useReassignAdminLabTaskMutation();
  const [cancelTask, { isLoading: isCancelling }] = useCancelAdminLabTaskMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateCollectionTaskMutation();

  // Show toast - memoized to prevent infinite loops
  const showToast = useCallback((type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState(prevState => ({ ...prevState, isOpen: false })), 5000);
  }, []);

  // Handle reset filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  // Handle assign
  const handleAssign = async (taskId, phlebotomistId) => {
    try {
      await assignTask({ taskId, phlebotomistId }).unwrap();
      showToast('success', 'Task assigned successfully');
      setAssignmentModal({ isOpen: false, taskId: null, mode: 'assign' });
      refetch();
    } catch (error) {
      showToast('error', error?.data?.message || 'Failed to assign task');
    }
  };

  // Handle reassign
  const handleReassign = async (taskId, phlebotomistId) => {
    try {
      await reassignTask({ taskId, phlebotomistId }).unwrap();
      showToast('success', 'Task reassigned successfully');
      setAssignmentModal({ isOpen: false, taskId: null, mode: 'assign' });
      refetch();
    } catch (error) {
      showToast('error', error?.data?.message || 'Failed to reassign task');
    }
  };

  // Handle cancel
  const handleCancel = async (taskId) => {
    if (window.confirm('Are you sure you want to cancel this task?')) {
      try {
        await cancelTask(taskId).unwrap();
        showToast('success', 'Task cancelled successfully');
        refetch();
      } catch (error) {
        showToast('error', error?.data?.message || 'Failed to cancel task');
      }
    }
  };

  // Handle create collection task - open modal
  const handleOpenCreateTaskModal = (orderId, orderNumber, testCount) => {
    setCreateTaskModal({
      isOpen: true,
      orderId,
      orderNumber,
      testCount,
    });
  };

  // Handle create collection task - submit
  const handleCreateTaskSubmit = async (orderId, phlebotomistId) => {
    try {
      await createTask({ orderId, phlebotomistId }).unwrap();
      showToast('success', 'Collection task created and assigned successfully');
      refetch(); // Refresh both orders and tasks lists
    } catch (error) {
      showToast('error', error?.data?.message || 'Failed to create collection task');
    }
  };

  const hasActiveFilters = statusFilter || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Lab Task Dashboard"
        subtitle="Manage lab sample collection tasks"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <KPICard
            title="Total Tasks Today"
            value={stats.totalToday || 0}
            icon={CheckCircle}
            color="primary"
            loading={isLoading}
          />
          <KPICard
            title="Pending Assignment"
            value={stats.pendingAssignment || 0}
            icon={AlertCircle}
            color="warning"
            loading={isLoading}
          />
          <KPICard
            title="En Route"
            value={stats.enRoute || 0}
            icon={Navigation}
            color="primary"
            loading={isLoading}
          />
          <KPICard
            title="Completed"
            value={stats.completed || 0}
            icon={CheckCircle}
            color="success"
            loading={isLoading}
            trend="up"
            trendValue={stats.completionTrend || '0'}
          />
          <KPICard
            title="Unassigned Orders"
            value={unassignedOrdersCount}
            icon={AlertCircle}
            color={unassignedOrdersCount > 0 ? 'warning' : 'success'}
            loading={ordersLoading}
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Status"
                options={TASK_STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              <Input
                type="date"
                label="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                label="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Unassigned Orders Alert with List */}
        {unassignedOrdersCount > 0 && (
          <Card className="mb-6 p-6 border-yellow-200 bg-yellow-50">
            <div className="mb-4">
              <p className="font-semibold text-yellow-900 mb-2">📋 {unassignedOrdersCount} Unassigned Lab Order{unassignedOrdersCount !== 1 ? 's' : ''}</p>
              <p className="text-sm text-yellow-700">These orders need collection tasks to be created and assigned to phlebotomists</p>
            </div>

            {/* Unassigned Orders Expandable List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {orders.filter(o => o.status === 'SCHEDULED').map((order) => (
                <div key={order.id} className="bg-white p-3 rounded border border-yellow-300 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-600">Patient: {order.patientId}</p>
                    {order.items?.length > 0 && (
                      <p className="text-xs text-gray-500">{order.items.length} test(s)</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenCreateTaskModal(order.id, order.orderNumber, order.items?.length || 0)}
                    className="ml-2"
                  >
                    Create Task
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Error state */}
        {error && (
          <Card className="mb-6 p-6 border-red-200 bg-red-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-red-900">Failed to load tasks</p>
                <p className="text-sm text-red-700">{error?.data?.message || 'Please try again'}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {hasActiveFilters ? 'No tasks match your filters' : 'No tasks found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Task ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phlebotomist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Scheduled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{task.id}</td>
                        <td className="px-6 py-4 text-sm">
                          <p className="text-gray-900">{task.patientName}</p>
                          <p className="text-xs text-gray-500">{task.patientCity}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              task.status === 'completed'
                                ? 'success'
                                : task.status === 'failed'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {STATUS_LABELS[task.status] || task.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {task.phlebotomistName ? (
                            <div>
                              <p className="text-gray-900">{task.phlebotomistName}</p>
                              <p className="text-xs text-gray-500">{task.phlebotomistPhone}</p>
                            </div>
                          ) : (
                            <span className="text-gray-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {task.scheduledAt ? new Date(task.scheduledAt).toLocaleDateString() : 'Not Scheduled'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => navigate(`/admin/lab/tasks/${task.id}`)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>

                            {!task.phlebotomistName && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                  setAssignmentModal({ isOpen: true, taskId: task.id, mode: 'assign' })
                                }
                                className="flex items-center gap-1"
                              >
                                <Edit2 className="h-3 w-3" />
                                Assign
                              </Button>
                            )}

                            {task.phlebotomistName && task.status !== 'completed' && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                  setAssignmentModal({ isOpen: true, taskId: task.id, mode: 'reassign' })
                                }
                                className="flex items-center gap-1"
                              >
                                <Edit2 className="h-3 w-3" />
                                Reassign
                              </Button>
                            )}

                            {task.status !== 'completed' && task.status !== 'failed' && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleCancel(task.id)}
                                disabled={isCancelling}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && tasks.length > 0 && (
              <p className="mt-4 text-center text-sm text-gray-600">
                Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Modal */}
      {assignmentModal.isOpen && (
        <AssignmentModal
          isOpen={assignmentModal.isOpen}
          taskId={assignmentModal.taskId}
          mode={assignmentModal.mode}
          isLoading={isAssigning || isReassigning}
          onAssign={handleAssign}
          onReassign={handleReassign}
          onClose={() => setAssignmentModal({ isOpen: false, taskId: null, mode: 'assign' })}
        />
      )}

      {/* Create Collection Task Modal */}
      <CreateCollectionTaskModal
        isOpen={createTaskModal.isOpen}
        orderId={createTaskModal.orderId}
        orderNumber={createTaskModal.orderNumber}
        testCount={createTaskModal.testCount}
        onClose={() => setCreateTaskModal({ isOpen: false, orderId: null, orderNumber: '', testCount: 0 })}
        onSubmit={handleCreateTaskSubmit}
        isLoading={isCreatingTask}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toastState.isOpen}
        variant={toastState.type}
        message={toastState.message}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
      />
    </div>
  );
}

// Assignment Modal Component
function AssignmentModal({
  isOpen,
  taskId,
  mode,
  isLoading,
  onAssign,
  onReassign,
  onClose,
}) {
  const [selectedPhlebotomist, setSelectedPhlebotomist] = React.useState('');
  const [phlebotomists, setPhlebotomists] = React.useState([]);
  const [loadingPhlebotomists, setLoadingPhlebotomists] = React.useState(true);

  // Fetch phlebotomists
  React.useEffect(() => {
    const fetchPhlebotomists = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/admin/lab/phlebotomists/available`
        );
        if (response.ok) {
          const data = await response.json();
          setPhlebotomists(data.phlebotomists || []);
        }
      } catch (error) {
        console.error('Failed to fetch phlebotomists:', error);
      } finally {
        setLoadingPhlebotomists(false);
      }
    };

    if (isOpen) {
      fetchPhlebotomists();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'assign' ? 'Assign Phlebotomist' : 'Reassign Phlebotomist'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {loadingPhlebotomists ? (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 bg-primary-600 rounded-full animate-spin" />
            </div>
          ) : phlebotomists.length === 0 ? (
            <p className="text-sm text-gray-600">No available phlebotomists</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {phlebotomists.map((phlebotomist) => (
                <label
                  key={phlebotomist.userId}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="phlebotomist"
                    value={phlebotomist.userId}
                    checked={selectedPhlebotomist === phlebotomist.userId}
                    onChange={(e) => setSelectedPhlebotomist(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{phlebotomist.firstName} {phlebotomist.lastName}</p>
                    <p className="text-xs text-gray-600">{phlebotomist.phoneNumber}</p>
                    <p className="text-xs text-gray-500">{phlebotomist.shiftType}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (mode === 'assign') {
                onAssign(taskId, selectedPhlebotomist);
              } else {
                onReassign(taskId, selectedPhlebotomist);
              }
            }}
            disabled={!selectedPhlebotomist || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            {mode === 'assign' ? 'Assign' : 'Reassign'}
          </Button>
        </div>
      </div>
    </div>
  );
}
