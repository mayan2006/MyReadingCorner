const BookLike = require("../Models/BookLikeModel");
const Book = require("../Models/BookModel");
const FreeWriting = require("../Models/FreeWritingModel");
const User = require("../Models/UserModel");
const { wrapAsync } = require("../middleware/asyncHandler");

const USER_BOOK_CARD_IMG = "https://placehold.co/600x800?text=User+Book";

const mapLikeToBookCard = async (like) => {
    const normal = await Book.findOne({ bookCode: like.bookCode }).lean();
    if (normal) {
        return { ...normal, authorUserCode: null };
    }
    const fw = await FreeWriting.findOne({ writingCode: like.bookCode }).lean();
    if (!fw) return null;
    const fwAuthor = await User.findOne({ userCode: fw.userCode })
        .select("firstName lastName")
        .lean();
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
        img: USER_BOOK_CARD_IMG,
        content: fw.content || ""
    };
};

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
    const books = [];
    for (const like of likes) {
        const card = await mapLikeToBookCard(like);
        if (card) books.push(card);
    }
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
