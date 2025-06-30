import { useState, useEffect } from "react";
import socketService from "../services/socketService";

const useSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState(() =>
    socketService.getConnectionStatus()
  );

  useEffect(() => {
    // Update connection status every second
    const intervalId = setInterval(() => {
      const status = socketService.getConnectionStatus();
      setConnectionStatus((prevStatus) => {
        // Only update if status changed to avoid unnecessary re-renders
        if (
          prevStatus.isConnected !== status.isConnected ||
          prevStatus.socketConnected !== status.socketConnected ||
          prevStatus.retryCount !== status.retryCount
        ) {
          return status;
        }
        return prevStatus;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    isConnected: connectionStatus.isConnected,
    socketConnected: connectionStatus.socketConnected,
    retryCount: connectionStatus.retryCount,
    reconnect: () => socketService.reconnect(),
  };
};

export default useSocket;
