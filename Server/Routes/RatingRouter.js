const express = require("express");
const ratingController = require("../Controllers/RatingController");
const { authenticate } = require("../middleware/authenticate");

const ratingRouter = express.Router();

ratingRouter.post("/", authenticate, ratingController.upsertRating);
ratingRouter.get("/book/:bookCode/average", ratingController.getAverageByBookCode);
ratingRouter.get("/book/:bookCode/me", authenticate, ratingController.getMyRatingByBookCode);

module.exports = ratingRouter;
