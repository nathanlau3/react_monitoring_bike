import { createSlice } from "@reduxjs/toolkit";
import { fetchTerminals, fetchClusters } from "./mapsThunks";

const initialState = {
  locations: [],
  terminals: [],
  clusters: [],
  selectedClusters: [],
  openTrack: false,
  openTerminal: false,
  openCluster: false,
  isConnected: false,
  loading: false,
  error: null,
  modal: {
    open: false,
    isCreate: false,
    selectedData: null,
  },
};

const mapsSlice = createSlice({
  name: "maps",
  initialState,
  reducers: {
    setLocations: (state, action) => {
      state.locations = action.payload;
    },
    setTerminals: (state, action) => {
      state.terminals = action.payload;
    },
    toggleTrack: (state) => {
      state.openTrack = !state.openTrack;
    },
    toggleTerminal: (state) => {
      state.openTerminal = !state.openTerminal;
    },
    toggleCluster: (state) => {
      state.openCluster = !state.openCluster;
    },
    setClusters: (state, action) => {
      state.clusters = action.payload;
    },
    setSelectedClusters: (state, action) => {
      state.selectedClusters = action.payload;
    },
    toggleClusterSelection: (state, action) => {
      const clusterId = action.payload;
      const isSelected = state.selectedClusters.includes(clusterId);

      if (isSelected) {
        state.selectedClusters = state.selectedClusters.filter(
          (id) => id !== clusterId
        );
      } else {
        state.selectedClusters.push(clusterId);
      }
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateLocation: (state, action) => {
      console.log("action.payload", action.payload);
      const index = state.locations.findIndex(
        (loc) => loc.iteration === action.payload.iteration
      );
      if (index !== -1) {
        state.locations[index] = action.payload;
      } else {
        state.locations.push(action.payload);
      }
    },
    openModal: (state, action) => {
      state.modal.open = true;
      state.modal.isCreate = action.payload.isCreate || false;
      state.modal.selectedData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.open = false;
      state.modal.isCreate = false;
      state.modal.selectedData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerminals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTerminals.fulfilled, (state, action) => {
        state.loading = false;
        state.terminals = action.payload;
        state.error = null;
      })
      .addCase(fetchTerminals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch terminals";
      })
      .addCase(fetchClusters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClusters.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters = action.payload;
        state.error = null;
      })
      .addCase(fetchClusters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch clusters";
      });
  },
});

export const {
  setLocations,
  setTerminals,
  setClusters,
  setSelectedClusters,
  toggleTrack,
  toggleTerminal,
  toggleCluster,
  toggleClusterSelection,
  setConnectionStatus,
  setLoading,
  setError,
  updateLocation,
  openModal,
  closeModal,
} = mapsSlice.actions;

export default mapsSlice.reducer;
