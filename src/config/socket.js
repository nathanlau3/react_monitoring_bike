import { io } from "socket.io-client";

// Socket.io configuration
const URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5005";

export const socket = io(URL, {
  // Auto connect on creation
  autoConnect: true,
  // Reconnection settings
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  // Connection timeout
  timeout: 20000,
  // Enable debug logs in development
  debug: process.env.NODE_ENV === "development",
  // Transport options - try websocket first, fallback to polling
  transports: ["websocket", "polling"],
  // Force new connection
  forceNew: true,
  // Additional options for better compatibility
  upgrade: true,
  rememberUpgrade: true,
});

// Function to connect socket
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// Function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Debug logging for development
if (process.env.NODE_ENV === "development") {
  socket.on("connect", () => {
    console.log("Socket.io: Connected to server", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket.io: Disconnected from server", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.io: Connection error", error);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("Socket.io: Reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_error", (error) => {
    console.error("Socket.io: Reconnection error", error);
  });
}
