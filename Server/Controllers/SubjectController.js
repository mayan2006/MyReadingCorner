const Subject = require("../Models/SubjectModel");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

/** תואם לטאבי הקטגוריות בלקוח — לשיוך נושא לתצוגה ב-Navbar */
const SUBJECT_NAV_CATEGORIES = [
    "פנטזיה",
    "רומנטיקה",
    "מתח",
    "נוער",
    "ספרי משתמשים"
];
const DEFAULT_SUBJECT_CATEGORY = "ספרי משתמשים";

const normalizeCategoryInput = (value) => {
    const s = (value ?? "").toString().replace(/[\u200e\u200f\u202a-\u202e]/g, "").trim();
    try {
        return s.normalize ? s.normalize("NFC") : s;
    } catch {
        return s;
    }
};

const getAllSubjects = async (req, res) => {
    const allSubjects = await Subject.find({
        $or: [
            { managerApproved: true },
            { managerApproved: { $exists: false } },
            {
                managerApproved: false,
                requestedByUserCode: { $exists: true, $nin: [null, ""] }
            }
        ]
    }).sort({ name: 1 });
    res.status(200).send(allSubjects);
};

const getPendingSubjects = async (req, res) => {
    const pending = await Subject.find({ managerApproved: false }).sort({ subjectCode: -1 });
    res.status(200).send(pending);
};

const getSubjectBySubjectCode = async (req, res) => {
    const subject = await Subject.findOne({ subjectCode: req.params.subjectCode }).lean();
    if (!subject) {
        throw new AppError(404, "Subject not found");
    }
    res.status(200).send(subject);
};

const getSubjectById = async (req, res) => {
    const subject = await Subject.findById(req.params.id);
    res.status(200).send(subject);
};

const deleteSubject = async (req, res) => {
    const subject = await Subject.deleteOne({ subjectCode: req.params.subjectCode });
    res.status(200).send("Book deleted " + subject);
};

const addNewSubject = async (req, res) => {
    const payload = { ...req.body };
    if (payload.managerApproved === undefined) {
        payload.managerApproved = true;
    }
    const newSubject = new Subject(payload);
    await newSubject.save();
    res.status(200).send({ message: "Subject added to DB", Subject: newSubject });
};

const createUserSubjectRequest = async (req, res) => {
    const name = (req.body.name || "").trim();
    let categoryCode = normalizeCategoryInput(req.body.categoryCode);
    if (!SUBJECT_NAV_CATEGORIES.includes(categoryCode)) {
        categoryCode = DEFAULT_SUBJECT_CATEGORY;
    }
    const subjectCode = `SUB-${Date.now()}`;
    const newSubject = new Subject({
        subjectCode,
        name,
        img: req.body.img || "/vite.svg",
        isApproved: false,
        managerApproved: false,
        requestedByUserCode: req.user.userCode,
        categoryCode
    });
    await newSubject.save();
    res.status(200).send({
        message: "Subject pending manager approval",
        Subject: newSubject
    });
};

const approveSubjectByCode = async (req, res) => {
    const { subjectCode } = req.params;
    const { categoryCode } = req.body || {};
    let categoryTrimmed = normalizeCategoryInput(categoryCode);
    if (!SUBJECT_NAV_CATEGORIES.includes(categoryTrimmed)) {
        categoryTrimmed = DEFAULT_SUBJECT_CATEGORY;
    }
    const subject = await Subject.findOne({ subjectCode });
    if (!subject) {
        throw new AppError(404, "נושא לא נמצא");
    }
    subject.managerApproved = true;
    subject.isApproved = true;
    subject.categoryCode = categoryTrimmed;
    await subject.save();
    res.status(200).send({ message: "הנושא אושר", Subject: subject });
};

const updateSubject = async (req, res) => {
    const subject = await Subject.findById(req.params.id);
    if (!subject) throw new AppError(404, "Subject not found");

    subject.set({ ...req.body });
    await subject.save();
    res.status(200).send({ message: "Subject updated", updatedSubject: subject });
};

module.exports = wrapAsync({
    getAllSubjects,
    getPendingSubjects,
    getSubjectBySubjectCode,
    getSubjectById,
    deleteSubject,
    addNewSubject,
    createUserSubjectRequest,
    approveSubjectByCode,
    updateSubject
});
