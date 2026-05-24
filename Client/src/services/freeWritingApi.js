import axios from "axios";
import { API_BASE_URL } from "./apiBase";

const buildFreeWritingPayload = (body = {}) => ({
  writingCode: body.writingCode,
  seriesCode: body.seriesCode,
  subjectCode: body.subjectCode,
  userCode: body.userCode,
  author: body.author,
  chapter: body.chapter,
  name: body.name,
  summary: body.summary,
  content: body.content,
  date: body.date,
  isApproved: body.isApproved
});

// CREATE
export const addFreeWriting = async (body) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/FreeWriting`,
      buildFreeWritingPayload(body)
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// GET
export const getAllFreeWriting = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/FreeWriting`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getFreeWritingById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/FreeWriting/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getFreeWritingByWritingCode = async (writingCode) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/FreeWriting/by-code/${encodeURIComponent(writingCode)}`
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getFreeWritingSeries = async (seriesCode) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/FreeWriting/series/${encodeURIComponent(seriesCode)}`
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// UPDATE
export const updateFreeWritingByWritingCode = async (writingCode, body) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/FreeWriting/by-code/${encodeURIComponent(writingCode)}`,
      buildFreeWritingPayload(body)
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const updateFreeWriting = async (id, body) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/FreeWriting/${id}`,
      buildFreeWritingPayload(body)
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const uploadFreeWritingCover = async (writingCode, userCode, imageFile) => {
  const formData = new FormData();
  formData.append("writingCode", writingCode);
  formData.append("userCode", userCode);
  formData.append("image", imageFile);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/FreeWriting/upload-cover`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// DELETE (server expects writingCode)
export const deleteFreeWriting = async (writingCode) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/FreeWriting/${writingCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
