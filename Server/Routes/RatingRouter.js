const express = require("express");
const ratingController = require("../Controllers/RatingController");
const { authenticate } = require("../middleware/authenticate");
const { validate } = require("../middleware/validate");
const { upsertRatingSchema } = require("../validators/actionSchemas");

const ratingRouter = express.Router();

ratingRouter.post("/", authenticate, validate(upsertRatingSchema), ratingController.upsertRating);
ratingRouter.get("/book/:bookCode/average", ratingController.getAverageByBookCode);
ratingRouter.get("/book/:bookCode/me", authenticate, ratingController.getMyRatingByBookCode);

module.exports = ratingRouter;
