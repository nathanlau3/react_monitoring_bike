import { socket, connectSocket, disconnectSocket } from "../config/socket";
import { SOCKET_CONFIG, DEFAULT_SOCKET_HANDLERS, isSocketError, getRetryDelay } from "../config/socketConfig";

/**
 * Clean Socket Service - Simplified and organized socket management
 */
class CleanSocketService {
  constructor() {
    this.isConnected = false;
    this.isConnecting = false;
    this.listeners = new Map();
    this.retryCount = 0;
    this.handlers = { ...DEFAULT_SOCKET_HANDLERS };
    this.boundHandlers = new Map();
    
    // Bind methods to maintain context
    this.handleConnect = this.handleConnect.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleTrackingUpdate = this.handleTrackingUpdate.bind(this);
    this.handleUnauthorized = this.handleUnauthorized.bind(this);
    this.handleConnectionError = this.handleConnectionError.bind(this);
  }

  /**
   * Initialize socket connection with custom handlers
   * @param {Object} handlers - Custom event handlers
   */
  initialize(handlers = {}) {
    this.log('Initializing socket service');
    
    // Merge custom handlers with defaults
    this.handlers = { ...DEFAULT_SOCKET_HANDLERS, ...handlers };
    
    // Clean up existing listeners
    this.cleanup();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Connect socket
    this.connect();
  }

  /**
   * Set up all socket event listeners
   */
  setupEventListeners() {
    const { EVENTS } = SOCKET_CONFIG;
    
    // Connection events
    this.addListener(EVENTS.CONNECT, this.handleConnect);
    this.addListener(EVENTS.DISCONNECT, this.handleDisconnect);
    this.addListener(EVENTS.CONNECT_ERROR, this.handleConnectionError);
    this.addListener(EVENTS.ERROR, this.handleError);
    this.addListener(EVENTS.UNAUTHORIZED, this.handleUnauthorized);
    
    // Tracking events
    this.addListener(EVENTS.FETCH_TRACKING_UPDATE, this.handleTrackingUpdate);
    
    // Add debug listener in development
    if (SOCKET_CONFIG.DEBUG.ENABLED) {
      socket.onAny((event, ...args) => {
        this.log(`📨 Received event '${event}':`, args);
      });
    }
  }

  /**
   * Add event listener and store reference for cleanup
   */
  addListener(event, handler) {
    socket.on(event, handler);
    this.listeners.set(event, handler);
    this.log(`Added listener for '${event}' event`);
  }

