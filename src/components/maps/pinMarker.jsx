import { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import bikeIcon from "../../assets/pin.png";
import terminalIcon from "../../assets/terminal-point.png";
import { Icon, divIcon } from "leaflet";

// Add CSS styles for better marker positioning and smooth animation
const markerStyles = `
  .custom-bike-marker,
  .custom-terminal-marker,
  .custom-default-marker {
    position: relative !important;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-origin: center bottom;
    will-change: transform;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .custom-bike-marker > div,
  .custom-terminal-marker > div,
  .custom-default-marker > div {
    position: relative;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .animated-marker {
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .animated-marker .leaflet-marker-icon {
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  /* Pulse animation for active tracking */
  .tracking-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  /* Smooth bounce animation for new position */
  .position-update {
    animation: bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes bounce {
    0% {
      transform: translateY(0px) scale(1);
    }
    50% {
      transform: translateY(-8px) scale(1.1);
    }
    100% {
      transform: translateY(0px) scale(1);
    }
  }

  /* Add a subtle glow effect for moving markers */
  .custom-bike-marker.animated-marker.tracking-pulse::before,
  .custom-terminal-marker.animated-marker.tracking-pulse::before,
  .custom-default-marker.animated-marker.tracking-pulse::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
    animation: glow 2s ease-in-out infinite;
  }

  @keyframes glow {
    0%, 100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }
`;

// Inject styles into document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = markerStyles;
  if (!document.head.querySelector("[data-marker-styles]")) {
    styleSheet.setAttribute("data-marker-styles", "true");
    document.head.appendChild(styleSheet);
  }
}

