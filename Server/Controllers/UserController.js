const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const FreeWriting = require("../Models/FreeWritingModel");
const Book = require("../Models/BookModel");
const BookLike = require("../Models/BookLikeModel");
const {
    REFRESH_COOKIE,
    setAuthCookies,
    clearAuthCookies,
    verifyRefreshToken
} = require("../utils/tokens");
const { isOwnerOrManager } = require("../middleware/authorize");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

const USER_BOOK_CARD_IMG = "https://placehold.co/600x800?text=User+Book";

const seriesKeyForWriting = (fw) => fw.seriesCode || fw.writingCode || "";

const sortFwChaptersAsc = (a, b) => {
    const ca = Number(a.chapter) || 0;
    const cb = Number(b.chapter) || 0;
    if (ca !== cb) return ca - cb;
    return String(a.writingCode || "").localeCompare(String(b.writingCode || ""));
};

/** One card per multi-chapter book */
const groupWritingsBySeries = (writings) => {
    const by = new Map();
    for (const w of writings) {
        const key = seriesKeyForWriting(w);
        if (!key) continue;
        if (!by.has(key)) by.set(key, []);
        by.get(key).push(w);
    }
    const out = [];
    for (const [seriesKey, chapters] of by) {
        const sorted = [...chapters].sort(sortFwChaptersAsc);
        out.push({ seriesKey, chapters: sorted, chapterCount: sorted.length });
    }
    return out;
};

const mapSeriesGroupToPublicWrittenCard = (group, profileUser) => {
    const first = group.chapters[0];
    const coverImg =
        (first.img && String(first.img).trim()) ||
        group.chapters.find((c) => c.img && String(c.img).trim())?.img ||
        USER_BOOK_CARD_IMG;
    return {
        seriesKey: group.seriesKey,
        chapterCount: group.chapterCount,
        bookCode: first.writingCode,
        categoryCode: "ספרי משתמשים",
        title: first.name || `כתיבה ${first.writingCode}`,
        author:
            first.author ||
            `${profileUser.firstName || ""} ${profileUser.lastName || ""}`.trim() ||
            profileUser.userCode,
        summary: first.summary || "כתיבה חופשית",
        img: coverImg,
        content: first.content || "",
        authorUserCode: profileUser.userCode
    };
};

const stripUserForClient = (userDoc) => {
    if (!userDoc) return null;
    const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    delete u.password;
    return u;
};

const getAllUsers = async (req, res) => {
    const allUsers = await User.find().select("-password");
    res.status(200).send(allUsers);
};

const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        throw new AppError(404, "user not found");
    }
    if (!isOwnerOrManager(req, user.userCode)) {
        throw new AppError(403, "אין הרשאה לבצע פעולה זו");
    }
    res.status(200).send(user);
};

const deleteUser = async (req, res) => {
    if (!isOwnerOrManager(req, req.params.userCode)) {
        throw new AppError(403, "אין הרשאה לבצע פעולה זו");
    }
    const user = await User.deleteOne({ userCode: req.params.userCode });
    res.status(200).send({ message: "user deleted", result: user });
};

const loginUser = async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError(401, "אימייל או סיסמה שגויים");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new AppError(401, "אימייל או סיסמה שגויים");
    }
    setAuthCookies(res, user);
    res.status(200).send({ message: "התחברות הצליחה", user: stripUserForClient(user) });
};

const logoutUser = async (req, res) => {
    clearAuthCookies(res);
    res.status(200).send({ message: "התנתקת בהצלחה" });
};

const refreshSession = async (req, res) => {
    try {
        const token = req.cookies?.[REFRESH_COOKIE];
        if (!token) {
            throw new AppError(401, "נדרשת התחברות");
        }
        const decoded = verifyRefreshToken(token);
        if (!decoded || decoded.typ !== "refresh" || !decoded.id) {
            clearAuthCookies(res);
            throw new AppError(401, "נדרשת התחברות");
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            clearAuthCookies(res);
            throw new AppError(401, "נדרשת התחברות");
        }
        setAuthCookies(res, user);
        res.status(200).send({ message: "session refreshed", user: stripUserForClient(user) });
    } catch (err) {
        if (err instanceof AppError) throw err;
        clearAuthCookies(res);
        if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
            throw new AppError(401, "נדרשת התחברות");
        }
        throw err;
    }
};

const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        throw new AppError(401, "נדרשת התחברות");
    }
    res.status(200).send({ user: stripUserForClient(user) });
};

const addNewUser = async (req, res) => {
    const body = { ...req.body };
    body.role = "user";
    const newUser = new User(body);
    await newUser.save();
    setAuthCookies(res, newUser);
    res.status(200).send({ message: "Store added to DB", user: stripUserForClient(newUser) });
};

const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new AppError(404, "user not found");
    }
    if (!isOwnerOrManager(req, user.userCode)) {
        throw new AppError(403, "אין הרשאה לבצע פעולה זו");
    }

    const allowed = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        img: req.body.img,
        userStatus: req.body.userStatus
    };
    if (req.body.password) {
        allowed.password = req.body.password;
    }
    if (req.user.role === "manager" && req.body.role) {
        allowed.role = req.body.role;
    }

    Object.keys(allowed).forEach((key) => {
        if (allowed[key] === undefined) delete allowed[key];
    });
    user.set(allowed);
    await user.save();
    res.status(200).send({ message: "user updated", updatedUser: stripUserForClient(user) });
};

/** פרופיל ציבורי: כתיבות של המשתמש + ספרים שסימן/ה בלייק (בלי רשימת "לקריאה בהמשך") */
const getPublicAuthorProfile = async (req, res) => {
    const { userCode } = req.params;
    const user = await User.findOne({ userCode }).select("userCode firstName lastName img").lean();
    if (!user) {
        throw new AppError(404, "משתמש לא נמצא");
    }

        const writings = await FreeWriting.find({ userCode }).lean();
        const writtenBooks = groupWritingsBySeries(writings).map((g) =>
            mapSeriesGroupToPublicWrittenCard(g, user)
        );

        const userLikes = await BookLike.find({ userCode }).lean();
        const likedBooks = [];
        for (const like of userLikes) {
            const normal = await Book.findOne({ bookCode: like.bookCode }).lean();
            if (normal) {
                likedBooks.push({ ...normal, authorUserCode: null });
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
            likedBooks.push({
                bookCode: fw.writingCode,
                categoryCode: "ספרי משתמשים",
                title: fw.name || `כתיבה ${fw.writingCode}`,
                author: authorName,
                summary: fw.summary || "",
                img: USER_BOOK_CARD_IMG,
                content: fw.content || "",
                authorUserCode: fw.userCode
            });
        }

        res.status(200).send({
            user: {
                userCode: user.userCode,
                firstName: user.firstName,
                lastName: user.lastName,
                img: user.img || ""
            },
            writtenBooks,
            likedBooks
        });
};

const updateUserImage = async (req, res) => {
    if (!req.file) {
        throw new AppError(400, "Image file is required");
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        throw new AppError(404, "user not found");
    }

    user.img = `/uploads/${req.file.filename}`;
    await user.save();

    return res.status(200).send({
        message: "profile image updated",
        user: stripUserForClient(user)
    });
};

module.exports = wrapAsync({
    getAllUsers,
    getUserById,
    deleteUser,
    addNewUser,
    loginUser,
    logoutUser,
    refreshSession,
    getMe,
    getPublicAuthorProfile,
    updateUser,
    updateUserImage
});
