const express = require("express");
const BookController = require("../Controllers/BookController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");

const BookRouter = express.Router();

BookRouter.get("/code/:bookCode", BookController.getBookByCode);
BookRouter.get("/:id", BookController.getBookById);
BookRouter.get("/", BookController.getAllBooks);
BookRouter.delete(
  "/:bookCode",
  authenticate,
  authorize("manager"),
  BookController.deleteBook
);
BookRouter.put("/:id", authenticate, authorize("manager"), BookController.updateBook);
BookRouter.post("/", authenticate, authorize("manager"), BookController.addNewBook);

module.exports = BookRouter;
