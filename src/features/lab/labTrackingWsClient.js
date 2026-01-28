/**
 * Lab Tracking WebSocket Client
 * Manages real-time lab order tracking updates
 * Handles connection, reconnection, and message handling
 */

class LabTrackingWsClient {
  constructor(baseUrl = process.env.REACT_APP_WS_BASE_URL) {
    this.baseUrl = baseUrl;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.messageHandlers = {};
    this.connectionHandlers = [];
    this.disconnectionHandlers = [];
    this.isManualClose = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId) {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.baseUrl}/labs/tracking?userId=${userId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Lab tracking WebSocket connected');
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('Lab tracking WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Lab tracking WebSocket closed');
          this.notifyConnectionHandlers(false);
          if (!this.isManualClose) {
            this.attemptReconnect(userId);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrder(orderId, handler) {
    if (!this.messageHandlers[orderId]) {
      this.messageHandlers[orderId] = [];
    }
    this.messageHandlers[orderId].push(handler);
    this.sendMessage({
      action: 'subscribe',
      orderId,
    });
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrder(orderId, handler) {
    if (this.messageHandlers[orderId]) {
      this.messageHandlers[orderId] = this.messageHandlers[orderId].filter((h) => h !== handler);
      if (this.messageHandlers[orderId].length === 0) {
        delete this.messageHandlers[orderId];
        this.sendMessage({
          action: 'unsubscribe',
          orderId,
        });
      }
    }
  }

  /**
   * Send message to WebSocket
   */
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message queued:', message);
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const { orderId, type, payload } = message;

      if (orderId && this.messageHandlers[orderId]) {
        this.messageHandlers[orderId].forEach((handler) => {
          handler({
            type,
            payload,
            timestamp: new Date(),
          });
        });
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Request current status of order
   */
  requestStatus(orderId) {
    this.sendMessage({
      action: 'getStatus',
      orderId,
    });
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect(userId).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyDisconnectionHandlers();
    }
  }

  /**
   * Register connection status handler
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
  }

  /**
   * Register disconnection handler
   */
  onDisconnect(handler) {
    this.disconnectionHandlers.push(handler);
  }

  /**
   * Notify all connection handlers
   */
  notifyConnectionHandlers(isConnected) {
    this.connectionHandlers.forEach((handler) => {
      handler(isConnected);
    });
  }

  /**
   * Notify all disconnection handlers
   */
  notifyDisconnectionHandlers() {
    this.disconnectionHandlers.forEach((handler) => {
      handler();
    });
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const labTrackingWsClient = new LabTrackingWsClient();

export default labTrackingWsClient;
