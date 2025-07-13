import { apiGet } from "../utils/apiClient";

export const GetTrackingData = async () => {
  try {
    const response = await apiGet("/v1/tracking");
    return response;
  } catch (error) {
    console.error("Error fetching tracking data:", error.message);
    throw error;
  }
};
