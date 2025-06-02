import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ZoomControl } from "react-leaflet/ZoomControl";
import { collection, getDocs } from "firebase/firestore";
import { dbFirestore } from "../../config/firebase";
import PinMarker from "./pinMarker";
import { socket } from "../../config/socket";

// Constants
const MAP_BUTTONS = [
  { id: "bicycle", label: "Bicycle" },
  { id: "terminal", label: "Terminal" },
];

const DEFAULT_CENTER = [-7.77561471227957, 110.37319551913158];
const DEFAULT_ZOOM = 15;

const Maps = ({ sidebarWidth }) => {
  // State management
  const [locations, setLocations] = useState([]);
  const [openTrack, setOpenTrack] = useState(false);
  const [openTerminal, setOpenTerminal] = useState(false);
  const [terminals, setTerminals] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Socket event handlers
  const handleConnect = useCallback(() => {
    console.log("Connected to socket");
    setIsConnected(true);
    socket.on("tracking-update", handleTrackingUpdate);
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("Disconnected from socket");
    setIsConnected(false);
    socket.off("tracking-update", handleTrackingUpdate);
  }, []);

  const handleTrackingUpdate = useCallback((data) => {
    console.log("Received tracking update:", data);
    // Implement tracking update logic here
  }, []);

  // Terminal data fetching
  const fetchTerminals = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(dbFirestore, "terminal"));
      const terminalData = querySnapshot.docs.map((doc, index) => ({
        ...doc.data(),
        iteration: index + 1,
      }));
      setTerminals(terminalData);
    } catch (error) {
      console.error("Error fetching terminals:", error);
    }
  }, []);

  // Button click handler
  const handleButtonClick = useCallback((buttonId) => {
    switch (buttonId) {
      case "bicycle":
        setOpenTrack((prev) => !prev);
        break;
      case "terminal":
        setOpenTerminal((prev) => !prev);
        break;
      default:
        break;
    }
  }, []);

  // Socket connection management
  useEffect(() => {
    socket.connect();
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [handleConnect, handleDisconnect]);

  // Initial data fetch
  useEffect(() => {
    fetchTerminals();
  }, [fetchTerminals]);

  return (
    <>
      <div className="grid grid-cols-6 gap-[100px] absolute container w-[500px] ml-10 z-40 p-5 mt-5">
        {MAP_BUTTONS.map(({ id, label }) => (
          <button
            key={id}
            className="w-20 h-7 rounded-3xl bg-white shadow shadow-neutral-950 z-40 text-sm hover:bg-gray-100 transition-colors"
            onClick={() => handleButtonClick(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <MapContainer
        zoomControl={false}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className={`h-screen w-[calc(100vw-${sidebarWidth}px)] z-30`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {openTrack &&
          locations.length > 0 &&
          locations.map((location) => (
            <PinMarker key={location.iteration} latlng={location} type="bike" />
          ))}

        {openTerminal &&
          terminals.length > 0 &&
          terminals.map((terminal) => (
            <PinMarker
              key={terminal.iteration}
              latlng={terminal}
              type="terminal"
            />
          ))}

        <ZoomControl position="topright" />
      </MapContainer>
    </>
  );
};

export default Maps;
