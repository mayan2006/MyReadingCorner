const MarkedBook=require('../Models/MarkedBookModel')

const getAllMarkedBook = async (req, res) => {
    try {
        const allMarkedBooks = await MarkedBook.find()
        res.status(200).send(allMarkedBooks)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const getMarkedBookById = async (req, res) => {
    try {
        const markedBook = await MarkedBook.findById(req.params.id)
        res.status(200).send(markedBook)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}

const deleteMarkedBook= async (req, res) => {
    try {
        const filter = { bookCode: req.params.bookCode };
        if (req.query.userCode) {
            filter.userCode = req.query.userCode;
        }

        const markedBook = await MarkedBook.deleteOne(filter)
        res.status(200).send({ message: "markedBook deleted", result: markedBook })
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const addNewMarkedBook = async (req, res) => {
    try {
        const { bookCode, userCode } = req.body;
        const existing = await MarkedBook.findOne({ bookCode, userCode });
        if (existing) {
            return res.status(200).send({
                message: "Already marked",
                markedBook: existing,
            });
        }
        const newMarkedBook = new MarkedBook({ ...req.body });
        await newMarkedBook.save();
        res.status(200).send({ message: "MarkedBook added to DB", markedBook:newMarkedBook });
    } catch (err) {
        res.status(500).send(err);
    }
}
const updateMarkedBook = async (req, res) => {
    try {
        const markedBook = await MarkedBook.findById(req.params.id);
        if (!markedBook)
            return res.status(404).send({ message: "markedBook not found" });

        markedBook.set({ ...req.body });
        await markedBook.save();
        res.status(200).send({ message: "markedBook updated", updatedmarkedBook: markedBook });
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = {
    getAllMarkedBook,
    getMarkedBookById,
    deleteMarkedBook,
    addNewMarkedBook,
    updateMarkedBook
}
