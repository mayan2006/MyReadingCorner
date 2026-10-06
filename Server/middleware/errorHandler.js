const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send({ message: "הקובץ גדול מדי (עד 2MB)" });
    }
    return res.status(400).send({ message: "העלאת הקובץ נכשלה" });
  }

  if (err.name === "ValidationError") {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).send({
      message: first?.message || "Validation failed",
      errors: err.errors
    });
  }

  if (err.name === "CastError") {
    return res.status(400).send({ message: "מזהה לא תקין" });
  }

  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;
  if (isServerError) {
    console.error(err);
  }

  const message = isServerError && process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";

  return res.status(statusCode).send({ message });
};

module.exports = { errorHandler };
