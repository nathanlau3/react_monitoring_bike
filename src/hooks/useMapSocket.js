import { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import cleanSocketService from "../services/cleanSocketService";
import { updateLocation } from "../redux/features/mapsSlice";
import { logout } from "../redux/features/authSlice";

/**
 * Custom hook for managing socket connection in maps component
 * Handles tracking updates, connection status, and error handling
 */
const useMapSocket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isConnecting: false,
    retryCount: 0,
    error: null,
  });

  // Handle tracking updates from socket
  const handleTrackingUpdate = useCallback(
    (data) => {
      console.log("[MAP SOCKET] Received tracking update:", data);
      dispatch(updateLocation(data));
    },
    [dispatch]
  );

  // Handle successful socket connection
  const handleConnect = useCallback(() => {
    console.log("[MAP SOCKET] Connected successfully");
    setConnectionState((prev) => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      retryCount: 0,
      error: null,
    }));
  }, []);

  // Handle socket disconnection
  const handleDisconnect = useCallback(() => {
    console.log("[MAP SOCKET] Disconnected");
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  // Handle unauthorized responses
  const handleUnauthorized = useCallback(() => {
    console.log("[MAP SOCKET] Unauthorized access - redirecting to login");

    // Disconnect socket
    cleanSocketService.disconnect();

    // Clear Redux auth state
    dispatch(logout());

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Navigate to login
    navigate("/login", { replace: true });
  }, [navigate, dispatch]);

  // Handle socket errors
  const handleError = useCallback((error) => {
    console.error("[MAP SOCKET] Socket error:", error);
    setConnectionState((prev) => ({
      ...prev,
      error: error.message || "Socket connection error",
      isConnecting: false,
    }));
  }, []);

  // Handle connection errors
  const handleConnectionError = useCallback((error) => {
    console.error("[MAP SOCKET] Connection error:", error);
    setConnectionState((prev) => ({
      ...prev,
      error: error.message || "Failed to connect",
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  // Manual reconnection function
  const reconnect = useCallback(() => {
    setConnectionState((prev) => ({
      ...prev,
      isConnecting: true,
      retryCount: prev.retryCount + 1,
      error: null,
    }));

    // Use clean socket service reconnect
    cleanSocketService.reconnect();
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    console.log("[MAP SOCKET] Initializing socket connection");

    setConnectionState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    cleanSocketService.initialize({
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onTrackingUpdate: handleTrackingUpdate,
      onUnauthorized: handleUnauthorized,
      onError: handleError,
      onConnectionError: handleConnectionError,
    });
  }, [
    handleConnect,
    handleDisconnect,
    handleTrackingUpdate,
    handleUnauthorized,
    handleError,
    handleConnectionError,
  ]);

  // Initialize socket on mount
  useEffect(() => {
    initializeSocket();

    // Cleanup on unmount
    return () => {
      console.log("[MAP SOCKET] Cleaning up socket connection");
      cleanSocketService.disconnect();
    };
  }, [initializeSocket]);

  // Debug function for development
  const debugSocket = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[MAP SOCKET] Debug Info:", {
        connectionState,
        socketStatus: cleanSocketService.getConnectionStatus(),
      });

      // Call the socket service debug function
      cleanSocketService.debug();
    }
  }, [connectionState]);

  return {
    // Connection state
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    retryCount: connectionState.retryCount,
    error: connectionState.error,

    // Actions
    reconnect,
    debugSocket,

    // Socket service access (for advanced usage)
    socketService: cleanSocketService,
  };
};

export default useMapSocket;
