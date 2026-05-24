const mongoose = require("mongoose");

const bookLikeSchema = new mongoose.Schema({
  bookCode: {
    type: String,
    required: true
  },
  userCode: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookLikeSchema.index({ bookCode: 1, userCode: 1 }, { unique: true });

const BookLike = mongoose.model("BookLike", bookLikeSchema);
module.exports = BookLike;