const PinMarker = ({ latlng, type }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPositionUpdate, setHasPositionUpdate] = useState(false);
  const previousPositionRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize position on first render
  useEffect(() => {
    if (latlng && !currentPosition) {
      const newPosition = [
        parseFloat(latlng.latitude),
        parseFloat(latlng.longitude),
      ];
      setCurrentPosition(newPosition);
      previousPositionRef.current = newPosition;
    }
  }, [latlng, currentPosition]);

  // Handle position updates with smooth animation
  useEffect(() => {
    if (!latlng || !currentPosition) return;

    const newPosition = [
      parseFloat(latlng.latitude),
      parseFloat(latlng.longitude),
    ];
    const prevPosition = previousPositionRef.current;

    // Check if position actually changed
    if (
      prevPosition &&
      (Math.abs(newPosition[0] - prevPosition[0]) > 0.000001 ||
        Math.abs(newPosition[1] - prevPosition[1]) > 0.000001)
    ) {
      // Log animation trigger for debugging
      if (type === "bike") {
        console.log("🚴 [ANIMATION] Triggering smooth movement:", {
          order_id: latlng.order_id,
          from: prevPosition,
          to: newPosition,
          distance: Math.sqrt(
            Math.pow(newPosition[0] - prevPosition[0], 2) +
              Math.pow(newPosition[1] - prevPosition[1], 2)
          ).toFixed(6),
          timestamp: new Date().toISOString(),
        });
      }

      // Animate to new position
      animateToPosition(newPosition);
      previousPositionRef.current = newPosition;

      // Trigger position update animation
      setHasPositionUpdate(true);
      setTimeout(() => setHasPositionUpdate(false), 600);
    }
  }, [
    latlng?.latitude,
    latlng?.longitude,
    currentPosition,
    type,
    latlng?.order_id,
  ]);

  // Smooth animation function
  const animateToPosition = (targetPosition) => {
    if (!currentPosition || isAnimating) return;

    setIsAnimating(true);
    const startPosition = [...currentPosition];
    const startTime = Date.now();
    const duration = 800; // 0.8 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (cubic-bezier equivalent)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const lat =
        startPosition[0] +
        (targetPosition[0] - startPosition[0]) * easeProgress;
      const lng =
        startPosition[1] +
        (targetPosition[1] - startPosition[1]) * easeProgress;

      setCurrentPosition([lat, lng]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentPosition(targetPosition);
        setIsAnimating(false);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Debug logging to track color changes
  useEffect(() => {
    if (latlng && type === "bike") {
      console.log("🎨 [PIN MARKER] Color update:", {
        order_id: latlng.order_id,
        tracking_color: latlng.tracking_color,
        iteration: latlng.iteration,
        timestamp: new Date().toISOString(),
      });
    }
  }, [latlng?.tracking_color, latlng?.order_id, latlng?.iteration, type]);

  // Memoize bike icon creation to update when tracking_color changes
  const customBikeIcon = useMemo(() => {
    if (type !== "bike" || !latlng) return null;

    console.log(
      "🔄 [PIN MARKER] Regenerating bike icon with color:",
      latlng.tracking_color,
      "for order:",
      latlng.order_id
    );

    return divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;" class="${
          hasPositionUpdate ? "position-update" : ""
        } ${isAnimating ? "tracking-pulse" : ""}">
          <img src="${bikeIcon}" style="width: 30px; height: 30px;" />
          <div style="
            background: ${latlng.tracking_color || "rgba(37, 99, 235, 0.9)"};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            margin-top: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.3);
          ">
            to: ${latlng.terminal_to || latlng.termina_to || "Unknown Terminal"}
          </div>
        </div>
      `,
      className: `custom-bike-marker animated-marker ${
        isAnimating ? "tracking-pulse" : ""
      }`,
      iconSize: [80, 60],
      iconAnchor: [40, 55], // Point to the bottom center of the bike icon
    });
  }, [
    latlng?.tracking_color,
    latlng?.terminal_to,
    latlng?.termina_to,
    latlng?.order_id,
    type,
    hasPositionUpdate,
    isAnimating,
  ]);

  // Memoize terminal icon creation to update when tracking_color changes
  const customTerminalIcon = useMemo(() => {
    if (type !== "terminal" || !latlng) return null;

    return divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;" class="${
          hasPositionUpdate ? "position-update" : ""
        } ${isAnimating ? "tracking-pulse" : ""}">
          <img src="${terminalIcon}" style="width: 50px; height: 80px;" />
          <div style="
            background: ${latlng.tracking_color || "rgba(124, 58, 237, 0.9)"};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            margin-top: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.3);
          ">
            ${latlng.name || "Terminal"}
          </div>
        </div>
      `,
      className: `custom-terminal-marker animated-marker ${
        isAnimating ? "tracking-pulse" : ""
      }`,
      iconSize: [80, 110],
      iconAnchor: [40, 90], // Point to the bottom center of the terminal icon
    });
  }, [
    latlng?.tracking_color,
    latlng?.name,
    type,
    hasPositionUpdate,
    isAnimating,
  ]);

  // Memoize default icon creation to update when tracking_color changes
  const customDefaultIcon = useMemo(() => {
    if (type === "bike" || type === "terminal" || !latlng) return null;

    return divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;" class="${
          hasPositionUpdate ? "position-update" : ""
        } ${isAnimating ? "tracking-pulse" : ""}">
          <img src="${terminalIcon}" style="width: 30px; height: 30px;" />
          <div style="
            background: ${latlng.tracking_color || "rgba(55, 65, 81, 0.9)"};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            margin-top: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.3);
          ">
            ${
              latlng.fullname ||
              latlng.terminal_to ||
              latlng.termina_to ||
              "Location"
            }
          </div>
        </div>
      `,
      className: `custom-default-marker animated-marker ${
        isAnimating ? "tracking-pulse" : ""
      }`,
      iconSize: [80, 60],
      iconAnchor: [40, 55], // Point to the bottom center of the icon
    });
  }, [
    latlng?.tracking_color,
    latlng?.fullname,
    latlng?.terminal_to,
    latlng?.termina_to,
    type,
    hasPositionUpdate,
    isAnimating,
  ]);

  if (latlng !== undefined && currentPosition) {
    if (type === "bike") {
      return (
        <Marker
          key={`bike-${latlng.order_id || latlng.iteration || "default"}-${
            latlng.tracking_color || "blue"
          }-${latlng.iteration}`}
          position={currentPosition}
          icon={customBikeIcon}
        >
          <Popup maxWidth={300} minWidth={200}>
            <div style={{ padding: "8px", fontFamily: "Arial, sans-serif" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: latlng.tracking_color || "#2563eb",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🚴 {latlng.terminal_to || latlng.termina_to}
              </div>

              {latlng.fullname && (
                <div style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#374151" }}>Name:</strong>
                  <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                    {latlng.fullname}
                  </span>
                </div>
              )}

              {(latlng.termina_to || latlng.terminal_to) && (
                <div style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#374151" }}>Destination:</strong>
                  <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                    {latlng.terminal_to || latlng.termina_to}
                  </span>
                </div>
              )}

              {latlng.tracking_color && (
                <div style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#374151" }}>Color:</strong>
                  <span
                    style={{ marginLeft: "8px", color: latlng.tracking_color }}
                  >
                    {latlng.tracking_color}
                  </span>
                </div>
              )}

              <div
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                📍 {Number(latlng.latitude)?.toFixed(6)},{" "}
                {Number(latlng.longitude)?.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    } else if (type === "terminal") {
      console.log(latlng);

      return (
        <Marker
          key={`terminal-${latlng.id || latlng.iteration || "default"}-${
            latlng.tracking_color || "purple"
          }`}
          position={currentPosition}
          icon={customTerminalIcon}
        >
          <Popup maxWidth={300} minWidth={200}>
            <div style={{ padding: "8px", fontFamily: "Arial, sans-serif" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#7c3aed",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🏪 Terminal Station
              </div>

              {latlng.fullname && (
                <div style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#374151" }}>Name:</strong>
                  <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                    {latlng.fullname}
                  </span>
                </div>
              )}

              {(latlng.termina_to || latlng.terminal_to) && (
                <div style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#374151" }}>Terminal ID:</strong>
                  <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                    {latlng.terminal_to || latlng.termina_to}
                  </span>
                </div>
              )}

              <div
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                📍 {Number(latlng.latitude)?.toFixed(6)},{" "}
                {Number(latlng.longitude)?.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    } else {
      return (
        <Marker
          key={`default-${latlng.id || latlng.iteration || "default"}-${
            latlng.tracking_color || "gray"
          }`}
          position={currentPosition}
          icon={customDefaultIcon}
        >
          <Popup maxWidth={300} minWidth={200}>
            <div style={{ padding: "8px", fontFamily: "Arial, sans-serif" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📍 Location
              </div>

              {latlng.fullname && (
                <div style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#374151" }}>Name:</strong>
                  <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                    {latlng.fullname}
                  </span>
                </div>
              )}

              {(latlng.termina_to || latlng.terminal_to) && (
                <div style={{ marginBottom: "6px" }}>
                  <strong style={{ color: "#374151" }}>Terminal:</strong>
                  <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                    {latlng.terminal_to || latlng.termina_to}
                  </span>
                </div>
              )}

              <div
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                📍 {Number(latlng.latitude)?.toFixed(6)},{" "}
                {Number(latlng.longitude)?.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    }
  }
};

export default PinMarker;
