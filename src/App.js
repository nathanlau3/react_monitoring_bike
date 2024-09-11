import React, {useState} from "react";
import './App.css';
import { Icon } from "leaflet";
import Maps from "./components/maps/maps";
import Dashboard from "./components/dashboard";
import Login from "./components/login";
import Account from "./components/account/account"
import bicycle from "./components/bicycle/bicycle";
import Bike_terminal from "./components/bike_terminal/bike_terminal";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Bicycle from "./components/bicycle/bicycle";
function App() {
  return (
    // <React.StrictMode>
    <Router>
      <Routes>
      
        <Route path="/" element={
          <div>          
          {/* // <div className="flex p-5 justify-center h-screen items-center"> */}
            <Dashboard/>
          </div>
        }/>

        <Route path="/terminal" element={
          <div>
            <Bike_terminal/>
          </div>
        }/>

        <Route path="/bicycle" element={
          <div>
            <Bicycle/>
          </div>
        }/>
      
      </Routes>
    </Router>
      // </React.StrictMode>
  );
}

export default App;