const BookResponse = require("../Models/BookResponseModel");
const Book = require("../Models/BookModel");
const FreeWriting = require("../Models/FreeWritingModel");
const User = require("../Models/UserModel");

const MAX_LEN = 2500;

const bookExists = async (bookCode) => {
  const code = (bookCode || "").trim();
  if (!code) return false;
  const inCatalog = await Book.findOne({ bookCode: code }).select("_id").lean();
  if (inCatalog) return true;
  const fw = await FreeWriting.findOne({ writingCode: code }).select("_id").lean();
  return !!fw;
};

const displayNameFromUser = (user) => {
  if (!user) return "";
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (full) return full;
  return user.userName || user.userCode || "";
};

const getResponsesByBookCode = async (req, res) => {
  try {
    const { bookCode } = req.params;
    if (!bookCode) {
      return res.status(400).send({ message: "bookCode is required" });
    }
    const list = await BookResponse.find({ bookCode })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.status(200).send(list);
  } catch (err) {
    res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const addResponse = async (req, res) => {
  try {
    const bookCode = (req.body.bookCode || "").trim();
    const userCode = (req.body.userCode || "").trim();
    const contentRaw = req.body.content;

    if (!bookCode || !userCode) {
      return res.status(400).send({ message: "bookCode and userCode are required" });
    }
    const content = typeof contentRaw === "string" ? contentRaw.trim() : "";
    if (!content.length) {
      return res.status(400).send({ message: "Response text is required" });
    }
    if (content.length > MAX_LEN) {
      return res.status(400).send({ message: `Response too long (max ${MAX_LEN} characters)` });
    }

    const exists = await bookExists(bookCode);
    if (!exists) {
      return res.status(404).send({ message: "Book not found" });
    }

    const user = await User.findOne({ userCode }).select("firstName lastName userName userCode").lean();
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const authorName = displayNameFromUser(user) || userCode;

    const doc = await BookResponse.create({
      bookCode,
      userCode,
      authorName,
      content
    });

    res.status(200).send({ message: "response added", response: doc });
  } catch (err) {
    res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const userCode = (req.query.userCode || req.body.userCode || "").trim();
    if (!userCode) {
      return res.status(400).send({ message: "userCode is required" });
    }

    const doc = await BookResponse.findById(id);
    if (!doc) {
      return res.status(404).send({ message: "Response not found" });
    }
    if (doc.userCode !== userCode) {
      return res.status(403).send({ message: "Forbidden" });
    }

    await BookResponse.deleteOne({ _id: id });
    res.status(200).send({ message: "response deleted" });
  } catch (err) {
    res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

module.exports = {
  getResponsesByBookCode,
  addResponse,
  deleteResponse
};
