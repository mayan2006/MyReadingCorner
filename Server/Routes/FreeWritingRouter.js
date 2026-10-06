const express = require("express");

const freeWritingController = require("../Controllers/FreeWritingController");
const { authenticate } = require("../middleware/authenticate");
const { validate } = require("../middleware/validate");
const { coverUpload } = require("../middleware/upload");
const {
  addFreeWritingSchema,
  updateFreeWritingSchema,
  uploadCoverSchema
} = require("../validators/actionSchemas");

const freeWritingRouter = express.Router();

freeWritingRouter.get("/", freeWritingController.getAllFreeWriting);
freeWritingRouter.get("/by-code/:writingCode", freeWritingController.getFreeWritingByWritingCode);
freeWritingRouter.put(
  "/by-code/:writingCode",
  authenticate,
  validate(updateFreeWritingSchema),
  freeWritingController.updateFreeWritingByWritingCode
);
freeWritingRouter.post(
  "/upload-cover",
  authenticate,
  coverUpload.single("image"),
  validate(uploadCoverSchema),
  freeWritingController.uploadCoverImage
);
freeWritingRouter.get("/series/:seriesCode", freeWritingController.getChaptersBySeriesCode);
freeWritingRouter.delete("/:writingCode", authenticate, freeWritingController.deleteFreeWriting);
freeWritingRouter.get("/:id", freeWritingController.getFreeWritingById);
freeWritingRouter.post(
  "/",
  authenticate,
  validate(addFreeWritingSchema),
  freeWritingController.addNewFreeWriting
);
freeWritingRouter.put(
  "/:id",
  authenticate,
  validate(updateFreeWritingSchema),
  freeWritingController.updateFreeWriting
);

module.exports = freeWritingRouter;
