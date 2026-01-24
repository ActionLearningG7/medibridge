import React from 'react';
import PropTypes from 'prop-types';

/**
 * Permission Gate Component
 *
 * Shows permission errors and provides instructions to fix
 * Displays when camera/microphone permissions are blocked
 *
 * Features:
 * - Clear error messages
 * - Browser-specific instructions (Chrome, Firefox, Safari, Edge)
 * - Visual guidance with icons
 * - Retry button
 * - No PHI displayed
 */
const PermissionGate = ({
  permissionError = null, // { type: 'camera' | 'microphone' | 'both', error: Error }
  onRetry,
  onCancel,
}) => {
  if (!permissionError) return null;

  const { type, error } = permissionError;

  // Detect browser
  const getBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('edg')) return 'edge';
    return 'unknown';
  };

  const browser = getBrowser();

  // Get error title and description
  const getErrorInfo = () => {
    const errorName = error?.name || '';

    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
      return {
        title: `${type === 'both' ? 'Camera and Microphone' : type === 'camera' ? 'Camera' : 'Microphone'} Access Denied`,
        description: 'You blocked camera/microphone permissions. Please allow access to continue.',
        icon: (
          <svg className="w-16 h-16 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
      };
    } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
      return {
        title: `No ${type === 'both' ? 'Camera or Microphone' : type === 'camera' ? 'Camera' : 'Microphone'} Found`,
        description: 'Please connect a camera/microphone to your device.',
        icon: (
          <svg className="w-16 h-16 text-yellow-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
      return {
        title: `${type === 'camera' ? 'Camera' : 'Microphone'} Already in Use`,
        description: 'Another application is using your camera/microphone. Please close it and try again.',
        icon: (
          <svg className="w-16 h-16 text-yellow-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    } else if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
      return {
        title: 'Device Settings Not Supported',
        description: 'Your camera/microphone does not support the required settings.',
        icon: (
          <svg className="w-16 h-16 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    } else if (errorName === 'SecurityError') {
      return {
        title: 'Security Error',
        description: 'Camera/microphone access is not allowed in this context. Please use HTTPS.',
        icon: (
          <svg className="w-16 h-16 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
      };
    } else {
      return {
        title: 'Camera/Microphone Access Error',
        description: error?.message || 'Failed to access camera/microphone.',
        icon: (
          <svg className="w-16 h-16 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    }
  };

  // Get browser-specific instructions
  const getBrowserInstructions = () => {
    switch (browser) {
      case 'chrome':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">Chrome Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click the <strong>lock icon</strong> in the address bar</li>
              <li>Find "Camera" and "Microphone" permissions</li>
              <li>Change to <strong>"Allow"</strong></li>
              <li>Refresh the page</li>
            </ol>
            <p className="text-xs text-gray-600 mt-2">
              Or go to <strong>chrome://settings/content</strong>
            </p>
          </div>
        );
      case 'firefox':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">Firefox Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click the <strong>camera/microphone icon</strong> in the address bar</li>
              <li>Click "Remove Blocked"</li>
              <li>Refresh the page</li>
              <li>Click "Allow" when prompted</li>
            </ol>
            <p className="text-xs text-gray-600 mt-2">
              Or go to <strong>Preferences → Privacy & Security → Permissions</strong>
            </p>
          </div>
        );
      case 'safari':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">Safari Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Go to <strong>Safari → Settings for This Website</strong></li>
              <li>Find "Camera" and "Microphone"</li>
              <li>Change to <strong>"Allow"</strong></li>
              <li>Refresh the page</li>
            </ol>
            <p className="text-xs text-gray-600 mt-2">
              Or go to <strong>System Preferences → Security & Privacy</strong>
            </p>
          </div>
        );
      case 'edge':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">Edge Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click the <strong>lock icon</strong> in the address bar</li>
              <li>Find "Camera" and "Microphone" permissions</li>
              <li>Change to <strong>"Allow"</strong></li>
              <li>Refresh the page</li>
            </ol>
            <p className="text-xs text-gray-600 mt-2">
              Or go to <strong>edge://settings/content</strong>
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">General Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Check browser permissions for this site</li>
              <li>Allow camera and microphone access</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        );
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          {errorInfo.icon}
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h3>
          <p className="text-gray-600">
            {errorInfo.description}
          </p>
        </div>

        {/* Browser Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {getBrowserInstructions()}
        </div>

        {/* Additional Help */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-medium mb-2">Still having issues?</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Make sure no other application is using your camera/microphone</li>
            <li>Check if your camera/microphone is properly connected</li>
            <li>Try restarting your browser</li>
            <li>Check your system privacy settings</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Try Again
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Error Details (for debugging) */}
        {error && (
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Technical Details</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs">
              <p><strong>Error:</strong> {error.name}</p>
              <p><strong>Message:</strong> {error.message}</p>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

PermissionGate.propTypes = {
  permissionError: PropTypes.shape({
    type: PropTypes.oneOf(['camera', 'microphone', 'both']).isRequired,
    error: PropTypes.instanceOf(Error),
  }),
  onRetry: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default PermissionGate;
