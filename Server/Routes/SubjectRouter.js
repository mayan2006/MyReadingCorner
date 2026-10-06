const express = require("express");

const SubjectController = require("../Controllers/SubjectController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { validate } = require("../middleware/validate");
const {
  createSubjectRequestSchema,
  approveSubjectSchema
} = require("../validators/actionSchemas");

const SubjectRouter = express.Router();

SubjectRouter.get(
  "/pending-approval",
  authenticate,
  authorize("manager"),
  SubjectController.getPendingSubjects
);
SubjectRouter.get("/catalog", SubjectController.getAllSubjects);
SubjectRouter.get("/", SubjectController.getAllSubjects);
SubjectRouter.post(
  "/user-request",
  authenticate,
  validate(createSubjectRequestSchema),
  SubjectController.createUserSubjectRequest
);
SubjectRouter.get("/by-code/:subjectCode", SubjectController.getSubjectBySubjectCode);
SubjectRouter.get("/:id", SubjectController.getSubjectById);
SubjectRouter.delete(
  "/:subjectCode",
  authenticate,
  authorize("manager"),
  SubjectController.deleteSubject
);
SubjectRouter.post("/", authenticate, authorize("manager"), SubjectController.addNewSubject);
SubjectRouter.put("/:id", authenticate, authorize("manager"), SubjectController.updateSubject);
SubjectRouter.patch(
  "/:subjectCode/approve",
  authenticate,
  authorize("manager"),
  validate(approveSubjectSchema),
  SubjectController.approveSubjectByCode
);

module.exports = SubjectRouter;
