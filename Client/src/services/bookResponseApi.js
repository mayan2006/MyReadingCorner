import { api } from "./apiBase";

export const getBookResponses = async (bookCode) => {
  try {
    const response = await api.get(`/bookResponse/book/${encodeURIComponent(bookCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const addBookResponse = async ({ bookCode, content }) => {
  try {
    const response = await api.post("/bookResponse", {
      bookCode,
      content
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const deleteBookResponse = async (responseId) => {
  try {
    const response = await api.delete(`/bookResponse/${encodeURIComponent(responseId)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
