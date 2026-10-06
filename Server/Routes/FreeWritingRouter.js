const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const freeWritingController = require("../Controllers/FreeWritingController");
const { authenticate } = require("../middleware/authenticate");

const freeWritingRouter = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname || ".jpg");
    cb(null, `fw-cover-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ storage });

freeWritingRouter.get("/", freeWritingController.getAllFreeWriting);
freeWritingRouter.get("/by-code/:writingCode", freeWritingController.getFreeWritingByWritingCode);
freeWritingRouter.put(
  "/by-code/:writingCode",
  authenticate,
  freeWritingController.updateFreeWritingByWritingCode
);
freeWritingRouter.post(
  "/upload-cover",
  authenticate,
  upload.single("image"),
  freeWritingController.uploadCoverImage
);
freeWritingRouter.get("/series/:seriesCode", freeWritingController.getChaptersBySeriesCode);
freeWritingRouter.delete("/:writingCode", authenticate, freeWritingController.deleteFreeWriting);
freeWritingRouter.get("/:id", freeWritingController.getFreeWritingById);
freeWritingRouter.post("/", authenticate, freeWritingController.addNewFreeWriting);
freeWritingRouter.put("/:id", authenticate, freeWritingController.updateFreeWriting);

module.exports = freeWritingRouter;
