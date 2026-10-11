const BookLike = require("../Models/BookLikeModel");
const Book = require("../Models/BookModel");
const FreeWriting = require("../Models/FreeWritingModel");
const User = require("../Models/UserModel");
const { wrapAsync } = require("../middleware/asyncHandler");

const USER_BOOK_CARD_IMG = "https://placehold.co/600x800?text=User+Book";

const getBookLikeState = async (req, res) => {
    const { bookCode } = req.params;
    const count = await BookLike.countDocuments({ bookCode });
    let likedByUser = false;
    if (req.user?.userCode) {
        likedByUser = !!(await BookLike.findOne({ bookCode, userCode: req.user.userCode }));
    }
    res.status(200).send({ bookCode, count, likedByUser });
};

const toggleBookLike = async (req, res) => {
    const { bookCode } = req.body;
    const userCode = req.user.userCode;
    const existing = await BookLike.findOne({ bookCode, userCode });
    if (existing) {
        await BookLike.deleteOne({ _id: existing._id });
    } else {
        await BookLike.create({ bookCode, userCode });
    }
    const liked = !existing;
    const count = await BookLike.countDocuments({ bookCode });
    res.status(200).send({ message: "ok", liked, count });
};

const getLikedBooksForUser = async (req, res) => {
    const { userCode } = req.params;
    const likes = await BookLike.find({ userCode }).sort({ createdAt: -1 }).lean();
    const codes = likes.map((like) => like.bookCode);
    const [catalog, writings] = await Promise.all([
        Book.find({ bookCode: { $in: codes } }).lean(),
        FreeWriting.find({ writingCode: { $in: codes } }).lean()
    ]);
    const catalogByCode = new Map(catalog.map((book) => [book.bookCode, book]));
    const writingByCode = new Map(writings.map((fw) => [fw.writingCode, fw]));
    const authorCodes = [...new Set(writings.map((fw) => fw.userCode).filter(Boolean))];
    const authors = await User.find({ userCode: { $in: authorCodes } })
        .select("userCode firstName lastName")
        .lean();
    const authorByCode = new Map(authors.map((user) => [user.userCode, user]));

    const books = likes
        .map((like) => {
            const catalogBook = catalogByCode.get(like.bookCode);
            if (catalogBook) {
                return { ...catalogBook, authorUserCode: null };
            }
            const fw = writingByCode.get(like.bookCode);
            if (!fw) return null;
            const fwAuthor = authorByCode.get(fw.userCode);
            const authorName =
                fw.author ||
                (fwAuthor ? `${fwAuthor.firstName || ""} ${fwAuthor.lastName || ""}`.trim() : "") ||
                fw.userCode;
            return {
                bookCode: fw.writingCode,
                categoryCode: "ספרי משתמשים",
                title: fw.name || `כתיבה ${fw.writingCode}`,
                author: authorName,
                authorUserCode: fw.userCode,
                summary: fw.summary || "",
                img: fw.img || USER_BOOK_CARD_IMG,
                content: fw.content || ""
            };
        })
        .filter(Boolean);

    res.status(200).send(books);
};

const getMyLikedBooks = async (req, res) => {
    req.params.userCode = req.user.userCode;
    return getLikedBooksForUser(req, res);
};

module.exports = wrapAsync({
    getBookLikeState,
    toggleBookLike,
    getLikedBooksForUser,
    getMyLikedBooks
});
