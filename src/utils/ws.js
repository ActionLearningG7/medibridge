/**
 * WebSocket Utilities
 *
 * Helper functions for WebSocket/WebRTC operations
 */

/**
 * Get WebSocket URL from environment
 */
export const getWebSocketUrl = () => {
  return process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';
};

/**
 * Validate signaling message
 */
export const isValidSignalMessage = (message) => {
  if (!message || typeof message !== 'object') {
    return false;
  }

  // Must have type
  if (!message.type) {
    return false;
  }

  // Valid types
  const validTypes = ['OFFER', 'ANSWER', 'ICE', 'JOIN', 'LEAVE', 'BYE'];
  if (!validTypes.includes(message.type)) {
    return false;
  }

  // OFFER and ANSWER must have sdp
  if ((message.type === 'OFFER' || message.type === 'ANSWER') && !message.sdp) {
    return false;
  }

  // ICE must have candidate
  if (message.type === 'ICE' && !message.candidate) {
    return false;
  }

  return true;
};

/**
 * Parse ICE candidate from string
 */
export const parseIceCandidate = (candidateStr) => {
  try {
    if (typeof candidateStr === 'string') {
      return JSON.parse(candidateStr);
    }
    return candidateStr;
  } catch (error) {
    console.error('Failed to parse ICE candidate:', error);
    return null;
  }
};

/**
 * Get role for signaling target
 * Returns opposite role
 */
export const getTargetRole = (myRole) => {
  if (myRole === 'DOCTOR') return 'PATIENT';
  if (myRole === 'PATIENT') return 'DOCTOR';
  return null;
};

/**
 * Format connection status for display
 */
export const formatConnectionStatus = (status) => {
  const statusMap = {
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    connected: 'Connected',
    error: 'Connection Error',
  };
  return statusMap[status] || 'Unknown';
};

/**
 * Check if WebSocket is supported
 */
export const isWebSocketSupported = () => {
  return 'WebSocket' in window || 'MozWebSocket' in window;
};

/**
 * Get WebSocket connection state name
 */
export const getWebSocketStateName = (readyState) => {
  const states = {
    0: 'CONNECTING',
    1: 'OPEN',
    2: 'CLOSING',
    3: 'CLOSED',
  };
  return states[readyState] || 'UNKNOWN';
};

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoffDelay = (attempt, baseDelay = 1000, maxDelay = 30000) => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (0-20% random variation)
  const jitter = delay * 0.2 * Math.random();
  return Math.floor(delay + jitter);
};

/**
 * Validate room ID format
 */
export const isValidRoomId = (roomId) => {
  if (!roomId || typeof roomId !== 'string') {
    return false;
  }

  // Must be UUID format (with or without dashes)
  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  return uuidRegex.test(roomId);
};

/**
 * Create signaling message payload
 */
export const createSignalPayload = (type, data = {}) => {
  const payload = {
    type,
    clientTs: Date.now(),
    ...data,
  };

  // Validate before returning
  if (!isValidSignalMessage(payload)) {
    console.warn('Invalid signal message created:', payload);
  }

  return payload;
};

/**
 * Log WebSocket event with emoji
 */
export const logWebSocketEvent = (event, data = {}) => {
  const eventEmojis = {
    connect: '🔌',
    disconnect: '🔴',
    message: '📨',
    error: '❌',
    reconnect: '🔄',
    subscribe: '📡',
    send: '📤',
  };

  const emoji = eventEmojis[event] || '📍';
  console.log(`${emoji} [WebSocket] ${event}:`, data);
};

/**
 * Get error message from WebSocket error
 */
export const getWebSocketErrorMessage = (error) => {
  if (!error) return 'Unknown error';

  if (typeof error === 'string') return error;

  if (error.message) return error.message;

  if (error.reason) return error.reason;

  return 'WebSocket connection failed';
};

/**
 * Check if error is recoverable (should retry)
 */
export const isRecoverableError = (error) => {
  if (!error) return false;

  const message = getWebSocketErrorMessage(error).toLowerCase();

  // Non-recoverable errors
  const nonRecoverable = [
    'unauthorized',
    'forbidden',
    'invalid token',
    'authentication failed',
    'max reconnection attempts',
  ];

  return !nonRecoverable.some((keyword) => message.includes(keyword));
};

/**
 * Format duration in seconds to MM:SS
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Debounce function for signaling
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for signaling
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  getWebSocketUrl,
  isValidSignalMessage,
  parseIceCandidate,
  getTargetRole,
  formatConnectionStatus,
  isWebSocketSupported,
  getWebSocketStateName,
  calculateBackoffDelay,
  isValidRoomId,
  createSignalPayload,
  logWebSocketEvent,
  getWebSocketErrorMessage,
  isRecoverableError,
  formatDuration,
  debounce,
  throttle,
};
