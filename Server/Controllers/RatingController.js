const Rating = require("../Models/RatingModel");
const { wrapAsync } = require("../middleware/asyncHandler");

const upsertRating = async (req, res) => {
  const { bookCode, stars } = req.body;
  const userCode = req.user.userCode;
  const numericStars = Number(stars);

  const rating = await Rating.findOneAndUpdate(
    { bookCode, userCode },
    { bookCode, userCode, stars: numericStars },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).send({ message: "rating saved", rating });
};

const getAverageByBookCode = async (req, res) => {
  const { bookCode } = req.params;
  const stats = await Rating.aggregate([
    { $match: { bookCode } },
    {
      $group: {
        _id: "$bookCode",
        average: { $avg: "$stars" },
        total: { $sum: 1 }
      }
    }
  ]);

  if (!stats.length) {
    return res.status(200).send({ bookCode, average: 0, total: 0 });
  }

  res.status(200).send({
    bookCode,
    average: Number(stats[0].average.toFixed(2)),
    total: stats[0].total
  });
};

const getMyRatingByBookCode = async (req, res) => {
  const { bookCode } = req.params;
  const userCode = req.user.userCode;
  const rating = await Rating.findOne({ bookCode, userCode });
  res.status(200).send({ bookCode, userCode, stars: rating?.stars || 0 });
};

module.exports = wrapAsync({
  upsertRating,
  getAverageByBookCode,
  getMyRatingByBookCode
});
