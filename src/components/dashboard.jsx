import React, { useState } from "react";
import "flowbite";
import Sidebar from "./sidebar";
import Maps from "./maps/maps";

const Dashboard = () => {
  const [openTrack] = useState(false);
  const [marker, setMarker] = useState({
    lat: -7.774704633801179,
    lng: 110.37681391039119,
  });
  const [open, setOpen] = useState(true);
  return (
    <Sidebar>
      <Maps
        style={{ width: "100%", height: "100vh" }}
        sidebarWidth={!open ? 200 : 70}
        openTrack={openTrack}
      />
    </Sidebar>
  );
};

export default Dashboard;
