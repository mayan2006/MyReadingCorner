const express = require("express");
const ratingController = require("../Controllers/RatingController");

const ratingRouter = express.Router();

ratingRouter.post("/", ratingController.upsertRating);
ratingRouter.get("/book/:bookCode/average", ratingController.getAverageByBookCode);
ratingRouter.get("/book/:bookCode/user/:userCode", ratingController.getUserRatingByBookCode);

module.exports = ratingRouter;
