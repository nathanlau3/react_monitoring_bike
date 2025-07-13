import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ZoomControl } from "react-leaflet/ZoomControl";
import { useMapEvents } from "react-leaflet/hooks";
import PinMarker from "../maps/pinMarker";
import { UpdateTerminal, CreateTerminal } from "../../api/bike_terminal";
import { SweetAlert2 } from "../../helper/sweetalert";
import LoadingSpinner from "../common/LoadingSpinner";
import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";

// Form Input Component
const FormInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  error,
}) => (
  <div className="relative w-full">
    <input
      className={`peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] ${
        error
          ? "border-red-500 focus:border-red-500"
          : "border-blue-gray-200 focus:border-gray-900"
      }`}
      placeholder=" "
      name={name}
      type={type}
      onChange={onChange}
      value={value || ""}
      required={required}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
      {label}
    </label>
    {error && (
      <p
        id={`${name}-error`}
        className="text-red-500 text-xs mt-1"
        role="alert"
      >
        {error}
      </p>
    )}
  </div>
);

// Map Component
const InteractiveMap = ({ coordinates, onLocationSelect, className }) => {
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        onLocationSelect({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      },
    });
    return null;
  };

  const center = useMemo(
    () =>
      coordinates.latitude && coordinates.longitude
        ? [coordinates.latitude, coordinates.longitude]
        : [-6.235780900122761, 106.84059830598854],
    [coordinates]
  );

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        zoomControl={false}
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.latitude && coordinates.longitude && (
          <PinMarker latlng={coordinates} />
        )}
        <MapClickHandler />
        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  );
};

const BikeTerminalModal = ({ open, onClose, data, isCreate, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    latitude: null,
    longitude: null,
    radius: null,
  });

  // Initialize form data
  useEffect(() => {
    if (data && !isCreate) {
      setFormData({
        name: data.name || "",
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        radius: data.radius || null,
      });
    } else if (isCreate) {
      setFormData({
        name: "",
        latitude: null,
        longitude: null,
        radius: null,
      });
    }
  }, [data, isCreate, open]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Terminal name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Terminal name must be at least 3 characters";
    }

    if (!formData.latitude) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(formData.latitude) || Math.abs(formData.latitude) > 90) {
      newErrors.latitude = "Invalid latitude value";
    }

    if (!formData.longitude) {
      newErrors.longitude = "Longitude is required";
    } else if (
      isNaN(formData.longitude) ||
      Math.abs(formData.longitude) > 180
    ) {
      newErrors.longitude = "Invalid longitude value";
    }

    if (!formData.radius) {
      newErrors.radius = "Radius is required";
    } else if (isNaN(formData.radius) || formData.radius < 0) {
      newErrors.radius = "Invalid radius value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  // Handle map location selection
  const handleLocationSelect = useCallback((coordinates) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    }));

    // Clear coordinate errors
    setErrors((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
    }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isCreate) {
        response = await CreateTerminal(formData);
      } else {
        response = await UpdateTerminal(data.id, formData);
      }

      SweetAlert2(response);

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      SweetAlert2({
        success: false,
        message: "Failed to save terminal. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = useCallback(() => {
    onClose();
    setFormData({
      name: "",
      latitude: null,
      longitude: null,
    });
    setErrors({});
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, handleClose]);

  if (!open) return null;

  console.log("Modal props:", { open, isCreate, data });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-2xl font-semibold text-gray-900">
            {isCreate ? "Add New" : "Edit"} Bike Terminal
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium text-gray-700">
                <FaMapMarkerAlt />
                Select Location
              </div>
              <p className="text-sm text-gray-600">
                Click on the map to select the terminal location
              </p>
              <InteractiveMap
                coordinates={formData}
                onLocationSelect={handleLocationSelect}
                className="w-full h-64 lg:h-80"
              />
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Terminal Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  error={errors.name}
                />

                <FormInput
                  label="Latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  error={errors.latitude}
                />

                <FormInput
                  label="Longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  error={errors.longitude}
                />

                <FormInput
                  label="Radius"
                  name="radius"
                  type="number"
                  value={formData.radius}
                  onChange={handleChange}
                />

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        {isCreate ? "Creating..." : "Updating..."}
                      </>
                    ) : isCreate ? (
                      "Create Terminal"
                    ) : (
                      "Update Terminal"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BikeTerminalModal);
