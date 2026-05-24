const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const FreeWriting = require("../Models/FreeWritingModel");
const Book = require("../Models/BookModel");
const BookLike = require("../Models/BookLikeModel");

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
    try {
        const allUsers = await User.find()
        res.status(200).send(allUsers)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.status(200).send(user)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}

const deleteUser= async (req, res) => {
    try {
        const user = await User.deleteOne({ userCode: req.params.userCode })
        res.status(200).send("store deleted " + user)
    }
    catch (err) {
        res.status(500).send("some error " + err)
    }
}
const loginUser = async (req, res) => {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const password = req.body.password || "";
        if (!email || !password) {
            return res.status(400).send({ message: "אימייל וסיסמה נדרשים" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: "אימייל או סיסמה שגויים" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send({ message: "אימייל או סיסמה שגויים" });
        }
        res.status(200).send({ message: "התחברות הצליחה", user: stripUserForClient(user) });
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const addNewUser = async (req, res) => {
    try {
        const body = { ...req.body };
        body.role = "user";
        const newUser = new User(body);
        await newUser.save();
        res.status(200).send({ message: "Store added to DB", user: stripUserForClient(newUser) });
    } catch (err) {
        if (err?.name === "ValidationError") {
            const firstValidationMessage = Object.values(err.errors || {})[0]?.message || "Validation failed";
            return res.status(400).send({ message: firstValidationMessage, errors: err.errors });
        }
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
}
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).send({ message: "user not found" });

        user.set({ ...req.body });
        await user.save();
        res.status(200).send({ message: "user updated", updatedUser: user });
    } catch (err) {
        res.status(500).send(err);
    }
}

/** פרופיל ציבורי: כתיבות של המשתמש + ספרים שסימן/ה בלייק (בלי רשימת "לקריאה בהמשך") */
const getPublicAuthorProfile = async (req, res) => {
    try {
        const { userCode } = req.params;
        const user = await User.findOne({ userCode }).select("userCode firstName lastName img").lean();
        if (!user) {
            return res.status(404).send({ message: "משתמש לא נמצא" });
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
    } catch (err) {
        res.status(500).send({ message: err?.message || "Internal server error" });
    }
};

const updateUserImage = async (req, res) => {
    try {
        const { userCode } = req.body;
        if (!userCode) {
            return res.status(400).send({ message: "userCode is required" });
        }

        if (!req.file) {
            return res.status(400).send({ message: "Image file is required" });
        }

        const user = await User.findOne({ userCode });
        if (!user) {
            return res.status(404).send({ message: "user not found" });
        }

        user.img = `/uploads/${req.file.filename}`;
        await user.save();

        return res.status(200).send({
            message: "profile image updated",
            user: stripUserForClient(user)
        });
    } catch (err) {
        return res.status(500).send({ message: err?.message || "Internal server error" });
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,
    addNewUser,
    loginUser,
    getPublicAuthorProfile,
    updateUser,
    updateUserImage
};
