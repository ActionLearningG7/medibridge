/**
 * useQueueWebSocket Hook
 * Manages real-time queue updates via STOMP WebSocket
 *
 * FIXES:
 * - Prevents multiple WebSocket connections from opening
 * - Properly cleans up subscriptions on unmount
 * - Only connects once when component mounts
 * - Uses stable refs to prevent infinite reconnects
 *
 * Usage:
 * const { queues, isConnected, error } = useQueueWebSocket();
 */

import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useQueueWebSocket = (onQueueUpdate = null) => {
  const [queues, setQueues] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to track the client instance and subscriptions
  const clientRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current || clientRef.current?.active) {
      return;
    }

    isConnectingRef.current = true;

    const connectWebSocket = () => {
      try {
        const socket = new SockJS(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/ws`
        );

        const client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          // Disable debug logging in production to reduce noise
          debug: (msg) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[STOMP Debug]', msg);
            }
          },

          onConnect: () => {
            console.log('[Queue WebSocket] Connected');
            setIsConnected(true);
            setError(null);

            // Clear any previous subscriptions
            subscriptionsRef.current.forEach(sub => {
              if (sub && typeof sub.unsubscribe === 'function') {
                sub.unsubscribe();
              }
            });
            subscriptionsRef.current = [];

            // Subscribe to all queues updates
            const queuesSub = client.subscribe('/topic/admin/queues', (message) => {
              try {
                const data = JSON.parse(message.body);
                setQueues(data);
                if (typeof onQueueUpdate === 'function') {
                  onQueueUpdate(data);
                }
              } catch (e) {
                console.error('[Queue WebSocket] Error parsing queue update', e);
              }
            });
            subscriptionsRef.current.push(queuesSub);

            // Subscribe to statistics updates
            const statsSub = client.subscribe(
              '/topic/admin/queues/statistics',
              (message) => {
                try {
                  const stats = JSON.parse(message.body);
                  console.log('[Queue WebSocket] Statistics received', stats);
                } catch (e) {
                  console.error('[Queue WebSocket] Error parsing statistics', e);
                }
              }
            );
            subscriptionsRef.current.push(statsSub);

            isConnectingRef.current = false;
          },

          onDisconnect: () => {
            console.log('[Queue WebSocket] Disconnected');
            setIsConnected(false);
            isConnectingRef.current = false;
          },

          onStompError: (frame) => {
            console.error('[Queue WebSocket] STOMP Error', frame);
            setError(frame.headers?.['message'] || 'WebSocket connection error');
            setIsConnected(false);
            isConnectingRef.current = false;
          },

          // Automatic reconnection strategy
          reconnectDelay: 5000, // Retry after 5 seconds
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        clientRef.current = client;
        client.activate();

      } catch (e) {
        console.error('[Queue WebSocket] Connection failed', e);
        setError(e.message);
        isConnectingRef.current = false;
      }
    };

    connectWebSocket();

    // Cleanup function: properly close connection on unmount
    return () => {
      // Only disconnect if this is unmounting (not a dependency change)
      if (clientRef.current?.active) {
        console.log('[Queue WebSocket] Cleaning up connection');

        // Unsubscribe from all topics
        subscriptionsRef.current.forEach(sub => {
          if (sub && typeof sub.unsubscribe === 'function') {
            sub.unsubscribe();
          }
        });
        subscriptionsRef.current = [];

        // Deactivate the client
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    queues,
    isConnected,
    error,
  };
};

export default useQueueWebSocket;
