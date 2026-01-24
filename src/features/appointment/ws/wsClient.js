/**
 * WebSocket STOMP Client for Real-Time Queue Updates
 * Connects to appointment_service WebSocket with JWT authentication
 *
 * Architecture:
 * - Uses SockJS for fallback transports (polling, streaming)
 * - STOMP protocol for pub/sub messaging
 * - JWT token in CONNECT headers for authentication
 * - Automatic reconnection with exponential backoff
 * - Heartbeat for connection health monitoring
 *
 * Topics:
 * - /topic/queue/{queueId} - Queue-specific events (for doctors)
 * - /user/queue/updates - User-specific queue updates (for patients)
 * - /topic/video/{roomId} - Video signaling (separate feature)
 */

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.connectionCallbacks = new Set();
    this.disconnectionCallbacks = new Set();
    this.errorCallbacks = new Set();
  }

  /**
   * Connect to WebSocket with JWT authentication
   * @param {string} token - JWT access token
   * @returns {Promise<void>}
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        console.log('[WebSocket] Already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('[WebSocket] Connection in progress');
        return;
      }

      this.isConnecting = true;

      try {
        // Get WebSocket URL from environment
        const wsUrl = process.env.REACT_APP_APPOINTMENT_WS_URL || 'http://localhost:8080/ws';

        console.log('[WebSocket] Connecting to:', wsUrl);

        // Create SockJS connection
        const socket = new SockJS(wsUrl);

        // Create STOMP client over SockJS
        this.client = Stomp.over(socket);

        // Configure client
        this.client.reconnectDelay = 0; // Disable auto-reconnect, we handle it manually
        this.client.heartbeatIncoming = 10000; // 10 seconds
        this.client.heartbeatOutgoing = 10000; // 10 seconds

        // Debug logging (disable in production)
        if (process.env.NODE_ENV === 'development') {
          this.client.debug = (msg) => {
            console.log('[WebSocket Debug]', msg);
          };
        } else {
          this.client.debug = () => {}; // Disable debug in production
        }

        // STOMP connect headers with JWT
        const connectHeaders = {
          Authorization: `Bearer ${token}`,
        };

        // Connect to STOMP broker
        this.client.connect(
          connectHeaders,
          (frame) => {
            console.log('[WebSocket] Connected:', frame);
            this.isConnected = true;
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000; // Reset delay

            // Notify connection callbacks
            this.connectionCallbacks.forEach((callback) => {
              try {
                callback(frame);
              } catch (error) {
                console.error('[WebSocket] Connection callback error:', error);
              }
            });

            resolve();
          },
          (error) => {
            console.error('[WebSocket] Connection error:', error);
            this.isConnected = false;
            this.isConnecting = false;

            // Notify error callbacks
            this.errorCallbacks.forEach((callback) => {
              try {
                callback(error);
              } catch (err) {
                console.error('[WebSocket] Error callback error:', err);
              }
            });

            // Attempt reconnection
            this.scheduleReconnect(token);

            reject(error);
          }
        );

        // Handle transport close
        socket.onclose = () => {
          console.log('[WebSocket] Transport closed');
          this.handleDisconnect(token);
        };

      } catch (error) {
        console.error('[WebSocket] Connection setup error:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Handle disconnection
   */
  handleDisconnect(token) {
    if (!this.isConnected) return;

    console.log('[WebSocket] Disconnected');
    this.isConnected = false;

    // Clear all subscriptions
    this.subscriptions.clear();

    // Notify disconnection callbacks
    this.disconnectionCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('[WebSocket] Disconnection callback error:', error);
      }
    });

    // Attempt reconnection
    this.scheduleReconnect(token);
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      console.log('[WebSocket] Attempting reconnection...');
      this.connect(token).catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (!this.client) return;

    console.log('[WebSocket] Disconnecting...');

    // Unsubscribe all
    this.subscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('[WebSocket] Error unsubscribing:', error);
      }
    });
    this.subscriptions.clear();

    // Disconnect client
    try {
      this.client.disconnect(() => {
        console.log('[WebSocket] Disconnected');
      });
    } catch (error) {
      console.error('[WebSocket] Error disconnecting:', error);
    }

    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Subscribe to a topic
   * @param {string} destination - Topic destination (e.g., '/topic/queue/123')
   * @param {function} callback - Message callback
   * @returns {string} Subscription ID
   */
  subscribe(destination, callback) {
    if (!this.isConnected) {
      console.error('[WebSocket] Cannot subscribe - not connected');
      return null;
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('[WebSocket] Message received:', destination, data);
          callback(data);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
          callback({ error: 'Failed to parse message' });
        }
      });

      const subscriptionId = subscription.id;
      this.subscriptions.set(subscriptionId, subscription);

      console.log('[WebSocket] Subscribed to:', destination, 'ID:', subscriptionId);

      return subscriptionId;
    } catch (error) {
      console.error('[WebSocket] Error subscribing:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from a topic
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      console.warn('[WebSocket] Subscription not found:', subscriptionId);
      return;
    }

    try {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      console.log('[WebSocket] Unsubscribed:', subscriptionId);
    } catch (error) {
      console.error('[WebSocket] Error unsubscribing:', error);
    }
  }

  /**
   * Send a message to the server
   * @param {string} destination - Destination (e.g., '/app/queue/join')
   * @param {object} body - Message body
   * @param {object} headers - Optional headers
   */
  send(destination, body, headers = {}) {
    if (!this.isConnected) {
      console.error('[WebSocket] Cannot send - not connected');
      return false;
    }

    try {
      this.client.send(destination, headers, JSON.stringify(body));
      console.log('[WebSocket] Message sent:', destination, body);
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      return false;
    }
  }

  /**
   * Register connection callback
   */
  onConnect(callback) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  /**
   * Register disconnection callback
   */
  onDisconnect(callback) {
    this.disconnectionCallbacks.add(callback);
    return () => this.disconnectionCallbacks.delete(callback);
  }

  /**
   * Register error callback
   */
  onError(callback) {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      subscriptionCount: this.subscriptions.size,
    };
  }
}

// Singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
