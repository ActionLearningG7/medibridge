import React from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../feedback/ToastProvider';

/**
 * Call Controls Component
 *
 * Large, mobile-friendly buttons to control microphone, camera, and end call
 * Displays connection status and shows toast notifications on actions
 *
 * Features:
 * - Toggle microphone (mute/unmute)
 * - Toggle camera (on/off)
 * - End call button
 * - Connection status indicator
 * - Toast notifications for user feedback
 * - Large, touch-friendly buttons
 * - Visual feedback on hover/active states
 */
const CallControls = ({
  isMuted = false,
  isVideoOff = false,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  disabled = false,
  connectionStatus = 'connected', // idle, connecting, waiting, connected, ended
  connectionQuality = 'good', // excellent, good, fair, poor
}) => {
  const { showToast } = useToast();

  // Handle microphone toggle with toast
  const handleToggleMute = () => {
    if (disabled) return;

    onToggleMute();

    // Show toast feedback
    if (isMuted) {
      showToast.success('Microphone unmuted');
    } else {
      showToast.info('Microphone muted');
    }
  };

  // Handle camera toggle with toast
  const handleToggleVideo = () => {
    if (disabled) return;

    onToggleVideo();

    // Show toast feedback
    if (isVideoOff) {
      showToast.success('Camera turned on');
    } else {
      showToast.info('Camera turned off');
    }
  };

  // Handle end call with confirmation toast
  const handleEndCall = () => {
    if (disabled) return;

    showToast.info('Ending call...');
    onEndCall();
  };

  // Get connection status display
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          text: 'Connecting...',
          color: 'text-yellow-600',
          icon: (
            <svg className="animate-spin w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
        };
      case 'waiting':
        return {
          text: 'Waiting...',
          color: 'text-blue-600',
          icon: (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'connected':
        return {
          text: getQualityText(),
          color: getQualityColor(),
          icon: getQualityIcon(),
        };
      case 'ended':
        return {
          text: 'Call Ended',
          color: 'text-gray-600',
          icon: (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      default:
        return {
          text: 'Idle',
          color: 'text-gray-600',
          icon: null,
        };
    }
  };

  // Get connection quality text
  const getQualityText = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return 'Connected';
    }
  };

  // Get connection quality color
  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return 'text-green-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  };

  // Get connection quality icon
  const getQualityIcon = () => {
    const bars = connectionQuality === 'excellent' ? 4 : connectionQuality === 'good' ? 3 : connectionQuality === 'fair' ? 2 : 1;
    const color = getQualityColor().replace('text-', '');

    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-sm transition-all ${
              i < bars ? `bg-${color}` : 'bg-gray-300'
            }`}
            style={{ height: `${(i + 1) * 3}px` }}
          />
        ))}
      </div>
    );
  };

  const statusDisplay = getConnectionStatusDisplay();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm">
        {statusDisplay.icon}
        <span className={`text-sm font-medium ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4 md:space-x-6">
        {/* Toggle Microphone */}
        <button
          onClick={handleToggleMute}
          disabled={disabled}
          className={`
            group relative p-5 md:p-6 rounded-full transition-all duration-200 
            shadow-lg hover:shadow-xl active:scale-95
            ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            } 
            text-white 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
            focus:outline-none focus:ring-4 focus:ring-offset-2 
            ${isMuted ? 'focus:ring-red-500' : 'focus:ring-gray-500'}
          `}
          aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? (
            <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}

          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>

        {/* Toggle Camera */}
        <button
          onClick={handleToggleVideo}
          disabled={disabled}
          className={`
            group relative p-5 md:p-6 rounded-full transition-all duration-200 
            shadow-lg hover:shadow-xl active:scale-95
            ${
              isVideoOff
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            } 
            text-white 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
            focus:outline-none focus:ring-4 focus:ring-offset-2 
            ${isVideoOff ? 'focus:ring-red-500' : 'focus:ring-gray-500'}
          `}
          aria-label={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
          title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoOff ? (
            <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}

          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isVideoOff ? 'Turn On' : 'Turn Off'}
          </span>
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          disabled={disabled}
          className="
            group relative p-5 md:p-6 rounded-full bg-red-600 hover:bg-red-700
            text-white transition-all duration-200 shadow-lg hover:shadow-xl
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:shadow-lg focus:outline-none focus:ring-4
            focus:ring-red-500 focus:ring-offset-2
          "
          aria-label="End Call"
          title="End Call"
        >
          <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>

          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            End Call
          </span>
        </button>
      </div>

      {/* Mobile Labels (optional, hidden on desktop) */}
      <div className="flex md:hidden items-center justify-center space-x-8 text-xs text-gray-600">
        <span>{isMuted ? 'Muted' : 'Mic'}</span>
        <span>{isVideoOff ? 'Off' : 'Camera'}</span>
        <span className="text-red-600">End</span>
      </div>
    </div>
  );
};

CallControls.propTypes = {
  isMuted: PropTypes.bool,
  isVideoOff: PropTypes.bool,
  onToggleMute: PropTypes.func.isRequired,
  onToggleVideo: PropTypes.func.isRequired,
  onEndCall: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  connectionStatus: PropTypes.oneOf(['idle', 'connecting', 'waiting', 'connected', 'ended']),
  connectionQuality: PropTypes.oneOf(['excellent', 'good', 'fair', 'poor']),
};

export default CallControls;
