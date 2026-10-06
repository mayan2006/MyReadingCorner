const Subject = require("../Models/SubjectModel");

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
    try {
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
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const getPendingSubjects = async (req, res) => {
    try {
        const pending = await Subject.find({ managerApproved: false }).sort({ subjectCode: -1 });
        res.status(200).send(pending);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const getSubjectBySubjectCode = async (req, res) => {
    try {
        const subject = await Subject.findOne({ subjectCode: req.params.subjectCode }).lean();
        if (!subject) {
            return res.status(404).send({ message: "Subject not found" });
        }
        res.status(200).send(subject);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        res.status(200).send(subject);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.deleteOne({ subjectCode: req.params.subjectCode });
        res.status(200).send("Book deleted " + subject);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const addNewSubject = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.managerApproved === undefined) {
            payload.managerApproved = true;
        }
        const newSubject = new Subject(payload);
        await newSubject.save();
        res.status(200).send({ message: "Subject added to DB", Subject: newSubject });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

/** נושא חדש ממשתמש — ממתין לאישור מנהל */
const createUserSubjectRequest = async (req, res) => {
    try {
        const name = (req.body.name || "").trim();
        if (!name) {
            return res.status(400).send({ message: "שם נושא נדרש" });
        }
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
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const approveSubjectByCode = async (req, res) => {
    try {
        const { subjectCode } = req.params;
        const { categoryCode } = req.body || {};
        let categoryTrimmed = normalizeCategoryInput(categoryCode);
        if (!categoryTrimmed) {
            return res.status(400).send({ message: "חובה לבחור קטגוריה לפני אישור הנושא" });
        }
        if (!SUBJECT_NAV_CATEGORIES.includes(categoryTrimmed)) {
            categoryTrimmed = DEFAULT_SUBJECT_CATEGORY;
        }
        const subject = await Subject.findOne({ subjectCode });
        if (!subject) {
            return res.status(404).send({ message: "נושא לא נמצא" });
        }
        subject.managerApproved = true;
        subject.isApproved = true;
        subject.categoryCode = categoryTrimmed;
        await subject.save();
        res.status(200).send({ message: "הנושא אושר", Subject: subject });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).send({ message: "Subject not found" });

        subject.set({ ...req.body });
        await subject.save();
        res.status(200).send({ message: "Subject updated", updatedSubject: subject });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

module.exports = {
    getAllSubjects,
    getPendingSubjects,
    getSubjectBySubjectCode,
    getSubjectById,
    deleteSubject,
    addNewSubject,
    createUserSubjectRequest,
    approveSubjectByCode,
    updateSubject
};
