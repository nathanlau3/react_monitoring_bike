import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBicycle, FaTimes, FaSpinner, FaMapMarkerAlt } from "react-icons/fa";
import {
  createBikeVehicle,
  updateBikeVehicle,
  closeModal,
} from "../../redux/features/bikeVehicleSlice";

const BikeVehicleModal = ({ open, onClose, isCreate, selectedVehicle }) => {
  const dispatch = useDispatch();
  const { terminals, isCreating, isUpdating, createError, updateError } =
    useSelector((state) => state.bikeVehicle);

  const [formData, setFormData] = useState({
    number: "",
    original_terminal_id: "",
    current_terminal_id: "",
    status: true,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (selectedVehicle && !isCreate) {
      setFormData({
        number: selectedVehicle.number || "",
        original_terminal_id: selectedVehicle.original_terminal_id || "",
        current_terminal_id: selectedVehicle.current_terminal_id || "",
        status:
          selectedVehicle.status !== undefined ? selectedVehicle.status : true,
      });
    } else if (isCreate) {
      setFormData({
        number: "",
        original_terminal_id: "",
        current_terminal_id: "",
        status: true,
      });
    }
    setErrors({});
  }, [selectedVehicle, isCreate, open]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.number || formData.number.toString().trim() === "") {
      newErrors.number = "Bike number is required";
    } else if (isNaN(formData.number) || parseInt(formData.number) <= 0) {
      newErrors.number = "Bike number must be a positive number";
    }

    if (!formData.original_terminal_id) {
      newErrors.original_terminal_id = "Original terminal is required";
    }

    if (!formData.current_terminal_id) {
      newErrors.current_terminal_id = "Current terminal is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      number: parseInt(formData.number),
      original_terminal_id: parseInt(formData.original_terminal_id),
      current_terminal_id: parseInt(formData.current_terminal_id),
    };

    try {
      if (isCreate) {
        await dispatch(createBikeVehicle(submitData)).unwrap();
      } else {
        await dispatch(
          updateBikeVehicle({
            id: selectedVehicle.id,
            vehicleData: submitData,
          })
        ).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle modal close
  const handleClose = useCallback(() => {
    setFormData({
      number: "",
      original_terminal_id: "",
      current_terminal_id: "",
      status: true,
    });
    setErrors({});
    dispatch(closeModal());
    if (onClose) onClose();
  }, [dispatch, onClose]);

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

  const isLoading = isCreating || isUpdating;
  const currentError = createError || updateError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBicycle className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isCreate ? "Add New Bike Vehicle" : "Edit Bike Vehicle"}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {isCreate
                    ? "Create a new bike vehicle in the system"
                    : `Update bike vehicle #${
                        selectedVehicle?.number || selectedVehicle?.id
                      }`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              <FaTimes className="text-gray-500 text-xl" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {currentError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{currentError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bike Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bike Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.number
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter bike number (e.g., 001, 002)"
                disabled={isLoading}
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-600">{errors.number}</p>
              )}
            </div>

            {/* Original Terminal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Terminal <span className="text-red-500">*</span>
              </label>
              <select
                name="original_terminal_id"
                value={formData.original_terminal_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.original_terminal_id
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                disabled={isLoading}
              >
                <option value="">Select original terminal</option>
                {terminals.map((terminal) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name || `Terminal ${terminal.id}`}
                  </option>
                ))}
              </select>
              {errors.original_terminal_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.original_terminal_id}
                </p>
              )}
            </div>

            {/* Current Terminal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Terminal <span className="text-red-500">*</span>
              </label>
              <select
                name="current_terminal_id"
                value={formData.current_terminal_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.current_terminal_id
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                disabled={isLoading}
              >
                <option value="">Select current terminal</option>
                {terminals.map((terminal) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name || `Terminal ${terminal.id}`}
                  </option>
                ))}
              </select>
              {errors.current_terminal_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.current_terminal_id}
                </p>
              )}
            </div>

            {/* Status Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      formData.status ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        formData.status ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                </label>
                <span
                  className={`text-sm font-medium ${
                    formData.status ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active bikes are available for use, inactive bikes are not
                available
              </p>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <FaSpinner className="animate-spin" />}
              {isCreate ? "Create Bike" : "Update Bike"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeVehicleModal;
