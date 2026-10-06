const User = require("../Models/UserModel");
const { ACCESS_COOKIE, verifyAccessToken } = require("../utils/tokens");
const AppError = require("../utils/AppError");
const { asyncHandler } = require("./asyncHandler");

const toReqUser = (user) => ({
  id: String(user._id),
  userCode: user.userCode,
  role: user.role || "user"
});

const loadUserFromAccessCookie = async (req) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return null;

  const decoded = verifyAccessToken(token);
  if (!decoded || decoded.typ !== "access" || !decoded.id) return null;

  const user = await User.findById(decoded.id).select("userCode role");
  if (!user) return null;
  return toReqUser(user);
};

const authenticate = asyncHandler(async (req, res, next) => {
  try {
    const user = await loadUserFromAccessCookie(req);
    if (!user) {
      throw new AppError(401, "נדרשת התחברות");
    }
    req.user = user;
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
      throw new AppError(401, "נדרשת התחברות");
    }
    throw err;
  }
});

const optionalAuthenticate = async (req, res, next) => {
  try {
    req.user = await loadUserFromAccessCookie(req);
  } catch {
    req.user = null;
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
