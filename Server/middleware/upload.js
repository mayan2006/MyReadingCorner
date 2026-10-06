const path = require("path");
const fs = require("fs");
const multer = require("multer");
const AppError = require("../utils/AppError");

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const imageFileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new AppError(400, "נא להעלות תמונה מסוג JPEG, PNG או WebP"));
};

const createImageUpload = (filenamePrefix) =>
  multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path.extname(file.originalname || ".jpg") || ".jpg";
        cb(null, `${filenamePrefix}-${uniqueSuffix}${extension}`);
      }
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  });

module.exports = {
  profileUpload: createImageUpload("profile"),
  coverUpload: createImageUpload("fw-cover")
};
