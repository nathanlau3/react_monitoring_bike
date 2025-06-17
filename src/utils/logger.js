// Logger utility to control logging throughout the application

// Check if logging is disabled via environment variable
const isLoggingDisabled = process.env.REACT_APP_DISABLE_LOGS === "true";

// Create logger object with conditional logging
export const logger = {
  log: isLoggingDisabled ? () => {} : console.log.bind(console),
  warn: isLoggingDisabled ? () => {} : console.warn.bind(console),
  error: isLoggingDisabled ? () => {} : console.error.bind(console),
  info: isLoggingDisabled ? () => {} : console.info.bind(console),
  debug: isLoggingDisabled ? () => {} : console.debug.bind(console),
  trace: isLoggingDisabled ? () => {} : console.trace.bind(console),
};

// Disable console methods globally if needed
export const disableAllLogs = () => {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
};

// Override React warnings
export const disableReactWarnings = () => {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") ||
        args[0].includes("deprecated") ||
        args[0].includes("Legacy") ||
        args[0].includes("componentWill") ||
        args[0].includes("findDOMNode") ||
        args[0].includes("ReactDOM.render"))
    ) {
      return;
    }
    originalWarn(...args);
  };
};

// Initialize log suppression based on environment
export const initializeLogSuppression = () => {
  console.log("🚀 Initializing log suppression...");
  console.log("Environment variables:");
  console.log("- REACT_APP_DISABLE_LOGS:", process.env.REACT_APP_DISABLE_LOGS);
  console.log(
    "- REACT_APP_DISABLE_REACT_WARNINGS:",
    process.env.REACT_APP_DISABLE_REACT_WARNINGS
  );
  console.log("- REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);

  if (
    process.env.NODE_ENV === "production" ||
    process.env.REACT_APP_DISABLE_LOGS === "true"
  ) {
    disableAllLogs();
    console.log("✅ All logs disabled");
  } else {
    console.log("✅ Logs enabled for development");
  }

  if (process.env.REACT_APP_DISABLE_REACT_WARNINGS === "true") {
    disableReactWarnings();
    console.log("✅ React warnings disabled");
  } else {
    console.log("✅ React warnings enabled");
  }
};

export default logger;
