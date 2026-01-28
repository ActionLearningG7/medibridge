/**
 * Admin Lab Task Details Page
 * View and manage specific lab task with assignment
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Phone, AlertCircle, Edit2, XCircle } from 'lucide-react';
import { useGetAdminLabTaskDetailQuery, useAssignAdminLabTaskMutation, useReassignAdminLabTaskMutation, useCancelAdminLabTaskMutation } from '../../features/lab/labApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Toast } from '../../ui';
import { StatusTimeline } from '../../components/lab/StatusTimeline';
import AssignPhlebotomistModal from '../../components/lab/AssignPhlebotomistModal';
import { LAB_ORDER_STATUS_LABELS } from '../../features/lab/constants';

const STATUS_LABELS = {
  assigned: 'Assigned',
  en_route: 'En Route',
  arrived: 'Arrived',
  collect_samples: 'Collecting Samples',
  in_transit: 'In Transit',
  completed: 'Completed',
  failed: 'Failed',
};

export default function AdminLabTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, mode: 'assign' });

  // Fetch task details
  const { data: task, isLoading, error, refetch } = useGetAdminLabTaskDetailQuery(taskId, {
    skip: !taskId,
  });

  // Mutations
  const [assignTask, { isLoading: isAssigning }] = useAssignAdminLabTaskMutation();
  const [reassignTask, { isLoading: isReassigning }] = useReassignAdminLabTaskMutation();
  const [cancelTask, { isLoading: isCancelling }] = useCancelAdminLabTaskMutation();

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Handle assign from modal
  const handleAssignFromModal = async (phlebotomistId) => {
    try {
      await assignTask({ taskId, phlebotomistId }).unwrap();
      showToast('success', 'Task assigned successfully');
      setAssignmentModal({ isOpen: false, mode: 'assign' });
      refetch();
    } catch (error) {
      showToast('error', error?.data?.message || 'Failed to assign task');
    }
  };

  // Handle reassign from modal
  const handleReassignFromModal = async (phlebotomistId) => {
    try {
      await reassignTask({ taskId, phlebotomistId }).unwrap();
      showToast('success', 'Task reassigned successfully');
      setAssignmentModal({ isOpen: false, mode: 'assign' });
      refetch();
    } catch (error) {
      showToast('error', error?.data?.message || 'Failed to reassign task');
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this task?')) {
      try {
        await cancelTask(taskId).unwrap();
        showToast('success', 'Task cancelled successfully');
        setTimeout(() => navigate('/admin/lab/tasks'), 1500);
      } catch (error) {
        showToast('error', error?.data?.message || 'Failed to cancel task');
      }
    }
  };

  // Early return if no taskId is provided
  if (!taskId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Error" subtitle="Invalid task ID" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-yellow-700 mb-4">
                <AlertCircle className="h-6 w-6" />
                <p className="font-semibold">No task ID provided</p>
              </div>
              <p className="text-gray-600 mb-4">Please select a task from the list</p>
              <Button onClick={() => navigate('/admin/labs/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Task Details" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-40 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Task Details" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 text-center border-red-200 bg-red-50">
            <p className="font-semibold text-red-900">Failed to load task details</p>
            <p className="text-sm text-red-700 mt-2">{error?.data?.message || 'Please try again'}</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/lab/tasks')}>
                Back to Tasks
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isCancellable = task.status !== 'completed' && task.status !== 'failed';
  const canReassign = task.phlebotomistId && task.status !== 'completed' && task.status !== 'failed';

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Task Details" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin/lab/tasks')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </button>

        {/* Header card */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Task ID</p>
                <h1 className="text-3xl font-bold text-gray-900">#{task.id}</h1>
              </div>
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
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!task.phlebotomistId && (
                <Button
                  size="sm"
                  onClick={() => {
                    setAssignmentModal({ isOpen: true, mode: 'assign' });
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Assign Phlebotomist
                </Button>
              )}

              {canReassign && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAssignmentModal({ isOpen: true, mode: 'reassign' });
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Reassign
                </Button>
              )}

              {isCancellable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Task
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Task Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline events={task.trackingEvents || []} />
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order ID */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Order ID</p>
                  <p className="text-gray-900">{task.orderId}</p>
                </div>

                {/* Tests */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tests</p>
                  <div className="space-y-2">
                    {task.tests?.map((test) => (
                      <div key={test.id} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-900">{test.name}</span>
                        <span className="text-xs text-gray-600">{test.code}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                {task.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Collection Address
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{task.address.line1}</p>
                      {task.address.line2 && <p>{task.address.line2}</p>}
                      <p>
                        {task.address.city}, {task.address.state} {task.address.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Info */}
            {task.patient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-medium text-gray-900">{task.patient.name}</p>
                  <p className="text-gray-600">{task.patient.email}</p>
                  <a
                    href={`tel:${task.patient.phone}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {task.patient.phone}
                  </a>
                  {task.patient.city && (
                    <p className="text-gray-600">{task.patient.city}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Assigned Phlebotomist */}
            {task.phlebotomistId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assigned Phlebotomist
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <p className="font-medium text-gray-900">{task.phlebotomistName}</p>
                  <a
                    href={`tel:${task.phlebotomistPhone}`}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    {task.phlebotomistPhone}
                  </a>
                  {task.phlebotomistExperience && (
                    <p className="text-gray-600">
                      {task.phlebotomistExperience} years experience
                    </p>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600 font-medium">Phlebotomist ID</p>
                    <p className="font-mono text-xs text-gray-900">{task.phlebotomistId}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!task.phlebotomistId && (
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 mb-2" />
                <p className="text-sm text-yellow-800">
                  This task has not been assigned to a phlebotomist yet.
                </p>
              </Card>
            )}

            {/* Scheduled Date */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  {task.scheduledAt ? new Date(task.scheduledAt).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Not Scheduled'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignPhlebotomistModal
        isOpen={assignmentModal.isOpen}
        mode={assignmentModal.mode}
        isLoading={assignmentModal.mode === 'assign' ? isAssigning : isReassigning}
        onAssign={
          assignmentModal.mode === 'assign' ? handleAssignFromModal : handleReassignFromModal
        }
        onClose={() => setAssignmentModal({ isOpen: false, mode: 'assign' })}
      />

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Error'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}

// ...existing helper functions if any...
