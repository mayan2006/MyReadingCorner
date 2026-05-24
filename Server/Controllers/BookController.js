const Book = require('../Models/BookModel')

const getAllBooks = async (req, res) => {
    try {
        const allBooks = await Book.find(); res.status(200).send(allBooks)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const getBookById = async (req, res) => {
    try {
       const book = await Book.findById(req.params.id)
        res.status(200).send(book)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const getBookByCode= async (req, res) => {
  try {
    const { bookCode } = req.params;

    const book = await Book.findOne({ bookCode: bookCode });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const deleteBook = async (req, res) => {
    try {
        const book = await Book.deleteOne({ bookCode: req.params.bookCode })
        res.status(200).send("Book deleted " + book)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const addNewBook = async (req, res) => {
    try {
        const newBook = new Book({ ...req.body });
        await newBook.save();
        res.status(200).send({ message: "Book added to DB", Book: newBook });
    } catch (err) {
        res.status(500).send(err);
    }
}
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book)
            return res.status(404).send({ message: "Book not found" });

        book.set({ ...req.body });
        await book.save();
        res.status(200).send({ message: "Book updated", updatedBook: book });
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = {
    getAllBooks,
    getBookById,
    deleteBook,
    addNewBook,
    updateBook,
    getBookByCode
}
