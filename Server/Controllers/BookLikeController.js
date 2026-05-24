const BookLike = require("../Models/BookLikeModel");
const Book = require("../Models/BookModel");
const FreeWriting = require("../Models/FreeWritingModel");
const User = require("../Models/UserModel");

const USER_BOOK_CARD_IMG = "https://placehold.co/600x800?text=User+Book";

const getBookLikeState = async (req, res) => {
    try {
        const { bookCode } = req.params;
        const { userCode } = req.query;
        if (!bookCode) {
            return res.status(400).send({ message: "bookCode is required" });
        }
        const count = await BookLike.countDocuments({ bookCode });
        let likedByUser = false;
        if (userCode) {
            likedByUser = !!(await BookLike.findOne({ bookCode, userCode }));
        }
        res.status(200).send({ bookCode, count, likedByUser });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const toggleBookLike = async (req, res) => {
    try {
        const { bookCode, userCode } = req.body;
        if (!bookCode || !userCode) {
            return res.status(400).send({ message: "bookCode and userCode are required" });
        }
        const existing = await BookLike.findOne({ bookCode, userCode });
        if (existing) {
            await BookLike.deleteOne({ _id: existing._id });
        } else {
            await BookLike.create({ bookCode, userCode });
        }
        const liked = !existing;
        const count = await BookLike.countDocuments({ bookCode });
        res.status(200).send({ message: "ok", liked, count });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

/** כל הספרים שהמשתמש סימן בלייק — לעמוד "ספרים אהובים" */
const getLikedBooksForUser = async (req, res) => {
    try {
        const { userCode } = req.params;
        if (!userCode) {
            return res.status(400).send({ message: "userCode is required" });
        }
        const likes = await BookLike.find({ userCode }).sort({ createdAt: -1 }).lean();
        const books = [];
        for (const like of likes) {
            const normal = await Book.findOne({ bookCode: like.bookCode }).lean();
            if (normal) {
                books.push({ ...normal, authorUserCode: null });
                continue;
            }
            const fw = await FreeWriting.findOne({ writingCode: like.bookCode }).lean();
            if (!fw) continue;
            const fwAuthor = await User.findOne({ userCode: fw.userCode })
                .select("firstName lastName")
                .lean();
            const authorName =
                fw.author ||
                (fwAuthor ? `${fwAuthor.firstName || ""} ${fwAuthor.lastName || ""}`.trim() : "") ||
                fw.userCode;
            books.push({
                bookCode: fw.writingCode,
                categoryCode: "ספרי משתמשים",
                title: fw.name || `כתיבה ${fw.writingCode}`,
                author: authorName,
                authorUserCode: fw.userCode,
                summary: fw.summary || "",
                img: USER_BOOK_CARD_IMG,
                content: fw.content || ""
            });
        }
        res.status(200).send(books);
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

module.exports = {
    getBookLikeState,
    toggleBookLike,
    getLikedBooksForUser
};
