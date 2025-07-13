import { apiGet, apiPut } from "../utils/apiClient";

export const getAccountList = async () => {
  try {
    const response = await apiGet("/account");
    return response;
  } catch (error) {
    console.error("Error fetching account list:", error.message);
    throw error;
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await apiGet(`/account/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching account ${id}:`, error.message);
    throw error;
  }
};

export const updateAccount = async (id, payload) => {
  try {
    const response = await apiPut(`/account/${id}`, payload);
    return response;
  } catch (error) {
    console.error(`Error updating account ${id}:`, error.message);
    throw error;
  }
};
