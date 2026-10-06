const AppError = require("../utils/AppError");

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, "נדרשת התחברות"));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError(403, "אין הרשאה לבצע פעולה זו"));
    }
    return next();
  };

const isOwnerOrManager = (req, resourceUserCode) =>
  Boolean(
    req.user &&
      (req.user.role === "manager" || req.user.userCode === resourceUserCode)
  );

module.exports = {
  authorize,
  isOwnerOrManager
};
