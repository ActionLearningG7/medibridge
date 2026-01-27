/**
 * Queue Status Component
 * Displays queue information with token, position, and ETA
 */

const QueueStatus = ({ queueEntry, onLeave, onJoinVideo }) => {
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusColor = (status) => {
    const colors = {
      WAITING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CALLED: 'bg-green-100 text-green-800 border-green-200',
      SERVING: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'WAITING':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'CALLED':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case 'SERVING':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Status Banner */}
      <div className={`px-6 py-4 border-b-2 ${getStatusColor(queueEntry.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(queueEntry.status)}
            <div>
              <h2 className="text-lg font-semibold">
                {queueEntry.status === 'WAITING' && 'Waiting in Queue'}
                {queueEntry.status === 'CALLED' && 'You\'re Being Called!'}
                {queueEntry.status === 'SERVING' && 'Currently Being Served'}
                {queueEntry.status === 'COMPLETED' && 'Consultation Completed'}
                {queueEntry.status === 'CANCELLED' && 'Queue Cancelled'}
              </h2>
              <p className="text-sm opacity-90">
                {queueEntry.status === 'WAITING' && 'Please wait for your turn'}
                {queueEntry.status === 'CALLED' && 'Please proceed to the consultation room'}
                {queueEntry.status === 'SERVING' && 'Your consultation is in progress'}
                {queueEntry.status === 'COMPLETED' && 'Thank you for your visit'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Information */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Token Number */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 mb-3">
              <span className="text-3xl font-bold text-primary-600">
                {queueEntry.tokenNumber || 'N/A'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">Token Number</p>
            <p className="text-xs text-gray-500 mt-1">Your queue identifier</p>
          </div>

          {/* Position */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-3">
              <span className="text-3xl font-bold text-blue-600">
                {queueEntry.position !== undefined ? queueEntry.position : '-'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">Current Position</p>
            <p className="text-xs text-gray-500 mt-1">
              {queueEntry.position === 1 ? 'Next in line!' : queueEntry.position === 0 ? 'Your turn!' : 'People ahead of you'}
            </p>
          </div>

          {/* Estimated Wait Time */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-3">
              <div className="text-center">
                <span className="text-2xl font-bold text-green-600 block leading-none">
                  {queueEntry.estimatedWaitTime ? formatTime(queueEntry.estimatedWaitTime) : '-'}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Estimated Wait</p>
            <p className="text-xs text-gray-500 mt-1">Approximate time</p>
          </div>
        </div>

        {/* Appointment Details */}
        {queueEntry.appointmentId && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Appointment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Appointment ID:</span>
                <span className="font-mono text-gray-900">{queueEntry.appointmentId.substring(0, 8)}</span>
              </div>
              {queueEntry.doctorName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Doctor:</span>
                  <span className="text-gray-900">Dr. {queueEntry.doctorName}</span>
                </div>
              )}
              {queueEntry.isEmergency && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Emergency
                  </span>
                </div>
              )}
              {queueEntry.joinedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined:</span>
                  <span className="text-gray-900">{new Date(queueEntry.joinedAt).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {queueEntry.status === 'CALLED' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onLeave}
              className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Leave Queue
            </button>
          </div>
        )}

        {queueEntry.status === 'WAITING' && (
          <div className="mt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">It's your turn!</h3>
                  <p className="mt-1 text-sm text-green-700">
                    The doctor is ready to see you now. Click the button below to join the video consultation.
                  </p>
                </div>
              </div>
            </div>
            {onJoinVideo && (
              <button
                onClick={onJoinVideo}
                className="w-full bg-primary-600 text-white px-4 py-3 rounded-md hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM17 11.5v2.5M2 13v2.5" />
                </svg>
                <span>Join Video Consultation</span>
              </button>
            )}
          </div>
        )}

        {queueEntry.status === 'IN_PROGRESS' && (
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="animate-pulse h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">Consultation in Progress</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Your consultation is currently active. Join the video call now.
                  </p>
                </div>
              </div>
            </div>
            {onJoinVideo && (
              <button
                onClick={onJoinVideo}
                className="w-full bg-primary-600 text-white px-4 py-3 rounded-md hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM17 11.5v2.5M2 13v2.5" />
                </svg>
                <span>Join Video Consultation</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueStatus;
