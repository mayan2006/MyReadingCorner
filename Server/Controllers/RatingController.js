const Rating = require("../Models/RatingModel");

const upsertRating = async (req, res) => {
  try {
    const { bookCode, userCode, stars } = req.body;
    const numericStars = Number(stars);

    if (!bookCode || !userCode || !numericStars || numericStars < 1 || numericStars > 5) {
      return res.status(400).send({ message: "bookCode, userCode and stars (1-5) are required" });
    }

    const rating = await Rating.findOneAndUpdate(
      { bookCode, userCode },
      { bookCode, userCode, stars: numericStars },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).send({ message: "rating saved", rating });
  } catch (err) {
    res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const getAverageByBookCode = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const getUserRatingByBookCode = async (req, res) => {
  try {
    const { bookCode, userCode } = req.params;
    const rating = await Rating.findOne({ bookCode, userCode });
    res.status(200).send({ bookCode, userCode, stars: rating?.stars || 0 });
  } catch (err) {
    res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

module.exports = {
  upsertRating,
  getAverageByBookCode,
  getUserRatingByBookCode
};
