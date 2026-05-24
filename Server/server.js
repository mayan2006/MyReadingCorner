require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ ייבוא CORS
const path = require('path');
const app = express();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mySiteDB';

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const bookRouter = require('../Server/Routes/BookRoutrer')
app.use('/books', bookRouter)
const categoryRouter = require('../Server/Routes/CategoryRouter')
app.use('/category', categoryRouter)
const freeWritingRouter =require('../Server/Routes/FreeWritingRouter')
app.use('/FreeWriting',freeWritingRouter)
const markedBookRouter=require('../Server/Routes/MarkedBookRouter')
app.use('/markedBook',markedBookRouter)
const subjectRouter=require('../Server/Routes/SubjectRouter')
app.use('/subject',subjectRouter)
const userRouter=require('../Server/Routes/UserRouter')
app.use('/user',userRouter)
const ratingRouter=require('../Server/Routes/RatingRouter')
app.use('/rating',ratingRouter)
const bookLikeRouter = require('../Server/Routes/BookLikeRouter')
app.use('/bookLike', bookLikeRouter)
const bookResponseRouter = require('../Server/Routes/BookResponseRouter')
app.use('/bookResponse', bookResponseRouter)


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

app.listen(5000, () => {
    console.log('Server is running at: http://localhost:5000');
});