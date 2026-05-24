const mongoose = require("mongoose");

const bookResponseSchema = new mongoose.Schema({
  bookCode: {
    type: String,
    required: true,
    index: true
  },
  userCode: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookResponseSchema.index({ bookCode: 1, createdAt: -1 });

const BookResponse = mongoose.model("BookResponse", bookResponseSchema);
module.exports = BookResponse;
