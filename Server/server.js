require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mySiteDB';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info(
      { atlas: MONGODB_URI.includes('mongodb+srv') },
      'connected to mongoDB'
    );
  })
  .catch((err) => {
    logger.error({ err }, 'could not connect to DB');
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'server listening');
});
