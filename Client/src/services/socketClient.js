import { API_BASE_URL } from "./apiBase";

const DEFAULT_LOCAL_SOCKET = "http://localhost:5000";

/** HTTP origin for Socket.io. Full API URL in production; Vite origin locally so `/api` can proxy the upgrade. */
export function getSocketOrigin() {
  if (API_BASE_URL.startsWith("http")) return API_BASE_URL;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_LOCAL_SOCKET;
}

/** Default `/socket.io` against the real API; `/api/socket.io` through the Vite proxy. */
export function getSocketPath() {
  return API_BASE_URL.startsWith("http") ? "/socket.io" : "/api/socket.io";
}
