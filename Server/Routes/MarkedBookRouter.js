const express = require("express");

const markedBookController = require("../Controllers/MarkedBookController");
const { authenticate } = require("../middleware/authenticate");
const { validate } = require("../middleware/validate");
const { addMarkedBookSchema } = require("../validators/actionSchemas");

const markedBookRouter = express.Router();

markedBookRouter.get("/", authenticate, markedBookController.getAllMarkedBook);
markedBookRouter.get("/:id", authenticate, markedBookController.getMarkedBookById);
markedBookRouter.delete("/:bookCode", authenticate, markedBookController.deleteMarkedBook);
markedBookRouter.post("/", authenticate, validate(addMarkedBookSchema), markedBookController.addNewMarkedBook);
markedBookRouter.put("/:id", authenticate, markedBookController.updateMarkedBook);

module.exports = markedBookRouter;
