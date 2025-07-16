import { socket, connectSocket, disconnectSocket } from "../config/socket";
import { store } from "../redux/store";
import { logout } from "../redux/features/authSlice";

class SocketService {
  constructor() {
    this.isConnected = false;
    this.listeners = new Map();
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    // Bind the tracking update handler once to maintain reference
    this.boundTrackingUpdate = this.handleTrackingUpdate.bind(this);
  }

  // Initialize socket connection with event handlers
  initialize(callbacks = {}) {
    const {
      onConnect,
      onDisconnect,
      onTrackingUpdate,
      onUnauthorized,
      onError,
    } = callbacks;

    // Clean up existing listeners
    this.cleanup();

    // Connection handlers
    const handleConnect = () => {
      console.log("Socket connected successfully");
      this.isConnected = true;
      this.retryCount = 0;

      // Set up tracking listener
      socket.on("fetch-tracking-update", this.boundTrackingUpdate);
      console.log(
        "[SOCKET SERVICE] 'fetch-tracking-update' event listener added"
      );

      if (onConnect) onConnect();
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      this.isConnected = false;

      // Remove tracking listener
      socket.off("fetch-tracking-update", this.boundTrackingUpdate);
      console.log("[SOCKET SERVICE] 'test' event listener removed");

      if (onDisconnect) onDisconnect();
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      this.isConnected = false;

      // Check if error is related to authentication
      if (this.isUnauthorizedError(error)) {
        console.log("Socket unauthorized - logging out");
        store.dispatch(logout());
        window.location.href = "/login";
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (onError) onError(error);
    };

    const handleUnauthorized = () => {
      console.log("Socket unauthorized event received - logging out");
      store.dispatch(logout());
      window.location.href = "/login";
      if (onUnauthorized) onUnauthorized();
    };

    // Auth status handler removed since authentication is disabled

    const handleGeneralError = (error) => {
      console.error("Socket error:", error);
      if (this.isUnauthorizedError(error)) {
        console.log("Socket authentication error");
        if (onUnauthorized) onUnauthorized();
      } else if (onError) {
        onError(error);
      }
    };

    // Store callbacks for cleanup
    this.listeners.set("connect", handleConnect);
    this.listeners.set("disconnect", handleDisconnect);
    this.listeners.set("connect_error", handleConnectError);
    this.listeners.set("unauthorized", handleUnauthorized);
    this.listeners.set("error", handleGeneralError);

    // Store tracking callback
    if (onTrackingUpdate) {
      this.onTrackingUpdate = onTrackingUpdate;
    }

    // Set up event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("unauthorized", handleUnauthorized);
    socket.on("error", handleGeneralError);

    // Connect the socket
    connectSocket();

    // Add a catch-all listener for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      // socket.onAny((event, ...args) => {
      //   console.log(`[SOCKET SERVICE] 📨 Received event '${event}':`, args);
      // });
    }

    // If already connected, trigger connect handler
    if (socket.connected) {
      handleConnect();
    }
  }

  // Handle tracking updates from "test" event
  handleTrackingUpdate(data) {
    // Call the callback if available
    if (this.onTrackingUpdate) {
      this.onTrackingUpdate(data);
    } else {
      console.warn(
        "[SOCKET SERVICE] ⚠️ No onTrackingUpdate callback registered"
      );
    }
  }

  // Check if error indicates unauthorized access
  isUnauthorizedError(error) {
    if (!error) return false;

    // Check error type
    if (error.type === "UnauthorizedError") return true;

    // Check error code
    if (error.code === 401) return true;

    // Check error message
    if (error.message && typeof error.message === "string") {
      const message = error.message.toLowerCase();
      if (message.includes("unauthorized") || message.includes("401")) {
        return true;
      }
    }

    // Check error description
    if (error.description && typeof error.description === "string") {
      if (error.description.toLowerCase().includes("unauthorized")) {
        return true;
      }
    }

    // Check error data
    if (error.data && typeof error.data === "object") {
      if (error.data.code === 401 || error.data.status === 401) {
        return true;
      }
    }

    return false;
  }

  // Send data through socket
  emit(event, data, callback) {
    if (socket.connected) {
      socket.emit(event, data, callback);
    } else {
      console.warn(`Cannot emit ${event}: socket not connected`);
    }
  }

  // Add custom event listener
  addEventListener(event, callback) {
    socket.on(event, callback);
  }

  // Remove custom event listener
  removeEventListener(event, callback) {
    socket.off(event, callback);
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketConnected: socket.connected,
      retryCount: this.retryCount,
    };
  }

  // Debug function to test socket connection and events
  debugSocket() {
    console.log("[SOCKET SERVICE] 🔍 Debug Information:");
    console.log("- Socket ID:", socket.id);
    console.log("- Socket Connected:", socket.connected);
    console.log("- Service Connected:", this.isConnected);
    console.log("- Retry Count:", this.retryCount);
    console.log("- Event Listeners:", socket.listeners("test"));

    // Test emitting a custom event to see if socket works
    if (socket.connected) {
      console.log("[SOCKET SERVICE] 📤 Testing socket emission...");
      socket.emit("fetch-tracking-update", { message: "Hello from client" });
    } else {
      console.log("[SOCKET SERVICE] ❌ Socket not connected for testing");
    }
  }

  // Manually reconnect
  reconnect() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(
        `Attempting to reconnect (${this.retryCount}/${this.maxRetries})`
      );

      setTimeout(() => {
        disconnectSocket();
        connectSocket();
      }, this.retryDelay * this.retryCount);
    } else {
      console.error("Max retry attempts reached");
    }
  }

  // Clean up all socket listeners
  cleanup() {
    // Remove all stored listeners
    this.listeners.forEach((handler, event) => {
      socket.off(event, handler);
    });
    this.listeners.clear();

    // Remove tracking listener
    socket.off("fetch-tracking-update", this.boundTrackingUpdate);
    console.log(
      "[SOCKET SERVICE] Cleanup: 'fetch-tracking-update' event listener removed"
    );

    // Clear callbacks
    this.onTrackingUpdate = null;
  }

  // Disconnect socket
  disconnect() {
    this.cleanup();
    disconnectSocket();
    this.isConnected = false;
  }
}

// Create singleton instance
const socketService = new SocketService();

// Expose debug function globally for development
if (process.env.NODE_ENV === "development") {
  window.debugSocket = () => socketService.debugSocket();
  window.socketService = socketService;
}

export default socketService;
