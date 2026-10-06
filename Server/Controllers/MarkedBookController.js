const MarkedBook = require("../Models/MarkedBookModel");
const { isOwnerOrManager } = require("../middleware/authorize");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

const getAllMarkedBook = async (req, res) => {
    const allMarkedBooks = await MarkedBook.find({ userCode: req.user.userCode });
    res.status(200).send(allMarkedBooks);
};

const getMarkedBookById = async (req, res) => {
    const markedBook = await MarkedBook.findById(req.params.id);
    if (!markedBook) {
        throw new AppError(404, "markedBook not found");
    }
    if (!isOwnerOrManager(req, markedBook.userCode)) {
        throw new AppError(403, "אין הרשאה לבצע פעולה זו");
    }
    res.status(200).send(markedBook);
};

const deleteMarkedBook = async (req, res) => {
    const markedBook = await MarkedBook.deleteOne({
        bookCode: req.params.bookCode,
        userCode: req.user.userCode
    });
    res.status(200).send({ message: "markedBook deleted", result: markedBook });
};

const addNewMarkedBook = async (req, res) => {
    const bookCode = req.body.bookCode;
    const userCode = req.user.userCode;
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
};

const updateMarkedBook = async (req, res) => {
    const markedBook = await MarkedBook.findById(req.params.id);
    if (!markedBook) {
        throw new AppError(404, "markedBook not found");
    }
    if (!isOwnerOrManager(req, markedBook.userCode)) {
        throw new AppError(403, "אין הרשאה לבצע פעולה זו");
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
};

module.exports = wrapAsync({
    getAllMarkedBook,
    getMarkedBookById,
    deleteMarkedBook,
    addNewMarkedBook,
    updateMarkedBook
});
