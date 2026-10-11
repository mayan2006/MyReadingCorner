const multer = require("multer");
const AppError = require("../utils/AppError");

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const imageFileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new AppError(400, "נא להעלות תמונה מסוג JPEG, PNG או WebP"));
};

const createImageUpload = () =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
  });

module.exports = {
  profileUpload: createImageUpload(),
  coverUpload: createImageUpload()
};
