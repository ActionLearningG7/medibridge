import React from 'react';
import PropTypes from 'prop-types';
import DeviceStatus from './DeviceStatus';

/**
 * Call Header Component
 *
 * Shows participant info, connection status, and device status
 */
const CallHeader = ({
  participantName,
  participantRole,
  connectionStatus, // 'idle', 'connecting', 'waiting', 'connected', 'ended'
  duration = '00:00',
  microphoneOn = true,
  cameraOn = true,
  connectionQuality = 'good',
}) => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'idle':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          message: 'Ready to start consultation',
        };
      case 'connecting':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
          message: 'Connecting to consultation...',
        };
      case 'waiting':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          message: `Waiting for ${participantRole || 'participant'} to join...`,
        };
      case 'connected':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          message: `Connected with ${participantName || participantRole}`,
        };
      case 'ended':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          message: 'Consultation ended',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: null,
          message: 'Status unknown',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Status Banner */}
        <div className="flex items-center space-x-4 flex-1">
          <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}>
            <div className={statusConfig.text}>
              {statusConfig.icon}
            </div>
            <div>
              <p className={`text-sm font-medium ${statusConfig.text}`}>
                {statusConfig.message}
              </p>
              {connectionStatus === 'connected' && duration && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Duration: {duration}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Device Status */}
        {connectionStatus === 'connected' && (
          <DeviceStatus
            microphoneOn={microphoneOn}
            cameraOn={cameraOn}
            connectionQuality={connectionQuality}
          />
        )}
      </div>
    </div>
  );
};

CallHeader.propTypes = {
  participantName: PropTypes.string,
  participantRole: PropTypes.string,
  connectionStatus: PropTypes.oneOf(['idle', 'connecting', 'waiting', 'connected', 'ended']),
  duration: PropTypes.string,
  microphoneOn: PropTypes.bool,
  cameraOn: PropTypes.bool,
  connectionQuality: PropTypes.oneOf(['excellent', 'good', 'fair', 'poor']),
};

export default CallHeader;
