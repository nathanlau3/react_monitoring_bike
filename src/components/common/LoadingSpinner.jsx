import React from "react";
import { Typography } from "@material-tailwind/react";

const LoadingSpinner = ({ message = "Loading...", size = "large" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 mb-4`}
      />
      <Typography variant="paragraph" color="gray" className="text-center">
        {message}
      </Typography>
    </div>
  );
};

export default LoadingSpinner;