  /**
   * Connect to socket server
   */
  connect() {
    if (this.isConnected || this.isConnecting) {
      this.log('Already connected or connecting');
      return;
    }

    this.isConnecting = true;
    this.log('Connecting to socket server');
    
    try {
      connectSocket();
      
      // If already connected, trigger connect handler
      if (socket.connected) {
        this.handleConnect();
      }
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    this.log('Disconnecting from socket server');
    this.cleanup();
    disconnectSocket();
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Handle successful connection
   */
  handleConnect() {
    this.log('Connected successfully');
    this.log('Socket ID:', socket.id);
    
    this.isConnected = true;
    this.isConnecting = false;
    this.retryCount = 0;
    
    // Call custom connect handler
    if (this.handlers.onConnect) {
      this.handlers.onConnect();
    }
    
    // Run connection test in development
    if (SOCKET_CONFIG.DEBUG.ENABLED) {
      this.runConnectionTest();
    }
  }

  /**
   * Handle disconnection
   */
  handleDisconnect(reason) {
    this.log('Disconnected:', reason);
    
    this.isConnected = false;
    this.isConnecting = false;
    
    // Call custom disconnect handler
    if (this.handlers.onDisconnect) {
      this.handlers.onDisconnect(reason);
    }
  }

  /**
   * Handle connection errors
   */
  handleConnectionError(error) {
    this.logError('Connection error:', error);
    
    this.isConnected = false;
    this.isConnecting = false;
    
    // Check if it's an unauthorized error
    if (isSocketError(error)) {
      this.handleUnauthorized();
      return;
    }
    
    // Call custom error handler
    if (this.handlers.onError) {
      this.handlers.onError(error);
    }
    
    // Attempt retry if under limit
    this.attemptRetry();
  }

  /**
   * Handle general errors
   */
  handleError(error) {
    this.logError('Socket error:', error);
    
    if (isSocketError(error)) {
      this.handleUnauthorized();
      return;
    }
    
    if (this.handlers.onError) {
      this.handlers.onError(error);
    }
  }

  /**
   * Handle unauthorized access
   */
  handleUnauthorized() {
    this.log('Unauthorized access detected');
    
    this.disconnect();
    
    if (this.handlers.onUnauthorized) {
      this.handlers.onUnauthorized();
    }
  }

  /**
   * Handle tracking updates
   */
  handleTrackingUpdate(data) {
    this.log('Received tracking update:', data);
    
    if (this.handlers.onTrackingUpdate) {
      this.handlers.onTrackingUpdate(data);
    }
  }

  /**
   * Attempt to retry connection
   */
  attemptRetry() {
    const { MAX_RETRIES } = SOCKET_CONFIG.RETRY_CONFIG;
    
    if (this.retryCount >= MAX_RETRIES) {
      this.logError('Max retry attempts reached');
      return;
    }
    
    this.retryCount++;
    const delay = getRetryDelay(this.retryCount);
    
    this.log(`Retrying connection in ${delay}ms (attempt ${this.retryCount}/${MAX_RETRIES})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Manual reconnection
   */
  reconnect() {
    this.log('Manual reconnection requested');
    this.retryCount = 0;
    this.disconnect();
    
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  /**
   * Emit event to server
   */
  emit(event, data, callback) {
    if (!this.isConnected) {
      this.logError(`Cannot emit '${event}': socket not connected`);
      return false;
    }
    
    this.log(`Emitting '${event}':`, data);
    
    try {
      if (callback) {
        socket.emit(event, data, callback);
      } else {
        socket.emit(event, data);
      }
      return true;
    } catch (error) {
      this.logError(`Error emitting '${event}':`, error);
      return false;
    }
  }

  /**
   * Join tracking room
   */
  joinTrackingRoom(orderId) {
    return this.emit(SOCKET_CONFIG.EVENTS.JOIN_TRACKING_ROOM, { orderId });
  }

  /**
   * Leave tracking room
   */
  leaveTrackingRoom(orderId) {
    return this.emit(SOCKET_CONFIG.EVENTS.LEAVE_TRACKING_ROOM, { orderId });
  }

  /**
   * Send tracking update
   */
  sendTrackingUpdate(trackingData) {
    return this.emit(SOCKET_CONFIG.EVENTS.TRACKING_UPDATE, trackingData);
  }

  /**
   * Send tracking history
   */
  sendTrackingHistory(trackingData) {
    return this.emit(SOCKET_CONFIG.EVENTS.TRACKING_HISTORY, trackingData);
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      socketConnected: socket.connected,
      retryCount: this.retryCount,
      socketId: socket.id,
    };
  }

  /**
   * Run connection test (development only)
   */
  runConnectionTest() {
    if (!SOCKET_CONFIG.DEBUG.ENABLED) return;
    
    setTimeout(() => {
      const testData = {
        order_id: 39,
        latitude: -7.7479829935023465,
        longitude: 110.38986627231766,
        status_active: true,
        test: true,
      };
      
      this.log('Running connection test:', testData);
      this.sendTrackingUpdate(testData);
    }, 2000);
  }

  /**
   * Debug information
   */
  debug() {
    const status = this.getConnectionStatus();
    const eventListeners = Array.from(this.listeners.keys());
    
    this.log('🔍 Debug Information:', {
      ...status,
      eventListeners,
      handlers: Object.keys(this.handlers),
    });
    
    // Show available debug functions
    if (window.socketService) {
      console.log('Available debug functions:');
      console.log('- window.socketService.debug()');
      console.log('- window.socketService.getConnectionStatus()');
      console.log('- window.socketService.reconnect()');
    }
  }

  /**
   * Clean up all event listeners
   */
  cleanup() {
    this.log('Cleaning up event listeners');
    
    // Remove all stored listeners
    this.listeners.forEach((handler, event) => {
      socket.off(event, handler);
    });
    this.listeners.clear();
    
    // Remove onAny listener
    if (SOCKET_CONFIG.DEBUG.ENABLED) {
      socket.offAny();
    }
  }

  /**
   * Logging utility
   */
  log(...args) {
    if (SOCKET_CONFIG.DEBUG.ENABLED) {
      console.log(SOCKET_CONFIG.DEBUG.LOG_PREFIX, ...args);
    }
  }

  /**
   * Error logging utility
   */
  logError(...args) {
    if (SOCKET_CONFIG.DEBUG.ENABLED) {
      console.error(SOCKET_CONFIG.DEBUG.LOG_PREFIX, ...args);
    }
  }
}

// Create singleton instance
const cleanSocketService = new CleanSocketService();

// Expose globally in development
if (SOCKET_CONFIG.DEBUG.ENABLED) {
  window.socketService = cleanSocketService;
  window.debugSocket = () => cleanSocketService.debug();
}

export default cleanSocketService;