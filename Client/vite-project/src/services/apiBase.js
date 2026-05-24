export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
