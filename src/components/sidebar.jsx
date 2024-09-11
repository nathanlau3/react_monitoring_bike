import React, { useState } from "react";
import {FaAngleDoubleLeft, FaBiking, FaWarehouse, FaMapMarkedAlt} from 'react-icons/fa'
import { IconContext } from "react-icons";
import { Navigate, Link } from "react-router-dom";
import {TbAlignBoxBottomCenterFilled} from 'react-icons/tb'
import 'leaflet/dist/leaflet.css';


const ArrayLink = [
  {
    "url": "/",
    "label": "Dashboard",
    "icon": <FaMapMarkedAlt/>
  },
  {
    "url": "/terminal",
    "label": "Terminal",
    "icon": <FaWarehouse/>
  },
  {
    "url": "/bicycle",
    "label": "Bikes",
    "icon": <FaBiking/>
  }
]

const Sidebar = ({ children }) => {
  const [open, setOpen] = useState(true);  
  
  return (
    <div className="flex relative">
      <div className={`flex bg-white ${open ? "w-[250px]" : "w-[100px]"} min-h-screen sticky top-0 z-50`}>
        <div className="h-[100%] w-[100%]">      
          <div className="container mx-auto p-3 h-20 border-b-2 border-slate-300">
            <Link to="/">
              <h2 className="flex justify-center h-[100%] text-2xl items-center font-bold">{!open ? "MB" : "MoBike"}</h2>
            </Link>
          </div>
          <div className="flex-col w-[100%] h-[calc(100%-80px)]"            
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
            className="bg-white absolute rounded-md -right-3 top-1/2 -translate-y-1/2 z-30 p-2"
            onClick={() => setOpen(!open)}
          >
          <IconContext.Provider value={{color: "black", size: "1em"}}>
            {/* {open ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight/>} */}
            <FaAngleDoubleLeft className={`${!open && "rotate-180"}`}/>
          </IconContext.Provider>
        </button>
        </div>
        {/* maps */}
        <div className="relative -mt-7 pt-7 text-2xl font-semibold flex-1 z-20">
          {children}
        </div>  
    </div>
  );
};

export default Sidebar;
