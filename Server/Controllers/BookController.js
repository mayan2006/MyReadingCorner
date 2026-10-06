const Book = require("../Models/BookModel");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

const getAllBooks = async (req, res) => {
    const allBooks = await Book.find();
    res.status(200).send(allBooks);
};

const getBookById = async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.status(200).send(book);
};

const getBookByCode = async (req, res) => {
    const { bookCode } = req.params;
    const book = await Book.findOne({ bookCode });
    if (!book) {
        throw new AppError(404, "Book not found");
    }
    res.json(book);
};

const deleteBook = async (req, res) => {
    const book = await Book.deleteOne({ bookCode: req.params.bookCode });
    res.status(200).send("Book deleted " + book);
};

const addNewBook = async (req, res) => {
    const newBook = new Book({ ...req.body });
    await newBook.save();
    res.status(200).send({ message: "Book added to DB", Book: newBook });
};

const updateBook = async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (!book) {
        throw new AppError(404, "Book not found");
    }
    book.set({ ...req.body });
    await book.save();
    res.status(200).send({ message: "Book updated", updatedBook: book });
};

module.exports = wrapAsync({
    getAllBooks,
    getBookById,
    deleteBook,
    addNewBook,
    updateBook,
    getBookByCode
});
