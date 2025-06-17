import React, { useState } from "react";
import "./App.css";
import Dashboard from "./components/dashboard";
import BikeTerminal from "./components/bike_terminal/bikeTerminal.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Bicycle from "./components/bicycle/bicycle";
import Login from "./components/login";
import { Provider, useSelector } from "react-redux";
import { store } from "./redux/store";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/terminal"
            element={
              <ProtectedRoute>
                <BikeTerminal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bicycle"
            element={
              <ProtectedRoute>
                <Bicycle />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
