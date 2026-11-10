import { api } from "./apiBase";

export const getPendingImportedBooks = async () => {
  try {
    const response = await api.get("/books/import/pending");
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const approveImportedBook = async (bookCode, categoryCode) => {
  try {
    const response = await api.post(`/books/import/${bookCode}/approve`, { categoryCode });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const rejectImportedBook = async (bookCode) => {
  try {
    const response = await api.post(`/books/import/${bookCode}/reject`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
