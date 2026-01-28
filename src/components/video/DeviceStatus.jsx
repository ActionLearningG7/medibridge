import React from 'react';
import PropTypes from 'prop-types';

/**
 * Device Status Component
 *
 * Displays current device status (camera, microphone, connection)
 * Shows permission errors and device availability
 *
 * Features:
 * - Camera status (on/off/blocked/unavailable)
 * - Microphone status (on/off/blocked/unavailable)
 * - Connection quality indicator
 * - Visual icons for each status
 * - No PHI displayed
 */
const DeviceStatus = ({
  cameraStatus = 'on', // on, off, blocked, unavailable, error
  microphoneStatus = 'on', // on, off, blocked, unavailable, error
  connectionQuality = 'good', // excellent, good, fair, poor
  showLabels = true,
  compact = false,
}) => {
  // Get camera status display
  const getCameraDisplay = () => {
    switch (cameraStatus) {
      case 'on':
        return {
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          text: 'Camera On',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'off':
        return {
          icon: (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ),
          text: 'Camera Off',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
      case 'blocked':
        return {
          icon: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          text: 'Camera Blocked',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      case 'unavailable':
        return {
          icon: (
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          text: 'No Camera',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      case 'error':
        return {
          icon: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          text: 'Camera Error',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: null,
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  // Get microphone status display
  const getMicrophoneDisplay = () => {
    switch (microphoneStatus) {
      case 'on':
        return {
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ),
          text: 'Mic On',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'off':
        return {
          icon: (
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Mic Off',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
      case 'blocked':
        return {
          icon: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          text: 'Mic Blocked',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      case 'unavailable':
        return {
          icon: (
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          text: 'No Mic',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      case 'error':
        return {
          icon: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          text: 'Mic Error',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: null,
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  // Get connection quality display
  const getConnectionDisplay = () => {
    switch (connectionQuality) {
      case 'excellent':
        return {
          icon: (
            <div className="flex items-center space-x-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-600 rounded-sm"
                  style={{ height: `${(i + 1) * 3}px` }}
                />
              ))}
            </div>
          ),
          text: 'Excellent',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'good':
        return {
          icon: (
            <div className="flex items-center space-x-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-sm ${i < 3 ? 'bg-green-600' : 'bg-gray-300'}`}
                  style={{ height: `${(i + 1) * 3}px` }}
                />
              ))}
            </div>
          ),
          text: 'Good',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'fair':
        return {
          icon: (
            <div className="flex items-center space-x-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-sm ${i < 2 ? 'bg-yellow-600' : 'bg-gray-300'}`}
                  style={{ height: `${(i + 1) * 3}px` }}
                />
              ))}
            </div>
          ),
          text: 'Fair',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      case 'poor':
        return {
          icon: (
            <div className="flex items-center space-x-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-sm ${i < 1 ? 'bg-red-600' : 'bg-gray-300'}`}
                  style={{ height: `${(i + 1) * 3}px` }}
                />
              ))}
            </div>
          ),
          text: 'Poor',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: null,
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const camera = getCameraDisplay();
  const microphone = getMicrophoneDisplay();
  const connection = getConnectionDisplay();

  if (compact) {
    // Compact view (icons only)
    return (
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded ${camera.bgColor}`} title={camera.text}>
          {camera.icon}
        </div>
        <div className={`p-2 rounded ${microphone.bgColor}`} title={microphone.text}>
          {microphone.icon}
        </div>
        <div className={`p-2 rounded ${connection.bgColor}`} title={connection.text}>
          {connection.icon}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="flex flex-col space-y-2">
      {/* Camera Status */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${camera.bgColor}`}>
        {camera.icon}
        {showLabels && (
          <span className={`text-sm font-medium ${camera.color}`}>
            {camera.text}
          </span>
        )}
      </div>

      {/* Microphone Status */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${microphone.bgColor}`}>
        {microphone.icon}
        {showLabels && (
          <span className={`text-sm font-medium ${microphone.color}`}>
            {microphone.text}
          </span>
        )}
      </div>

      {/* Connection Quality */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${connection.bgColor}`}>
        {connection.icon}
        {showLabels && (
          <span className={`text-sm font-medium ${connection.color}`}>
            {connection.text}
          </span>
        )}
      </div>
    </div>
  );
};

DeviceStatus.propTypes = {
  cameraStatus: PropTypes.oneOf(['on', 'off', 'blocked', 'unavailable', 'error']),
  microphoneStatus: PropTypes.oneOf(['on', 'off', 'blocked', 'unavailable', 'error']),
  connectionQuality: PropTypes.oneOf(['excellent', 'good', 'fair', 'poor']),
  showLabels: PropTypes.bool,
  compact: PropTypes.bool,
};


export default DeviceStatus;
