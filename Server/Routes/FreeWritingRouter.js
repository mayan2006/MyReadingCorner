const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const freeWritingController = require("../Controllers/FreeWritingController");

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
freeWritingRouter.put("/by-code/:writingCode", freeWritingController.updateFreeWritingByWritingCode);
freeWritingRouter.post("/upload-cover", upload.single("image"), freeWritingController.uploadCoverImage);
freeWritingRouter.get("/series/:seriesCode", freeWritingController.getChaptersBySeriesCode);
freeWritingRouter.delete("/:writingCode", freeWritingController.deleteFreeWriting);
freeWritingRouter.get("/:id", freeWritingController.getFreeWritingById);
freeWritingRouter.post("/", freeWritingController.addNewFreeWriting);
freeWritingRouter.put("/:id", freeWritingController.updateFreeWriting);

module.exports = freeWritingRouter;
