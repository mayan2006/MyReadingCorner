const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://myreadingcorner-1.onrender.com",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
];

const isAllowedOrigin = (origin) => !origin || allowedOrigins.includes(origin);

module.exports = { allowedOrigins, isAllowedOrigin };
