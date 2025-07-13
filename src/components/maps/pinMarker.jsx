import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import bikeIcon from "../../assets/pin.png";
import terminalIcon from "../../assets/terminal-point.png";
import { Icon, divIcon } from "leaflet";

// Add CSS styles for better marker positioning
const markerStyles = `
  .custom-bike-marker,
  .custom-terminal-marker,
  .custom-default-marker {
    position: relative !important;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-origin: center bottom;
    will-change: transform;
  }
  
  .custom-bike-marker > div,
  .custom-terminal-marker > div,
  .custom-default-marker > div {
    position: relative;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
        <div style="display: flex; flex-direction: column; align-items: center;">
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
      className: "custom-bike-marker",
      iconSize: [80, 60],
      iconAnchor: [40, 55], // Point to the bottom center of the bike icon
    });
  }, [
    latlng?.tracking_color,
    latlng?.terminal_to,
    latlng?.termina_to,
    latlng?.order_id,
    type,
  ]);

  // Memoize terminal icon creation to update when tracking_color changes
  const customTerminalIcon = useMemo(() => {
    if (type !== "terminal" || !latlng) return null;

    return divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
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
      className: "custom-terminal-marker",
      iconSize: [80, 110],
      iconAnchor: [40, 90], // Point to the bottom center of the terminal icon
    });
  }, [latlng?.tracking_color, latlng?.name, type]);

  // Memoize default icon creation to update when tracking_color changes
  const customDefaultIcon = useMemo(() => {
    if (type === "bike" || type === "terminal" || !latlng) return null;

    return divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
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
      className: "custom-default-marker",
      iconSize: [80, 60],
      iconAnchor: [40, 55], // Point to the bottom center of the icon
    });
  }, [
    latlng?.tracking_color,
    latlng?.fullname,
    latlng?.terminal_to,
    latlng?.termina_to,
    type,
  ]);

  if (latlng !== undefined) {
    if (type === "bike") {
      return (
        <Marker
          key={`bike-${latlng.order_id || latlng.iteration || "default"}-${
            latlng.tracking_color || "blue"
          }-${latlng.iteration}`}
          position={[parseFloat(latlng.latitude), parseFloat(latlng.longitude)]}
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
          position={[parseFloat(latlng.latitude), parseFloat(latlng.longitude)]}
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
          position={[parseFloat(latlng.latitude), parseFloat(latlng.longitude)]}
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
