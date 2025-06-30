import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/sidebar";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSpinner,
  FaBicycle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  fetchBikeOrders,
  fetchTerminals,
  approveBikeOrder,
  assignBikeToOrder,
  setShowModal,
  setSelectedOrder,
  setSearchTerm,
  setStatusFilter,
  setSelectedTerminalId,
  filterOrders,
  clearErrors,
} from "../redux/features/bikeOrderSlice";

const BikeOrder = () => {
  const dispatch = useDispatch();

  // Get state from Redux
  const {
    orders,
    filteredOrders,
    selectedOrder,
    showModal,
    searchTerm,
    statusFilter,
    selectedTerminalId,
    terminals,
    isLoading: isLoadingOrders,
    isLoadingTerminals,
    isApproving,
    isAssigningBike,
    error,
    terminalsError,
    approveError,
    assignBikeError,
  } = useSelector((state) => state.bikeOrder);

  // Initialize terminals and orders
  useEffect(() => {
    dispatch(fetchTerminals());
  }, [dispatch]);

  // Fetch orders when selectedTerminalId changes
  useEffect(() => {
    if (selectedTerminalId) {
      dispatch(fetchBikeOrders(selectedTerminalId));
    }
  }, [dispatch, selectedTerminalId]);

  // Filter orders when search term or status filter changes
  useEffect(() => {
    dispatch(filterOrders());
  }, [dispatch, orders, searchTerm, statusFilter]);

  // Handle terminal selection
  const handleTerminalChange = useCallback(
    (terminalId) => {
      dispatch(setSelectedTerminalId(terminalId));
    },
    [dispatch]
  );

  // Handle order approval
  const handleApprove = useCallback(
    async (orderId) => {
      try {
        const result = await dispatch(approveBikeOrder(orderId));
        if (approveBikeOrder.fulfilled.match(result)) {
          console.log("Order approved successfully");
        } else {
          // Handle error from thunk
          alert(
            `Error approving order: ${
              result.payload?.message || "Unknown error"
            }`
          );
        }
      } catch (error) {
        console.error("Error approving order:", error);
        alert(`Error approving order: ${error.message}`);
      }
    },
    [dispatch]
  );

  // Handle assign bike number
  const handleAssignBike = useCallback(
    async (orderId, bikeNumber) => {
      try {
        const result = await dispatch(
          assignBikeToOrder({ orderId, bikeNumber })
        );
        if (assignBikeToOrder.fulfilled.match(result)) {
          console.log("Bike assigned successfully");
        } else {
          alert(
            `Error assigning bike: ${
              result.payload?.message || "Unknown error"
            }`
          );
        }
      } catch (error) {
        console.error("Error assigning bike:", error);
        alert(`Error assigning bike: ${error.message}`);
      }
    },
    [dispatch]
  );

  // Handle view order details
  const handleViewOrder = useCallback(
    (order) => {
      dispatch(setSelectedOrder(order));
      dispatch(setShowModal(true));
    },
    [dispatch]
  );

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "APPROVED":
          return "bg-green-100 text-green-800 border-green-200";
        case "COMPLETED":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "PENDING":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
          status
        )}`}
      >
        {status}
      </span>
    );
  };

  // Action buttons component
  const ActionButtons = ({ order }) => {
    const isButtonLoading = isApproving || isAssigningBike;

    if (order.status === "PENDING") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(order.id)}
            disabled={isButtonLoading}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Approve Order"
          >
            <FaCheck size={12} />
            Approve
          </button>
          {/* {!order.no_bike && (
            <button
              onClick={() => {
                const bikeNumber = prompt("Enter bike number:");
                if (bikeNumber) {
                  handleAssignBike(order.id, parseInt(bikeNumber));
                }
              }}
              disabled={isButtonLoading}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="Assign Bike"
            >
              <FaBicycle size={12} />
              Assign Bike
            </button>
          )} */}
        </div>
      );
    }

    // if (order.status === "APPROVED" && !order.no_bike) {
    //   return (
    //     <button
    //       onClick={() => {
    //         const bikeNumber = prompt("Enter bike number:");
    //         if (bikeNumber) {
    //           handleAssignBike(order.id, parseInt(bikeNumber));
    //         }
    //       }}
    //       disabled={isButtonLoading}
    //       className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    //       title="Assign Bike"
    //     >
    //       <FaBicycle size={12} />
    //       Assign Bike
    //     </button>
    //   );
    // }

    return <span className="text-gray-500 text-sm">No actions available</span>;
  };

  return (
    <Sidebar>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bike Orders
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and approve bike rental orders between terminals
                </p>
              </div>
              {/* <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <FaDownload size={14} />
                  Export
                </button>
              </div> */}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Terminal Filter */}
              <div className="sm:w-64">
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedTerminalId || ""}
                    onChange={(e) =>
                      handleTerminalChange(e.target.value || null)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                    disabled={isLoadingTerminals}
                  >
                    <option value="">Select Terminal</option>
                    {terminals.map((terminal) => (
                      <option key={terminal.id} value={terminal.id}>
                        {terminal.name_terminal || terminal.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingTerminals && (
                    <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, identity number, or terminal..."
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Terminal Selection Warning */}
          {!selectedTerminalId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-yellow-600" />
                <p className="text-yellow-800">
                  Please select a terminal to view bike orders.
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bike
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedTerminalId &&
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.fullname}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {order.identity_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.terminal_from_code} →{" "}
                              {order.terminal_to_code}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.terminal_from}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {order.terminal_to}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {order.no_bike ? (
                              <div className="flex items-center gap-1 text-blue-600">
                                <FaBicycle size={12} />
                                <span className="font-medium">
                                  Bike #{order.no_bike}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                Not assigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDate(order.created_at)}
                            </div>
                            {order.updated_at !== order.created_at && (
                              <div className="text-xs text-gray-500">
                                Updated: {formatDate(order.updated_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <FaEye size={14} />
                            </button>
                            <ActionButtons order={order} />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {isLoadingOrders && selectedTerminalId && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-3">
                  <FaSpinner className="animate-spin text-blue-600" size={20} />
                  <span className="text-gray-700">Loading orders...</span>
                </div>
              </div>
            )}

            {terminalsError && (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-2">
                  Error loading terminals
                </div>
                <div className="text-gray-400 mb-4">{terminalsError}</div>
                <button
                  onClick={() => dispatch(fetchTerminals())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {error && !isLoadingOrders && selectedTerminalId && (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-2">
                  Error loading orders
                </div>
                <div className="text-gray-400 mb-4">{error}</div>
                <button
                  onClick={() => dispatch(fetchBikeOrders(selectedTerminalId))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoadingOrders &&
              !error &&
              selectedTerminalId &&
              filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">
                    No orders found
                  </div>
                  <div className="text-gray-400">
                    Try adjusting your search or filter criteria
                  </div>
                </div>
              )}
          </div>

          {/* Loading Overlay */}
          {(isApproving || isAssigningBike) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex items-center gap-3">
                  <FaSpinner className="animate-spin text-blue-600" size={20} />
                  <span className="text-gray-700">
                    {isApproving ? "Approving order..." : "Assigning bike..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Modal */}
          {showModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      Order Details - #{selectedOrder.id}
                    </h2>
                    <button
                      onClick={() => dispatch(setShowModal(false))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Order Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Order ID:</span>
                          <span className="ml-2 font-medium">
                            #{selectedOrder.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-2">
                            {formatDate(selectedOrder.created_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <span className="ml-2">
                            {formatDate(selectedOrder.updated_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className="ml-2">
                            <StatusBadge status={selectedOrder.status} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Customer Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <span className="ml-2 font-medium">
                            {selectedOrder.fullname}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Identity Number:
                          </span>
                          <span className="ml-2">
                            {selectedOrder.identity_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">User ID:</span>
                          <span className="ml-2">{selectedOrder.user_id}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Route Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">From:</span>
                          <span className="ml-2 font-medium">
                            {selectedOrder.terminal_from} (
                            {selectedOrder.terminal_from_code})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">To:</span>
                          <span className="ml-2 font-medium">
                            {selectedOrder.terminal_to} (
                            {selectedOrder.terminal_to_code})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Bike & Admin
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Bike Number:</span>
                          <span className="ml-2">
                            {selectedOrder.no_bike ? (
                              <span className="font-medium text-blue-600">
                                #{selectedOrder.no_bike}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                Not assigned
                              </span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Admin:</span>
                          <span className="ml-2">
                            {selectedOrder.admin_name || (
                              <span className="text-gray-400">
                                Not assigned
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default BikeOrder;
