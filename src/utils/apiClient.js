import axios from "axios";

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5005",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized responses and other errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error is due to unauthorized access
    if (error.response?.status === 401) {
      console.log("Unauthorized access detected - redirecting to login");
      handleLogout();
      
      return Promise.reject({
        ...error,
        message: "Unauthorized - Please login again",
        isAuthError: true,
      });
    }

    // Enhance error with standardized format
    const enhancedError = {
      ...error,
      message: error.response?.data?.responseMessage || 
               error.response?.data?.message || 
               error.message || 
               'An unexpected error occurred',
      statusCode: error.response?.status,
      data: error.response?.data
    };

    return Promise.reject(enhancedError);
  }
);

// Centralized logout function
const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Redirect to login page
  window.location.href = "/login";
};

// API method wrappers with consistent error handling
export const apiGet = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPost = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPut = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiDelete = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;
