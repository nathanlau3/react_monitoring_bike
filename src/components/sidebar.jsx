import React, { useState, useCallback, memo, useEffect } from "react";
import {
  FaAngleDoubleLeft,
  FaBiking,
  FaWarehouse,
  FaMapMarkedAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/features/authSlice";
import "leaflet/dist/leaflet.css";

// Constants
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
const NavigationItem = memo(({ item, isOpen, isMobile }) => {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  return (
    <Link
      to={item.url}
      className={`
        flex items-center gap-4 px-5 py-4 cursor-pointer 
        transition-all duration-200 ease-in-out
        relative group
        ${
          isActive
            ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        }
        ${!isOpen && !isMobile ? "justify-center px-3" : ""}
        ${isMobile ? "justify-start" : ""}
      `}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <IconContext.Provider
          value={{
            size: "1.5em",
            className: `transition-colors duration-200 ${
              isActive
                ? "text-blue-600"
                : "text-gray-600 group-hover:text-blue-600"
            }`,
          }}
        >
          <item.icon />
        </IconContext.Provider>

        {/* Tooltip for collapsed state */}
        {!isOpen && !isMobile && (
          <div
            className="
            absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm
            rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 whitespace-nowrap z-50
            before:content-[''] before:absolute before:right-full before:top-1/2 
            before:-translate-y-1/2 before:border-4 before:border-transparent 
            before:border-r-gray-900
          "
          >
            {item.label}
          </div>
        )}
      </div>

      <span
        className={`
          font-medium transition-all duration-200 select-none
          ${!isOpen && !isMobile ? "hidden" : "block"}
        `}
      >
        {item.label}
      </span>
    </Link>
  );
});

NavigationItem.displayName = "NavigationItem";

// Memoized Logo Component
const Logo = memo(({ isOpen, isMobile }) => (
  <div className="p-4 h-20 border-b border-gray-200 bg-white">
    <Link
      to="/"
      className="flex items-center justify-center h-full"
      aria-label="MoBike Dashboard"
    >
      <h1
        className={`
        font-bold text-blue-600 transition-all duration-200
        ${!isOpen && !isMobile ? "text-xl" : "text-2xl"}
      `}
      >
        {!isOpen && !isMobile ? "MB" : "MoBike"}
      </h1>
    </Link>
  </div>
));

Logo.displayName = "Logo";

// Mobile Overlay Component
const MobileOverlay = memo(({ isOpen, onClose }) => (
  <div
    className={`
      fixed inset-0 bg-black transition-opacity duration-300 z-40 lg:hidden
      ${isOpen ? "opacity-50 visible" : "opacity-0 invisible"}
    `}
    onClick={onClose}
    aria-hidden="true"
  />
));

MobileOverlay.displayName = "MobileOverlay";

// Main Sidebar Component
const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && isMobile) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isMobile]);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="font-bold text-xl text-blue-600">
          MoBike
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <IconContext.Provider
            value={{ size: "1.5em", className: "text-gray-600" }}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </IconContext.Provider>
        </button>
      </div>

      <div className="flex relative">
        {/* Mobile Overlay */}
        <MobileOverlay isOpen={isOpen && isMobile} onClose={closeSidebar} />

        {/* Sidebar */}
        <aside
          className={`
            bg-white transition-all duration-300 ease-in-out border-r border-gray-200
            ${
              isMobile
                ? `fixed top-0 left-0 h-full z-50 transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                  } w-64`
                : `sticky top-0 h-screen ${isOpen ? "w-64" : "w-20"}`
            }
          `}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex flex-col h-full">
            <Logo isOpen={isOpen} isMobile={isMobile} />

            <nav className="flex-1 py-4" role="menu">
              {NAVIGATION_ITEMS.map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  isOpen={isOpen}
                  isMobile={isMobile}
                />
              ))}
            </nav>

            {/* User Info and Actions */}
            <div className="border-t border-gray-200">
              {/* User Info */}
              {user && (
                <div className={`p-4 ${!isOpen && !isMobile ? "px-2" : ""}`}>
                  <div
                    className={`flex items-center gap-3 ${
                      !isOpen && !isMobile ? "justify-center" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.email
                          ? user.email.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                    {(isOpen || isMobile) && (
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email || "No email"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={handleLogout}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    text-red-600 hover:bg-red-50 transition-colors duration-200
                    ${!isOpen && !isMobile ? "justify-center" : "justify-start"}
                  `}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <IconContext.Provider value={{ size: "1.2em" }}>
                    <FaSignOutAlt />
                  </IconContext.Provider>
                  {(isOpen || isMobile) && (
                    <span className="font-medium">Sign Out</span>
                  )}
                </button>
              </div>

              {/* Desktop Toggle Button */}
              {!isMobile && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={toggleSidebar}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      hover:bg-gray-100 transition-colors duration-200
                      text-gray-600 hover:text-blue-600
                      ${!isOpen ? "justify-center" : "justify-start"}
                    `}
                    aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                    title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                  >
                    <IconContext.Provider value={{ size: "1.2em" }}>
                      <FaAngleDoubleLeft
                        className={`transition-transform duration-300 ${
                          !isOpen && "rotate-180"
                        }`}
                      />
                    </IconContext.Provider>
                    {isOpen && <span className="font-medium">Collapse</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-gray-50">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </>
  );
};

export default memo(Sidebar);
