import { useEffect, useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ZoomControl } from "react-leaflet/ZoomControl";
import PinMarker from "./pinMarker";
import { socket } from "../../config/socket";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  toggleTrack,
  toggleTerminal,
  setConnectionStatus,
  updateLocation,
} from "../../redux/features/mapsSlice";
import { fetchTerminals } from "../../redux/features/mapsThunks";

// Constants
const MAP_BUTTONS = [
  {
    id: "bicycle",
    label: "Bicycles",
    icon: "🚴",
    description: "Show bike locations",
  },
  {
    id: "terminal",
    label: "Terminals",
    icon: "🏪",
    description: "Show terminal locations",
  },
];

const DEFAULT_CENTER = [-7.77561471227957, 110.37319551913158];
const DEFAULT_ZOOM = 15;

const Maps = ({ sidebarWidth = 256 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const {
    locations,
    terminals,
    openTrack,
    openTerminal,
    isConnected,
    isLoading,
    error,
  } = useSelector((state) => state.maps);

  // Socket event handlers - Define handleTrackingUpdate first to avoid initialization error
  const handleTrackingUpdate = useCallback(
    (data) => {
      // console.log("Received tracking update:", data);
      dispatch(updateLocation(data));
    },
    [dispatch]
  );

  const handleConnect = useCallback(() => {
    console.log("Socket connected successfully");
    dispatch(setConnectionStatus(true));
    setRetryCount(0);
    socket.on("test", handleTrackingUpdate);
  }, [dispatch, handleTrackingUpdate]);

  const handleDisconnect = useCallback(() => {
    console.log("Socket disconnected");
    dispatch(setConnectionStatus(false));
    socket.off("test", handleTrackingUpdate);
  }, [dispatch, handleTrackingUpdate]);

  // Button click handler
  const handleButtonClick = useCallback(
    (buttonId) => {
      if (isLoading) return;

      switch (buttonId) {
        case "bicycle":
          dispatch(toggleTrack());
          break;
        case "terminal":
          dispatch(toggleTerminal());
          break;
        default:
          break;
      }
    },
    [dispatch, isLoading]
  );

  // Handle unauthorized responses
  const handleUnauthorized = useCallback(() => {
    console.log("Unauthorized access - redirecting to login");
    navigate("/login", { replace: true });
  }, [navigate]);

  // Modified retry handler
  const handleRetry = useCallback(async () => {
    setRetryCount((prev) => prev + 1);
    try {
      const result = await dispatch(fetchTerminals());

      if (fetchTerminals.rejected.match(result)) {
        // Check if it's an unauthorized error
        if (result.payload?.status === 401 && result.payload?.needsRedirect) {
          handleUnauthorized();
        }
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  }, [dispatch, handleUnauthorized]);

  // Socket connection management
  useEffect(() => {
    console.log("Setting up socket connection");

    // Set up event listeners first
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      dispatch(setConnectionStatus(false));
    });

    // Connect the socket
    if (!socket.connected) {
      socket.connect();
    }

    // If already connected, trigger handleConnect manually
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      console.log("Cleaning up socket connection");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error");
      socket.off("test", handleTrackingUpdate);
      // Only disconnect if we're the last component using the socket
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [handleConnect, handleDisconnect, handleTrackingUpdate, dispatch]);

  // Initial data fetch with auth handling
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const result = await dispatch(fetchTerminals());

        if (fetchTerminals.rejected.match(result)) {
          // Check if it's an unauthorized error
          if (result.payload?.status === 401 && result.payload?.needsRedirect) {
            handleUnauthorized();
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [dispatch, handleUnauthorized]);

  // Connection Status Component
  const ConnectionStatus = () => (
    <div className="absolute top-6 right-6 z-50">
      <div
        className={`
        flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
        backdrop-blur-md border transition-all duration-200
        ${
          isConnected
            ? "bg-green-50/90 text-green-700 border-green-200 shadow-green-100"
            : "bg-red-50/90 text-red-700 border-red-200 shadow-red-100"
        }
        shadow-lg
      `}
      >
        <div
          className={`
          w-2 h-2 rounded-full transition-all duration-200
          ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}
        `}
        />
        {isConnected ? "Connected" : "Disconnected"}
      </div>
    </div>
  );

  // Map Controls Component
  const MapControls = () => (
    <div className="absolute top-6 left-6 z-50 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {MAP_BUTTONS.map(({ id, label, icon, description }) => {
          const isActive =
            (id === "bicycle" && openTrack) ||
            (id === "terminal" && openTerminal);

          return (
            <button
              key={id}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-xl
                backdrop-blur-md border transition-all duration-200
                font-medium text-sm min-w-[140px]
                ${
                  isActive
                    ? "bg-blue-500/90 text-white border-blue-400 shadow-blue-200"
                    : "bg-white/90 text-gray-700 border-gray-200 hover:bg-blue-50/90 hover:border-blue-300 hover:text-blue-700"
                }
                ${
                  isLoading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-lg hover:scale-105"
                }
                shadow-lg transform active:scale-95
              `}
              onClick={() => handleButtonClick(id)}
              disabled={isLoading}
              title={description}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>

              {isActive && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse ml-auto" />
              )}

              {/* Tooltip */}
              <div
                className="
                absolute top-full left-1/2 transform -translate-x-1/2 mt-2
                px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 whitespace-nowrap z-50
                before:content-[''] before:absolute before:bottom-full before:left-1/2 
                before:-translate-x-1/2 before:border-4 before:border-transparent 
                before:border-b-gray-900
              "
              >
                {description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Data Stats */}
      <div className="flex gap-2">
        {openTrack && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/90 text-blue-700 rounded-lg text-sm font-medium backdrop-blur-md border border-blue-200">
            <span>🚴</span>
            <span>{locations.length} Bikes</span>
          </div>
        )}
        {openTerminal && (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50/90 text-purple-700 rounded-lg text-sm font-medium backdrop-blur-md border border-purple-200">
            <span>🏪</span>
            <span>{terminals.length} Terminals</span>
          </div>
        )}
      </div>
    </div>
  );

  // Error Component
  const ErrorDisplay = () => (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-50/95 backdrop-blur-sm">
      <div className="max-w-md mx-4 p-8 bg-white rounded-2xl shadow-xl border border-red-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={handleRetry}
            className="
              px-6 py-3 bg-red-500 text-white rounded-xl font-medium
              hover:bg-red-600 transition-colors duration-200
              active:scale-95 transform
            "
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Retrying...
              </div>
            ) : (
              `Try Again ${retryCount > 0 ? `(${retryCount})` : ""}`
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Loading Component
  const LoadingDisplay = () => (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-gray-50/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center absolute top-2 left-1/2 transform -translate-x-1/2">
            <span className="text-white text-xl">🗺️</span>
          </div>
        </div>
        <p className="text-gray-600 font-medium">Loading map data...</p>
        <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Map Container */}
      <MapContainer
        zoomControl={false}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Bike Markers */}
        {openTrack &&
          locations.length > 0 &&
          locations.map((location, index) => (
            <PinMarker
              key={`bike-${location.iteration || index}`}
              latlng={location}
              type="bike"
            />
          ))}

        {/* Terminal Markers */}
        {openTerminal &&
          terminals.length > 0 &&
          terminals.map((terminal, index) => (
            <PinMarker
              key={`terminal-${terminal.iteration || index}`}
              latlng={terminal}
              type="terminal"
            />
          ))}

        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* UI Overlays */}
      <ConnectionStatus />
      <MapControls />

      {/* Loading Overlay */}
      {isLoading && <LoadingDisplay />}

      {/* Welcome Message for First Time Users */}
      {!openTrack && !openTerminal && !isLoading && !error && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="px-6 py-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 text-center max-w-sm">
            <div className="text-2xl mb-2">👋</div>
            <p className="text-gray-700 font-medium mb-1">Welcome to MoBike!</p>
            <p className="text-gray-500 text-sm">
              Select bicycles or terminals to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;
