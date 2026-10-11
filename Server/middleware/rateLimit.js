const { rateLimit } = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "יותר מדי ניסיונות. נסי שוב מאוחר יותר." },
  skip: () => process.env.NODE_ENV === "test"
});

module.exports = { authLimiter };
