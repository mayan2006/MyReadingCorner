const express = require("express");
const bookLikeController = require("../Controllers/BookLikeController");
const { authenticate, optionalAuthenticate } = require("../middleware/authenticate");

const bookLikeRouter = express.Router();

bookLikeRouter.get("/me", authenticate, bookLikeController.getMyLikedBooks);
bookLikeRouter.get("/user/:userCode", bookLikeController.getLikedBooksForUser);
bookLikeRouter.get("/book/:bookCode", optionalAuthenticate, bookLikeController.getBookLikeState);
bookLikeRouter.post("/toggle", authenticate, bookLikeController.toggleBookLike);

module.exports = bookLikeRouter;
