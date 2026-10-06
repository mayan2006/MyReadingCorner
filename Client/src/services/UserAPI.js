import axios from "axios";
import { API_BASE_URL, api } from "./apiBase";

const buildUserPayload = (body = {}) => ({
  userCode: body.userCode,
  firstName: body.firstName,
  lastName: body.lastName,
  password: body.password,
  email: body.email,
  img: body.img,
  userStatus: body.userStatus
});

export const loginUser = async (body) => {
  try {
    const response = await api.post("/user/login", {
      email: (body.email || "").trim().toLowerCase(),
      password: body.password || ""
    });
    return response.data;
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message || error?.message || "התחברות נכשלה";
    throw new Error(serverMessage);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/user/logout");
    return response.data;
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message || error?.message || "התנתקות נכשלה";
    throw new Error(serverMessage);
  }
};

export const getMe = async () => {
  const response = await api.get("/user/me");
  return response.data;
};

// CREATE
export const addUser = async (body) => {
  try {
    const response = await api.post("/user", buildUserPayload(body));
    return response.data;
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.password?.message ||
      error?.response?.data?.errors?.firstName?.message ||
      error?.response?.data?.errors?.lastName?.message ||
      error?.response?.data?.errors?.email?.message ||
      error?.message ||
      "Failed to create user";

    throw new Error(serverMessage);
  }
};

export const getPublicAuthorProfile = async (userCode) => {
  try {
    const response = await api.get(`/user/public/${encodeURIComponent(userCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get("/user");
    return response.data;
  } catch (error) {
    return error.message;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    return error.message;
  }
};

export const updateUser = async (id, body) => {
  try {
    const response = await api.put(`/user/${id}`, buildUserPayload(body));
    return response.data;
  } catch (error) {
    return error.message;
  }
};

export const uploadUserImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await api.post("/user/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const deleteUser = async (userCode) => {
  try {
    const response = await api.delete(`/user/${userCode}`);
    return response.data;
  } catch (error) {
    return error.message;
  }
};

export { axios, API_BASE_URL };
