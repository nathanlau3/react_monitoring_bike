import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "./authSlice";
import Swal from "sweetalert2";
import {
  GetBikeVehicles,
  CreateBikeVehicle,
  UpdateBikeVehicle,
  DeleteBikeVehicle,
} from "../../api/bike_vehicle";
import { GetTerminal } from "../../api/bike_terminal";

// Async thunk for fetching bike vehicles
export const fetchBikeVehicles = createAsyncThunk(
  "bikeVehicle/fetchBikeVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GetBikeVehicles();

      if (response.isSuccess && response.data) {
        return response.data;
      } else {
        throw new Error(
          response.responseMessage || "Failed to fetch bike vehicles"
        );
      }
    } catch (error) {
      console.error("Error fetching bike vehicles:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to fetch bike vehicles",
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for fetching terminals
export const fetchTerminals = createAsyncThunk(
  "bikeVehicle/fetchTerminals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GetTerminal();

      if (response.isSuccess && response.data) {
        return response.data;
      } else {
        throw new Error(
          response.responseMessage || "Failed to fetch terminals"
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

// Async thunk for creating bike vehicle
export const createBikeVehicle = createAsyncThunk(
  "bikeVehicle/createBikeVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await CreateBikeVehicle(vehicleData);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create bike vehicle");
      }
    } catch (error) {
      console.error("Error creating bike vehicle:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to create bike vehicle",
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for updating bike vehicle
export const updateBikeVehicle = createAsyncThunk(
  "bikeVehicle/updateBikeVehicle",
  async ({ id, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await UpdateBikeVehicle(id, vehicleData);

      if (response.success) {
        return { id, ...response.data };
      } else {
        throw new Error(response.message || "Failed to update bike vehicle");
      }
    } catch (error) {
      console.error("Error updating bike vehicle:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to update bike vehicle",
        needsRedirect: false,
      });
    }
  }
);

// Async thunk for deleting bike vehicle
export const deleteBikeVehicle = createAsyncThunk(
  "bikeVehicle/deleteBikeVehicle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await DeleteBikeVehicle(id);

      if (response.success) {
        return id;
      } else {
        throw new Error(response.message || "Failed to delete bike vehicle");
      }
    } catch (error) {
      console.error("Error deleting bike vehicle:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to delete bike vehicle",
        needsRedirect: false,
      });
    }
  }
);

const initialState = {
  vehicles: [],
  filteredVehicles: [],
  terminals: [],
  searchTerm: "",
  statusFilter: "all", // "all", "active", "inactive"
  terminalFilter: "all",
  selectedVehicle: null,
  showModal: false,
  isCreate: false,
  isLoading: false,
  isLoadingTerminals: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  terminalsError: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

const bikeVehicleSlice = createSlice({
  name: "bikeVehicle",
  initialState,
  reducers: {
    // Modal management
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    setIsCreate: (state, action) => {
      state.isCreate = action.payload;
    },
    openModal: (state, action) => {
      state.showModal = true;
      state.isCreate = action.payload.isCreate || false;
      state.selectedVehicle = action.payload.vehicle || null;
    },
    closeModal: (state) => {
      state.showModal = false;
      state.isCreate = false;
      state.selectedVehicle = null;
      state.createError = null;
      state.updateError = null;
    },

    // Filters
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setTerminalFilter: (state, action) => {
      state.terminalFilter = action.payload;
    },

    // Filter vehicles
    filterVehicles: (state) => {
      let filtered = [...state.vehicles];

      // Search filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (vehicle) =>
            vehicle.number?.toString().includes(searchLower) ||
            vehicle.id?.toString().includes(searchLower)
        );
      }

      // Status filter
      if (state.statusFilter !== "all") {
        const isActive = state.statusFilter === "active";
        filtered = filtered.filter((vehicle) => vehicle.status === isActive);
      }

      // Terminal filter
      if (state.terminalFilter !== "all") {
        const terminalId = parseInt(state.terminalFilter);
        filtered = filtered.filter(
          (vehicle) =>
            vehicle.current_terminal_id === terminalId ||
            vehicle.original_terminal_id === terminalId
        );
      }

      state.filteredVehicles = filtered;
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.terminalsError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bike vehicles
      .addCase(fetchBikeVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBikeVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = action.payload;
        state.filteredVehicles = action.payload;
        state.error = null;
      })
      .addCase(fetchBikeVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch bike vehicles";
        state.vehicles = [];
        state.filteredVehicles = [];

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: action.payload?.message || "Failed to fetch bike vehicles",
          confirmButtonColor: "#d33",
        });
      })

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

      // Create bike vehicle
      .addCase(createBikeVehicle.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createBikeVehicle.fulfilled, (state, action) => {
        state.isCreating = false;
        if (action.payload) {
          state.vehicles.push(action.payload);
          state.filteredVehicles.push(action.payload);
        }
        state.createError = null;
        state.showModal = false;
        state.selectedVehicle = null;

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Bike vehicle created successfully",
          confirmButtonColor: "#10b981",
        });
      })
      .addCase(createBikeVehicle.rejected, (state, action) => {
        state.isCreating = false;
        state.createError =
          action.payload?.message || "Failed to create bike vehicle";

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: action.payload?.message || "Failed to create bike vehicle",
          confirmButtonColor: "#d33",
        });
      })

      // Update bike vehicle
      .addCase(updateBikeVehicle.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateBikeVehicle.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedVehicle = action.payload;
        const index = state.vehicles.findIndex(
          (v) => v.id === updatedVehicle.id
        );
        if (index !== -1) {
          state.vehicles[index] = updatedVehicle;
          const filteredIndex = state.filteredVehicles.findIndex(
            (v) => v.id === updatedVehicle.id
          );
          if (filteredIndex !== -1) {
            state.filteredVehicles[filteredIndex] = updatedVehicle;
          }
        }
        state.updateError = null;
        state.showModal = false;
        state.selectedVehicle = null;

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Bike vehicle updated successfully",
          confirmButtonColor: "#10b981",
        });
      })
      .addCase(updateBikeVehicle.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError =
          action.payload?.message || "Failed to update bike vehicle";

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: action.payload?.message || "Failed to update bike vehicle",
          confirmButtonColor: "#d33",
        });
      })

      // Delete bike vehicle
      .addCase(deleteBikeVehicle.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteBikeVehicle.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload;
        state.vehicles = state.vehicles.filter((v) => v.id !== deletedId);
        state.filteredVehicles = state.filteredVehicles.filter(
          (v) => v.id !== deletedId
        );
        state.deleteError = null;

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Bike vehicle deleted successfully",
          confirmButtonColor: "#10b981",
        });
      })
      .addCase(deleteBikeVehicle.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError =
          action.payload?.message || "Failed to delete bike vehicle";

        // Show error alert
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: action.payload?.message || "Failed to delete bike vehicle",
          confirmButtonColor: "#d33",
        });
      });
  },
});

export const {
  setShowModal,
  setSelectedVehicle,
  setIsCreate,
  openModal,
  closeModal,
  setSearchTerm,
  setStatusFilter,
  setTerminalFilter,
  filterVehicles,
  clearErrors,
} = bikeVehicleSlice.actions;

export default bikeVehicleSlice.reducer;
