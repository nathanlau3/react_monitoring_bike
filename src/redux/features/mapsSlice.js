import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  locations: [],
  terminals: [],
  openTrack: false,
  openTerminal: false,
  isConnected: false,
  isLoading: false,
  error: null,
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
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateLocation: (state, action) => {
      const index = state.locations.findIndex(
        (loc) => loc.iteration === action.payload.iteration
      );
      if (index !== -1) {
        state.locations[index] = action.payload;
      } else {
        state.locations.push(action.payload);
      }
    },
  },
});

export const {
  setLocations,
  setTerminals,
  toggleTrack,
  toggleTerminal,
  setConnectionStatus,
  setLoading,
  setError,
  updateLocation,
} = mapsSlice.actions;

export default mapsSlice.reducer;
