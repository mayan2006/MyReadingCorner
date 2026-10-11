const { v2: cloudinary } = require("cloudinary");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const persistUploadedImage = async (file, folder) => {
  if (!file?.buffer) {
    throw new Error("missing file buffer");
  }

  if (isCloudinaryConfigured()) {
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `my-reading-corner/${folder}`,
          resource_type: "image"
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(file.buffer);
    });
    return uploaded.secure_url;
  }

  const extension = path.extname(file.originalname || ".jpg") || ".jpg";
  const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  return `/uploads/${filename}`;
};

module.exports = {
  persistUploadedImage,
  isCloudinaryConfigured
};
