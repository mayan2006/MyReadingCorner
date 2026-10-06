const express = require("express");

const categoryController = require("../Controllers/CategoryController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");

const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.getAllCategorys);
categoryRouter.get("/:id", categoryController.getCategoryById);
categoryRouter.delete(
  "/:categoryCode",
  authenticate,
  authorize("manager"),
  categoryController.deleteCategory
);
categoryRouter.post("/", authenticate, authorize("manager"), categoryController.addNewCategory);
categoryRouter.put("/:id", authenticate, authorize("manager"), categoryController.updateCategory);

module.exports = categoryRouter;
