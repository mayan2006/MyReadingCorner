const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const userController = require("../Controllers/UserController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");

const userRouter = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname || ".jpg");
    cb(null, `profile-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ storage });

userRouter.post("/login", userController.loginUser);
userRouter.post("/logout", userController.logoutUser);
userRouter.post("/refresh", userController.refreshSession);
userRouter.get("/me", authenticate, userController.getMe);
userRouter.get("/public/:userCode", userController.getPublicAuthorProfile);
userRouter.post("/upload-image", authenticate, upload.single("image"), userController.updateUserImage);
userRouter.post("/", userController.addNewUser);
userRouter.get("/", authenticate, authorize("manager"), userController.getAllUsers);
userRouter.get("/:id", authenticate, userController.getUserById);
userRouter.put("/:id", authenticate, userController.updateUser);
userRouter.delete("/:userCode", authenticate, userController.deleteUser);

module.exports = userRouter;
