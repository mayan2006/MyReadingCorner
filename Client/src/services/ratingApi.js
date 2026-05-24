import axios from "axios";
import { API_BASE_URL } from "./apiBase";

export const saveRating = async (body) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rating`, {
      bookCode: body.bookCode,
      userCode: body.userCode,
      stars: body.stars
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getAverageRatingByBookCode = async (bookCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rating/book/${bookCode}/average`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getUserRatingByBookCode = async (bookCode, userCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rating/book/${bookCode}/user/${userCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
