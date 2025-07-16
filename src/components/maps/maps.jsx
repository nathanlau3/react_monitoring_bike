import { useEffect, useCallback, useState } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup } from "react-leaflet";
import { ZoomControl } from "react-leaflet/ZoomControl";
import PinMarker from "./pinMarker";
import { divIcon } from "leaflet";
import useMapSocket from "../../hooks/useMapSocket";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  toggleTrack,
  toggleTerminal,
  toggleCluster,
  setClusters,
  setSelectedClusters,
  toggleClusterSelection,
} from "../../redux/features/mapsSlice";
import { logout } from "../../redux/features/authSlice";
import {
  fetchTerminals,
  fetchClusters,
  fetchTrackingData,
} from "../../redux/features/mapsThunks";

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
  {
    id: "cluster",
    label: "Cluster",
    icon: "🎯",
    description: "Show cluster area",
  },
];

const DEFAULT_CENTER = [-7.77561471227957, 110.37319551913158];
const DEFAULT_ZOOM = 15;

const Maps = ({ sidebarWidth = 256 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [showClusterModal, setShowClusterModal] = useState(false);

  // Use map socket hook for connection status and tracking updates
  const { isConnected, isConnecting, error: socketError, reconnect, debugSocket } = useMapSocket();

  const {
    locations,
    terminals,
    clusters,
    selectedClusters,
    openTrack,
    openTerminal,
    openCluster,
    isLoading,
    error,
  } = useSelector((state) => state.maps);

  // Helper function to correct longitude coordinates (fix for negative longitude values)
  const correctLongitude = (lng) => {
    // If longitude is negative and appears to be incorrectly formatted for Yogyakarta area
    if (lng < 0 && lng < -180) {
      // Convert -249.x to 110.x (Yogyakarta longitude range)
      return lng + 360; // This should bring -249.x to around 110.x
    }
    return lng;
  };

  // Helper function to convert polygon coordinates for Leaflet
  const convertPolygonCoordinates = (polygonData) => {
    if (
      !polygonData ||
      !polygonData.coordinates ||
      !polygonData.coordinates[0]
    ) {
      return [];
    }

    // Convert from GeoJSON format [longitude, latitude] to Leaflet format [latitude, longitude]
    // Also correct longitude values if they're incorrectly formatted
    return polygonData.coordinates[0].map((coord) => [
      coord[1], // latitude (stays the same)
      correctLongitude(coord[0]), // longitude (corrected if needed)
    ]);
  };

  // Helper function to format area for display
  const formatArea = (areaMeters) => {
    if (!areaMeters) return "Unknown";

    if (areaMeters > 1000000) {
      return `${(areaMeters / 1000000).toFixed(1)} km²`;
    } else {
      return `${(areaMeters / 1000).toFixed(1)} hectares`;
    }
  };

  // Handle unauthorized responses (fallback for non-socket API calls)
  const handleUnauthorized = useCallback(() => {
    console.log("Unauthorized access - clearing auth state and redirecting to login");

    // Clear Redux auth state
    dispatch(logout());

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Navigate to login
    navigate("/login", { replace: true });
  }, [navigate, dispatch]);

  // Button click handler
  const handleButtonClick = useCallback(
    async (buttonId) => {
      if (isLoading) return;

      switch (buttonId) {
        case "bicycle":
          dispatch(toggleTrack());
          // Fetch initial tracking data if not already loaded and track is being opened
          if (!openTrack && !locations.length) {
            try {
              const result = await dispatch(fetchTrackingData());
              if (fetchTrackingData.rejected.match(result)) {
                if (
                  result.payload?.status === 401 &&
                  result.payload?.needsRedirect
                ) {
                  handleUnauthorized();
                }
              }
            } catch (error) {
              console.error("Error fetching initial tracking data:", error);
            }
          }
          break;
        case "terminal":
          dispatch(toggleTerminal());
          break;
        case "cluster":
          dispatch(toggleCluster());
          // Fetch clusters if not already loaded
          if (!clusters.length) {
            try {
              const result = await dispatch(fetchClusters());
              if (fetchClusters.rejected.match(result)) {
                if (
                  result.payload?.status === 401 &&
                  result.payload?.needsRedirect
                ) {
                  handleUnauthorized();
                }
              }
            } catch (error) {
              console.error("Error fetching clusters:", error);
            }
          }
          break;
        default:
          break;
      }
    },
    [
      dispatch,
      isLoading,
      clusters.length,
      handleUnauthorized,
      openTrack,
      locations.length,
    ]
  );

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
            : isConnecting
            ? "bg-yellow-50/90 text-yellow-700 border-yellow-200 shadow-yellow-100"
            : "bg-red-50/90 text-red-700 border-red-200 shadow-red-100"
        }
        shadow-lg
      `}
      >
        <div
          className={`
          w-2 h-2 rounded-full transition-all duration-200
          ${
            isConnected
              ? "bg-green-500 animate-pulse"
              : isConnecting
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-500"
          }
        `}
        />
        {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={debugSocket}
            className="ml-2 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
            title="Debug Socket"
          >
            🔍
          </button>
        )}
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
            (id === "terminal" && openTerminal) ||
            (id === "cluster" && openCluster);

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
        {openCluster && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/90 text-blue-700 rounded-lg text-sm font-medium backdrop-blur-md border border-blue-200">
            <span>🎯</span>
            <span>
              {selectedClusters.length} Cluster
              {selectedClusters.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setShowClusterModal(true)}
              className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Select
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Error Component
  const ErrorDisplay = () => {
    const displayError = error || socketError;
    const errorType = socketError ? "Socket Connection Error" : "Data Loading Error";
    
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-50/95 backdrop-blur-sm">
        <div className="max-w-md mx-4 p-8 bg-white rounded-2xl shadow-xl border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">{socketError ? "🔌" : "⚠️"}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {errorType}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{displayError}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={socketError ? reconnect : handleRetry}
                className="
                  px-6 py-3 bg-red-500 text-white rounded-xl font-medium
                  hover:bg-red-600 transition-colors duration-200
                  active:scale-95 transform
                "
                disabled={isLoading || isConnecting}
              >
                {isLoading || isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {socketError ? "Reconnecting..." : "Retrying..."}
                  </div>
                ) : (
                  `${socketError ? "Reconnect" : "Try Again"} ${retryCount > 0 ? `(${retryCount})` : ""}`
                )}
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={debugSocket}
                  className="
                    px-4 py-3 bg-gray-500 text-white rounded-xl font-medium
                    hover:bg-gray-600 transition-colors duration-200
                    active:scale-95 transform
                  "
                >
                  Debug
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  if (error || socketError) {
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

        {/* Cluster Areas */}
        {openCluster &&
          clusters
            .filter((cluster) => selectedClusters.includes(cluster.id))
            .map((cluster, index) => {
              const colors = [
                "#ef4444", // Red
                "#10b981", // Green
                "#3b82f6", // Blue
                "#f59e0b", // Yellow
                "#8b5cf6", // Purple
                "#06b6d4", // Cyan
                "#f97316", // Orange
                "#84cc16", // Lime
              ];
              const color = colors[index % colors.length];

              // Convert polygon coordinates for Leaflet
              const polygonCoordinates = convertPolygonCoordinates(
                cluster.polygon_area
              );

              // Use center coordinates from API response with longitude correction
              const centerLat = cluster.center_latitude || cluster.latitude;
              const centerLng = correctLongitude(
                cluster.center_longitude || cluster.longitude
              );

              return (
                <div key={`cluster-${cluster.id}`}>
                  {/* Cluster Polygon */}
                  {polygonCoordinates.length > 0 && (
                    <Polygon
                      positions={polygonCoordinates}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: "10, 5",
                      }}
                    />
                  )}

                  {/* Cluster Center Point */}
                  {centerLat && centerLng && (
                    <Marker
                      position={[centerLat, centerLng]}
                      icon={divIcon({
                        html: `
                          <div style="
                            width: 20px;
                            height: 20px;
                            background: ${color};
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            position: relative;
                          ">
                            <div style="
                              position: absolute;
                              top: -8px;
                              left: -8px;
                              width: 36px;
                              height: 36px;
                              border: 2px solid ${color};
                              border-radius: 50%;
                              opacity: 0.5;
                              animation: pulse-${cluster.id} 2s infinite;
                            "></div>
                          </div>
                          <style>
                            @keyframes pulse-${cluster.id} {
                              0% { transform: scale(1); opacity: 0.5; }
                              50% { transform: scale(1.2); opacity: 0.3; }
                              100% { transform: scale(1); opacity: 0.5; }
                            }
                          </style>
                        `,
                        className: `cluster-center-marker-${cluster.id}`,
                        iconSize: [26, 26], // Slightly larger to account for border
                        iconAnchor: [13, 13], // Center the marker precisely
                      })}
                    >
                      <Popup>
                        <div
                          style={{
                            padding: "8px",
                            fontFamily: "Arial, sans-serif",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: color,
                              marginBottom: "8px",
                            }}
                          >
                            🎯 {cluster.name}
                          </div>
                          {cluster.description && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "4px",
                              }}
                            >
                              {cluster.description}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginBottom: "4px",
                            }}
                          >
                            📍 {centerLat?.toFixed(6)}, {centerLng?.toFixed(6)}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            📏 Area: {formatArea(cluster.area_meters)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </div>
              );
            })}

        {/* Bike Markers */}
        {openTrack &&
          locations.length > 0 &&
          locations.map((location, index) => (
            <PinMarker
              key={`bike-${location.order_id || location.iteration || index}`}
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
      {!openTrack && !openTerminal && !openCluster && !isLoading && !error && (
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

      {/* Cluster Selection Modal */}
      {showClusterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Select Clusters
                </h2>
                <button
                  onClick={() => setShowClusterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <span className="text-gray-500 text-xl">×</span>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Choose which cluster areas to display on the map
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {clusters.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">
                    No clusters available
                  </div>
                  <div className="text-gray-400 text-sm">
                    Please check your connection and try again
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {clusters.map((cluster, index) => {
                    const colors = [
                      "#3b82f6",
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#06b6d4",
                      "#f97316",
                      "#84cc16",
                    ];
                    const color = colors[index % colors.length];
                    const isSelected = selectedClusters.includes(cluster.id);

                    return (
                      <div
                        key={cluster.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          dispatch(toggleClusterSelection(cluster.id))
                        }
                      >
                        <div className="flex items-start gap-3">
                          {/* Color indicator */}
                          <div
                            className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />

                          {/* Cluster info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {cluster.name}
                              </h3>
                              {isSelected && (
                                <span className="text-blue-600 text-sm">✓</span>
                              )}
                            </div>

                            {cluster.description && (
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {cluster.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📏 {formatArea(cluster.area_meters)}</span>
                              <span>
                                📍{" "}
                                {(
                                  cluster.center_latitude || cluster.latitude
                                )?.toFixed(4)}
                                ,{" "}
                                {correctLongitude(
                                  cluster.center_longitude || cluster.longitude
                                )?.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedClusters.length} of {clusters.length} clusters
                  selected
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => dispatch(setSelectedClusters([]))}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() =>
                      dispatch(setSelectedClusters(clusters.map((c) => c.id)))
                    }
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setShowClusterModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;
