import React from "react";
import { Typography } from "@material-tailwind/react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

const ErrorMessage = ({
  message = "Something went wrong",
  onRetry,
  showRetry = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-center mb-4">
        <FaExclamationTriangle className="text-red-500 mr-2" size={24} />
        <Typography variant="h6" color="red" className="font-semibold">
          Error
        </Typography>
      </div>

      <Typography variant="paragraph" color="red" className="text-center mb-4">
        {message}
      </Typography>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <FaRedo size={14} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
