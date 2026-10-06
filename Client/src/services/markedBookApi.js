import { api } from "./apiBase";

const buildMarkedBookPayload = (body = {}) => ({
  bookCode: body.bookCode,
  name: body.name,
  date: body.date,
  bookStatus: body.bookStatus
});

export const addMarkedBook = async (body) => {
  try {
    const response = await api.post("/markedBook", buildMarkedBookPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getAllMarkedBook = async () => {
  try {
    const response = await api.get("/markedBook");
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getMarkedBookById = async (id) => {
  try {
    const response = await api.get(`/markedBook/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const updateMarkedBook = async (id, body) => {
  try {
    const response = await api.put(`/markedBook/${id}`, buildMarkedBookPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const deleteMarkedBook = async (bookCode) => {
  try {
    const response = await api.delete(`/markedBook/${bookCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
