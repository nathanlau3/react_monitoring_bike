import React, { useState, useCallback, memo } from "react";
import {
  FaAngleDoubleLeft,
  FaBiking,
  FaWarehouse,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import { Link, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Constants
const SIDEBAR_WIDTH = {
  EXPANDED: "250px",
  COLLAPSED: "100px",
};

const NAVIGATION_ITEMS = [
  {
    id: "dashboard",
    url: "/",
    label: "Dashboard",
    icon: FaMapMarkedAlt,
  },
  {
    id: "terminal",
    url: "/terminal",
    label: "Terminal",
    icon: FaWarehouse,
  },
  {
    id: "bicycle",
    url: "/bicycle",
    label: "Bikes",
    icon: FaBiking,
  },
];

// Memoized Navigation Item Component
const NavigationItem = memo(({ item, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  return (
    <Link
      to={item.url}
      className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors duration-200
        ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}
        ${!isOpen ? "justify-center" : ""}`}
    >
      <IconContext.Provider
        value={{ size: "2em", className: isActive ? "text-blue-600" : "" }}
      >
        <item.icon />
      </IconContext.Provider>
      <span
        className={`transition-opacity duration-200 ${!isOpen ? "hidden" : ""}`}
      >
        {item.label}
      </span>
    </Link>
  );
});

NavigationItem.displayName = "NavigationItem";

// Memoized Logo Component
const Logo = memo(({ isOpen }) => (
  <div className="container mx-auto p-3 h-20 border-b-2 border-slate-300">
    <Link to="/" className="block h-full">
      <h2 className="flex justify-center h-full text-2xl items-center font-bold transition-all duration-200">
        {!isOpen ? "MB" : "MoBike"}
      </h2>
    </Link>
  </div>
));

Logo.displayName = "Logo";

// Main Sidebar Component
const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex relative">
      <div
        className={`flex bg-white transition-all duration-300 ease-in-out
          ${
            isOpen
              ? `w-[${SIDEBAR_WIDTH.EXPANDED}]`
              : `w-[${SIDEBAR_WIDTH.COLLAPSED}]`
          }
          min-h-screen sticky top-0 z-50 shadow-lg`}
      >
        <div className="h-full w-full">
          <Logo isOpen={isOpen} />

          <nav className="flex-col w-full h-[calc(100%-80px)]">
            {NAVIGATION_ITEMS.map((item) => (
              <NavigationItem key={item.id} item={item} isOpen={isOpen} />
            ))}
          </nav>
        </div>

        <button
          className="bg-white absolute rounded-md -right-3 top-1/2 -translate-y-1/2 z-30 p-2
            shadow-md hover:bg-gray-100 transition-colors duration-200"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <IconContext.Provider value={{ color: "black", size: "1em" }}>
            <FaAngleDoubleLeft
              className={`transition-transform duration-300 ${
                !isOpen && "rotate-180"
              }`}
            />
          </IconContext.Provider>
        </button>
      </div>

      <main className="relative -mt-7 pt-7 text-2xl font-semibold flex-1 z-20">
        {children}
      </main>
    </div>
  );
};

export default memo(Sidebar);
