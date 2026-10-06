const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!parsed.success) {
    const issue = parsed.error.issues?.[0];
    return next(new AppError(400, issue?.message || "קלט לא תקין"));
  }

  if (parsed.data.body !== undefined) {
    req.body = parsed.data.body;
  }
  next();
};

module.exports = { validate };
