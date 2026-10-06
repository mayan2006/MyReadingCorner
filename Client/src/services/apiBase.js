import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let refreshPromise = null;

const shouldSkipRefresh = (config) => {
  const url = config?.url || "";
  const method = (config?.method || "get").toLowerCase();
  if (url.includes("/user/login") || url.includes("/user/refresh") || url.includes("/user/logout")) {
    return true;
  }
  // Signup is POST /user — don't try to refresh on validation errors
  if (method === "post" && (url.endsWith("/user") || url.endsWith("/user/"))) {
    return true;
  }
  return false;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      !original ||
      original._retry ||
      error.response?.status !== 401 ||
      shouldSkipRefresh(original)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = api.post("/user/refresh").finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      return api(original);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    }
  }
);

/** Turn `/uploads/...` or relative paths into an absolute URL for `<img src>`. */
export function resolveMediaUrl(src) {
  if (!src || typeof src !== "string") return "";
  const t = src.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${base}${path}`;
}
