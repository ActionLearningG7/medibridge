/**
 * Queue Status Card Component
 * Displays current queue status with token, position, and ETA
 */

import { Clock, Users, AlertCircle, Loader } from 'lucide-react';
import { cn } from '../../utils/cn';

const QueueStatusCard = ({ queueData, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!queueData) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Not in Queue</h3>
          <p className="text-sm text-gray-500">
            You are not currently in any queue. Book an appointment to join.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      WAITING: 'bg-yellow-50 border-yellow-200',
      CALLED: 'bg-blue-50 border-blue-200',
      IN_CONSULTATION: 'bg-purple-50 border-purple-200',
      COMPLETED: 'bg-green-50 border-green-200',
      NO_SHOW: 'bg-red-50 border-red-200',
      SKIPPED: 'bg-gray-50 border-gray-200',
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  const getStatusBadge = (status) => {
    const badges = {
      WAITING: 'bg-yellow-100 text-yellow-800',
      CALLED: 'bg-blue-100 text-blue-800',
      IN_CONSULTATION: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      NO_SHOW: 'bg-red-100 text-red-800',
      SKIPPED: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatWaitTime = (joinedAt) => {
    if (!joinedAt) return 'N/A';

    const joined = new Date(joinedAt);
    const now = new Date();
    const diffMs = now - joined;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes`;

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={cn('rounded-lg border-2 p-6', getStatusColor(queueData.status))}>
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Queue Status</h3>
        <span
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-full',
            getStatusBadge(queueData.status)
          )}
        >
          {queueData.status}
        </span>
      </div>

      {/* Token Number - Large Display */}
      <div className="mb-6">
        <div className="text-center bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Your Token Number</p>
          <p className="text-5xl font-bold text-primary-600">#{queueData.tokenNumber}</p>
        </div>
      </div>

      {/* Queue Information */}
      <div className="space-y-4">
        {/* Position in Queue */}
        {queueData.position !== null && queueData.position !== undefined && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Position</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{queueData.position}</span>
          </div>
        )}

        {/* Wait Time */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Waiting Time</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatWaitTime(queueData.joinedAt)}
          </span>
        </div>

        {/* Estimated Wait Time */}
        {queueData.estimatedWaitTime && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <Loader className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Est. Wait</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {queueData.estimatedWaitTime}
            </span>
          </div>
        )}

        {/* Emergency Badge */}
        {queueData.isEmergency && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Priority: Emergency</span>
          </div>
        )}
      </div>

      {/* Called Status Message */}
      {queueData.status === 'CALLED' && (
        <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900">You've Been Called!</h4>
              <p className="text-sm text-blue-700 mt-1">
                Please proceed to the consultation room. The doctor is ready to see you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {queueData.notes && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">{queueData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default QueueStatusCard;
