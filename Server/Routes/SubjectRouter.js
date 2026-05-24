const express = require("express");

const SubjectController = require("../Controllers/SubjectController");

const SubjectRouter = express.Router();

SubjectRouter.get("/pending-approval", SubjectController.getPendingSubjects);
/** רשימת כל הנושאים — לפני /:id כדי שלא יילכד id=dynamic */
SubjectRouter.get("/catalog", SubjectController.getAllSubjects);
SubjectRouter.get("/", SubjectController.getAllSubjects);
SubjectRouter.post("/user-request", SubjectController.createUserSubjectRequest);
SubjectRouter.get("/by-code/:subjectCode", SubjectController.getSubjectBySubjectCode);
SubjectRouter.get("/:id", SubjectController.getSubjectById);
SubjectRouter.delete("/:subjectCode", SubjectController.deleteSubject);
SubjectRouter.post("/", SubjectController.addNewSubject);
SubjectRouter.put("/:id", SubjectController.updateSubject);
SubjectRouter.patch("/:subjectCode/approve", SubjectController.approveSubjectByCode);

module.exports = SubjectRouter;
