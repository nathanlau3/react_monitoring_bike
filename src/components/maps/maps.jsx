import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ZoomControl } from "react-leaflet/ZoomControl";
import { db } from "../../config/firebase";
import {
  onValue,
  ref,
  getDatabase,
  get,
  onChildAdded,
} from "firebase/database";
import PinMarker from "./pinMarker";

const Maps = ({ sidebarWidth, openTrack }) => {
  const [locations, setLocations] = useState([]);
  let i = 1;
  useEffect(() => {
    onValue(ref(db, "/tracking-user"), (snapshot) => {
      const data = snapshot.val();
      // console.log('snapshot -->>>', data)

      let asw = [];
      Object.keys(data).forEach((val, key) => {
        let check = data[val];
        console.log("check ->>>", check);
        check.iteration = i;
        // console.log(check)
        asw.push(check);
        i++;
      });
      setLocations(asw);
      console.log(asw);
      // console.log(locations)
    });
  }, []);
  useEffect(() => {
    console.log("location ->>", locations);
  }, [locations]);
  return (
    <MapContainer
      zoomControl={false}
      center={[-6.235780900122761, 106.84059830598854]}
      zoom={15}
      scrollWheelZoom={true}
      className={`h-screen w-[calc(100vw-${sidebarWidth}px)]`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {openTrack &&
        locations.length &&
        locations.map((x) => {
          console.log("ASUUUU ->>>", x);
          return <PinMarker key={x.iteration} latlng={x} />;
        })}
      <ZoomControl position="topright" />
    </MapContainer>
  );
};

export default Maps;
