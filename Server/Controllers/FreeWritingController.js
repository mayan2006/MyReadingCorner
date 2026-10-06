const FreeWriting = require("../Models/FreeWritingModel");
const { isOwnerOrManager } = require("../middleware/authorize");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

const getAllFreeWriting = async (req, res) => {
    const allFreeWriting = await FreeWriting.find();
    res.status(200).send(allFreeWriting);
};

const getFreeWritingById = async (req, res) => {
    const freeWriting = await FreeWriting.findById(req.params.id);
    res.status(200).send(freeWriting);
};

const getChaptersBySeriesCode = async (req, res) => {
    const { seriesCode } = req.params;
    const list = await FreeWriting.find({
        $or: [{ seriesCode }, { writingCode: seriesCode }]
    })
        .sort({ chapter: 1, writingCode: 1 })
        .lean();
    res.status(200).send(list);
};

const getFreeWritingByWritingCode = async (req, res) => {
    const doc = await FreeWriting.findOne({ writingCode: req.params.writingCode });
    if (!doc) {
        throw new AppError(404, "freeWriting not found");
    }
    res.status(200).send(doc);
};

const updateFreeWritingByWritingCode = async (req, res) => {
    const doc = await FreeWriting.findOne({ writingCode: req.params.writingCode });
    if (!doc) {
        throw new AppError(404, "freeWriting not found");
    }
    if (!isOwnerOrManager(req, doc.userCode)) {
        throw new AppError(403, "Forbidden");
    }
    const {
        subjectCode,
        chapter,
        name,
        summary,
        content,
        author,
        isApproved
    } = req.body;
    doc.set({
        subjectCode: subjectCode != null ? subjectCode : doc.subjectCode,
        chapter: chapter != null ? Number(chapter) : doc.chapter,
        name: name != null ? name : doc.name,
        summary: summary != null ? summary : doc.summary,
        content: content != null ? content : doc.content,
        author: author != null ? author : doc.author,
        isApproved: typeof isApproved === "boolean" ? isApproved : doc.isApproved,
        date: new Date()
    });
    await doc.save();
    res.status(200).send({ message: "freeWriting updated", updatedFreeWriting: doc });
};

const uploadCoverImage = async (req, res) => {
    const writingCode = (req.body.writingCode || "").trim();
    if (!req.file) {
        throw new AppError(400, "Image file is required");
    }

    const doc = await FreeWriting.findOne({ writingCode });
    if (!doc) {
        throw new AppError(404, "freeWriting not found");
    }
    if (!isOwnerOrManager(req, doc.userCode)) {
        throw new AppError(403, "Forbidden");
    }

    doc.img = `/uploads/${req.file.filename}`;
    await doc.save();

    res.status(200).send({ message: "cover updated", freeWriting: doc });
};

const deleteFreeWriting = async (req, res) => {
    const doc = await FreeWriting.findOne({ writingCode: req.params.writingCode });
    if (!doc) {
        throw new AppError(404, "freeWriting not found");
    }
    if (!isOwnerOrManager(req, doc.userCode)) {
        throw new AppError(403, "Forbidden");
    }
    const freeWriting = await FreeWriting.deleteOne({ writingCode: req.params.writingCode });
    res.status(200).send("freeWriting deleted " + freeWriting);
};

const addNewFreeWriting = async (req, res) => {
    const body = { ...req.body };
    body.userCode = req.user.userCode;
    const incomingSeries = body.seriesCode;
    const writingCode = body.writingCode;

    if (!incomingSeries || incomingSeries === writingCode) {
        body.seriesCode = writingCode;
    } else {
        const inSeries = {
            $or: [{ seriesCode: incomingSeries }, { writingCode: incomingSeries }]
        };
        const siblings = await FreeWriting.find(inSeries)
            .sort({ chapter: -1 })
            .limit(1);
        const maxCh = siblings.length ? siblings[0].chapter : 0;
        body.chapter = maxCh + 1;
        body.seriesCode = incomingSeries;
        if (!body.subjectCode) {
            const first = await FreeWriting.findOne(inSeries)
                .sort({ chapter: 1 })
                .lean();
            if (first?.subjectCode) {
                body.subjectCode = first.subjectCode;
            }
        }
    }

    const newFreeWriting = new FreeWriting(body);
    await newFreeWriting.save();
    res.status(200).send({ message: "freeWriting added to DB", freeWriting: newFreeWriting });
};

const updateFreeWriting = async (req, res) => {
    const freeWriting = await FreeWriting.findById(req.params.id);
    if (!freeWriting) {
        throw new AppError(404, "freeWriting not found");
    }
    if (!isOwnerOrManager(req, freeWriting.userCode)) {
        throw new AppError(403, "Forbidden");
    }

    const { subjectCode, chapter, name, summary, content, author, isApproved } = req.body || {};
    freeWriting.set({
        ...(subjectCode !== undefined ? { subjectCode } : {}),
        ...(chapter !== undefined ? { chapter } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(typeof isApproved === "boolean" ? { isApproved } : {})
    });
    await freeWriting.save();
    res.status(200).send({ message: "freeWriting updated", updatedFreeWriting: freeWriting });
};

module.exports = wrapAsync({
    getAllFreeWriting,
    getFreeWritingById,
    getChaptersBySeriesCode,
    getFreeWritingByWritingCode,
    updateFreeWritingByWritingCode,
    uploadCoverImage,
    deleteFreeWriting,
    addNewFreeWriting,
    updateFreeWriting
});
