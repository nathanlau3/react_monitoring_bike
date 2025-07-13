import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPost } from "../../utils/apiClient";

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await apiPost("/v1/auth/login", credentials);

      // Extract token from backend response structure
      // Backend returns: { isSuccess, statusCode, responseMessage, data }
      // where data contains the actual token
      const token = data.data; // The token is directly in data.data
      const userData = data.user || null; // User data if available

      // Store token in localStorage
      if (token) {
        localStorage.setItem("token", token);
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }

      // Return data in the format expected by Redux state
      return {
        token: token,
        access_token: token, // Fallback for compatibility
        user: userData,
        ...data, // Include any other response data
      };
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      // Optional: Call logout endpoint
      const token = localStorage.getItem("token");
      if (token) {
        await apiPost("/auth/logout");
      }
    } catch (error) {
      // Continue with local logout even if API call fails
      console.log("Logout API call failed, continuing with local logout");
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("token"),
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token || action.payload.access_token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const { clearError, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
