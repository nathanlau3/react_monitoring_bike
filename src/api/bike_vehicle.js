import { apiGet, apiPost, apiPut, apiDelete } from "../utils/apiClient";

export const GetBikeVehicles = async () => {
  try {
    const response = await apiGet("/v1/bike-vehicle");
    return response;
  } catch (error) {
    console.error("Error fetching bike vehicles:", error.message);
    throw error;
  }
};

export const GetBikeVehicleById = async (id) => {
  try {
    const response = await apiGet(`/v1/bike-vehicle/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching bike vehicle ${id}:`, error.message);
    throw error;
  }
};

export const CreateBikeVehicle = async (data) => {
  try {
    const response = await apiPost("/v1/bike-vehicle", data);
    return {
      success: response.isSuccess,
      message: response.responseMessage,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating bike vehicle:", error.message);
    return {
      success: false,
      message: error.message || "Error creating bike vehicle",
      data: null,
    };
  }
};

export const UpdateBikeVehicle = async (id, data) => {
  try {
    const response = await apiPut(`/v1/bike-vehicle/${id}`, data);
    return {
      success: response.isSuccess,
      message: response.responseMessage,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error updating bike vehicle ${id}:`, error.message);
    return {
      success: false,
      message: error.message || "Error updating bike vehicle",
      data: null,
    };
  }
};

export const DeleteBikeVehicle = async (id) => {
  try {
    const response = await apiDelete(`/v1/bike-vehicle/${id}`);
    return {
      success: response.isSuccess,
      message: response.responseMessage,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error deleting bike vehicle ${id}:`, error.message);
    return {
      success: false,
      message: error.message || "Error deleting bike vehicle",
      data: null,
    };
  }
};
