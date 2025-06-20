import { createAsyncThunk } from "@reduxjs/toolkit";
import { setError, setLoading } from "./mapsSlice";
import { logout } from "./authSlice";

export const fetchTerminals = createAsyncThunk(
  "maps/fetchTerminals",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
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

      const response = await fetch(`${apiUrl}/v1/bike-terminal`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: token,
          }),
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
      const data = responseData.data;

      // Transform data to match expected structure
      const terminalData = Array.isArray(data) ? data : data.terminals || [];
      const formattedData = terminalData.map((terminal, index) => ({
        ...terminal,
        iteration: terminal.iteration || index + 1,
      }));

      return formattedData;
    } catch (error) {
      const errorMessage = error.message || "Failed to fetch terminals";
      return rejectWithValue({
        status: error.status || 500,
        message: errorMessage,
        needsRedirect: false,
      });
    }
  }
);
