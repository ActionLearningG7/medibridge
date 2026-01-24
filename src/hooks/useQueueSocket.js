/**
 * useQueueSocket Hook
 * Custom React hook for WebSocket queue updates
 *
 * Features:
 * - Automatic connection management with JWT
 * - Subscribe to queue-specific topics
 * - Fallback to polling on disconnect
 * - Automatic cleanup on unmount
 * - Real-time updates for patients and doctors
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../features/auth/authSlice';
import wsClient from '../features/appointment/ws/wsClient';

/**
 * Hook for patient queue updates
 * Subscribes to user-specific queue events
 * Falls back to polling every 15s if WebSocket disconnects
 */
export const usePatientQueueSocket = (refetchCallback) => {
  const token = useSelector(selectAccessToken);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const subscriptionIdRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (isPolling || pollingIntervalRef.current) return;

    console.log('[usePatientQueueSocket] Starting polling fallback');
    setIsPolling(true);

    // Poll every 15 seconds
    pollingIntervalRef.current = setInterval(() => {
      console.log('[usePatientQueueSocket] Polling queue status...');
      if (refetchCallback) {
        refetchCallback();
      }
    }, 15000);
  }, [isPolling, refetchCallback]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[usePatientQueueSocket] Stopping polling fallback');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
  }, []);

  // Handle WebSocket message
  const handleMessage = useCallback((data) => {
    console.log('[usePatientQueueSocket] Queue update received:', data);

    // Stop polling since WebSocket is working
    stopPolling();

    // Trigger refetch with new data
    if (refetchCallback) {
      refetchCallback();
    }
  }, [refetchCallback, stopPolling]);

  // Setup WebSocket connection and subscription
  useEffect(() => {
    if (!token) {
      console.log('[usePatientQueueSocket] No token available');
      return;
    }

    let mounted = true;

    const setupWebSocket = async () => {
      try {
        // Connect to WebSocket
        await wsClient.connect(token);

        if (!mounted) return;

        setIsConnected(true);
        stopPolling(); // Stop polling if it was running

        // Subscribe to user-specific queue updates
        const subscriptionId = wsClient.subscribe('/user/queue/updates', handleMessage);
        subscriptionIdRef.current = subscriptionId;

        console.log('[usePatientQueueSocket] Subscribed to /user/queue/updates');
      } catch (error) {
        console.error('[usePatientQueueSocket] Connection error:', error);
        if (mounted) {
          setIsConnected(false);
          startPolling(); // Fallback to polling
        }
      }
    };

    setupWebSocket();

    // Register connection callbacks
    const unregisterConnect = wsClient.onConnect(() => {
      if (mounted) {
        setIsConnected(true);
        stopPolling();
      }
    });

    const unregisterDisconnect = wsClient.onDisconnect(() => {
      if (mounted) {
        setIsConnected(false);
        startPolling(); // Fallback to polling on disconnect
      }
    });

    // Cleanup
    return () => {
      mounted = false;

      // Unsubscribe from topic
      if (subscriptionIdRef.current) {
        wsClient.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }

      // Stop polling
      stopPolling();

      // Unregister callbacks
      unregisterConnect();
      unregisterDisconnect();
    };
  }, [token, handleMessage, startPolling, stopPolling]);

  return {
    isConnected,
    isPolling,
    wsStatus: wsClient.getStatus(),
  };
};

/**
 * Hook for doctor queue updates
 * Subscribes to queue-specific events for the doctor's queue
 * Falls back to polling if WebSocket disconnects
 */
export const useDoctorQueueSocket = (queueId, refetchCallback) => {
  const token = useSelector(selectAccessToken);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const subscriptionIdRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (isPolling || pollingIntervalRef.current) return;

    console.log('[useDoctorQueueSocket] Starting polling fallback');
    setIsPolling(true);

    // Poll every 10 seconds for doctors (more frequent)
    pollingIntervalRef.current = setInterval(() => {
      console.log('[useDoctorQueueSocket] Polling queue status...');
      if (refetchCallback) {
        refetchCallback();
      }
    }, 10000);
  }, [isPolling, refetchCallback]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[useDoctorQueueSocket] Stopping polling fallback');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
  }, []);

  // Handle WebSocket message
  const handleMessage = useCallback((data) => {
    console.log('[useDoctorQueueSocket] Queue update received:', data);

    // Stop polling since WebSocket is working
    stopPolling();

    // Trigger refetch with new data
    if (refetchCallback) {
      refetchCallback();
    }
  }, [refetchCallback, stopPolling]);

  // Setup WebSocket connection and subscription
  useEffect(() => {
    if (!token || !queueId) {
      console.log('[useDoctorQueueSocket] Missing token or queueId');
      return;
    }

    let mounted = true;

    const setupWebSocket = async () => {
      try {
        // Connect to WebSocket
        await wsClient.connect(token);

        if (!mounted) return;

        setIsConnected(true);
        stopPolling(); // Stop polling if it was running

        // Subscribe to queue-specific topic
        const topic = `/topic/queue/${queueId}`;
        const subscriptionId = wsClient.subscribe(topic, handleMessage);
        subscriptionIdRef.current = subscriptionId;

        console.log('[useDoctorQueueSocket] Subscribed to:', topic);
      } catch (error) {
        console.error('[useDoctorQueueSocket] Connection error:', error);
        if (mounted) {
          setIsConnected(false);
          startPolling(); // Fallback to polling
        }
      }
    };

    setupWebSocket();

    // Register connection callbacks
    const unregisterConnect = wsClient.onConnect(() => {
      if (mounted) {
        setIsConnected(true);
        stopPolling();
      }
    });

    const unregisterDisconnect = wsClient.onDisconnect(() => {
      if (mounted) {
        setIsConnected(false);
        startPolling(); // Fallback to polling on disconnect
      }
    });

    // Cleanup
    return () => {
      mounted = false;

      // Unsubscribe from topic
      if (subscriptionIdRef.current) {
        wsClient.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }

      // Stop polling
      stopPolling();

      // Unregister callbacks
      unregisterConnect();
      unregisterDisconnect();
    };
  }, [token, queueId, handleMessage, startPolling, stopPolling]);

  return {
    isConnected,
    isPolling,
    wsStatus: wsClient.getStatus(),
  };
};

/**
 * Generic hook for any WebSocket topic
 * Flexible subscription with custom callback
 */
export const useWebSocketTopic = (topic, callback, enabled = true) => {
  const token = useSelector(selectAccessToken);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionIdRef = useRef(null);

  useEffect(() => {
    if (!token || !enabled || !topic) {
      return;
    }

    let mounted = true;

    const setupWebSocket = async () => {
      try {
        await wsClient.connect(token);

        if (!mounted) return;

        setIsConnected(true);

        const subscriptionId = wsClient.subscribe(topic, callback);
        subscriptionIdRef.current = subscriptionId;

        console.log('[useWebSocketTopic] Subscribed to:', topic);
      } catch (error) {
        console.error('[useWebSocketTopic] Connection error:', error);
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    setupWebSocket();

    const unregisterConnect = wsClient.onConnect(() => {
      if (mounted) setIsConnected(true);
    });

    const unregisterDisconnect = wsClient.onDisconnect(() => {
      if (mounted) setIsConnected(false);
    });

    return () => {
      mounted = false;

      if (subscriptionIdRef.current) {
        wsClient.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }

      unregisterConnect();
      unregisterDisconnect();
    };
  }, [token, topic, callback, enabled]);

  return {
    isConnected,
    wsStatus: wsClient.getStatus(),
    sendMessage: (destination, body) => wsClient.send(destination, body),
  };
};

export default usePatientQueueSocket;
