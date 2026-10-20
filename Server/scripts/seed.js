require("dotenv").config();

const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { seedDatabase } = require("./seedData");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mySiteDB";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const result = await seedDatabase();
  logger.info(result, "seed complete");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  logger.error({ err }, "seed failed");
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
