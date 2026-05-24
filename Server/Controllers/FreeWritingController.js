const FreeWriting=require('../Models/FreeWritingModel')

const getAllFreeWriting = async (req, res) => {
    try {
        const allFreeWriting = await FreeWriting.find()
        res.status(200).send(allFreeWriting)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const getFreeWritingById = async (req, res) => {
    try {
        const freeWriting = await FreeWriting.findById(req.params.id)
        res.status(200).send(freeWriting)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}

const getChaptersBySeriesCode = async (req, res) => {
    try {
        const { seriesCode } = req.params;
        if (!seriesCode) {
            return res.status(400).send({ message: "seriesCode is required" });
        }
        const list = await FreeWriting.find({
            $or: [{ seriesCode }, { writingCode: seriesCode }]
        })
            .sort({ chapter: 1, writingCode: 1 })
            .lean();
        res.status(200).send(list);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const getFreeWritingByWritingCode = async (req, res) => {
    try {
        const doc = await FreeWriting.findOne({ writingCode: req.params.writingCode });
        if (!doc) {
            return res.status(404).send({ message: "freeWriting not found" });
        }
        res.status(200).send(doc);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const updateFreeWritingByWritingCode = async (req, res) => {
    try {
        const doc = await FreeWriting.findOne({ writingCode: req.params.writingCode });
        if (!doc) {
            return res.status(404).send({ message: "freeWriting not found" });
        }
        const { userCode } = req.body || {};
        if (!userCode || userCode !== doc.userCode) {
            return res.status(403).send({ message: "Forbidden" });
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
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const uploadCoverImage = async (req, res) => {
    try {
        const writingCode = (req.body.writingCode || "").trim();
        const userCode = (req.body.userCode || "").trim();
        if (!writingCode || !userCode) {
            return res.status(400).send({ message: "writingCode and userCode are required" });
        }
        if (!req.file) {
            return res.status(400).send({ message: "Image file is required" });
        }

        const doc = await FreeWriting.findOne({ writingCode });
        if (!doc) {
            return res.status(404).send({ message: "freeWriting not found" });
        }
        if (doc.userCode !== userCode) {
            return res.status(403).send({ message: "Forbidden" });
        }

        doc.img = `/uploads/${req.file.filename}`;
        await doc.save();

        res.status(200).send({ message: "cover updated", freeWriting: doc });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const deleteFreeWriting = async (req, res) => {
    try {
        const freeWriting = await FreeWriting.deleteOne({ writingCode: req.params.writingCode })
        res.status(200).send("freeWriting deleted " + freeWriting)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const addNewFreeWriting = async (req, res) => {
    try {
        const body = { ...req.body };
        const incomingSeries = body.seriesCode;
        const writingCode = body.writingCode;

        if (!incomingSeries || incomingSeries === writingCode) {
            body.seriesCode = writingCode;
        } else {
            // Match legacy rows that only had writingCode (no seriesCode on first chapter)
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
    } catch (err) {
        res.status(500).send({ message: err?.message || String(err) });
    }
};
const updateFreeWriting = async (req, res) => {
    try {
        const freeWriting = await FreeWriting.findById(req.params.id);
        if (!freeWriting)
            return res.status(404).send({ message: "freeWriting not found" });

        freeWriting.set({ ...req.body });
        await freeWriting.save();
        res.status(200).send({ message: "freeWriting updated", updatedFreeWriting: freeWriting });
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = {
    getAllFreeWriting,
    getFreeWritingById,
    getChaptersBySeriesCode,
    getFreeWritingByWritingCode,
    updateFreeWritingByWritingCode,
    uploadCoverImage,
    deleteFreeWriting,
    addNewFreeWriting,
    updateFreeWriting
};
