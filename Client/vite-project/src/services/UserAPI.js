import axios from "axios";
import { API_BASE_URL } from "./apiBase";

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
    const response = await axios.post(`${API_BASE_URL}/user/login`, {
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

// CREATE
export const addUser = async (body) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user`, buildUserPayload(body));
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
    const response = await axios.get(`${API_BASE_URL}/user/public/${encodeURIComponent(userCode)}`);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// GET
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user`);
    return response.data;
  } catch (error) {
    return error.message;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${id}`);
    return response.data;
  } catch (error) {
    return error.message;
  }
};

// UPDATE
export const updateUser = async (id, body) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/user/${id}`, buildUserPayload(body));
    return response.data;
  } catch (error) {
    return error.message;
  }
};

export const uploadUserImage = async (userCode, imageFile) => {
  const formData = new FormData();
  formData.append("userCode", userCode);
  formData.append("image", imageFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/user/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

// DELETE (server expects userCode, not Mongo _id)
export const deleteUser = async (userCode) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/user/${userCode}`);
    return response.data;
  } catch (error) {
    return error.message;
  }
};