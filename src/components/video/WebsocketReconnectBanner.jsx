import React from 'react';
import PropTypes from 'prop-types';

/**
 * WebSocket Reconnect Banner Component
 *
 * Shows when WebSocket connection is lost
 * Displays reconnect attempts and retry button
 */
const WebsocketReconnectBanner = ({
  show,
  reconnectAttempts,
  onRetry,
  maxAttempts = 5
}) => {
  if (!show) return null;

  const isMaxAttemptsReached = reconnectAttempts >= maxAttempts;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Message */}
        <div className="flex items-center space-x-3 flex-1">
          {isMaxAttemptsReached ? (
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="animate-spin w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}

          <div className="flex-1">
            {isMaxAttemptsReached ? (
              <p className="text-sm font-medium text-red-900">
                Connection lost. Please refresh the page to reconnect.
              </p>
            ) : (
              <p className="text-sm font-medium text-yellow-900">
                Connection lost. Reconnecting... (Attempt {reconnectAttempts + 1}/{maxAttempts})
              </p>
            )}
          </div>
        </div>

        {/* Retry Button */}
        {isMaxAttemptsReached && (
          <button
            onClick={onRetry}
            className="ml-4 px-4 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 transition-colors whitespace-nowrap"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

WebsocketReconnectBanner.propTypes = {
  show: PropTypes.bool.isRequired,
  reconnectAttempts: PropTypes.number.isRequired,
  onRetry: PropTypes.func.isRequired,
  maxAttempts: PropTypes.number,
};

export default WebsocketReconnectBanner;
