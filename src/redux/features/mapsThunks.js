import { createAsyncThunk } from "@reduxjs/toolkit";
import { setError, setLoading } from "./mapsSlice";
import { logout } from "./authSlice";
import { apiGet } from "../../utils/apiClient";

export const fetchTerminals = createAsyncThunk(
  "maps/fetchTerminals",
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet("/v1/bike-terminal");
      const data = responseData.data;

      // Transform data to match expected structure
      const terminalData = Array.isArray(data) ? data : data.terminals || [];
      const formattedData = terminalData.map((terminal, index) => ({
        ...terminal,
        iteration: terminal.iteration || index + 1,
      }));

      return formattedData;
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

export const fetchClusters = createAsyncThunk(
  "maps/fetchClusters",
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet("/v1/cluster");
      const data = responseData.data;

      // Transform data to match expected structure
      const clusterData = Array.isArray(data) ? data : [];
      const formattedData = clusterData.map((cluster, index) => ({
        ...cluster,
        // Extract coordinates from center_point
        latitude: cluster.center_point?.coordinates[1],
        longitude: cluster.center_point?.coordinates[0],
        iteration: cluster.iteration || index + 1,
      }));

      return formattedData;
    } catch (error) {
      console.error("Error fetching clusters:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to fetch clusters",
        needsRedirect: false,
      });
    }
  }
);

export const fetchTrackingData = createAsyncThunk(
  "maps/fetchTrackingData",
  async (_, { rejectWithValue }) => {
    try {
      const responseData = await apiGet("/v1/tracking");
      const data = responseData.data;

      // Transform tracking data to match expected structure
      const trackingData = Array.isArray(data) ? data : [];
      const formattedData = trackingData.map((track, index) => ({
        ...track,
        iteration: track.order_id || index + 1, // Use order_id as iteration or fallback to index
      }));

      return formattedData;
    } catch (error) {
      console.error("Error fetching tracking data:", error.message);
      return rejectWithValue({
        status: error.statusCode || 500,
        message: error.message || "Failed to fetch tracking data",
        needsRedirect: false,
      });
    }
  }
);
