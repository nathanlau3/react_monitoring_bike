import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "./authSlice";
import Swal from "sweetalert2";
import { apiGet, apiPost, apiPut } from "../../utils/apiClient";

// Async thunk for fetching terminals
export const fetchTerminals = createAsyncThunk(
  "bikeOrder/fetchTerminals",
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet("/v1/bike-terminal");

      if (responseData.isSuccess && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.responseMessage || "Failed to fetch terminals"
        );
      }
    } catch (error) {
      console.error("Error fetching terminals:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to fetch terminals",
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for fetching bike orders
export const fetchBikeOrders = createAsyncThunk(
  "bikeOrder/fetchBikeOrders",
  async (terminal_from_id, { rejectWithValue }) => {
    try {
      // Build URL with terminal_from_id parameter
      let url = "/v1/order/web";
      if (terminal_from_id) {
        url += `?terminal_from_id=${terminal_from_id}`;
      }

      const responseData = await apiGet(url);

      if (responseData.isSuccess && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.responseMessage || "Failed to fetch orders"
        );
      }
    } catch (error) {
      console.error("Error fetching bike orders:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to fetch orders",
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for approving bike orders
export const approveBikeOrder = createAsyncThunk(
  "bikeOrder/approveBikeOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const responseData = await apiPut(`/v1/order/approval/${orderId}`);

      if (!responseData.isSuccess) {
        throw new Error(
          responseData.responseMessage || "Failed to approve order"
        );
      }

      return {
        orderId,
        responseData,
      };
    } catch (error) {
      console.error("Error approving bike order:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to approve order",
        orderId,
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for assigning bike to order
export const assignBikeToOrder = createAsyncThunk(
  "bikeOrder/assignBikeToOrder",
  async ({ orderId, bikeNumber }, { rejectWithValue }) => {
    try {
      const responseData = await apiPost(`/v1/order/assign-bike/${orderId}`, {
        bike_number: bikeNumber,
      });

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
      console.error("Error assigning bike to order:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to assign bike",
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
