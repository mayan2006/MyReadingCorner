import axios from "axios";
import { API_BASE_URL } from "./apiBase";

const buildSubjectPayload = (body = {}) => ({
  subjectCode: body.subjectCode,
  name: body.name,
  img: body.img,
  isApproved: body.isApproved,
  managerApproved: body.managerApproved,
  requestedByUserCode: body.requestedByUserCode,
  categoryCode: body.categoryCode
});

// CREATE
export const addSubject = async (body) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/subject`, buildSubjectPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

/** נושא חדש ממשתמש — נשמר כממתין לאישור מנהל */
export const createUserSubjectRequest = async ({ name, userCode, img, categoryCode }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/subject/user-request`, {
      name,
      userCode,
      ...(img ? { img } : {}),
      ...(categoryCode ? { categoryCode } : {})
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getPendingSubjects = async (managerUserCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subject/pending-approval`, {
      params: { managerUserCode }
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const approveSubjectByCode = async (subjectCode, managerUserCode, categoryCode = "") => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/subject/${encodeURIComponent(subjectCode)}/approve`,
      { managerUserCode, categoryCode }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getSubjectBySubjectCode = async (subjectCode) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/subject/by-code/${encodeURIComponent(subjectCode)}`
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// GET — רשימת נושאים (הסינון לטופס כתיבה חופשית נעשה בקומפוננטה)
export const getAllSubjects = async () => {
  try {
    const base = API_BASE_URL.replace(/\/$/, "");
    const response = await axios.get(`${base}/subject/catalog`, {
      headers: { Accept: "application/json" },
      responseType: "json"
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* ignore */
      }
    }
    return [];
  } catch {
    return [];
  }
};

export const getSubjectById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subject/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// UPDATE
export const updateSubject = async (id, body) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/subject/${id}`, buildSubjectPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// DELETE (server expects subjectCode)
export const deleteSubject = async (subjectCode) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/subject/${subjectCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
