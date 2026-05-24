import axios from "axios";
import { API_BASE_URL } from "./apiBase";

export const getBookLikeState = async (bookCode, userCode = "") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookLike/book/${encodeURIComponent(bookCode)}`, {
      params: userCode ? { userCode } : {}
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getLikedBooksForUser = async (userCode) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/bookLike/user/${encodeURIComponent(userCode)}`
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const toggleBookLike = async (bookCode, userCode) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookLike/toggle`, { bookCode, userCode });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
