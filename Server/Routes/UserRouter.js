const express = require("express");

const userController = require("../Controllers/UserController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimit");
const { profileUpload } = require("../middleware/upload");
const { loginSchema, signupSchema } = require("../validators/userSchemas");

const userRouter = express.Router();

userRouter.post("/login", authLimiter, validate(loginSchema), userController.loginUser);
userRouter.post("/logout", userController.logoutUser);
userRouter.post("/refresh", userController.refreshSession);
userRouter.get("/me", authenticate, userController.getMe);
userRouter.get("/public/:userCode", userController.getPublicAuthorProfile);
userRouter.post(
  "/upload-image",
  authenticate,
  profileUpload.single("image"),
  userController.updateUserImage
);
userRouter.post("/", authLimiter, validate(signupSchema), userController.addNewUser);
userRouter.get("/", authenticate, authorize("manager"), userController.getAllUsers);
userRouter.get("/:id", authenticate, userController.getUserById);
userRouter.put("/:id", authenticate, userController.updateUser);
userRouter.delete("/:userCode", authenticate, userController.deleteUser);

module.exports = userRouter;
