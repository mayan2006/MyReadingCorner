import { api } from "./apiBase";

const buildSubjectPayload = (body = {}) => ({
  subjectCode: body.subjectCode,
  name: body.name,
  img: body.img,
  isApproved: body.isApproved,
  managerApproved: body.managerApproved,
  requestedByUserCode: body.requestedByUserCode,
  categoryCode: body.categoryCode
});

export const addSubject = async (body) => {
  try {
    const response = await api.post("/subject", buildSubjectPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const createUserSubjectRequest = async ({ name, img, categoryCode }) => {
  try {
    const response = await api.post("/subject/user-request", {
      name,
      ...(img ? { img } : {}),
      ...(categoryCode ? { categoryCode } : {})
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getPendingSubjects = async () => {
  try {
    const response = await api.get("/subject/pending-approval");
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const approveSubjectByCode = async (subjectCode, categoryCode = "") => {
  try {
    const response = await api.patch(`/subject/${encodeURIComponent(subjectCode)}/approve`, {
      categoryCode
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getSubjectBySubjectCode = async (subjectCode) => {
  try {
    const response = await api.get(`/subject/by-code/${encodeURIComponent(subjectCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getAllSubjects = async () => {
  try {
    const response = await api.get("/subject/catalog", {
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
    const response = await api.get(`/subject/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const updateSubject = async (id, body) => {
  try {
    const response = await api.put(`/subject/${id}`, buildSubjectPayload(body));
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const deleteSubject = async (subjectCode) => {
  try {
    const response = await api.delete(`/subject/${subjectCode}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
