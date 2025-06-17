import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import bikeIcon from "../../assets/pin.png";
import terminalIcon from "../../assets/terminal-point.png";
import { Icon, divIcon } from "leaflet";

const PinMarker = ({ latlng, type }) => {
  if (latlng !== undefined) {
    if (type === "bike") {
      // Create custom marker with text label
      const customBikeIcon = divIcon({
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-15px, -30px);">
            <img src="${bikeIcon}" style="width: 30px; height: 30px;" />
            <div style="
              background: rgba(37, 99, 235, 0.9);
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
              to: ${
                latlng.terminal_to || latlng.termina_to || "Unknown Terminal"
              }
            </div>
          </div>
        `,
        className: "custom-bike-marker",
        iconSize: [60, 50],
        iconAnchor: [30, 40],
      });

      return (
        <Marker
          position={[`${latlng.latitude}`, `${latlng.longitude}`]}
          icon={customBikeIcon}
        >
          <Popup maxWidth={300} minWidth={200}>
            <div style={{ padding: "8px", fontFamily: "Arial, sans-serif" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#2563eb",
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

              <div
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                📍 {latlng.latitude?.toFixed(6)}, {latlng.longitude?.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    } else if (type === "terminal") {
      // Create custom marker with text label for terminals
      const customTerminalIcon = divIcon({
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-25px, -40px);">
            <img src="${terminalIcon}" style="width: 50px; height: 80px;" />
            <div style="
              background: rgba(124, 58, 237, 0.9);
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
                "Terminal"
              }
            </div>
          </div>
        `,
        className: "custom-terminal-marker",
        iconSize: [80, 100],
        iconAnchor: [40, 80],
      });

      return (
        <Marker
          position={[`${latlng.latitude}`, `${latlng.longitude}`]}
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
                📍 {latlng.latitude?.toFixed(6)}, {latlng.longitude?.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    } else {
      // Default marker with text label
      const customDefaultIcon = divIcon({
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-15px, -30px);">
            <img src="${terminalIcon}" style="width: 30px; height: 30px;" />
            <div style="
              background: rgba(55, 65, 81, 0.9);
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
        iconSize: [60, 50],
        iconAnchor: [30, 40],
      });

      return (
        <Marker
          position={[`${latlng.latitude}`, `${latlng.longitude}`]}
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
                📍 {latlng.latitude?.toFixed(6)}, {latlng.longitude?.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    }
  }
};

export default PinMarker;
