const MarkedBook = require("../Models/MarkedBookModel");
const { isOwnerOrManager } = require("../middleware/authorize");

const getAllMarkedBook = async (req, res) => {
    try {
        const allMarkedBooks = await MarkedBook.find({ userCode: req.user.userCode });
        res.status(200).send(allMarkedBooks);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const getMarkedBookById = async (req, res) => {
    try {
        const markedBook = await MarkedBook.findById(req.params.id);
        if (!markedBook) {
            return res.status(404).send({ message: "markedBook not found" });
        }
        if (!isOwnerOrManager(req, markedBook.userCode)) {
            return res.status(403).send({ message: "אין הרשאה לבצע פעולה זו" });
        }
        res.status(200).send(markedBook);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const deleteMarkedBook = async (req, res) => {
    try {
        const markedBook = await MarkedBook.deleteOne({
            bookCode: req.params.bookCode,
            userCode: req.user.userCode
        });
        res.status(200).send({ message: "markedBook deleted", result: markedBook });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const addNewMarkedBook = async (req, res) => {
    try {
        const bookCode = req.body.bookCode;
        const userCode = req.user.userCode;
        if (!bookCode) {
            return res.status(400).send({ message: "bookCode is required" });
        }
        const existing = await MarkedBook.findOne({ bookCode, userCode });
        if (existing) {
            return res.status(200).send({
                message: "Already marked",
                markedBook: existing
            });
        }
        const newMarkedBook = new MarkedBook({
            bookCode,
            name: req.body.name,
            userCode,
            date: req.body.date || new Date(),
            bookStatus: req.body.bookStatus
        });
        await newMarkedBook.save();
        res.status(200).send({ message: "MarkedBook added to DB", markedBook: newMarkedBook });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const updateMarkedBook = async (req, res) => {
    try {
        const markedBook = await MarkedBook.findById(req.params.id);
        if (!markedBook) {
            return res.status(404).send({ message: "markedBook not found" });
        }
        if (!isOwnerOrManager(req, markedBook.userCode)) {
            return res.status(403).send({ message: "אין הרשאה לבצע פעולה זו" });
        }
        const { name, date, bookStatus, bookCode } = req.body || {};
        markedBook.set({
            ...(name !== undefined ? { name } : {}),
            ...(date !== undefined ? { date } : {}),
            ...(bookStatus !== undefined ? { bookStatus } : {}),
            ...(bookCode !== undefined ? { bookCode } : {})
        });
        await markedBook.save();
        res.status(200).send({ message: "markedBook updated", updatedmarkedBook: markedBook });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

module.exports = {
    getAllMarkedBook,
    getMarkedBookById,
    deleteMarkedBook,
    addNewMarkedBook,
    updateMarkedBook
};
