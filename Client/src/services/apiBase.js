import axios from "axios";

const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
const DEFAULT_PROD_API = "https://myreadingcornerserver.onrender.com";

/** Local: Vite `/api` proxy, or VITE_API_BASE_URL if it is a full URL.
 *  Production: the real API host. Render static `_redirects` cannot proxy `/api`. */
export const API_BASE_URL = import.meta.env.PROD
  ? (envUrl.startsWith("http") ? envUrl : DEFAULT_PROD_API)
  : (envUrl.startsWith("http") ? envUrl : "/api");

const ACCESS_TOKEN_KEY = "mrcAccessToken";

let memoryAccessToken = "";

const readStoredAccessToken = () => {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const setAccessToken = (token = "") => {
  memoryAccessToken = token || "";
  try {
    if (memoryAccessToken) sessionStorage.setItem(ACCESS_TOKEN_KEY, memoryAccessToken);
    else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* private mode */
  }
};

setAccessToken(readStoredAccessToken());

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const stripContentType = (headers) => {
  if (!headers) return;
  if (typeof headers.delete === "function") {
    headers.delete("Content-Type");
    headers.delete("content-type");
    return;
  }
  delete headers["Content-Type"];
  delete headers["content-type"];
};

api.interceptors.request.use((config) => {
  if (memoryAccessToken) {
    config.headers = config.headers || {};
    if (typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${memoryAccessToken}`);
    } else {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    stripContentType(config.headers);
  }
  return config;
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
  (response) => {
    const token = response?.data?.accessToken;
    if (typeof token === "string" && token) {
      setAccessToken(token);
    }
    return response;
  },
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
      if (typeof FormData !== "undefined" && original.data instanceof FormData) {
        stripContentType(original.headers);
      }
      return api(original);
    } catch (refreshErr) {
      setAccessToken("");
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
