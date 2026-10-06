const express = require("express");
const bookResponseController = require("../Controllers/BookResponseController");
const { authenticate } = require("../middleware/authenticate");

const bookResponseRouter = express.Router();

bookResponseRouter.get("/book/:bookCode", bookResponseController.getResponsesByBookCode);
bookResponseRouter.post("/", authenticate, bookResponseController.addResponse);
bookResponseRouter.delete("/:id", authenticate, bookResponseController.deleteResponse);

module.exports = bookResponseRouter;
