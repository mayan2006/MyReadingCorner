import axios from "axios";
import { API_BASE_URL } from "./apiBase";

const buildBookPayload = (body = {}) => ({
  bookCode: body.bookCode,
  categoryCode: body.categoryCode,
  title: body.title,
  summary: body.summary,
  author: body.author,
  img: body.img,
  content: body.content
});

// CREATE
export const addBook = async (body) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/books`, buildBookPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// GET
export const getAllBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getBookById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getBookByCode = async (bookCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books/code/${bookCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// UPDATE
export const updateBook = async (id, body) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/books/${id}`, buildBookPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// DELETE (server expects bookCode)
export const deleteBook = async (bookCode) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/books/${bookCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
