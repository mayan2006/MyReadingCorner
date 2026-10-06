const jwt = require("jsonwebtoken");

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

const accessSecret = () =>
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me";
const refreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";

const cookieBaseOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/"
  };
};

const tokenPayload = (user) => ({
  id: String(user._id),
  userCode: user.userCode,
  role: user.role || "user"
});

const signAccessToken = (user) =>
  jwt.sign({ ...tokenPayload(user), typ: "access" }, accessSecret(), {
    expiresIn: "15m"
  });

const signRefreshToken = (user) =>
  jwt.sign({ ...tokenPayload(user), typ: "refresh" }, refreshSecret(), {
    expiresIn: "7d"
  });

const verifyAccessToken = (token) => jwt.verify(token, accessSecret());

const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret());

const setAuthCookies = (res, user) => {
  const options = cookieBaseOptions();
  res.cookie(ACCESS_COOKIE, signAccessToken(user), {
    ...options,
    maxAge: 15 * 60 * 1000
  });
  res.cookie(REFRESH_COOKIE, signRefreshToken(user), {
    ...options,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearAuthCookies = (res) => {
  const options = cookieBaseOptions();
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
};

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies
};
