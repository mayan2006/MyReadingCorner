import axios from "axios";
import { API_BASE_URL } from "./apiBase";

const buildMarkedBookPayload = (body = {}) => ({
  bookCode: body.bookCode,
  name: body.name,
  userCode: body.userCode,
  date: body.date,
  bookStatus: body.bookStatus
});

// CREATE
export const addMarkedBook = async (body) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/markedBook`,
      buildMarkedBookPayload(body)
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// GET
export const getAllMarkedBook = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/markedBook`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getMarkedBookById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/markedBook/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// UPDATE
export const updateMarkedBook = async (id, body) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/markedBook/${id}`,
      buildMarkedBookPayload(body)
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// DELETE (can also pass userCode for scoped delete)
export const deleteMarkedBook = async (bookCode, userCode) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/markedBook/${bookCode}`, {
      params: userCode ? { userCode } : undefined
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
