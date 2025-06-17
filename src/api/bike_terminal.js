import axios from "axios";

let response_alert = {
  status: null,
  message: null,
};

const customConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const GetTerminal = async () => {
  try {
    customConfig.headers.Authorization = localStorage.getItem("token");
    const data = await axios.get(
      process.env.REACT_APP_BACKEND_URL + "/v1/bike-terminal",
      customConfig
    );
    if (data) return data.data;
    else console.log("Not found");
  } catch (err) {
    return null;
  }
};

export const GetTerminalById = async (id) => {
  try {
    const data = await axios.get(
      `http://localhost:5005/v1/bike-terminal/${id}`,
      customConfig
    );
    if (data) return data.data;
  } catch (err) {
    return null;
  }
};

export const CreateTerminal = async () => {
  try {
    const response = await axios.post();
  } catch (err) {
    return false;
  }
};

export const UpdateTerminal = async (id, data) => {
  try {
    const response = await axios.put(
      `http://localhost:5005/v1/bike-terminal/${id}`,
      data,
      customConfig
    );
    response_alert.status = response.data.isSuccess;
    response_alert.message = response.data.responseMessage;
    return response_alert;
  } catch (err) {
    response_alert.status = err.response.data.isSuccess;
    response_alert.message = err.response.data.responseMessage;
    return response_alert;
  }
};
