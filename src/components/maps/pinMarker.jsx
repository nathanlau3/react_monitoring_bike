import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import icon from '../../assets/pin.png'
import { Icon, divIcon } from "leaflet";

const PinMarker = ({latlng}) => {
  let DefaultIcon = new Icon({
    
    iconUrl: icon,
    iconSize: [30, 30],
  });  
  console.log(latlng)
  if (latlng != undefined) {
    return (
      <Marker  position={[`${latlng.lat}`, `${latlng.lng}`]} icon={DefaultIcon} >
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    );
  }  
};

export default PinMarker;
