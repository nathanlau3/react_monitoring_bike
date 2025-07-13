import { apiGet, apiPost, apiPut } from "../utils/apiClient";

export const GetTerminal = async () => {
  try {
    const response = await apiGet("/v1/bike-terminal");
    return response;
  } catch (error) {
    console.error("Error fetching terminals:", error.message);
    throw error;
  }
};

export const GetTerminalById = async (id) => {
  try {
    const response = await apiGet(`/v1/bike-terminal/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching terminal ${id}:`, error.message);
    throw error;
  }
};

export const CreateTerminal = async (data) => {
  try {
    const response = await apiPost("/v1/bike-terminal", data);
    return {
      status: response.isSuccess,
      message: response.responseMessage,
      data: response.data
    };
  } catch (error) {
    console.error("Error creating terminal:", error.message);
    return {
      status: false,
      message: error.message || "Error creating terminal",
      data: null
    };
  }
};

export const UpdateTerminal = async (id, data) => {
  try {
    const response = await apiPut(`/v1/bike-terminal/${id}`, data);
    return {
      status: response.isSuccess,
      message: response.responseMessage,
      data: response.data
    };
  } catch (error) {
    console.error(`Error updating terminal ${id}:`, error.message);
    return {
      status: false,
      message: error.message || "Error updating terminal",
      data: null
    };
  }
};
