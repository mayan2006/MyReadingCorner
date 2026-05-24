import axios from "axios";
import { API_BASE_URL } from "./apiBase";

const buildCategoryPayload = (body = {}) => ({
  categoryCode: body.categoryCode,
  name: body.name
});

// CREATE
export const addCategory = async (body) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/category`, buildCategoryPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// GET
export const getAllCategory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// UPDATE
export const updateCategory = async (id, body) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/category/${id}`, buildCategoryPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// DELETE (server expects categoryCode)
export const deleteCategory = async (categoryCode) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/category/${categoryCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
