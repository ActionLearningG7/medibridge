/**
 * Admin Queue Monitoring Page
 * Monitor all queues across the system with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Calendar, Activity, Users, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { PageHeader } from '../../components/layout';
import {
  useGetAllActiveQueuesQuery,
  useGetQueueStatisticsQuery,
  usePauseQueueMutation,
  useResumeQueueMutation,
  useCloseQueueMutation,
} from '../../features/user/adminApi';
import useQueueWebSocket from '../../hooks/useQueueWebSocket';
import QueueMonitorTable from '../../components/admin/QueueMonitorTable';

const AdminQueueMonitoring = () => {
  // State
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Queries - Real API calls
  const {
    data: queuesData = [],
    isLoading: queuesLoading,
    refetch: refetchQueues,
    error: queuesError
  } = useGetAllActiveQueuesQuery();

  const {
    data: statsData = {},
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetQueueStatisticsQuery();

  // Queue action mutations
  const [pauseQueue, { isLoading: isPausingQueue }] = usePauseQueueMutation();
  const [resumeQueue, { isLoading: isResumingQueue }] = useResumeQueueMutation();
  const [closeQueue, { isLoading: isClosingQueue }] = useCloseQueueMutation();

  const isLoadingAction = isPausingQueue || isResumingQueue || isClosingQueue;

  // WebSocket subscription - no callback to prevent connection resets
  const {
    queues: wsQueues,
    isConnected: wsConnected,
    error: wsError
  } = useQueueWebSocket();

  // Update last refresh when WebSocket data changes
  useEffect(() => {
    if (wsConnected && wsQueues.length > 0) {
      setLastRefresh(new Date());
    }
  }, [wsQueues, wsConnected]);

  // Use WebSocket data if available, otherwise use API data
  const queues = wsConnected && wsQueues.length > 0 ? wsQueues : queuesData;
  const isLoading = queuesLoading && !wsConnected;

  // Calculate aggregate stats from queues or use API stats
  const queueStats = statsData || {
    totalQueues: queues.length,
    activeQueues: queues.filter((q) => q.status === 'OPEN').length,
    pausedQueues: queues.filter((q) => q.status === 'PAUSED').length,
    totalWaiting: queues.reduce((sum, q) => sum + (q.waitingCount || 0), 0),
    totalCompleted: queues.reduce((sum, q) => sum + (q.completedCount || 0), 0),
    totalPatients: queues.reduce((sum, q) => sum + (q.totalPatients || 0), 0),
  };

  // Auto-refresh every 30 seconds (fallback when WebSocket is not connected)
  useEffect(() => {
    if (!autoRefresh || wsConnected) return;

    const interval = setInterval(() => {
      refetchQueues();
      refetchStats();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, wsConnected, refetchQueues, refetchStats]);

  const handleRefresh = useCallback(() => {
    refetchQueues();
    refetchStats();
    setLastRefresh(new Date());
    showToast('Queue data refreshed', 'success');
  }, [refetchQueues, refetchStats]);

  const handleViewDetails = useCallback((queue) => {
    setSelectedQueue(queue);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedQueue(null);
  }, []);

  const handlePauseQueue = useCallback(async (queueId) => {
    try {
      await pauseQueue(queueId).unwrap();
      showToast('Queue paused successfully', 'success');
      refetchQueues();
    } catch (error) {
      showToast('Failed to pause queue: ' + (error?.data?.message || 'Unknown error'), 'error');
    }
  }, [pauseQueue, refetchQueues]);

  const handleResumeQueue = useCallback(async (queueId) => {
    try {
      await resumeQueue(queueId).unwrap();
      showToast('Queue resumed successfully', 'success');
      refetchQueues();
    } catch (error) {
      showToast('Failed to resume queue: ' + (error?.data?.message || 'Unknown error'), 'error');
    }
  }, [resumeQueue, refetchQueues]);

  const handleCloseQueue = useCallback(async (queueId) => {
    if (!window.confirm('Are you sure you want to close this queue? This action cannot be undone.')) {
      return;
    }
    try {
      await closeQueue(queueId).unwrap();
      showToast('Queue closed successfully', 'success');
      refetchQueues();
    } catch (error) {
      showToast('Failed to close queue: ' + (error?.data?.message || 'Unknown error'), 'error');
    }
  }, [closeQueue, refetchQueues]);

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    const bgColor =
      type === 'success' ? 'bg-green-600' :
      type === 'error' ? 'bg-red-600' :
      type === 'warning' ? 'bg-yellow-600' :
      'bg-blue-600';

    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${bgColor}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const MetricCard = ({ title, value, icon: Icon, iconColor, iconBgColor, footer }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {footer && <p className="mt-2 text-xs text-gray-500">{footer}</p>}
        </div>
        <div className={`flex-shrink-0 ${iconBgColor} rounded-lg p-3`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <PageHeader
        title="Queue Monitoring"
        subtitle={`Real-time queue overview - ${new Date().toLocaleDateString()}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Queue Monitoring' }
        ]}
      />

      {/* Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700">
              Auto-refresh (30s)
            </label>
          </div>
          <span className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Now
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Total Queues"
          value={queueStats.totalQueues}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          footer="Active today"
        />
        <MetricCard
          title="Open Queues"
          value={queueStats.activeQueues}
          icon={Activity}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          footer="Currently open"
        />
        <MetricCard
          title="Paused"
          value={queueStats.pausedQueues}
          icon={AlertCircle}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          footer="Temporarily paused"
        />
        <MetricCard
          title="Total Patients"
          value={queueStats.totalPatients}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          footer="All queues"
        />
        <MetricCard
          title="Waiting"
          value={queueStats.totalWaiting}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          footer="Across all queues"
        />
        <MetricCard
          title="Completed"
          value={queueStats.totalCompleted}
          icon={CheckCircle}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-100"
          footer="Today's total"
        />
      </div>

      {/* WebSocket Status Banner - Only show if there's actually a problem */}
      {wsError && !wsConnected && queuesData.length === 0 && queuesError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900">Connection Issue</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Unable to connect to real-time updates or fetch queue data. Please check your connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner - Only show when WebSocket is connected */}
      {wsConnected && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Real-Time Queue Monitoring <span className="text-green-600 ml-2">● Live</span>
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Monitor all active queues, patient flow, and doctor availability across the system.
                Click "View Details" to see individual queue entries and patient information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Queue Monitor Table */}
      <QueueMonitorTable
        queues={queues}
        onViewDetails={handleViewDetails}
        onPauseQueue={handlePauseQueue}
        onResumeQueue={handleResumeQueue}
        onCloseQueue={handleCloseQueue}
        isLoading={isLoading}
        isLoadingAction={isLoadingAction}
      />

      {/* Queue Details Modal */}
      {selectedQueue && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCloseDetails} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${selectedQueue.status === 'OPEN' ? 'text-green-700' :
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
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Queue ID:</span>
                    <span className="font-mono text-xs text-gray-900">{selectedQueue.id}</span>
                  </div>
                </div>

                {/* Patient List Placeholder */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue Entries</h3>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Patient list details will be available when the queue entries API is implemented.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Expected endpoint: GET /api/v1/admin/queues/{'{queueId}'}/entries
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center sticky bottom-0">
                <div className="flex gap-2">
                  {/* Pause/Resume Button */}
                  {selectedQueue.status === 'OPEN' ? (
                    <button
                      onClick={() => {
                        handlePauseQueue(selectedQueue.id);
                        setSelectedQueue(null);
                      }}
                      disabled={isLoadingAction}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      Pause Queue
                    </button>
                  ) : selectedQueue.status === 'PAUSED' ? (
                    <button
                      onClick={() => {
                        handleResumeQueue(selectedQueue.id);
                        setSelectedQueue(null);
                      }}
                      disabled={isLoadingAction}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Resume Queue
                    </button>
                  ) : null}

                  {/* Close Button */}
                  {selectedQueue.status !== 'CLOSED' && (
                    <button
                      onClick={() => {
                        handleCloseQueue(selectedQueue.id);
                        setSelectedQueue(null);
                      }}
                      disabled={isLoadingAction}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Close Queue
                    </button>
                  )}
                </div>

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

export default AdminQueueMonitoring;
