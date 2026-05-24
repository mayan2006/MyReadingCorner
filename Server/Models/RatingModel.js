const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  bookCode: {
    type: String,
    required: true
  },
  userCode: {
    type: String,
    required: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

ratingSchema.index({ bookCode: 1, userCode: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
