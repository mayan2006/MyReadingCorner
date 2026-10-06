import { api } from "./apiBase";

export const saveRating = async (body) => {
  try {
    const response = await api.post("/rating", {
      bookCode: body.bookCode,
      stars: body.stars
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getAverageRatingByBookCode = async (bookCode) => {
  try {
    const response = await api.get(`/rating/book/${bookCode}/average`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getUserRatingByBookCode = async (bookCode) => {
  try {
    const response = await api.get(`/rating/book/${bookCode}/me`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
