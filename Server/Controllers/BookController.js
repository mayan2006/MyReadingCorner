const Book = require("../Models/BookModel");
const FreeWriting = require("../Models/FreeWritingModel");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

const USER_BOOK_CARD_IMG = "https://placehold.co/600x800?text=User+Book";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePage = (value) => {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
};

const parseLimit = (value, fallback = 12) => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n) || n < 1) return fallback;
    return Math.min(n, 50);
};

const mapFreeWritingToCard = (fw) => ({
    bookCode: fw.writingCode,
    categoryCode: "ספרי משתמשים",
    title: fw.name || `כתיבה ${fw.writingCode}`,
    author: fw.author,
    authorUserCode: fw.userCode,
    summary: fw.summary || "",
    img: fw.img || USER_BOOK_CARD_IMG,
    content: fw.content || ""
});

const searchFreeWritings = async (query, limit) => {
    const regex = new RegExp(escapeRegex(query), "i");
    const writings = await FreeWriting.find({
        $or: [{ name: regex }, { author: regex }, { summary: regex }, { userCode: regex }]
    })
        .sort({ date: -1 })
        .limit(limit * 4)
        .lean();

    const seenSeries = new Set();
    const cards = [];
    for (const fw of writings) {
        const seriesKey = fw.seriesCode || fw.writingCode;
        if (seenSeries.has(seriesKey)) continue;
        seenSeries.add(seriesKey);
        cards.push(mapFreeWritingToCard(fw));
        if (cards.length >= limit) break;
    }
    return cards;
};

const getAllBooks = async (req, res) => {
    const q = String(req.query.q || "").trim();
    const wantsPagination =
        q.length > 0 || req.query.page != null || req.query.limit != null;

    if (!wantsPagination) {
        const allBooks = await Book.find().lean();
        return res.status(200).send(allBooks);
    }

    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit, q ? 7 : 12);
    const filter = {};

    if (q) {
        const regex = new RegExp(escapeRegex(q), "i");
        filter.$or = [{ title: regex }, { author: regex }, { summary: regex }];
    }

    const skip = (page - 1) * limit;
    const [catalogItems, catalogTotal, userBooks] = await Promise.all([
        Book.find(filter).skip(skip).limit(limit).lean(),
        Book.countDocuments(filter),
        q ? searchFreeWritings(q, limit) : Promise.resolve([])
    ]);

    const seen = new Set(catalogItems.map((book) => book.bookCode));
    const extras = userBooks.filter((book) => !seen.has(book.bookCode));
    const items = [...catalogItems, ...extras].slice(0, limit);
    const total = catalogTotal + extras.length;
    const pages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).send({ items, total, page, limit, pages });
};

const getPopularBooks = async (req, res) => {
    const limit = parseLimit(req.query.limit, 12);

    const popular = await Book.aggregate([
        {
            $lookup: {
                from: "booklikes",
                localField: "bookCode",
                foreignField: "bookCode",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "ratings",
                localField: "bookCode",
                foreignField: "bookCode",
                as: "ratings"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                ratingCount: { $size: "$ratings" },
                averageRating: { $ifNull: [{ $avg: "$ratings.stars" }, 0] }
            }
        },
        { $project: { likes: 0, ratings: 0 } },
        {
            $match: {
                $or: [{ likeCount: { $gt: 0 } }, { ratingCount: { $gt: 0 } }]
            }
        },
        { $sort: { likeCount: -1, averageRating: -1, title: 1 } },
        { $limit: limit }
    ]);

    res.status(200).send(popular);
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
    getPopularBooks,
    getBookById,
    deleteBook,
    addNewBook,
    updateBook,
    getBookByCode
});
