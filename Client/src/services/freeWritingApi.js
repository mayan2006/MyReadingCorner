import { api } from "./apiBase";

const buildFreeWritingPayload = (body = {}) => ({
  writingCode: body.writingCode,
  seriesCode: body.seriesCode,
  subjectCode: body.subjectCode,
  author: body.author,
  chapter: body.chapter,
  name: body.name,
  summary: body.summary,
  content: body.content,
  date: body.date,
  isApproved: body.isApproved
});

export const addFreeWriting = async (body) => {
  try {
    const response = await api.post("/FreeWriting", buildFreeWritingPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getAllFreeWriting = async () => {
  try {
    const response = await api.get("/FreeWriting");
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getFreeWritingById = async (id) => {
  try {
    const response = await api.get(`/FreeWriting/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getFreeWritingByWritingCode = async (writingCode) => {
  try {
    const response = await api.get(`/FreeWriting/by-code/${encodeURIComponent(writingCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getFreeWritingSeries = async (seriesCode) => {
  try {
    const response = await api.get(`/FreeWriting/series/${encodeURIComponent(seriesCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const updateFreeWritingByWritingCode = async (writingCode, body) => {
  try {
    const response = await api.put(
      `/FreeWriting/by-code/${encodeURIComponent(writingCode)}`,
      buildFreeWritingPayload(body)
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const updateFreeWriting = async (id, body) => {
  try {
    const response = await api.put(`/FreeWriting/${id}`, buildFreeWritingPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const uploadFreeWritingCover = async (writingCode, imageFile) => {
  const formData = new FormData();
  formData.append("writingCode", writingCode);
  formData.append("image", imageFile);

  try {
    const response = await api.post("/FreeWriting/upload-cover", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const deleteFreeWriting = async (writingCode) => {
  try {
    const response = await api.delete(`/FreeWriting/${writingCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
