const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: "נדרשת התחברות" });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).send({ message: "אין הרשאה לבצע פעולה זו" });
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
