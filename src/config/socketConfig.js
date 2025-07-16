/**
 * Socket.IO configuration and constants
 */

// Socket connection configuration
export const SOCKET_CONFIG = {
  // Connection options
  CONNECTION_OPTIONS: {
    pingTimeout: 120000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    timeout: 20000,
    forceNew: true,
  },

  // Event names
  EVENTS: {
    // Client events (outgoing)
    TRACKING_UPDATE: 'tracking-update',
    TRACKING_HISTORY: 'tracking-history',
    JOIN_TRACKING_ROOM: 'join_tracking_room',
    LEAVE_TRACKING_ROOM: 'leave_tracking_room',
    TEST_CLIENT_EVENT: 'test_client_event',

    // Server events (incoming)
    FETCH_TRACKING_UPDATE: 'fetch-tracking-update',
    TRACKING_ERROR: 'tracking-error',
    TRACKING_UPDATE_ACK: 'tracking_update',

    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    UNAUTHORIZED: 'unauthorized',
    ERROR: 'error',
    RECONNECT: 'reconnect',
    RECONNECT_ERROR: 'reconnect_error',
    RECONNECT_FAILED: 'reconnect_failed',
  },

  // Error codes
  ERROR_CODES: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
    RECONNECTION_FAILED: 'RECONNECTION_FAILED',
  },

  // Retry configuration
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
  },

  // Debug configuration
  DEBUG: {
    ENABLED: process.env.NODE_ENV === 'development',
    LOG_PREFIX: '[SOCKET]',
    VERBOSE: process.env.REACT_APP_SOCKET_DEBUG === 'true',
  },
};

// Socket event handlers configuration
export const DEFAULT_SOCKET_HANDLERS = {
  onConnect: () => console.log(`${SOCKET_CONFIG.DEBUG.LOG_PREFIX} Connected`),
  onDisconnect: (reason) => console.log(`${SOCKET_CONFIG.DEBUG.LOG_PREFIX} Disconnected:`, reason),
  onError: (error) => console.error(`${SOCKET_CONFIG.DEBUG.LOG_PREFIX} Error:`, error),
  onTrackingUpdate: (data) => console.log(`${SOCKET_CONFIG.DEBUG.LOG_PREFIX} Tracking update:`, data),
  onUnauthorized: () => console.warn(`${SOCKET_CONFIG.DEBUG.LOG_PREFIX} Unauthorized access`),
};

// Utility functions
export const createSocketUrl = (baseUrl) => {
  // Remove trailing slash if present
  const cleanUrl = baseUrl.replace(/\/$/, '');
  return cleanUrl;
};

export const isSocketError = (error) => {
  return error && (
    error.code === SOCKET_CONFIG.ERROR_CODES.UNAUTHORIZED ||
    error.type === 'UnauthorizedError' ||
    error.message?.toLowerCase().includes('unauthorized')
  );
};

export const getRetryDelay = (retryCount) => {
  const { RETRY_DELAY, BACKOFF_MULTIPLIER } = SOCKET_CONFIG.RETRY_CONFIG;
  return Math.min(RETRY_DELAY * Math.pow(BACKOFF_MULTIPLIER, retryCount), 30000);
};

export default SOCKET_CONFIG;