import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

/**
 * WebRTC WebSocket Client
 *
 * Handles WebSocket STOMP connection for WebRTC signaling
 * - JWT authentication in CONNECT headers
 * - Automatic reconnection with exponential backoff
 * - Room-based signaling
 */
class WebRTCWebSocketClient {
  constructor() {
    this.stompClient = null;
    this.socket = null;
    this.roomId = null;
    this.token = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.reconnectTimer = null;

    // Callback handlers
    this.onSignalCallback = null;
    this.onPresenceCallback = null;
    this.onConnectedCallback = null;
    this.onDisconnectedCallback = null;
    this.onErrorCallback = null;

    // Subscription objects
    this.signalSubscription = null;
    this.presenceSubscription = null;
  }

  /**
   * Connect to WebSocket with JWT authentication
   */
  connect(roomId, token, callbacks = {}) {
    if (this.isConnected && this.roomId === roomId) {
      console.log('🔌 Already connected to room:', roomId);
      return;
    }

    this.roomId = roomId;
    this.token = token;

    // Store callbacks
    this.onSignalCallback = callbacks.onSignal || null;
    this.onPresenceCallback = callbacks.onPresence || null;
    this.onConnectedCallback = callbacks.onConnected || null;
    this.onDisconnectedCallback = callbacks.onDisconnected || null;
    this.onErrorCallback = callbacks.onError || null;

    console.log('🔌 Connecting to WebSocket for room:', roomId);

    try {
      // Get WebSocket URL from environment
      const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

      // Create SockJS connection
      this.socket = new SockJS(wsUrl);

      // Create STOMP client
      this.stompClient = Stomp.over(this.socket);

      // Disable debug logs in production
      if (process.env.NODE_ENV === 'production') {
        this.stompClient.debug = () => {};
      } else {
        this.stompClient.debug = (msg) => {
          if (msg.includes('PING') || msg.includes('PONG')) return;
          console.log('🔌 STOMP:', msg);
        };
      }

      // Set heartbeat (client will send every 10s, expect from server every 10s)
      this.stompClient.heartbeatIncoming = 10000;
      this.stompClient.heartbeatOutgoing = 10000;

      // Connect with JWT in headers
      const connectHeaders = {
        Authorization: `Bearer ${token}`,
      };

      this.stompClient.connect(
        connectHeaders,
        (frame) => this.onConnectSuccess(frame),
        (error) => this.onConnectError(error)
      );
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.handleError(error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle successful connection
   */
  onConnectSuccess(frame) {
    console.log('✅ WebSocket connected:', frame.command);
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    // Subscribe to signaling messages (private)
    this.subscribeToSignaling();

    // Subscribe to presence events (shared)
    this.subscribeToPresence();

    // Send JOIN message
    this.sendJoinMessage();

    // Call connected callback
    if (this.onConnectedCallback) {
      this.onConnectedCallback();
    }
  }

  /**
   * Handle connection error
   */
  onConnectError(error) {
    console.error('❌ WebSocket connection error:', error);
    this.isConnected = false;

    this.handleError(error);
    this.scheduleReconnect();
  }

  /**
   * Subscribe to signaling messages (private user queue)
   */
  subscribeToSignaling() {
    if (!this.stompClient || !this.roomId) return;

    const destination = `/user/webrtc/${this.roomId}/signal`;
    console.log('📡 Subscribing to signaling:', destination);

    this.signalSubscription = this.stompClient.subscribe(
      destination,
      (message) => {
        try {
          const signal = JSON.parse(message.body);
          console.log('📨 Signal received:', signal.type, signal);

          if (this.onSignalCallback) {
            this.onSignalCallback(signal);
          }
        } catch (error) {
          console.error('❌ Failed to parse signal message:', error);
        }
      }
    );
  }

  /**
   * Subscribe to presence events (shared topic)
   */
  subscribeToPresence() {
    if (!this.stompClient || !this.roomId) return;

    const destination = `/topic/consultations/${this.roomId}/presence`;
    console.log('📡 Subscribing to presence:', destination);

    this.presenceSubscription = this.stompClient.subscribe(
      destination,
      (message) => {
        try {
          const event = JSON.parse(message.body);
          console.log('👥 Presence event:', event.eventType, event);

          if (this.onPresenceCallback) {
            this.onPresenceCallback(event);
          }
        } catch (error) {
          console.error('❌ Failed to parse presence event:', error);
        }
      }
    );
  }

  /**
   * Send JOIN message to room
   */
  sendJoinMessage() {
    this.sendSignal({
      type: 'JOIN',
      to: null,
      clientTs: Date.now(),
    });
  }

  /**
   * Send signaling message
   */
  sendSignal(payload) {
    if (!this.stompClient || !this.isConnected) {
      console.error('❌ Cannot send signal: Not connected');
      return false;
    }

    if (!this.roomId) {
      console.error('❌ Cannot send signal: No room ID');
      return false;
    }

    try {
      const destination = `/app/webrtc/${this.roomId}/signal`;
      const message = {
        ...payload,
        clientTs: payload.clientTs || Date.now(),
      };

      console.log('📤 Sending signal:', message.type, destination);

      this.stompClient.send(
        destination,
        {},
        JSON.stringify(message)
      );

      return true;
    } catch (error) {
      console.error('❌ Failed to send signal:', error);
      this.handleError(error);
      return false;
    }
  }

  /**
   * Send OFFER signal
   */
  sendOffer(sdp, targetRole) {
    return this.sendSignal({
      type: 'OFFER',
      to: targetRole, // 'DOCTOR' or 'PATIENT'
      sdp: sdp,
    });
  }

  /**
   * Send ANSWER signal
   */
  sendAnswer(sdp, targetRole) {
    return this.sendSignal({
      type: 'ANSWER',
      to: targetRole,
      sdp: sdp,
    });
  }

  /**
   * Send ICE candidate
   */
  sendIceCandidate(candidate, targetRole) {
    return this.sendSignal({
      type: 'ICE',
      to: targetRole,
      candidate: JSON.stringify(candidate),
    });
  }

  /**
   * Send LEAVE message
   */
  sendLeave() {
    return this.sendSignal({
      type: 'LEAVE',
      to: null,
    });
  }

  /**
   * Send BYE message
   */
  sendBye() {
    return this.sendSignal({
      type: 'BYE',
      to: null,
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Send LEAVE message before disconnecting
    if (this.isConnected) {
      this.sendLeave();
    }

    // Unsubscribe from topics
    if (this.signalSubscription) {
      this.signalSubscription.unsubscribe();
      this.signalSubscription = null;
    }

    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
      this.presenceSubscription = null;
    }

    // Disconnect STOMP client
    if (this.stompClient && this.isConnected) {
      try {
        this.stompClient.disconnect(() => {
          console.log('✅ WebSocket disconnected');
        });
      } catch (error) {
        console.error('❌ Error disconnecting:', error);
      }
    }

    // Close socket
    if (this.socket) {
      try {
        this.socket.close();
      } catch (error) {
        console.error('❌ Error closing socket:', error);
      }
    }

    // Reset state
    this.isConnected = false;
    this.stompClient = null;
    this.socket = null;

    // Call disconnected callback
    if (this.onDisconnectedCallback) {
      this.onDisconnectedCallback();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.handleError(new Error('Max reconnection attempts reached'));
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectAttempts++;
    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.roomId && this.token) {
        this.connect(this.roomId, this.token, {
          onSignal: this.onSignalCallback,
          onPresence: this.onPresenceCallback,
          onConnected: this.onConnectedCallback,
          onDisconnected: this.onDisconnectedCallback,
          onError: this.onErrorCallback,
        });
      }
    }, delay);
  }

  /**
   * Handle errors
   */
  handleError(error) {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Check if connected
   */
  isConnectionActive() {
    return this.isConnected && this.stompClient !== null;
  }

  /**
   * Get current room ID
   */
  getCurrentRoomId() {
    return this.roomId;
  }
}

// Create singleton instance
const webrtcWsClient = new WebRTCWebSocketClient();

export default webrtcWsClient;
