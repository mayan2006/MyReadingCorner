const BookResponse = require("../Models/BookResponseModel");
const Book = require("../Models/BookModel");
const FreeWriting = require("../Models/FreeWritingModel");
const User = require("../Models/UserModel");
const AppError = require("../utils/AppError");
const { wrapAsync } = require("../middleware/asyncHandler");

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
  const { bookCode } = req.params;
  const list = await BookResponse.find({ bookCode })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.status(200).send(list);
};

const addResponse = async (req, res) => {
  const bookCode = (req.body.bookCode || "").trim();
  const userCode = req.user.userCode;
  const content = (req.body.content || "").trim();

  const exists = await bookExists(bookCode);
  if (!exists) {
    throw new AppError(404, "Book not found");
  }

  const user = await User.findOne({ userCode }).select("firstName lastName userName userCode").lean();
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const authorName = displayNameFromUser(user) || userCode;

  const doc = await BookResponse.create({
    bookCode,
    userCode,
    authorName,
    content
  });

  res.status(200).send({ message: "response added", response: doc });
};

const deleteResponse = async (req, res) => {
  const { id } = req.params;
  const userCode = req.user.userCode;

  const doc = await BookResponse.findById(id);
  if (!doc) {
    throw new AppError(404, "Response not found");
  }
  if (doc.userCode !== userCode && req.user.role !== "manager") {
    throw new AppError(403, "Forbidden");
  }

  await BookResponse.deleteOne({ _id: id });
  res.status(200).send({ message: "response deleted" });
};

module.exports = wrapAsync({
  getResponsesByBookCode,
  addResponse,
  deleteResponse
});
