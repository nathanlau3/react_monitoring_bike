import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { initializeLogSuppression } from "./utils/logger";

// Test console.log before anything else
console.log("🚀 Index.js loaded - console.log working BEFORE logger init");

// Initialize log suppression based on environment variables
initializeLogSuppression();

// Test console.log after logger initialization
console.log("✅ Index.js - console.log working AFTER logger init");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
