import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import bikeIcon from '../../assets/pin.png'
import terminalIcon from '../../assets/bike_terminal.png'
import { Icon, divIcon } from "leaflet";

const PinMarker = ({latlng, type}) => {
  if (latlng != undefined) {
    if (type == "bike") {
      let BikeIcon = new Icon({
        iconUrl: bikeIcon,
        iconSize: [30, 30],
      });  
      return (
        <Marker  position={[`${latlng.latitude}`, `${latlng.longitude}`]} icon={BikeIcon} >
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      );
    } else if (type == "terminal") {
      let TerminalIcon = new Icon({
        iconUrl: terminalIcon,
        iconSize: [30, 30],
      });  
      return (
        <Marker  position={[`${latlng.latitude}`, `${latlng.longitude}`]} icon={TerminalIcon} >
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      );
    } else {
      let TerminalIcon = new Icon({
        iconUrl: terminalIcon,
        iconSize: [30, 30],
      });  
      return (
        <Marker  position={[`${latlng.latitude}`, `${latlng.longitude}`]} icon={TerminalIcon} >
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      );
    }
  }  
};

export default PinMarker;
