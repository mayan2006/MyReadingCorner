const express = require("express");
const bookLikeController = require("../Controllers/BookLikeController");
const { authenticate, optionalAuthenticate } = require("../middleware/authenticate");
const { validate } = require("../middleware/validate");
const { toggleLikeSchema } = require("../validators/actionSchemas");

const bookLikeRouter = express.Router();

bookLikeRouter.get("/me", authenticate, bookLikeController.getMyLikedBooks);
bookLikeRouter.get("/user/:userCode", bookLikeController.getLikedBooksForUser);
bookLikeRouter.get("/book/:bookCode", optionalAuthenticate, bookLikeController.getBookLikeState);
bookLikeRouter.post("/toggle", authenticate, validate(toggleLikeSchema), bookLikeController.toggleBookLike);

module.exports = bookLikeRouter;
