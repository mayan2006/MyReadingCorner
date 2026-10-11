require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mySiteDB';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✨ server is connected to mongoDB');
    if (MONGODB_URI.includes('mongodb+srv')) {
      console.log('   (MongoDB Atlas)');
    }
  })
  .catch((err) => {
    console.log('❌ server could not connect to DB:', err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});
