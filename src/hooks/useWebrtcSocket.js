import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import webrtcWsClient from '../features/appointment/ws/webrtcWsClient';

/**
 * useWebrtcSocket Hook
 *
 * React hook for managing WebRTC WebSocket connection with edge case handling
 *
 * Features:
 * - Connection lifecycle management
 * - Signaling methods
 * - Connection status tracking
 * - Auto-reconnect with exponential backoff
 * - Reconnect banner display
 * - BYE signal forwarding
 *
 * Edge Cases Handled:
 * - WS disconnect → show banner + auto-reconnect
 * - Connection error → retry with exponential backoff
 * - BYE signal → forward to peer handler
 * - Do not auto-logout on FETCH_ERROR
 */
const useWebrtcSocket = (roomId, options = {}) => {
  const { token } = useSelector((state) => state.auth);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error, reconnecting
  const [error, setError] = useState(null);
  const [lastSignal, setLastSignal] = useState(null);
  const [presenceEvents, setPresenceEvents] = useState([]);
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Refs for callbacks to avoid re-renders
  const onSignalRef = useRef(options.onSignal);
  const onPresenceRef = useRef(options.onPresence);
  const onConnectedRef = useRef(options.onConnected);
  const onDisconnectedRef = useRef(options.onDisconnected);
  const onErrorRef = useRef(options.onError);

  // Reconnect logic
  const reconnectTimeoutRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const INITIAL_RECONNECT_DELAY = 1000; // 1 second
  const MAX_RECONNECT_DELAY = 30000; // 30 seconds

  // Update refs when callbacks change
  useEffect(() => {
    onSignalRef.current = options.onSignal;
    onPresenceRef.current = options.onPresence;
    onConnectedRef.current = options.onConnected;
    onDisconnectedRef.current = options.onDisconnected;
    onErrorRef.current = options.onError;
  }, [options.onSignal, options.onPresence, options.onConnected, options.onDisconnected, options.onError]);

  /**
   * Calculate exponential backoff delay for reconnect
   */
  const getReconnectDelay = useCallback((attemptNumber) => {
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, attemptNumber),
      MAX_RECONNECT_DELAY
    );
    // Add jitter (randomness) to prevent thundering herd
    return delay + Math.random() * 1000;
  }, []);

  /**
   * Handle signal received
   */
  const handleSignal = useCallback((signal) => {
    console.log('📨 [useWebrtcSocket] Signal received:', signal.type);
    setLastSignal(signal);

    if (onSignalRef.current) {
      onSignalRef.current(signal);
    }
  }, []);

  /**
   * Handle presence event
   */
  const handlePresence = useCallback((event) => {
    console.log('👥 [useWebrtcSocket] Presence event:', event.eventType);
    setPresenceEvents((prev) => [...prev.slice(-9), event]); // Keep last 10 events

    if (onPresenceRef.current) {
      onPresenceRef.current(event);
    }
  }, []);

  /**
   * Handle connected
   */
  const handleConnected = useCallback(() => {
    console.log('✅ [useWebrtcSocket] Connected');
    setIsConnected(true);
    setConnectionStatus('connected');
    setError(null);
    setShowReconnectBanner(false);
    setReconnectAttempts(0);

    if (onConnectedRef.current) {
      onConnectedRef.current();
    }
  }, []);

  /**
   * Handle disconnected with reconnect logic
   */
  const handleDisconnected = useCallback(() => {
    console.log('🔌 [useWebrtcSocket] Disconnected');
    setIsConnected(false);
    setConnectionStatus('reconnecting');
    setShowReconnectBanner(true);

    if (onDisconnectedRef.current) {
      onDisconnectedRef.current();
    }

    // Auto-reconnect with exponential backoff
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = getReconnectDelay(reconnectAttempts);
      console.log(`🔄 [useWebrtcSocket] Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempts((prev) => prev + 1);
        setConnectionStatus('connecting');
        attemptReconnect();
      }, delay);
    } else {
      console.error('❌ [useWebrtcSocket] Max reconnect attempts reached');
      setConnectionStatus('error');
      setError({
        message: 'Unable to reconnect after multiple attempts. Please refresh the page.',
        type: 'max_reconnect_attempts',
      });
      setShowReconnectBanner(false);
    }
  }, [reconnectAttempts, MAX_RECONNECT_ATTEMPTS, getReconnectDelay]);
    console.log('🔌 [useWebrtcSocket] Disconnected');
    setIsConnected(false);
    setConnectionStatus('disconnected');

    if (onDisconnectedRef.current) {
      onDisconnectedRef.current();
    }
  }, []);

  /**
   * Handle error - DO NOT auto logout on FETCH_ERROR
   */
  const handleError = useCallback((err) => {
    console.error('❌ [useWebrtcSocket] Error:', err);

    // Check if this is a FETCH_ERROR
    const isFetchError = err?.type === 'FETCH_ERROR' || err?.status === 'error';

    if (isFetchError) {
      console.warn('⚠️ [useWebrtcSocket] FETCH_ERROR detected - NOT triggering logout');
      // Show reconnect banner but do NOT logout
      setShowReconnectBanner(true);
      setConnectionStatus('reconnecting');
    } else {
      setError(err);
      setConnectionStatus('error');
    }

    if (onErrorRef.current) {
      onErrorRef.current(err);
    }
  }, []);

  /**
   * Attempt reconnect to WebSocket
   */
  const attemptReconnect = useCallback(() => {
    if (!roomId || !token) {
      console.error('❌ [useWebrtcSocket] Cannot reconnect: Missing roomId or token');
      return;
    }

    console.log('🔄 [useWebrtcSocket] Attempting to reconnect...');
    connect();
  }, [roomId, token]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!roomId) {
      console.warn('⚠️ [useWebrtcSocket] Cannot connect: No room ID');
      return;
    }

    if (!token) {
      console.warn('⚠️ [useWebrtcSocket] Cannot connect: No token');
      setError(new Error('Authentication token not available'));
      return;
    }

    console.log('🔌 [useWebrtcSocket] Connecting to room:', roomId);
    setConnectionStatus('connecting');
    setError(null);

    webrtcWsClient.connect(roomId, token, {
      onSignal: handleSignal,
      onPresence: handlePresence,
      onConnected: handleConnected,
      onDisconnected: handleDisconnected,
      onError: handleError,
    });
  }, [roomId, token, handleSignal, handlePresence, handleConnected, handleDisconnected, handleError]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    console.log('🔌 [useWebrtcSocket] Disconnecting...');
    webrtcWsClient.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  /**
   * Send signal
   */
  const sendSignal = useCallback((payload) => {
    if (!isConnected) {
      console.warn('⚠️ [useWebrtcSocket] Cannot send signal: Not connected');
      return false;
    }
    return webrtcWsClient.sendSignal(payload);
  }, [isConnected]);

  /**
   * Send OFFER
   */
  const sendOffer = useCallback((sdp, targetRole) => {
    return webrtcWsClient.sendOffer(sdp, targetRole);
  }, []);

  /**
   * Send ANSWER
   */
  const sendAnswer = useCallback((sdp, targetRole) => {
    return webrtcWsClient.sendAnswer(sdp, targetRole);
  }, []);

  /**
   * Send ICE candidate
   */
  const sendIceCandidate = useCallback((candidate, targetRole) => {
    return webrtcWsClient.sendIceCandidate(candidate, targetRole);
  }, []);

  /**
   * Send LEAVE
   */
  const sendLeave = useCallback(() => {
    return webrtcWsClient.sendLeave();
  }, []);

  /**
   * Auto-connect when roomId and token are available
   * Cleanup on unmount or navigation
   */
  useEffect(() => {
    if (roomId && token && options.autoConnect !== false) {
      connect();
    }

    // Cleanup on unmount or when roomId changes
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (roomId) {
        disconnect();
      }
      console.log('🧹 [useWebrtcSocket] Cleanup on unmount');
    };
  }, [roomId, token, connect, disconnect]); // Include connect/disconnect now

  return {
    // State
    isConnected,
    connectionStatus,
    error,
    lastSignal,
    presenceEvents,
    showReconnectBanner,
    reconnectAttempts,

    // Methods
    connect,
    disconnect,
    attemptReconnect,
    sendSignal,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendLeave,
  };
};

export default useWebrtcSocket;
