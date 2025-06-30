import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "./authSlice";
import axios from "axios";
import Swal from "sweetalert2";

// Async thunk for fetching terminals
export const fetchTerminals = createAsyncThunk(
  "bikeOrder/fetchTerminals",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5005";
      const state = getState();

      // Try to get token from Redux state, fallback to localStorage
      let token = null;
      if (state && state.auth && state.auth.token) {
        token = state.auth.token;
        console.log("Using token from Redux state");
      } else {
        token = localStorage.getItem("token");
        console.log("Using token from localStorage");
      }

      console.log("apiUrl", apiUrl);

      const response = await fetch(`${apiUrl}/v1/bike-terminal`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      });

      if (!response.ok) {
        // Handle unauthorized response
        if (response.status === 401) {
          dispatch(logout());
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
            needsRedirect: true,
          });
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.isSuccess && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.responseMessage || "Failed to fetch terminals"
        );
      }
    } catch (error) {
      console.log("error", error);
      const errorMessage = error.message || "Failed to fetch terminals";
      return rejectWithValue({
        status: error.status || 500,
        message: errorMessage,
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for fetching bike orders
export const fetchBikeOrders = createAsyncThunk(
  "bikeOrder/fetchBikeOrders",
  async (terminal_from_id, { dispatch, getState, rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5005";
      const state = getState();

      // Try to get token from Redux state, fallback to localStorage
      let token = null;
      if (state && state.auth && state.auth.token) {
        token = state.auth.token;
        console.log("Using token from Redux state");
      } else {
        token = localStorage.getItem("token");
        console.log("Using token from localStorage");
      }

      console.log("apiUrl", apiUrl);

      // Build URL with terminal_from_id parameter
      const url = new URL(`${apiUrl}/v1/order/web`);
      if (terminal_from_id) {
        url.searchParams.append("terminal_from_id", terminal_from_id);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      });

      if (!response.ok) {
        // Handle unauthorized response
        if (response.status === 401) {
          dispatch(logout());
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
            needsRedirect: true,
          });
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.isSuccess && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.responseMessage || "Failed to fetch orders"
        );
      }
    } catch (error) {
      console.log("error", error);
      const errorMessage = error.message || "Failed to fetch orders";
      return rejectWithValue({
        status: error.status || 500,
        message: errorMessage,
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for approving bike orders
export const approveBikeOrder = createAsyncThunk(
  "bikeOrder/approveBikeOrder",
  async (orderId, { dispatch, getState, rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5005";
      const state = getState();

      // Try to get token from Redux state, fallback to localStorage
      let token = null;
      if (state && state.auth && state.auth.token) {
        token = state.auth.token;
        console.log("Using token from Redux state");
      } else {
        token = localStorage.getItem("token");
        console.log("Using token from localStorage");
      }

      console.log("apiUrl", apiUrl);

      const response = await axios({
        method: "PUT",
        url: `${apiUrl}/v1/order/approval/${orderId}`,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.data.isSuccess) {
        // Handle unauthorized response
        if (response.data.status === 401) {
          dispatch(logout());
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
            needsRedirect: true,
          });
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = response.data;

      if (responseData.isSuccess) {
        return {
          orderId,
          responseData,
        };
      } else {
        throw new Error(
          responseData.responseMessage || "Failed to approve order"
        );
      }
    } catch (error) {
      console.log("error", error);
      const errorMessage = error.message || "Failed to approve order";
      return rejectWithValue({
        status: error.status || 500,
        message: errorMessage,
        orderId,
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for assigning bike to order (if you have an endpoint for this)
export const assignBikeToOrder = createAsyncThunk(
  "bikeOrder/assignBikeToOrder",
  async ({ orderId, bikeNumber }, { dispatch, getState, rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5005";
      const state = getState();

      // Try to get token from Redux state, fallback to localStorage
      let token = null;
      if (state && state.auth && state.auth.token) {
        token = state.auth.token;
        console.log("Using token from Redux state");
      } else {
        token = localStorage.getItem("token");
        console.log("Using token from localStorage");
      }

      console.log("apiUrl", apiUrl);

      // This is a placeholder - replace with your actual endpoint
      const response = await fetch(
        `${apiUrl}/v1/order/assign-bike/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: token }),
          },
          body: JSON.stringify({ bike_number: bikeNumber }),
        }
      );

      if (!response.ok) {
        // Handle unauthorized response
        if (response.status === 401) {
          dispatch(logout());
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
            needsRedirect: true,
          });
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.isSuccess) {
        return {
          orderId,
          bikeNumber,
          responseData,
        };
      } else {
        throw new Error(
          responseData.responseMessage || "Failed to assign bike"
        );
      }
    } catch (error) {
      console.log("error", error);
      const errorMessage = error.message || "Failed to assign bike";
      return rejectWithValue({
        status: error.status || 500,
        message: errorMessage,
        orderId,
        bikeNumber,
        needsRedirect: false,
      });
    }
  }
);

// Initial state
const initialState = {
  // Data
  orders: [],
  filteredOrders: [],
  selectedOrder: null,
  terminals: [],

  // Loading states
  isLoading: false,
  isLoadingTerminals: false,
  isApproving: false,
  isAssigningBike: false,

  // Error states
  error: null,
  terminalsError: null,
  approveError: null,
  assignBikeError: null,

  // UI states
  showModal: false,

  // Filter states
  searchTerm: "",
  statusFilter: "all",
  selectedTerminalId: null,
};

// Bike order slice
const bikeOrderSlice = createSlice({
  name: "bikeOrder",
  initialState,
  reducers: {
    // UI Actions
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },

    // Filter Actions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSelectedTerminalId: (state, action) => {
      state.selectedTerminalId = action.payload;
    },

    // Filter orders based on search term and status
    filterOrders: (state) => {
      let filtered = state.orders;

      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (order) =>
            order.id.toString().includes(searchLower) ||
            order.fullname.toLowerCase().includes(searchLower) ||
            order.identity_number.toLowerCase().includes(searchLower) ||
            order.terminal_from.toLowerCase().includes(searchLower) ||
            order.terminal_to.toLowerCase().includes(searchLower)
        );
      }

      if (state.statusFilter !== "all") {
        filtered = filtered.filter(
          (order) => order.status === state.statusFilter
        );
      }

      state.filteredOrders = filtered;
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.terminalsError = null;
      state.approveError = null;
      state.assignBikeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch terminals
      .addCase(fetchTerminals.pending, (state) => {
        state.isLoadingTerminals = true;
        state.terminalsError = null;
      })
      .addCase(fetchTerminals.fulfilled, (state, action) => {
        state.isLoadingTerminals = false;
        state.terminals = action.payload;
        state.terminalsError = null;
      })
      .addCase(fetchTerminals.rejected, (state, action) => {
        state.isLoadingTerminals = false;
        state.terminalsError =
          action.payload?.message || "Failed to fetch terminals";
        state.terminals = [];

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: action.payload?.message || "Failed to fetch terminals",
          confirmButtonColor: "#d33",
        });
      })

      // Fetch bike orders
      .addCase(fetchBikeOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBikeOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.filteredOrders = action.payload;
        state.error = null;
      })
      .addCase(fetchBikeOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
        state.orders = [];
        state.filteredOrders = [];

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: action.payload?.message || "Failed to fetch orders",
          confirmButtonColor: "#d33",
        });
      })

      // Approve bike order
      .addCase(approveBikeOrder.pending, (state) => {
        state.isApproving = true;
        state.approveError = null;
      })
      .addCase(approveBikeOrder.fulfilled, (state, action) => {
        state.isApproving = false;
        const { orderId, responseData } = action.payload;

        // Update the order in the orders array
        const orderIndex = state.orders.findIndex(
          (order) => order.id === orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = {
            ...state.orders[orderIndex],
            status: "APPROVED",
            admin_name: responseData.data?.admin_name || "Current Admin",
            admin_id: responseData.data?.admin_id || 1,
            updated_at:
              responseData.data?.updated_at || new Date().toISOString(),
          };
        }

        // Update filtered orders as well
        const filteredIndex = state.filteredOrders.findIndex(
          (order) => order.id === orderId
        );
        if (filteredIndex !== -1) {
          state.filteredOrders[filteredIndex] = {
            ...state.filteredOrders[filteredIndex],
            status: "APPROVED",
            admin_name: responseData.data?.admin_name || "Current Admin",
            admin_id: responseData.data?.admin_id || 1,
            updated_at:
              responseData.data?.updated_at || new Date().toISOString(),
          };
        }

        state.approveError = null;

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Order has been approved successfully!",
          confirmButtonColor: "#28a745",
          timer: 3000,
          timerProgressBar: true,
        });
      })
      .addCase(approveBikeOrder.rejected, (state, action) => {
        state.isApproving = false;
        state.approveError =
          action.payload?.message || "Failed to approve order";

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Approval Failed!",
          text: action.payload?.message || "Failed to approve order",
          confirmButtonColor: "#d33",
        });
      })

      // Assign bike to order
      .addCase(assignBikeToOrder.pending, (state) => {
        state.isAssigningBike = true;
        state.assignBikeError = null;
      })
      .addCase(assignBikeToOrder.fulfilled, (state, action) => {
        state.isAssigningBike = false;
        const { orderId, bikeNumber, responseData } = action.payload;

        // Update the order in the orders array
        const orderIndex = state.orders.findIndex(
          (order) => order.id === orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = {
            ...state.orders[orderIndex],
            no_bike: bikeNumber,
            admin_name: responseData.data?.admin_name || "Current Admin",
            admin_id: responseData.data?.admin_id || 1,
            updated_at:
              responseData.data?.updated_at || new Date().toISOString(),
          };
        }

        // Update filtered orders as well
        const filteredIndex = state.filteredOrders.findIndex(
          (order) => order.id === orderId
        );
        if (filteredIndex !== -1) {
          state.filteredOrders[filteredIndex] = {
            ...state.filteredOrders[filteredIndex],
            no_bike: bikeNumber,
            admin_name: responseData.data?.admin_name || "Current Admin",
            admin_id: responseData.data?.admin_id || 1,
            updated_at:
              responseData.data?.updated_at || new Date().toISOString(),
          };
        }

        state.assignBikeError = null;

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Bike ${bikeNumber} has been assigned successfully!`,
          confirmButtonColor: "#28a745",
          timer: 3000,
          timerProgressBar: true,
        });
      })
      .addCase(assignBikeToOrder.rejected, (state, action) => {
        state.isAssigningBike = false;
        state.assignBikeError =
          action.payload?.message || "Failed to assign bike";

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Assignment Failed!",
          text: action.payload?.message || "Failed to assign bike",
          confirmButtonColor: "#d33",
        });
      });
  },
});

// Export actions
export const {
  setShowModal,
  setSelectedOrder,
  setSearchTerm,
  setStatusFilter,
  setSelectedTerminalId,
  filterOrders,
  clearErrors,
} = bikeOrderSlice.actions;

// Export reducer
export default bikeOrderSlice.reducer;
