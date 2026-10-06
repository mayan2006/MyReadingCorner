const express = require("express");

const markedBookController = require("../Controllers/MarkedBookController");
const { authenticate } = require("../middleware/authenticate");

const markedBookRouter = express.Router();

markedBookRouter.get("/", authenticate, markedBookController.getAllMarkedBook);
markedBookRouter.get("/:id", authenticate, markedBookController.getMarkedBookById);
markedBookRouter.delete("/:bookCode", authenticate, markedBookController.deleteMarkedBook);
markedBookRouter.post("/", authenticate, markedBookController.addNewMarkedBook);
markedBookRouter.put("/:id", authenticate, markedBookController.updateMarkedBook);

module.exports = markedBookRouter;
