const express = require("express");
const bookResponseController = require("../Controllers/BookResponseController");

const bookResponseRouter = express.Router();

bookResponseRouter.get("/book/:bookCode", bookResponseController.getResponsesByBookCode);
bookResponseRouter.post("/", bookResponseController.addResponse);
bookResponseRouter.delete("/:id", bookResponseController.deleteResponse);

module.exports = bookResponseRouter;
