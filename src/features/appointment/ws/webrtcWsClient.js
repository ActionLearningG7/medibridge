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

    // Debug state tracking
    this.lastSignals = []; // Keep last 10 signals for debug panel
    this.debugStateCallback = null; // Callback to update debug panel
  }

  /**
   * Register callback for debug state updates
   */
  onDebugStateChange(callback) {
    this.debugStateCallback = callback;
  }

  /**
   * Emit debug state update
   */
  emitDebugStateChange() {
    if (this.debugStateCallback) {
      this.debugStateCallback(this.getDebugState());
    }
  }

  /**
   * Get current debug state for CallDebugPanel
   */
  getDebugState() {
    return {
      isConnected: this.isConnected,
      roomId: this.roomId,
      token: this.token ? '***' : null,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      stompClient: this.stompClient,
      socket: this.socket,
      signalSubscription: this.signalSubscription,
      presenceSubscription: this.presenceSubscription,
      lastSignals: this.lastSignals,
    };
  }

  /**
   * Add signal to debug history
   */
  addSignalToHistory(signal, direction = 'recv') {
    const timestamp = new Date().toLocaleTimeString();
    const signalEntry = {
      timestamp,
      type: signal.type,
      from: direction === 'recv' ? signal.from || 'peer' : undefined,
      to: direction === 'send' ? signal.to : undefined,
      direction,
    };

    this.lastSignals.unshift(signalEntry);
    if (this.lastSignals.length > 10) {
      this.lastSignals.pop();
    }

    this.emitDebugStateChange();
  }

  /**
   * Connect to WebSocket with JWT authentication
   */
  connect(roomId, token, callbacks = {}) {
    if (this.isConnected && this.roomId === roomId) {
      console.log('🔌 Already connected to room:', roomId);
      return;
    }

    // Reset connection state if changing rooms
    if (this.roomId !== roomId) {
      this.disconnect();
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
    console.log('📋 Token available:', !!token);
    console.log('🌐 WebSocket URL:', process.env.REACT_APP_APPOINTMENT_WS_URL || 'http://localhost:8080/ws');

    try {
      // Get WebSocket URL from environment
      // Uses SockJS with HTTP fallback, so use http:// not ws://
      const wsUrl = process.env.REACT_APP_APPOINTMENT_WS_URL || 'http://localhost:8080/ws';
      console.log('🔗 Final WebSocket URL:', wsUrl);

      // Create SockJS connection with debug enabled
      this.socket = new SockJS(wsUrl, null, {
        debug: true,
        devel: true,
        timeout: 20000,
      });
      console.log('✅ SockJS socket created, waiting for connection...');

      // Set up socket event handlers for debugging
      this.socket.onopen = () => {
        console.log('✅ SockJS socket opened (transport protocol established)');
      };

      this.socket.onclose = (event) => {
        console.log('❌ SockJS socket closed');
        console.log('  - Event code:', event.code);
        console.log('  - Event reason:', event.reason);
        console.log('  - Event wasClean:', event.wasClean);
      };

      this.socket.onerror = (error) => {
        console.error('❌ SockJS socket error:', error);
        if (error instanceof Event) {
          console.error('  - Error type:', error.type);
          console.error('  - Error message:', error.message);
        }
      };

      // Create STOMP client
      this.stompClient = Stomp.over(this.socket);
      console.log('✅ STOMP client created');

      // Disable debug logs in production
      if (process.env.NODE_ENV === 'production') {
        this.stompClient.debug = () => {};
      } else {
        this.stompClient.debug = (msg) => {
          if (msg.includes('PING') || msg.includes('PONG')) return;
          console.log('🔌 STOMP:', msg);
        };
      }

      // Set heartbeat (client will send every 10s, expect from server every 30s)
      this.stompClient.heartbeatIncoming = 30000;
      this.stompClient.heartbeatOutgoing = 10000;

      // Connect with JWT in headers
      const connectHeaders = {
        Authorization: `Bearer ${token}`,
      };

      console.log('🔐 Connecting with JWT token, headers:', { Authorization: 'Bearer [REDACTED]' });
      this.stompClient.connect(
        connectHeaders,
        (frame) => {
          console.log('✅ WebSocket CONNECT successful, frame:', frame);
          this.onConnectSuccess(frame);
        },
        (error) => {
          console.error('❌ WebSocket CONNECT error:', error);
          this.onConnectError(error);
        }
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
    if (!this.stompClient || !this.roomId) {
      console.error('❌ Cannot subscribe: stompClient or roomId missing');
      return;
    }

    const destination = `/user/webrtc/${this.roomId}/signal`;
    console.log('📡 Subscribing to signaling:', destination);

    try {
      this.signalSubscription = this.stompClient.subscribe(
        destination,
        (message) => {
          console.log('✅ Signal subscription message received');
          try {
            const signal = JSON.parse(message.body);
            console.log('📨 Signal received:', signal.type, signal);

            if (this.onSignalCallback) {
              this.onSignalCallback(signal);
            }
          } catch (error) {
            console.error('❌ Failed to parse signal message:', error);
          }
        },
        (error) => {
          console.error('❌ Signal subscription error:', error);
          this.handleError(error);
        }
      );
      console.log('✅ Signal subscription created:', destination);
    } catch (error) {
      console.error('❌ Failed to subscribe to signaling:', error);
      this.handleError(error);
    }
  }

  /**
   * Subscribe to presence events (shared topic)
   */
  subscribeToPresence() {
    if (!this.stompClient || !this.roomId) {
      console.error('❌ Cannot subscribe: stompClient or roomId missing');
      return;
    }

    const destination = `/topic/consultations/${this.roomId}/presence`;
    console.log('📡 Subscribing to presence:', destination);

    try {
      this.presenceSubscription = this.stompClient.subscribe(
        destination,
        (message) => {
          console.log('✅ Presence subscription message received');
          try {
            const event = JSON.parse(message.body);
            console.log('👥 Presence event:', event.eventType, event);

            if (this.onPresenceCallback) {
              this.onPresenceCallback(event);
            }
          } catch (error) {
            console.error('❌ Failed to parse presence event:', error);
          }
        },
        (error) => {
          console.error('❌ Presence subscription error:', error);
          this.handleError(error);
        }
      );
      console.log('✅ Presence subscription created:', destination);
    } catch (error) {
      console.error('❌ Failed to subscribe to presence:', error);
      this.handleError(error);
    }
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
