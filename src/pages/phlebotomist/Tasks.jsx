/**
 * Phlebotomist Tasks Page
 * List of tasks assigned to the current phlebotomist
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPhlebotomistTasksQuery } from '../../features/lab/labApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Button, Badge, Toast } from '../../ui';
import { MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

const STATUS_COLORS = {
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

export default function PhlebotomistTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  // Fetch tasks
  const { data: tasks = [], isLoading, error, refetch } = useGetPhlebotomistTasksQuery({
    status: filterStatus || undefined,
  });

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  // Get status filter options
  const statusOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'EN_ROUTE', label: 'En Route' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'SAMPLES_COLLECTED', label: 'Collecting' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  // Get stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'SAMPLES_COLLECTED'].includes(t.status)).length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="My Tasks"
        subtitle="Lab sample collection tasks assigned to you"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6 p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {filterStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus('')}
              >
                Clear
              </Button>
            )}
          </div>
        </Card>

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

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filterStatus ? 'No tasks match your filter' : 'No tasks assigned yet'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.taskId}
                onClick={() => navigate(`/phlebotomist/tasks/${task.taskId}`)}
                className="w-full text-left"
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">Task #{task.taskId.substring(0, 8)}</h3>
                        <Badge className={STATUS_COLORS[task.status]}>
                          {STATUS_LABELS[task.status] || task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{task.address || 'No address provided'}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        {task.city}, {task.area}
                      </div>
                    </div>

                    {/* Right content */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Scheduled</p>
                      <p className="text-sm font-medium text-gray-900">
                        {task.scheduledAt ? new Date(task.scheduledAt).toLocaleDateString() : 'Not Scheduled'}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">→</div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}

        {!isLoading && tasks.length > 0 && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

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
