import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../sidebar";
import BikeVehicleModal from "./BikeVehicleModal";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaBicycle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  fetchBikeVehicles,
  fetchTerminals,
  deleteBikeVehicle,
  openModal,
  closeModal,
  setSearchTerm,
  setStatusFilter,
  setTerminalFilter,
  filterVehicles,
  clearErrors,
} from "../../redux/features/bikeVehicleSlice";
import Swal from "sweetalert2";

// Constants
const TABLE_HEAD = ["No", "Bike #", "Terminal Info", "Status", "Actions"];

const BUTTON_STYLES = {
  primary:
    "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2",
  edit: "bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1",
  delete:
    "bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1",
  view: "bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    <div
      className={`w-2 h-2 rounded-full mr-1.5 ${
        status ? "bg-green-400" : "bg-red-400"
      }`}
    />
    {status ? "Active" : "Inactive"}
  </span>
);

const BikeVehicleTableRow = ({
  vehicle,
  index,
  onEdit,
  onDelete,
  terminals,
}) => {
  const getTerminalName = (terminalId) => {
    const terminal = terminals.find((t) => t.id === terminalId);
    return terminal?.name || `Terminal ${terminalId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {index + 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FaBicycle className="text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              Bike #{vehicle.number}
            </div>
            <div className="text-sm text-gray-500">ID: {vehicle.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400 text-xs" />
            <span className="text-sm text-gray-900 font-medium">Current:</span>
            <span className="text-sm text-blue-600">
              {getTerminalName(vehicle.current_terminal_id)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400 text-xs" />
            <span className="text-sm text-gray-900 font-medium">Original:</span>
            <span className="text-sm text-gray-600">
              {getTerminalName(vehicle.original_terminal_id)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Created: {formatDate(vehicle.created_at)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={vehicle.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(vehicle)}
            className={BUTTON_STYLES.edit}
            title="Edit bike vehicle"
          >
            <FaEdit />
            Edit
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className={BUTTON_STYLES.delete}
            title="Delete bike vehicle"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

const Bicycle = () => {
  // Redux state
  const dispatch = useDispatch();
  const {
    vehicles,
    filteredVehicles,
    terminals,
    searchTerm,
    statusFilter,
    terminalFilter,
    showModal,
    isCreate,
    selectedVehicle,
    isLoading,
    isLoadingTerminals,
    isDeleting,
    error,
    terminalsError,
  } = useSelector((state) => state.bikeVehicle);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchBikeVehicles());
    dispatch(fetchTerminals());
  }, [dispatch]);

  // Filter vehicles when filters change
  useEffect(() => {
    dispatch(filterVehicles());
  }, [dispatch, vehicles, searchTerm, statusFilter, terminalFilter]);

  // Modal handlers
  const handleOpenModal = useCallback(
    (isCreate = false, vehicle = null) => {
      dispatch(openModal({ isCreate, vehicle }));
    },
    [dispatch]
  );

  const handleCloseModal = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  // Search and filter handlers
  const handleSearchChange = useCallback(
    (e) => {
      dispatch(setSearchTerm(e.target.value));
    },
    [dispatch]
  );

  const handleStatusFilterChange = useCallback(
    (e) => {
      dispatch(setStatusFilter(e.target.value));
    },
    [dispatch]
  );

  const handleTerminalFilterChange = useCallback(
    (e) => {
      dispatch(setTerminalFilter(e.target.value));
    },
    [dispatch]
  );

  // Delete handler
  const handleDelete = useCallback(
    async (vehicle) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete Bike #${vehicle.number}? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        try {
          await dispatch(deleteBikeVehicle(vehicle.id)).unwrap();
        } catch (error) {
          console.error("Error deleting bike vehicle:", error);
        }
      }
    },
    [dispatch]
  );

  // Retry handler
  const handleRetry = useCallback(() => {
    dispatch(clearErrors());
    dispatch(fetchBikeVehicles());
    dispatch(fetchTerminals());
  }, [dispatch]);

  // Memoized vehicle rows
  const vehicleRows = useMemo(() => {
    if (!filteredVehicles?.length) return [];

    return filteredVehicles.map((vehicle, index) => (
      <BikeVehicleTableRow
        key={vehicle.id}
        vehicle={vehicle}
        index={index}
        onEdit={(vehicle) => handleOpenModal(false, vehicle)}
        onDelete={handleDelete}
        terminals={terminals}
      />
    ));
  }, [filteredVehicles, terminals, handleOpenModal, handleDelete]);

  // Loading state
  if (isLoading) {
    return (
      <Sidebar>
        <div className="container p-5">
          <LoadingSpinner message="Loading bike vehicles..." />
        </div>
      </Sidebar>
    );
  }

  // Error state
  if (error) {
    return (
      <Sidebar>
        <div className="container p-5">
          <ErrorMessage
            message="Failed to load bike vehicles"
            onRetry={handleRetry}
          />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="container mx-auto p-5 max-w-7xl">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBicycle className="text-blue-600 text-2xl" />
              </div>
              Bike Vehicle Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all bike vehicles in the system
            </p>
          </div>
          <button
            className={BUTTON_STYLES.primary}
            type="button"
            onClick={() => handleOpenModal(true)}
            aria-label="Add new bike vehicle"
          >
            <FaPlus />
            Add New Bike
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Bikes</p>
                <p className="text-2xl font-bold text-blue-800">
                  {vehicles?.length || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <FaBicycle className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Active Bikes
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {vehicles?.filter((v) => v.status)?.length || 0}
                </p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <FaBicycle className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">
                  Inactive Bikes
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {vehicles?.filter((v) => !v.status)?.length || 0}
                </p>
              </div>
              <div className="p-2 bg-red-200 rounded-lg">
                <FaBicycle className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Terminals</p>
                <p className="text-2xl font-bold text-purple-800">
                  {terminals?.length || 0}
                </p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <FaMapMarkerAlt className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by bike number or ID..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Terminal Filter */}
            <div className="lg:w-56">
              <select
                value={terminalFilter}
                onChange={handleTerminalFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingTerminals}
              >
                <option value="all">All Terminals</option>
                {terminals.map((terminal) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name || `Terminal ${terminal.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Results */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredVehicles?.length || 0} of {vehicles?.length || 0}{" "}
              bike vehicles
            </div>
            {(searchTerm ||
              statusFilter !== "all" ||
              terminalFilter !== "all") && (
              <button
                onClick={() => {
                  dispatch(setSearchTerm(""));
                  dispatch(setStatusFilter("all"));
                  dispatch(setTerminalFilter("all"));
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FaFilter />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles?.length > 0 ? (
                  vehicleRows
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_HEAD.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <FaBicycle className="text-gray-400 text-4xl mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No bike vehicles found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          terminalFilter !== "all"
                            ? "Try adjusting your filters or search terms"
                            : "Get started by adding your first bike vehicle"}
                        </p>
                        {!searchTerm &&
                          statusFilter === "all" &&
                          terminalFilter === "all" && (
                            <button
                              onClick={() => handleOpenModal(true)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Add New Bike Vehicle
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Loading overlay for delete operations */}
          {isDeleting && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-gray-600">Deleting bike vehicle...</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <BikeVehicleModal
          open={showModal}
          onClose={handleCloseModal}
          isCreate={isCreate}
          selectedVehicle={selectedVehicle}
        />
      </div>
    </Sidebar>
  );
};

export default Bicycle;
