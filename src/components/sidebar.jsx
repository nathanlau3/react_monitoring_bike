import React, { useState } from "react";
import {FaAngleDoubleLeft, FaUserCircle} from 'react-icons/fa'
import { IconContext } from "react-icons";
import { Navigate, Link } from "react-router-dom";
import {TbAlignBoxBottomCenterFilled} from 'react-icons/tb'
import 'leaflet/dist/leaflet.css';
import { useMap } from "react-leaflet";
import Maps from "./maps/maps";

const ArrayLink = [
  {
    "url": "/dashboard",
    "label": "Dashboard",
    "icon": <TbAlignBoxBottomCenterFilled/>
  },
  {
    "url": "/user",
    "label": "User",
    "icon": <FaUserCircle/>
  }
]

const Sidebar = ({ children }) => {
  const [open, setOpen] = useState(true);  
  const [openTrack, setOpenTrack] = useState(false)
  const [marker, setMarker] = useState({
    lat: -7.774704633801179,
    lng: 110.37681391039119
  })
  return (
    <div className="flex relative">
      <div className={`flex bg-white ${open ? "w-[250px]" : "w-[100px]"} h-screen relative `}>
        <div className="h-[100%] w-[100%]">      
          <div className="container mx-auto p-3 h-20 border-b-2 border-slate-300">
            <Link to="/dashboard">
              <h2 className="flex justify-center h-[100%] text-2xl items-center font-bold">{!open ? "MB" : "MoBike"}</h2>
            </Link>
          </div>
          <div className="flex flex-col gap-3 my-3 w-[100%] h-[100%]"            
            >
          {ArrayLink.map((x, i) => (
              <Link 
                key={i}
                className={`flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-gray-300 ${!open ? "justify-center" : ""}`}
                to={`${x.url}`}                        
              >
              <IconContext.Provider value={{ size: "2em" }}>
                {x.icon}
              </IconContext.Provider>
              <span className={`${!open ? "hidden" : ""}`}>{x.label}</span>
              </Link>                          
            
          ))}
          </div>
        </div>      
      <button 
          className="bg-white absolute rounded-md -right-3 top-1/2 -translate-y-1/2 z-40 p-2"
          onClick={() => setOpen(!open)}
        >
        <IconContext.Provider value={{color: "black", size: "1em"}}>
          {/* {open ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight/>} */}
          <FaAngleDoubleLeft className={`${!open && "rotate-180"}`}/>
        </IconContext.Provider>
      </button>
      </div>
      {/* maps */}
      <div className="-mb-7 -mt-7 pt-7 text-2xl font-semibold flex-1 z-30">
        <Maps 
          style={{ width: "100%", height: "100vh" }}
          sidebarWidth={!open?200:70}          
          openTrack={openTrack}          
        />
      </div>      
      <div className="grid grid-cols-6 gap-[150px] absolute container w-[1000px] px-[500px] z-40 p-5 mt-5">
        <button 
          className="w-20 h-7 rounded-3xl bg-white shadow shadow-neutral-950"          
          onClick={() => setOpenTrack(!openTrack)}
        >          
        </button>        
      </div>
    </div>
  );
};

export default Sidebar;
