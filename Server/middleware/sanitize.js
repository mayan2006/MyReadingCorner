const mongoSanitize = require("express-mongo-sanitize");

/** Sanitize in place. Do not reassign req.query (read-only in Express 5). */
const sanitizeRequest = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  }
  if (req.params && typeof req.params === "object") {
    mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  }
  next();
};

module.exports = { sanitizeRequest };
