import React, { useState } from "react";
import "./App.css";
import Dashboard from "./components/dashboard";
import BikeTerminal from "./components/bike_terminal/bike_terminal";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Bicycle from "./components/bicycle/bicycle";
function App() {
  return (
    // <React.StrictMode>
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              {/* // <div className="flex p-5 justify-center h-screen items-center"> */}
              <Dashboard />
            </div>
          }
        />

        <Route
          path="/terminal"
          element={
            <div>
              <BikeTerminal />
            </div>
          }
        />

        <Route
          path="/bicycle"
          element={
            <div>
              <Bicycle />
            </div>
          }
        />
      </Routes>
    </Router>
    // </React.StrictMode>
  );
}

export default App;
