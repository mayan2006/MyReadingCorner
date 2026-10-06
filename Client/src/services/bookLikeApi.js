import { api } from "./apiBase";

export const getBookLikeState = async (bookCode) => {
  try {
    const response = await api.get(`/bookLike/book/${encodeURIComponent(bookCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getLikedBooksForUser = async (userCode) => {
  try {
    const response = await api.get(`/bookLike/user/${encodeURIComponent(userCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getMyLikedBooks = async () => {
  try {
    const response = await api.get("/bookLike/me");
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const toggleBookLike = async (bookCode) => {
  try {
    const response = await api.post("/bookLike/toggle", { bookCode });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
