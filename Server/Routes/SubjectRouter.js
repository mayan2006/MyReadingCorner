const express = require("express");

const SubjectController = require("../Controllers/SubjectController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");

const SubjectRouter = express.Router();

SubjectRouter.get(
  "/pending-approval",
  authenticate,
  authorize("manager"),
  SubjectController.getPendingSubjects
);
/** רשימת כל הנושאים — לפני /:id כדי שלא יילכד id=dynamic */
SubjectRouter.get("/catalog", SubjectController.getAllSubjects);
SubjectRouter.get("/", SubjectController.getAllSubjects);
SubjectRouter.post("/user-request", authenticate, SubjectController.createUserSubjectRequest);
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
  SubjectController.approveSubjectByCode
);

module.exports = SubjectRouter;
