/**
 * Phlebotomist Task Details Page
 * Detailed task information and sample collection with workflow actions
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import {
  useGetPhlebotomistTaskDetailQuery,
  useAcceptPhlebotomistTaskMutation,
  useEnRoutePhlebotomistTaskMutation,
  useArrivePhlebotomistTaskMutation,
  useCollectSamplesPhlebotomistTaskMutation,
  useDeliverToLabPhlebotomistTaskMutation,
  useCompletePhlebotomistTaskMutation,
} from '../../features/lab/labApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Badge, Toast } from '../../ui';
import { TaskActionPanel } from '../../components/lab/TaskActionPanel';
import { StatusTimeline } from '../../components/lab/StatusTimeline';

const STATUS_LABELS = {
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived',
  SAMPLES_COLLECTED: 'Collecting',
  IN_TRANSIT: 'In Transit',
  DELIVERED_TO_LAB: 'Delivered to Lab',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

const STATUS_BADGE_COLORS = {
  ASSIGNED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  EN_ROUTE: 'bg-purple-100 text-purple-800',
  ARRIVED: 'bg-green-100 text-green-800',
  SAMPLES_COLLECTED: 'bg-yellow-100 text-yellow-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  DELIVERED_TO_LAB: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function PhlebotomistTaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch task details
  const { data: task, isLoading, error, refetch } = useGetPhlebotomistTaskDetailQuery(taskId, {
    skip: !taskId,
  });

  // Action mutations
  const [acceptTask] = useAcceptPhlebotomistTaskMutation();
  const [enRouteTask] = useEnRoutePhlebotomistTaskMutation();
  const [arriveTask] = useArrivePhlebotomistTaskMutation();
  const [collectSamples] = useCollectSamplesPhlebotomistTaskMutation();
  const [deliverToLab] = useDeliverToLabPhlebotomistTaskMutation();
  const [completeTask] = useCompletePhlebotomistTaskMutation();

  // Map action to mutation
  const getMutation = (actionId) => {
    const mutations = {
      accept: acceptTask,
      en_route: enRouteTask,
      arrive: arriveTask,
      collect_samples: collectSamples,
      deliver_to_lab: deliverToLab,
      complete: completeTask,
    };
    return mutations[actionId];
  };

  // Show toast
  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Handle action
  const handleAction = async (actionId) => {
    if (actionId === 'update_location') {
      // TODO: Open location update modal
      showToast('info', 'Location update coming soon');
      return;
    }

    setActionLoading(true);

    try {
      const mutation = getMutation(actionId);
      if (!mutation) {
        throw new Error('Invalid action');
      }

      if (actionId === 'collect_samples') {
        // Collect samples requires a list of SampleItem objects: { barcode, sampleType, containerType }
        const collectedSamples = task.tests?.map((test, index) => ({
          barcode: `SMP-${test.code}-${index + 1}`,
          sampleType: 'BLOOD', // hardcoded for MVP/Demo
          containerType: 'EDTA_TUBE'
        })) || [];

        await mutation({
          taskId,
          samples: collectedSamples,
          notes: 'collected via mobile app'
        }).unwrap();
      } else {
        await mutation(taskId).unwrap();
      }

      showToast('success', `Task ${actionId.replace(/_/g, ' ')} successfully`);
      refetch();
    } catch (error) {
      console.error('Action failed:', error);
      showToast('error', error?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Early return if no taskId is provided
  if (!taskId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Error" subtitle="Invalid task ID" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-yellow-700 font-semibold mb-2">No task ID provided</p>
              <p className="text-gray-600 mb-4">Please select a task from your tasks list</p>
              <Button onClick={() => navigate('/phlebotomist/tasks')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
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
            <p className="font-semibold text-red-900">Failed to load task</p>
            <p className="text-sm text-red-700 mt-2">{error?.data?.message || 'Please try again'}</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/phlebotomist/tasks')}>
                Back to Tasks
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Task Details" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/phlebotomist/tasks')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Tasks
        </button>

        {/* Header card */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Task ID</p>
                <h1 className="text-3xl font-bold text-gray-900">#{task.taskId}</h1>
              </div>
              <Badge className={STATUS_BADGE_COLORS[task.status]}>
                {STATUS_LABELS[task.status] || task.status}
              </Badge>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-medium text-gray-900">{task.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a
                    href={`tel:${task.patientPhone}`}
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    {task.patientPhone}
                  </a>
                </div>
                {task.patientAge && (
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium text-gray-900">{task.patientAge} years</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collection Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Collection Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{task.address?.line1}</p>
                  {task.address?.line2 && <p>{task.address.line2}</p>}
                  <p>
                    {task.address?.city}, {task.address?.state} {task.address?.zipCode}
                  </p>
                </div>
                {task.address?.coordinates && (
                  <p className="text-xs text-gray-500 mt-3">
                    Coordinates: {task.address.coordinates.lat}, {task.address.coordinates.lng}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            {task.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Collection Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.instructions.fastingInstructions && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Fasting</p>
                      <p className="text-sm text-gray-600">{task.instructions.fastingInstructions}</p>
                    </div>
                  )}
                  {task.instructions.generalNotes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">General Notes</p>
                      <p className="text-sm text-gray-600">{task.instructions.generalNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Tests to Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.tests?.map((test) => (
                    <div key={test.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{test.name}</span>
                      <span className="text-xs text-gray-600">{test.code}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {task.trackingEvents && task.trackingEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Task Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatusTimeline events={task.trackingEvents} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Action Panel */}
            <TaskActionPanel
              currentStatus={task.status}
              isLoading={actionLoading}
              onAction={handleAction}
            />

            {/* Scheduled Date */}
            <Card className="mt-6 p-4">
              <p className="text-sm text-gray-600">Scheduled Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {task.scheduledAt ? new Date(task.scheduledAt).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'Not Scheduled'}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : toastState.type === 'error' ? 'Error' : 'Info'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </div>
  );
}
