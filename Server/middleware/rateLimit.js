const { rateLimit } = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "יותר מדי ניסיונות. נסי שוב מאוחר יותר." }
});

module.exports = { authLimiter };
