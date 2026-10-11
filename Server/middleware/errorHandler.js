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

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const messages = {
      email: "האימייל כבר קיים במערכת",
      userCode: "קוד המשתמש כבר תפוס",
      bookCode: "קוד הספר כבר קיים",
      writingCode: "קוד הכתיבה כבר קיים",
      subjectCode: "קוד הנושא כבר קיים"
    };
    return res.status(409).send({ message: messages[field] || "ערך כפול במערכת" });
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
