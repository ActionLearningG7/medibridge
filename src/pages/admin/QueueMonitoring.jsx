/**
 * Queue Monitoring Page
 * Admin view of all queues today with drilldown per doctor
 */

import { useState } from 'react';
import { RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/layout';
import { useGetSystemStatisticsQuery } from '../../features/user/adminApi';
import { useToast } from '../../components/feedback/ToastProvider';
import QueueMonitorTable from '../../components/admin/QueueMonitorTable';
import MetricCard from '../../components/dashboard/MetricCard';
import { Users, Clock, CheckCircle, Activity } from 'lucide-react';
import { SkeletonStats, SkeletonTable } from '../../components/feedback/Skeleton';

const QueueMonitoring = () => {
  const { showToast } = useToast();

  // State
  const [selectedQueue, setSelectedQueue] = useState(null);

  // Queries
  const { data: stats, isLoading: statsLoading, refetch } = useGetSystemStatisticsQuery();

  // Mock queue data (TODO: Replace with real API when available)
  const mockQueues = [
    {
      id: 'q1',
      doctorId: 'd1',
      doctorName: 'John Smith',
      specialization: 'Cardiologist',
      status: 'OPEN',
      totalPatients: 12,
      waitingCount: 5,
      completedCount: 7,
      openedAt: new Date().toISOString(),
    },
    {
      id: 'q2',
      doctorId: 'd2',
      doctorName: 'Jane Doe',
      specialization: 'Pediatrician',
      status: 'PAUSED',
      totalPatients: 8,
      waitingCount: 3,
      completedCount: 5,
      openedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'q3',
      doctorId: 'd3',
      doctorName: 'Bob Johnson',
      specialization: 'Dermatologist',
      status: 'OPEN',
      totalPatients: 15,
      waitingCount: 8,
      completedCount: 7,
      openedAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const queues = mockQueues;

  // Calculate aggregate stats
  const queueStats = {
    totalQueues: queues.length,
    activeQueues: queues.filter((q) => q.status === 'OPEN').length,
    totalWaiting: queues.reduce((sum, q) => sum + q.waitingCount, 0),
    totalCompleted: queues.reduce((sum, q) => sum + q.completedCount, 0),
  };

  const handleRefresh = () => {
    refetch();
    showToast.info('Refreshing queue data...');
  };

  const handleViewDetails = (queue) => {
    setSelectedQueue(queue);
  };

  const handleCloseDetails = () => {
    setSelectedQueue(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Queue Monitoring"
        subtitle={`Today's queue overview - ${new Date().toLocaleDateString()}`}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Queue Monitoring' }]}
        actions={
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        }
      />

      {/* Statistics */}
      {statsLoading ? (
        <SkeletonStats count={4} className="mb-6" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Queues"
            value={queueStats.totalQueues}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            footer="Active today"
          />
          <MetricCard
            title="Active Queues"
            value={queueStats.activeQueues}
            icon={Activity}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            footer="Currently open"
          />
          <MetricCard
            title="Patients Waiting"
            value={queueStats.totalWaiting}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            footer="Across all queues"
          />
          <MetricCard
            title="Completed Today"
            value={queueStats.totalCompleted}
            icon={CheckCircle}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            footer="Total consultations"
          />
        </div>
      )}

      {/* Queue Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Real-Time Queue Monitoring</h3>
            <p className="text-sm text-blue-700 mt-1">
              Monitor all active queues, patient flow, and doctor availability across the system. Click "View Details" to see individual queue entries.
            </p>
          </div>
        </div>
      </div>

      {/* Queue Monitor Table */}
      <QueueMonitorTable
        queues={queues}
        onViewDetails={handleViewDetails}
        isLoading={false}
      />

      {/* Queue Details Modal */}
      {selectedQueue && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCloseDetails} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Queue Details - Dr. {selectedQueue.doctorName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedQueue.specialization}</p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Queue Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-1">Total Patients</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedQueue.totalPatients}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-700 mb-1">Waiting</p>
                    <p className="text-2xl font-bold text-yellow-900">{selectedQueue.waitingCount}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{selectedQueue.completedCount}</p>
                  </div>
                </div>

                {/* Queue Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      selectedQueue.status === 'OPEN' ? 'text-green-700' :
                      selectedQueue.status === 'PAUSED' ? 'text-yellow-700' :
                      'text-gray-700'
                    }`}>
                      {selectedQueue.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Opened At:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedQueue.openedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-medium text-gray-900">
                      {selectedQueue.totalPatients > 0
                        ? Math.round((selectedQueue.completedCount / selectedQueue.totalPatients) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                {/* Patient List Placeholder */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue Entries</h3>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Patient list details will be available when the queue entries API is implemented.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QueueMonitoring;
