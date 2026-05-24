const express = require("express");
const bookLikeController = require("../Controllers/BookLikeController");

const bookLikeRouter = express.Router();

bookLikeRouter.get("/user/:userCode", bookLikeController.getLikedBooksForUser);
bookLikeRouter.get("/book/:bookCode", bookLikeController.getBookLikeState);
bookLikeRouter.post("/toggle", bookLikeController.toggleBookLike);

module.exports = bookLikeRouter;
