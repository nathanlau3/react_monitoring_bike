import React, {useState} from "react";
import './App.css';
import { Icon } from "leaflet";
import Maps from "./components/maps/maps";
import Dashboard from "./components/dashboard";
import Login from "./components/login";
import Account from "./components/account/account"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
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
        {/* <Route path="/dashboard" element={
          <div>
            <Dashboard/>
          </div>
        }/> */}
        <Route path="/user" element={
          <div>
            <Account/>
          </div>
        }/>
      </Routes>
    </Router>
      // </React.StrictMode>
  );
}

export default App;