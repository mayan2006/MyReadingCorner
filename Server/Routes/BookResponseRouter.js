const express = require("express");
const bookResponseController = require("../Controllers/BookResponseController");
const { authenticate } = require("../middleware/authenticate");
const { validate } = require("../middleware/validate");
const { addBookResponseSchema } = require("../validators/actionSchemas");

const bookResponseRouter = express.Router();

bookResponseRouter.get("/book/:bookCode", bookResponseController.getResponsesByBookCode);
bookResponseRouter.post("/", authenticate, validate(addBookResponseSchema), bookResponseController.addResponse);
bookResponseRouter.delete("/:id", authenticate, bookResponseController.deleteResponse);

module.exports = bookResponseRouter;
