import axios from "axios";
import { API_BASE_URL } from "./apiBase";

export const getBookResponses = async (bookCode) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/bookResponse/book/${encodeURIComponent(bookCode)}`
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const addBookResponse = async ({ bookCode, userCode, content }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookResponse`, {
      bookCode,
      userCode,
      content
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const deleteBookResponse = async (responseId, userCode) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/bookResponse/${encodeURIComponent(responseId)}`,
      { params: { userCode } }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
